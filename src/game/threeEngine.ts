/**
 * Neon Dash - Core 3D Three.js Game Engine
 * Implements full 3D endless runner loop, responsive controls, kinematics,
 * physics collisions, powerups, drone chase, and visual effects.
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  GameState,
  Lane,
  PlayerStats,
  PowerUpActive,
  PowerUpType
} from './types';
import {
  createProceduralCourier,
  createProceduralDrone,
  createProceduralFox,
  CharacterModelRig
} from './proceduralModels';
import { LevelManager, LANE_X, LANE_WIDTH } from './levelManager';
import { soundEngine } from './audio';
import { CHARACTERS, StorageManager, TRAILS } from './storage';

// Pre-allocated math helpers to eliminate GC frame stalls
const _vec3 = new THREE.Vector3();
const _playerBox = new THREE.Box3();
const _tempBox = new THREE.Box3();

export interface GameEngineCallbacks {
  onStatsUpdate: (stats: PlayerStats) => void;
  onPowerUpsUpdate: (powerups: PowerUpActive[]) => void;
  onGameOver: (stats: PlayerStats) => void;
  onMissionProgress: (data: {
    orbsCollected: number;
    jumpsCount: number;
    slidesCount: number;
    distance: number;
    powerupsUsed: number;
    gemsCollected: number;
  }) => void;
}

export class NeonDashEngine {
  public container: HTMLElement;
  public callbacks: GameEngineCallbacks;

  // Three.js Core
  public scene!: THREE.Scene;
  public camera!: THREE.PerspectiveCamera;
  public renderer!: THREE.WebGLRenderer;
  private isSoftwareGl = false;
  private animFrameId: number | null = null;
  private clock = new THREE.Clock();

  // Subsystems
  public levelManager!: LevelManager;
  private playerRig!: CharacterModelRig;
  private droneRig!: { root: THREE.Group; update: (t: number, p: THREE.Vector3, s: boolean) => void };
  private foxRig?: { root: THREE.Group; update: (t: number, s: number, p: THREE.Vector3) => void };

  // Game Logic State
  public gameState: GameState = 'menu';
  public currentLane: Lane = 0;
  public playerX = 0;
  public playerY = 0;
  public playerZ = 0;
  private targetX = 0;

  // Kinematics
  private velocityY = 0;
  private isJumping = false;
  private isSliding = false;
  private isInvulnerable = false;
  private invulnerableTimer = 0;
  private slideTimer = 0;
  private readonly SLIDE_DURATION = 0.75;
  private readonly JUMP_FORCE = 12.5;
  private readonly GRAVITY = 32.0;

  // Stats
  public score = 0;
  public distance = 0;
  public orbs = 0;
  public gems = 0;
  public speed = 22.0;
  private readonly BASE_SPEED = 22.0;
  private readonly MAX_SPEED = 46.0;

  // Mission Counters in this run
  private runJumps = 0;
  private runSlides = 0;
  private runPowerups = 0;

  // Active Power-ups
  public activePowerups: Map<PowerUpType, { remaining: number; max: number }> = new Map();

  // Particle systems
  private particlePool: THREE.InstancedMesh | null = null;
  private particleData: Array<{ pos: THREE.Vector3; vel: THREE.Vector3; life: number; maxLife: number }> = [];
  private readonly MAX_PARTICLES = 160;

  // Character & Trail Settings
  public selectedCharId = 'kaelen';
  public selectedTrailColor = 0x06b6d4;
  public hasFoxCompanion = false;

  constructor(container: HTMLElement, callbacks: GameEngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;

    this.initRenderer();
    this.initScene();
    this.initParticles();
    this.loadUserData();
    this.setupPlayer();
    this.setupDrone();
    this.setupFox();

    this.levelManager = new LevelManager(this.scene);
    this.levelManager.reset();

    // Start render loop
    this.startLoop();
  }

  private initRenderer() {
    // Detect software WebGL as per Three.js guidelines
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false
    });

    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.renderer.setSize(width, height);
    this.container.appendChild(this.renderer.domElement);
  }

  private initScene() {
    this.scene = new THREE.Scene();

    // Twilight Sunset Sky & Horizon Fog
    const sunsetDuskColor = 0x160829;
    this.scene.background = new THREE.Color(sunsetDuskColor);
    this.scene.fog = new THREE.FogExp2(sunsetDuskColor, 0.0085);

    // Camera setup for high-speed dynamic perspective
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 450);
    this.camera.position.set(0, 4.2, -6.5);
    this.camera.lookAt(0, 1.8, 12);

    // Studio Environment Reflections
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3-Point Lighting Rig
    // 1. Warm Directional Key Light (Sunset Sun Angle)
    const keyLight = new THREE.DirectionalLight(0xfb923c, 2.2);
    keyLight.position.set(15, 25, 20);
    if (!this.isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
      const d = 25;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 100;
    }
    this.scene.add(keyLight);

    // 2. Cool Sky / Ground Fill (Hemisphere)
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x581c87, 0.9);
    hemiLight.position.set(0, 30, 0);
    this.scene.add(hemiLight);

    // 3. Neon Magenta Rim Light
    const rimLight = new THREE.DirectionalLight(0xec4899, 1.4);
    rimLight.position.set(-15, 8, -10);
    this.scene.add(rimLight);
  }

  private initParticles() {
    const geom = new THREE.BoxGeometry(0.08, 0.08, 0.08);
    const mat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    this.particlePool = new THREE.InstancedMesh(geom, mat, this.MAX_PARTICLES);
    this.particlePool.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.scene.add(this.particlePool);

    const dummy = new THREE.Object3D();
    dummy.scale.set(0, 0, 0);
    dummy.updateMatrix();

    for (let i = 0; i < this.MAX_PARTICLES; i++) {
      this.particlePool.setMatrixAt(i, dummy.matrix);
      this.particleData.push({
        pos: new THREE.Vector3(0, -100, 0),
        vel: new THREE.Vector3(),
        life: 0,
        maxLife: 1
      });
    }
    this.particlePool.instanceMatrix.needsUpdate = true;
  }

  public spawnParticleBurst(pos: THREE.Vector3, color: number, count = 12) {
    if (!this.particlePool) return;
    let spawned = 0;
    for (let i = 0; i < this.MAX_PARTICLES && spawned < count; i++) {
      const p = this.particleData[i];
      if (p.life <= 0) {
        p.pos.copy(pos);
        p.vel.set(
          (Math.random() - 0.5) * 6,
          Math.random() * 5 + 1,
          (Math.random() - 0.5) * 6
        );
        p.maxLife = 0.4 + Math.random() * 0.3;
        p.life = p.maxLife;
        spawned++;
      }
    }
  }

  public loadUserData() {
    this.selectedCharId = StorageManager.getSelectedCharacterId();
    const trailId = StorageManager.getSelectedTrailId();
    const trail = TRAILS.find(t => t.id === trailId);
    this.selectedTrailColor = trail ? trail.color : 0x06b6d4;
    this.hasFoxCompanion = StorageManager.isFoxCompanionUnlocked();
  }

  public setupPlayer() {
    if (this.playerRig) {
      this.scene.remove(this.playerRig.root);
    }
    const charConfig = CHARACTERS.find(c => c.id === this.selectedCharId) || CHARACTERS[0];
    this.playerRig = createProceduralCourier(charConfig);
    this.scene.add(this.playerRig.root);

    // If Vesper Volt, activate starting shield
    if (charConfig.id === 'vesper') {
      this.activatePowerup('shield', 9999);
    }
  }

  private setupDrone() {
    this.droneRig = createProceduralDrone();
    this.scene.add(this.droneRig.root);
  }

  private setupFox() {
    if (this.foxRig) {
      this.scene.remove(this.foxRig.root);
      this.foxRig = undefined;
    }
    if (this.hasFoxCompanion) {
      this.foxRig = createProceduralFox();
      this.scene.add(this.foxRig.root);
    }
  }

  // ---- CONTROLS ----

  public moveLeft() {
    if (this.gameState !== 'playing') return;
    if (this.currentLane > -1) {
      this.currentLane = (this.currentLane - 1) as Lane;
      this.targetX = LANE_X[this.currentLane];
      soundEngine.playJump();
    }
  }

  public moveRight() {
    if (this.gameState !== 'playing') return;
    if (this.currentLane < 1) {
      this.currentLane = (this.currentLane + 1) as Lane;
      this.targetX = LANE_X[this.currentLane];
      soundEngine.playJump();
    }
  }

  public jump() {
    if (this.gameState !== 'playing') return;
    if (!this.isJumping) {
      this.isJumping = true;
      this.velocityY = this.JUMP_FORCE;
      this.isSliding = false;
      this.runJumps++;
      soundEngine.playJump();
    }
  }

  public slide() {
    if (this.gameState !== 'playing') return;
    if (this.isJumping) {
      // Fast-fall dive down when jumping
      this.velocityY = -this.JUMP_FORCE * 1.5;
    }
    this.isSliding = true;
    this.slideTimer = this.SLIDE_DURATION;
    this.runSlides++;
    soundEngine.playSlide();
  }

  // ---- GAME LIFECYCLE ----

  public startGame() {
    this.loadUserData();
    this.setupPlayer();
    this.setupFox();

    this.gameState = 'playing';
    this.currentLane = 0;
    this.playerX = 0;
    this.targetX = 0;
    this.playerY = 0;
    this.playerZ = 0;
    this.velocityY = 0;
    this.isJumping = false;
    this.isSliding = false;
    this.isInvulnerable = false;
    this.invulnerableTimer = 0;
    this.slideTimer = 0;

    this.score = 0;
    this.distance = 0;
    this.orbs = 0;
    this.gems = 0;
    this.speed = this.BASE_SPEED;

    this.runJumps = 0;
    this.runSlides = 0;
    this.runPowerups = 0;

    this.activePowerups.clear();

    const charConfig = CHARACTERS.find(c => c.id === this.selectedCharId) || CHARACTERS[0];
    if (charConfig.id === 'vesper') {
      this.activatePowerup('shield', 9999);
    }

    this.levelManager.reset();
    soundEngine.startMusic();
    this.emitStats();
  }

  public pauseGame() {
    if (this.gameState === 'playing') {
      this.gameState = 'paused';
    }
  }

  public resumeGame() {
    if (this.gameState === 'paused') {
      this.gameState = 'playing';
      this.clock.getDelta(); // flush delta spike
    }
  }

  public revive() {
    this.gameState = 'playing';
    this.isInvulnerable = true;
    this.invulnerableTimer = 2.5; // 2.5s safe window
    this.playerY = 0;
    this.velocityY = 0;
    this.isJumping = false;
    this.isSliding = false;

    // Clear immediate obstacles in front of player
    this.levelManager.obstacles = this.levelManager.obstacles.filter(o => {
      const isAheadClose = o.data.z > this.playerZ - 2 && o.data.z < this.playerZ + 18;
      if (isAheadClose) {
        this.scene.remove(o.mesh);
        return false;
      }
      return true;
    });

    soundEngine.playRevive();
    this.emitStats();
  }

  public activatePowerup(type: PowerUpType, durationSec: number) {
    const char = CHARACTERS.find(c => c.id === this.selectedCharId);
    let dur = durationSec;

    // Perk checks
    if (type === 'magnet' && char?.id === 'kaelen') {
      dur *= 1.25;
    }
    if (type === 'jetpack' && char?.id === 'aero') {
      dur += 2.5;
    }

    this.activePowerups.set(type, { remaining: dur, max: dur });
    this.runPowerups++;
    soundEngine.playPowerup(type);

    if (type === 'jetpack') {
      this.levelManager.spawnSkyTrail(this.playerZ);
    }

    this.emitPowerups();
  }

  private handleGameOver() {
    this.gameState = 'gameover';
    soundEngine.playCrash();

    // Trigger mission updates
    this.callbacks.onMissionProgress({
      orbsCollected: this.orbs,
      jumpsCount: this.runJumps,
      slidesCount: this.runSlides,
      distance: Math.floor(this.distance),
      powerupsUsed: this.runPowerups,
      gemsCollected: this.gems
    });

    this.callbacks.onGameOver({
      score: Math.floor(this.score),
      distance: Math.floor(this.distance),
      orbs: this.orbs,
      gems: this.gems,
      multiplier: this.activePowerups.has('doubleScore') ? 2 : 1,
      speed: this.speed,
      maxSpeed: this.MAX_SPEED
    });
  }

  // ---- RENDER LOOP ----

  private startLoop() {
    const tick = () => {
      const delta = Math.min(this.clock.getDelta(), 0.1);
      const time = this.clock.getElapsedTime();

      if (this.gameState === 'playing') {
        this.updateGame(delta, time);
      } else if (this.gameState === 'menu' || this.gameState === 'gameover') {
        this.updateIdle(time);
      }

      this.renderer.render(this.scene, this.camera);

      if (this.isSoftwareGl) {
        this.afterDraw(tick);
      } else {
        this.animFrameId = requestAnimationFrame(tick);
      }
    };

    tick();
  }

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.animFrameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.animFrameId = window.setTimeout(cb, 60);
      }
    };
    this.animFrameId = window.setTimeout(poll, 5);
  }

  private updateIdle(time: number) {
    // Gentle camera orbit for showroom feel
    this.playerRig.updateAnimation(time, 0, false, false, false, 0);
    this.playerRig.root.position.set(0, 0, 0);
    this.camera.position.set(Math.sin(time * 0.4) * 3, 2.5, -4.5);
    this.camera.lookAt(0, 1.2, 0);
  }

  private updateGame(delta: number, time: number) {
    // 1. Advance Speed and Distance
    this.speed = Math.min(this.MAX_SPEED, this.BASE_SPEED + (this.distance / 120) * 1.5);
    const forwardStep = this.speed * delta;
    this.playerZ += forwardStep;
    this.distance = this.playerZ;

    // 2. Score calculation (distance * 1 + multiplier)
    const multiplier = this.activePowerups.has('doubleScore') ? 2 : 1;
    this.score += forwardStep * 1.2 * multiplier;

    // 3. Lane movement interpolation
    const laneDiff = this.targetX - this.playerX;
    this.playerX += laneDiff * 14 * delta;

    // 4. Jetpack & Jump/Slide Kinematics
    const isJetpackActive = this.activePowerups.has('jetpack');

    if (isJetpackActive) {
      // Fly smoothly up to 5.5m altitude
      const targetFlyY = 5.5;
      this.playerY += (targetFlyY - this.playerY) * 6 * delta;
      this.velocityY = 0;
      this.isJumping = false;
      this.isSliding = false;
    } else {
      // Regular ground physics
      if (this.isJumping) {
        this.playerY += this.velocityY * delta;
        this.velocityY -= this.GRAVITY * delta;

        if (this.playerY <= 0) {
          this.playerY = 0;
          this.velocityY = 0;
          this.isJumping = false;
        }
      } else {
        this.playerY = 0;
      }

      // Slide countdown
      if (this.isSliding) {
        this.slideTimer -= delta;
        if (this.slideTimer <= 0) {
          this.isSliding = false;
        }
      }
    }

    // Invulnerability cooldown
    if (this.isInvulnerable) {
      this.invulnerableTimer -= delta;
      if (this.invulnerableTimer <= 0) {
        this.isInvulnerable = false;
      }
    }

    // 5. Update Power-up Timers
    let powerupsChanged = false;
    for (const [type, data] of this.activePowerups.entries()) {
      if (type === 'shield') continue; // shield persists until hit
      data.remaining -= delta;
      if (data.remaining <= 0) {
        this.activePowerups.delete(type);
        powerupsChanged = true;
      }
    }
    if (powerupsChanged) {
      this.emitPowerups();
    }

    // Update visuals on player rig
    this.playerRig.jetpackMesh.visible = isJetpackActive;
    this.playerRig.shieldBubble.visible = this.activePowerups.has('shield');

    // Blink player during invulnerability
    this.playerRig.root.visible = !this.isInvulnerable || Math.floor(time * 16) % 2 === 0;

    // 6. Update Player Rig Position & Animation
    this.playerRig.root.position.set(this.playerX, this.playerY, this.playerZ);
    this.playerRig.updateAnimation(
      time,
      this.speed,
      this.isJumping,
      this.isSliding,
      isJetpackActive,
      laneDiff
    );

    // 7. Update Chaser Drone
    this.droneRig.update(time, this.playerRig.root.position, false);

    // 8. Update Fox Sidekick
    if (this.foxRig) {
      this.foxRig.update(time, this.speed, this.playerRig.root.position);
    }

    // 9. Update Level Manager (recyling chunks, moving carts)
    this.levelManager.update(this.playerZ, delta, time);

    // 10. Sneaker Trail Particles
    if (Math.random() > 0.3) {
      const footPos = this.playerRig.root.position.clone();
      footPos.y += 0.15;
      footPos.z -= 0.3;
      this.spawnParticleBurst(footPos, this.selectedTrailColor, 1);
    }

    // 11. Update Particles
    this.updateParticles(delta);

    // 12. Check Collisions & Collectibles
    this.checkCollisions();
    this.checkCollectibles(delta);

    // 13. Update Follow Camera
    const camTargetX = this.playerX * 0.45;
    const camTargetY = isJetpackActive ? 7.8 : 3.8 + (this.playerY * 0.4);
    const camTargetZ = this.playerZ - 6.2;

    this.camera.position.x += (camTargetX - this.camera.position.x) * 12 * delta;
    this.camera.position.y += (camTargetY - this.camera.position.y) * 8 * delta;
    this.camera.position.z = camTargetZ;
    this.camera.lookAt(this.playerX * 0.2, this.playerY * 0.5 + 1.6, this.playerZ + 12);

    // 14. Emit HUD Stats
    this.emitStats();
  }

  private updateParticles(delta: number) {
    if (!this.particlePool) return;
    const dummy = new THREE.Object3D();

    for (let i = 0; i < this.MAX_PARTICLES; i++) {
      const p = this.particleData[i];
      if (p.life > 0) {
        p.life -= delta;
        p.pos.addScaledVector(p.vel, delta);
        p.vel.y -= 9.8 * delta; // particle gravity

        const scale = (p.life / p.maxLife) * 0.12;
        dummy.position.copy(p.pos);
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();
        this.particlePool.setMatrixAt(i, dummy.matrix);
      } else {
        dummy.position.set(0, -100, 0);
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        this.particlePool.setMatrixAt(i, dummy.matrix);
      }
    }
    this.particlePool.instanceMatrix.needsUpdate = true;
  }

  private checkCollisions() {
    if (this.isInvulnerable || this.activePowerups.has('jetpack')) return;

    // Calculate player bounding box
    const px = this.playerX;
    const py = this.playerY;
    const pz = this.playerZ;

    // Sliding reduces player hitbox height significantly
    const boxHeight = this.isSliding ? 0.7 : 1.7;
    const boxHalfW = 0.38;
    const boxHalfD = 0.35;

    _playerBox.min.set(px - boxHalfW, py, pz - boxHalfD);
    _playerBox.max.set(px + boxHalfW, py + boxHeight, pz + boxHalfD);

    for (let i = 0; i < this.levelManager.obstacles.length; i++) {
      const obs = this.levelManager.obstacles[i];

      // Only check obstacles close to player Z
      if (Math.abs(obs.data.z - pz) > 3.0) continue;

      if (_playerBox.intersectsBox(obs.collider)) {
        // Impact!
        if (this.activePowerups.has('shield')) {
          // Shield absorbs hit
          this.activePowerups.delete('shield');
          this.emitPowerups();
          soundEngine.playShieldBreak();
          this.spawnParticleBurst(_vec3.set(px, py + 1.0, pz), 0x06b6d4, 30);
          this.isInvulnerable = true;
          this.invulnerableTimer = 1.6;
          // Destroy obstacle
          this.scene.remove(obs.mesh);
          this.levelManager.obstacles.splice(i, 1);
          return;
        } else {
          // Crash!
          this.spawnParticleBurst(_vec3.set(px, py + 1.0, pz), 0xef4444, 40);
          this.handleGameOver();
          return;
        }
      }
    }
  }

  private checkCollectibles(delta: number) {
    const isMagnetActive = this.activePowerups.has('magnet');
    const magnetRadius = 13.0;
    const px = this.playerX;
    const py = this.playerY + 0.8;
    const pz = this.playerZ;

    for (let i = this.levelManager.collectibles.length - 1; i >= 0; i--) {
      const col = this.levelManager.collectibles[i];
      const cx = col.mesh.position.x;
      const cy = col.mesh.position.y;
      const cz = col.mesh.position.z;

      const distSq = (cx - px) ** 2 + (cy - py) ** 2 + (cz - pz) ** 2;

      // Magnet pull logic
      if (isMagnetActive && col.data.type === 'orb' && distSq < magnetRadius ** 2) {
        col.mesh.position.x += (px - cx) * 16 * delta;
        col.mesh.position.y += (py - cy) * 16 * delta;
        col.mesh.position.z += (pz - cz) * 16 * delta;
      }

      // Collect radius
      if (distSq < 2.0) {
        // Collect!
        col.data.collected = true;
        this.scene.remove(col.mesh);
        this.levelManager.collectibles.splice(i, 1);

        if (col.data.type === 'orb') {
          const char = CHARACTERS.find(c => c.id === this.selectedCharId);
          const bonus = char?.id === 'nyx' ? 1.15 : 1.0;
          this.orbs += Math.round(1 * bonus);
          const mult = this.activePowerups.has('doubleScore') ? 2 : 1;
          this.score += 20 * mult;
          soundEngine.playOrb(this.orbs);
          this.spawnParticleBurst(_vec3.set(cx, cy, cz), 0x06b6d4, 8);
        } else if (col.data.type === 'gem') {
          this.gems += 1;
          this.score += 500;
          soundEngine.playGem();
          this.spawnParticleBurst(_vec3.set(cx, cy, cz), 0xec4899, 20);
        } else if (col.data.type === 'powerup' && col.data.powerUpType) {
          const baseDuration = col.data.powerUpType === 'jetpack' ? 8 : 10;
          this.activatePowerup(col.data.powerUpType, baseDuration);
          this.spawnParticleBurst(_vec3.set(cx, cy, cz), 0xf59e0b, 25);
        }
      }
    }
  }

  private emitStats() {
    this.callbacks.onStatsUpdate({
      score: Math.floor(this.score),
      distance: Math.floor(this.distance),
      orbs: this.orbs,
      gems: this.gems,
      multiplier: this.activePowerups.has('doubleScore') ? 2 : 1,
      speed: Math.floor(this.speed),
      maxSpeed: this.MAX_SPEED
    });
  }

  private emitPowerups() {
    const list: PowerUpActive[] = [];
    this.activePowerups.forEach((data, type) => {
      list.push({
        type,
        duration: data.remaining,
        maxDuration: data.max
      });
    });
    this.callbacks.onPowerUpsUpdate(list);
  }

  public handleResize() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public destroy() {
    if (this.animFrameId !== null) {
      if (this.isSoftwareGl) {
        clearTimeout(this.animFrameId);
      } else {
        cancelAnimationFrame(this.animFrameId);
      }
    }
    soundEngine.stopMusic();
    this.renderer.dispose();
  }
}

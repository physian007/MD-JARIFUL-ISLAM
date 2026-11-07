/**
 * Neon Dash - Procedural Rooftop Level Manager
 * Spawns, manages, and recycles rooftop chunks, obstacles, collectibles, and city skyline.
 */

import * as THREE from 'three';
import { Lane, ObstacleData, CollectibleData, PowerUpType } from './types';
import {
  createBarrierLow,
  createOverheadBeam,
  createMovingCart,
  createFullBlocker,
  createEnergyOrb,
  createGem,
  createPowerUpCrate
} from './proceduralModels';

export const LANE_WIDTH = 2.5;
export const LANE_X: Record<Lane, number> = {
  [-1]: -LANE_WIDTH,
  [0]: 0,
  [1]: LANE_WIDTH
};

export const CHUNK_LENGTH = 48;
export const ACTIVE_CHUNKS = 6;

export interface RooftopChunk {
  group: THREE.Group;
  zStart: number;
  zEnd: number;
  hasGap: boolean;
  gapStart: number;
  gapLength: number;
}

export interface ActiveObstacle {
  data: ObstacleData;
  mesh: THREE.Group;
  collider: THREE.Box3;
}

export interface ActiveCollectible {
  data: CollectibleData;
  mesh: THREE.Group;
  baseY: number;
}

export class LevelManager {
  public scene: THREE.Scene;
  public chunks: RooftopChunk[] = [];
  public obstacles: ActiveObstacle[] = [];
  public collectibles: ActiveCollectible[] = [];
  public backgroundGroup: THREE.Group;

  private nextChunkZ = 0;
  private nextObstacleId = 1;
  private nextCollectibleId = 1;
  private lastObstacleZ = 20; // safe zone at beginning

  // Materials for track & skyline
  private roofMat: THREE.MeshStandardMaterial;
  private roofSideMat: THREE.MeshStandardMaterial;
  private laneDividerMat: THREE.MeshBasicMaterial;
  private edgeGlowMat: THREE.MeshStandardMaterial;
  private buildingMat: THREE.MeshStandardMaterial;
  private windowMat: THREE.MeshBasicMaterial;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.backgroundGroup = new THREE.Group();
    this.scene.add(this.backgroundGroup);

    // Initialize track materials
    this.roofMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8,
      metalness: 0.2
    });

    this.roofSideMat = new THREE.MeshStandardMaterial({
      color: 0x070b14,
      roughness: 0.9,
      metalness: 0.1
    });

    this.laneDividerMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.7
    });

    this.edgeGlowMat = new THREE.MeshStandardMaterial({
      color: 0xec4899,
      emissive: 0xec4899,
      emissiveIntensity: 1.5,
      roughness: 0.2,
      metalness: 0.8
    });

    this.buildingMat = new THREE.MeshStandardMaterial({
      color: 0x0a071b,
      roughness: 0.9,
      metalness: 0.2
    });

    this.windowMat = new THREE.MeshBasicMaterial({
      color: 0xf43f5e
    });

    this.buildCitySkyline();
  }

  public reset() {
    // Clear obstacles
    this.obstacles.forEach(o => this.scene.remove(o.mesh));
    this.obstacles = [];

    // Clear collectibles
    this.collectibles.forEach(c => this.scene.remove(c.mesh));
    this.collectibles = [];

    // Clear chunks
    this.chunks.forEach(c => this.scene.remove(c.group));
    this.chunks = [];

    this.nextChunkZ = 0;
    this.nextObstacleId = 1;
    this.nextCollectibleId = 1;
    this.lastObstacleZ = 24; // safety head start

    // Generate initial chunks
    for (let i = 0; i < ACTIVE_CHUNKS; i++) {
      this.spawnChunk(i > 1); // no gaps in the first two chunks
    }
  }

  private buildCitySkyline() {
    // Build procedural skyscraper silhouettes on left and right flanks
    const buildingGeom = new THREE.BoxGeometry(1, 1, 1);

    // Left and right flank towers
    for (let i = -10; i < 40; i++) {
      const zPos = i * 20;

      // Left building cluster
      const leftH = 30 + Math.random() * 45;
      const leftW = 12 + Math.random() * 8;
      const leftD = 12 + Math.random() * 8;
      const leftX = -25 - Math.random() * 20;
      const leftTower = new THREE.Mesh(buildingGeom, this.buildingMat);
      leftTower.scale.set(leftW, leftH, leftD);
      leftTower.position.set(leftX, leftH / 2 - 15, zPos);
      this.backgroundGroup.add(leftTower);

      // Neon antenna spire on tall towers
      if (Math.random() > 0.4) {
        const spireGeom = new THREE.CylinderGeometry(0.1, 0.4, 12, 6);
        const spireMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
        const spire = new THREE.Mesh(spireGeom, spireMat);
        spire.position.set(leftX, leftH - 15 + 6, zPos);
        this.backgroundGroup.add(spire);
      }

      // Right building cluster
      const rightH = 25 + Math.random() * 50;
      const rightW = 12 + Math.random() * 8;
      const rightD = 12 + Math.random() * 8;
      const rightX = 25 + Math.random() * 20;
      const rightTower = new THREE.Mesh(buildingGeom, this.buildingMat);
      rightTower.scale.set(rightW, rightH, rightD);
      rightTower.position.set(rightX, rightH / 2 - 15, zPos);
      this.backgroundGroup.add(rightTower);

      if (Math.random() > 0.4) {
        const spireGeom = new THREE.CylinderGeometry(0.1, 0.4, 12, 6);
        const spireMat = new THREE.MeshBasicMaterial({ color: 0xec4899 });
        const spire = new THREE.Mesh(spireGeom, spireMat);
        spire.position.set(rightX, rightH - 15 + 6, zPos);
        this.backgroundGroup.add(spire);
      }
    }

    // Flying cyber vehicle light streams in the distance
    const flyPathGeom = new THREE.CylinderGeometry(0.08, 0.08, 800, 6);
    flyPathGeom.rotateX(Math.PI / 2);
    const flyPathMat1 = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35 });
    const flyPath1 = new THREE.Mesh(flyPathGeom, flyPathMat1);
    flyPath1.position.set(-45, 18, 200);
    this.backgroundGroup.add(flyPath1);

    const flyPathMat2 = new THREE.MeshBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.35 });
    const flyPath2 = new THREE.Mesh(flyPathGeom, flyPathMat2);
    flyPath2.position.set(50, 24, 200);
    this.backgroundGroup.add(flyPath2);
  }

  private spawnChunk(allowGap = true) {
    const chunkGroup = new THREE.Group();
    const zStart = this.nextChunkZ;
    const hasGap = allowGap && Math.random() < 0.22;
    const gapLength = hasGap ? 6.5 : 0;
    const roofLength = CHUNK_LENGTH - gapLength;
    const zEnd = zStart + CHUNK_LENGTH;

    // Track surface width: 3 lanes * 2.5 + shoulders = 9.2m
    const trackWidth = 9.2;
    const roofGeom = new THREE.BoxGeometry(trackWidth, 1.2, roofLength);
    const roofMesh = new THREE.Mesh(roofGeom, this.roofMat);
    roofMesh.position.set(0, -0.6, zStart + roofLength / 2);
    roofMesh.receiveShadow = true;
    chunkGroup.add(roofMesh);

    // Deep building facade beneath rooftop
    const facadeGeom = new THREE.BoxGeometry(trackWidth * 1.05, 30, roofLength);
    const facadeMesh = new THREE.Mesh(facadeGeom, this.roofSideMat);
    facadeMesh.position.set(0, -15 - 1.2, zStart + roofLength / 2);
    chunkGroup.add(facadeMesh);

    // Glowing Lane Dividers (two divider strips between the 3 lanes)
    const dividerGeom = new THREE.PlaneGeometry(0.12, roofLength);
    dividerGeom.rotateX(-Math.PI / 2);

    const div1 = new THREE.Mesh(dividerGeom, this.laneDividerMat);
    div1.position.set(-LANE_WIDTH / 2, 0.02, zStart + roofLength / 2);
    chunkGroup.add(div1);

    const div2 = new THREE.Mesh(dividerGeom, this.laneDividerMat);
    div2.position.set(LANE_WIDTH / 2, 0.02, zStart + roofLength / 2);
    chunkGroup.add(div2);

    // Neon Edge Rails
    const railGeom = new THREE.BoxGeometry(0.2, 0.35, roofLength);
    const railL = new THREE.Mesh(railGeom, this.edgeGlowMat);
    railL.position.set(-trackWidth / 2 + 0.1, 0.1, zStart + roofLength / 2);
    chunkGroup.add(railL);

    const railR = new THREE.Mesh(railGeom, this.edgeGlowMat);
    railR.position.set(trackWidth / 2 - 0.1, 0.1, zStart + roofLength / 2);
    chunkGroup.add(railR);

    // Decorative rooftop props (solar arrays, AC vents on outer shoulders)
    if (Math.random() > 0.3) {
      const ventGeom = new THREE.CylinderGeometry(0.7, 0.7, 0.6, 8);
      const ventMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
      const vent = new THREE.Mesh(ventGeom, ventMat);
      const side = Math.random() > 0.5 ? -3.8 : 3.8;
      vent.position.set(side, 0.3, zStart + 10 + Math.random() * 20);
      chunkGroup.add(vent);
    }

    // Gap warning laser edge if there is a chasm gap
    if (hasGap) {
      const warningGeom = new THREE.BoxGeometry(trackWidth, 0.1, 0.2);
      const warningMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const warningBar = new THREE.Mesh(warningGeom, warningMat);
      warningBar.position.set(0, 0.05, zStart + roofLength - 0.2);
      chunkGroup.add(warningBar);
    }

    this.scene.add(chunkGroup);

    const chunkData: RooftopChunk = {
      group: chunkGroup,
      zStart,
      zEnd,
      hasGap,
      gapStart: zStart + roofLength,
      gapLength
    };

    this.chunks.push(chunkData);
    this.nextChunkZ = zEnd;

    // Spawn obstacles and items in this chunk
    this.populateChunk(chunkData);
  }

  private populateChunk(chunk: RooftopChunk) {
    const usableZStart = Math.max(chunk.zStart + 4, this.lastObstacleZ + 12);
    const usableZEnd = chunk.hasGap ? chunk.gapStart - 6 : chunk.zEnd - 4;

    if (usableZEnd - usableZStart < 10) return;

    let currentZ = usableZStart;

    while (currentZ < usableZEnd) {
      // Decide whether to spawn obstacle or collectible cluster
      const spawnType = Math.random();

      if (spawnType < 0.6) {
        // Spawn Obstacle pattern
        this.spawnObstaclePattern(currentZ);
        currentZ += 16 + Math.random() * 10;
      } else {
        // Spawn Collectible stream (orbs, gems, power-ups)
        this.spawnCollectibleStream(currentZ);
        currentZ += 12 + Math.random() * 8;
      }
    }

    // If chunk has a gap, register gap hazard
    if (chunk.hasGap) {
      this.obstacles.push({
        data: {
          id: this.nextObstacleId++,
          type: 'chasm_gap',
          lane: 0,
          z: chunk.gapStart + chunk.gapLength / 2
        },
        mesh: new THREE.Group(), // invisible collider representation
        collider: new THREE.Box3(
          new THREE.Vector3(-4.5, -5, chunk.gapStart),
          new THREE.Vector3(4.5, 0.2, chunk.gapStart + chunk.gapLength)
        )
      });
    }

    this.lastObstacleZ = currentZ;
  }

  private spawnObstaclePattern(z: number) {
    // Fair pattern rules: At least 1 lane is always open and playable!
    const lanes: Lane[] = [-1, 0, 1];
    const patternType = Math.floor(Math.random() * 5);

    if (patternType === 0) {
      // Single low barrier (Jump over)
      const targetLane = lanes[Math.floor(Math.random() * 3)];
      this.createObstacle('barrier_low', targetLane, z);
      // Place an arc of orbs right over it!
      this.spawnJumpOrbArc(targetLane, z);
    } else if (patternType === 1) {
      // Overhead beam (Slide under)
      const targetLane = lanes[Math.floor(Math.random() * 3)];
      this.createObstacle('overhead_beam', targetLane, z);
      // Place low orbs right under the beam
      this.spawnSlideOrbStream(targetLane, z);
    } else if (patternType === 2) {
      // Full Blocker in one lane, moving cart in second, third lane clear
      const shuffled = [...lanes].sort(() => Math.random() - 0.5);
      this.createObstacle('full_blocker', shuffled[0], z);
      if (Math.random() > 0.4) {
        this.createObstacle('moving_cart', shuffled[1], z);
      }
      // Orbs in safe lane
      this.spawnOrbStream(shuffled[2], z - 2, 4);
    } else if (patternType === 3) {
      // Two full blockers with a single middle escape or side escape lane
      const freeLane = lanes[Math.floor(Math.random() * 3)];
      lanes.forEach(l => {
        if (l !== freeLane) {
          this.createObstacle('full_blocker', l, z);
        }
      });
      // Guiding orbs leading through the safe opening!
      this.spawnOrbStream(freeLane, z - 4, 5);
    } else {
      // Moving patrol cart
      const targetLane = lanes[Math.floor(Math.random() * 3)];
      this.createObstacle('moving_cart', targetLane, z);
    }
  }

  private createObstacle(type: ObstacleData['type'], lane: Lane, z: number) {
    let mesh: THREE.Group;
    let collider: THREE.Box3;
    const x = LANE_X[lane];

    if (type === 'barrier_low') {
      mesh = createBarrierLow();
      mesh.position.set(x, 0, z);
      collider = new THREE.Box3(
        new THREE.Vector3(x - 1.1, 0, z - 0.3),
        new THREE.Vector3(x + 1.1, 0.9, z + 0.3)
      );
    } else if (type === 'overhead_beam') {
      mesh = createOverheadBeam();
      mesh.position.set(x, 0, z);
      // Collider starts at y=1.2 to y=2.6 so sliding (y <= 0.8) passes under!
      collider = new THREE.Box3(
        new THREE.Vector3(x - 1.2, 1.2, z - 0.4),
        new THREE.Vector3(x + 1.2, 2.7, z + 0.4)
      );
    } else if (type === 'moving_cart') {
      mesh = createMovingCart();
      mesh.position.set(x, 0, z);
      collider = new THREE.Box3(
        new THREE.Vector3(x - 0.7, 0, z - 1.1),
        new THREE.Vector3(x + 0.7, 1.2, z + 1.1)
      );
    } else {
      // full_blocker
      mesh = createFullBlocker();
      mesh.position.set(x, 0, z);
      collider = new THREE.Box3(
        new THREE.Vector3(x - 0.9, 0, z - 0.8),
        new THREE.Vector3(x + 0.9, 3.4, z + 0.8)
      );
    }

    this.scene.add(mesh);
    this.obstacles.push({
      data: {
        id: this.nextObstacleId++,
        type,
        lane,
        z,
        speed: type === 'moving_cart' ? 3.5 : 0,
        dir: 1
      },
      mesh,
      collider
    });
  }

  private spawnCollectibleStream(z: number) {
    const lanes: Lane[] = [-1, 0, 1];
    const lane = lanes[Math.floor(Math.random() * 3)];
    const roll = Math.random();

    if (roll < 0.15) {
      // Power-up Crate!
      const powerTypes: PowerUpType[] = ['magnet', 'doubleScore', 'jetpack', 'shield'];
      const chosenType = powerTypes[Math.floor(Math.random() * powerTypes.length)];
      this.createPowerup(chosenType, lane, z);
    } else if (roll < 0.3) {
      // Rare Gem!
      this.createGemItem(lane, z);
      // Flanked by orbs
      this.createOrb(lane, z - 2.5, 0.8);
      this.createOrb(lane, z + 2.5, 0.8);
    } else {
      // Standard stream of 4-6 energy orbs
      this.spawnOrbStream(lane, z, 5);
    }
  }

  private spawnOrbStream(lane: Lane, startZ: number, count: number) {
    for (let i = 0; i < count; i++) {
      this.createOrb(lane, startZ + i * 2.2, 0.8);
    }
  }

  private spawnJumpOrbArc(lane: Lane, barrierZ: number) {
    // 5 orbs forming a parabola arc over the barrier
    const offsets = [-3, -1.5, 0, 1.5, 3];
    const heights = [0.8, 1.7, 2.3, 1.7, 0.8];
    offsets.forEach((off, idx) => {
      this.createOrb(lane, barrierZ + off, heights[idx]);
    });
  }

  private spawnSlideOrbStream(lane: Lane, beamZ: number) {
    [-2, 0, 2].forEach(off => {
      this.createOrb(lane, beamZ + off, 0.4);
    });
  }

  private createOrb(lane: Lane, z: number, y: number) {
    const mesh = createEnergyOrb();
    mesh.position.set(LANE_X[lane], y, z);
    this.scene.add(mesh);

    this.collectibles.push({
      data: {
        id: this.nextCollectibleId++,
        type: 'orb',
        lane,
        z,
        y
      },
      mesh,
      baseY: y
    });
  }

  private createGemItem(lane: Lane, z: number) {
    const mesh = createGem();
    mesh.position.set(LANE_X[lane], 1.0, z);
    this.scene.add(mesh);

    this.collectibles.push({
      data: {
        id: this.nextCollectibleId++,
        type: 'gem',
        lane,
        z,
        y: 1.0
      },
      mesh,
      baseY: 1.0
    });
  }

  private createPowerup(powerUpType: PowerUpType, lane: Lane, z: number) {
    const mesh = createPowerUpCrate(powerUpType);
    mesh.position.set(LANE_X[lane], 1.1, z);
    this.scene.add(mesh);

    this.collectibles.push({
      data: {
        id: this.nextCollectibleId++,
        type: 'powerup',
        powerUpType,
        lane,
        z,
        y: 1.1
      },
      mesh,
      baseY: 1.1
    });
  }

  // High-altitude orb trail generated during Jetpack flight!
  public spawnSkyTrail(playerZ: number) {
    const lanes: Lane[] = [-1, 0, 1];
    lanes.forEach(lane => {
      for (let i = 0; i < 8; i++) {
        this.createOrb(lane, playerZ + 15 + i * 3, 5.5);
      }
    });
  }

  public update(playerZ: number, delta: number, time: number) {
    // 1. Recycle chunks that are far behind player
    if (this.chunks.length > 0 && this.chunks[0].zEnd < playerZ - 20) {
      const oldChunk = this.chunks.shift()!;
      this.scene.remove(oldChunk.group);
      this.spawnChunk(true);
    }

    // 2. Animate and prune obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];

      // Remove obstacles behind player
      if (obs.data.z < playerZ - 15) {
        this.scene.remove(obs.mesh);
        this.obstacles.splice(i, 1);
        continue;
      }

      // Moving cart updates
      if (obs.data.type === 'moving_cart' && obs.data.speed) {
        obs.data.z += obs.data.speed * delta;
        obs.mesh.position.z = obs.data.z;
        obs.collider.min.z = obs.data.z - 1.1;
        obs.collider.max.z = obs.data.z + 1.1;
      }
    }

    // 3. Animate and prune collectibles
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const col = this.collectibles[i];

      if (col.data.z < playerZ - 10 || col.data.collected) {
        this.scene.remove(col.mesh);
        this.collectibles.splice(i, 1);
        continue;
      }

      // Gentle floating bob & spin
      col.mesh.rotation.y = time * 3;
      col.mesh.position.y = col.baseY + Math.sin(time * 4 + col.data.id) * 0.12;
    }

    // 4. City backdrop follow (smoothly scrolls with player)
    this.backgroundGroup.position.z = playerZ * 0.75;
  }
}

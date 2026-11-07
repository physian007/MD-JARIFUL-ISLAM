/**
 * Neon Dash - Procedural 3D Models
 * Built strictly according to Three.js composite procedural guidelines (3-12 parts per object,
 * zero external files, varied roughness/metalness, grounded pivots).
 */

import * as THREE from 'three';
import { CharacterConfig, PowerUpType } from './types';

// Shared Materials & Shaders for procedural consistency
const MAT_DARK_METAL = new THREE.MeshStandardMaterial({
  color: 0x1e222d,
  roughness: 0.35,
  metalness: 0.85
});

const MAT_CHROME = new THREE.MeshStandardMaterial({
  color: 0x94a3b8,
  roughness: 0.15,
  metalness: 0.95
});

const MAT_HAZARD_YELLOW = new THREE.MeshStandardMaterial({
  color: 0xf59e0b,
  roughness: 0.4,
  metalness: 0.2
});

const MAT_HAZARD_STRIPE = new THREE.MeshStandardMaterial({
  color: 0x18181b,
  roughness: 0.5,
  metalness: 0.1
});

export interface CharacterModelRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  head: THREE.Group;
  leftLegPivot: THREE.Group;
  rightLegPivot: THREE.Group;
  leftArmPivot: THREE.Group;
  rightArmPivot: THREE.Group;
  visorMesh: THREE.Mesh;
  sneakerGlows: THREE.Mesh[];
  jetpackMesh: THREE.Group;
  shieldBubble: THREE.Mesh;
  updateAnimation: (time: number, speed: number, isJumping: boolean, isSliding: boolean, isFlying: boolean, laneOffset: number) => void;
}

export function createProceduralCourier(char: CharacterConfig): CharacterModelRig {
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  // Materials based on character config
  const jacketMat = new THREE.MeshStandardMaterial({
    color: char.jacketColor,
    roughness: 0.3,
    metalness: 0.4
  });

  const pantsMat = new THREE.MeshStandardMaterial({
    color: char.pantsColor,
    roughness: 0.7,
    metalness: 0.15
  });

  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xd4a373,
    roughness: 0.65,
    metalness: 0.05
  });

  const hairMat = new THREE.MeshStandardMaterial({
    color: char.hairColor,
    roughness: 0.8,
    metalness: 0.2
  });

  const visorMat = new THREE.MeshStandardMaterial({
    color: char.visorColor,
    emissive: char.visorColor,
    emissiveIntensity: 1.5,
    roughness: 0.1,
    metalness: 0.9
  });

  const sneakerGlowMat = new THREE.MeshStandardMaterial({
    color: char.sneakerGlow,
    emissive: char.sneakerGlow,
    emissiveIntensity: 2.0,
    roughness: 0.2,
    metalness: 0.5
  });

  const shoeMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.5,
    metalness: 0.3
  });

  // 1. Torso & Jacket (Primary Silhouette)
  const torsoGeom = new THREE.BoxGeometry(0.55, 0.65, 0.35);
  const torso = new THREE.Mesh(torsoGeom, jacketMat);
  torso.position.y = 1.05;
  torso.castShadow = true;
  torso.receiveShadow = true;
  bodyGroup.add(torso);

  // Jacket collar & zipper line
  const collarGeom = new THREE.CylinderGeometry(0.18, 0.22, 0.12, 8);
  const collar = new THREE.Mesh(collarGeom, MAT_DARK_METAL);
  collar.position.y = 1.4;
  bodyGroup.add(collar);

  const zipperGeom = new THREE.BoxGeometry(0.06, 0.6, 0.04);
  const zipper = new THREE.Mesh(zipperGeom, MAT_CHROME);
  zipper.position.set(0, 1.05, 0.18);
  bodyGroup.add(zipper);

  // Courier Battery Backpack (Secondary Silhouette)
  const backpackGroup = new THREE.Group();
  backpackGroup.position.set(0, 1.08, -0.22);
  const packGeom = new THREE.BoxGeometry(0.38, 0.48, 0.18);
  const packMesh = new THREE.Mesh(packGeom, MAT_DARK_METAL);
  backpackGroup.add(packMesh);

  // Glowing battery bar on backpack
  const batteryBarGeom = new THREE.BoxGeometry(0.24, 0.08, 0.04);
  const batteryBar = new THREE.Mesh(batteryBarGeom, sneakerGlowMat);
  batteryBar.position.set(0, 0, -0.1);
  backpackGroup.add(batteryBar);
  bodyGroup.add(backpackGroup);

  // 2. Head Group (Accent & Secondary)
  const headGroup = new THREE.Group();
  headGroup.position.y = 1.55;

  // Face
  const faceGeom = new THREE.BoxGeometry(0.32, 0.32, 0.3);
  const face = new THREE.Mesh(faceGeom, skinMat);
  face.castShadow = true;
  headGroup.add(face);

  // Hair
  const hairGeom = new THREE.BoxGeometry(0.35, 0.16, 0.34);
  const hair = new THREE.Mesh(hairGeom, hairMat);
  hair.position.set(0, 0.14, -0.02);
  headGroup.add(hair);

  // Cyber Visor
  const visorGeom = new THREE.BoxGeometry(0.34, 0.12, 0.12);
  const visorMesh = new THREE.Mesh(visorGeom, visorMat);
  visorMesh.position.set(0, 0.04, 0.14);
  headGroup.add(visorMesh);
  bodyGroup.add(headGroup);

  // 3. Arms (Articulated Pivots)
  const armGeom = new THREE.BoxGeometry(0.14, 0.55, 0.14);
  armGeom.translate(0, -0.22, 0); // pivot at shoulder

  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.35, 1.3, 0);
  const leftArm = new THREE.Mesh(armGeom, jacketMat);
  leftArm.castShadow = true;
  leftArmPivot.add(leftArm);
  bodyGroup.add(leftArmPivot);

  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.35, 1.3, 0);
  const rightArm = new THREE.Mesh(armGeom, jacketMat);
  rightArm.castShadow = true;
  rightArmPivot.add(rightArm);
  bodyGroup.add(rightArmPivot);

  // 4. Legs & Glowing High-Tops (Articulated Pivots)
  const legGeom = new THREE.BoxGeometry(0.16, 0.65, 0.16);
  legGeom.translate(0, -0.3, 0); // pivot at hip

  const shoeGeom = new THREE.BoxGeometry(0.18, 0.14, 0.32);
  shoeGeom.translate(0, -0.65, 0.05);

  const soleGlowGeom = new THREE.BoxGeometry(0.19, 0.04, 0.33);
  soleGlowGeom.translate(0, -0.71, 0.05);

  const sneakerGlows: THREE.Mesh[] = [];

  // Left Leg
  const leftLegPivot = new THREE.Group();
  leftLegPivot.position.set(-0.16, 0.72, 0);
  const leftPants = new THREE.Mesh(legGeom, pantsMat);
  leftPants.castShadow = true;
  leftLegPivot.add(leftPants);

  const leftShoe = new THREE.Mesh(shoeGeom, shoeMat);
  leftShoe.castShadow = true;
  leftLegPivot.add(leftShoe);

  const leftSole = new THREE.Mesh(soleGlowGeom, sneakerGlowMat);
  leftLegPivot.add(leftSole);
  sneakerGlows.push(leftSole);
  bodyGroup.add(leftLegPivot);

  // Right Leg
  const rightLegPivot = new THREE.Group();
  rightLegPivot.position.set(0.16, 0.72, 0);
  const rightPants = new THREE.Mesh(legGeom, pantsMat);
  rightPants.castShadow = true;
  rightLegPivot.add(rightPants);

  const rightShoe = new THREE.Mesh(shoeGeom, shoeMat);
  rightShoe.castShadow = true;
  rightLegPivot.add(rightShoe);

  const rightSole = new THREE.Mesh(soleGlowGeom, sneakerGlowMat);
  rightLegPivot.add(rightSole);
  sneakerGlows.push(rightSole);
  bodyGroup.add(rightLegPivot);

  // 5. Jetpack Attachment (shown when Jetpack power-up active)
  const jetpackGroup = new THREE.Group();
  jetpackGroup.position.set(0, 1.1, -0.35);
  jetpackGroup.visible = false;

  const thrusterGeom = new THREE.CylinderGeometry(0.08, 0.12, 0.45, 8);
  const thrusterL = new THREE.Mesh(thrusterGeom, MAT_DARK_METAL);
  thrusterL.position.x = -0.2;
  const thrusterR = new THREE.Mesh(thrusterGeom, MAT_DARK_METAL);
  thrusterR.position.x = 0.2;
  jetpackGroup.add(thrusterL, thrusterR);

  // Glowing thruster flame
  const flameGeom = new THREE.ConeGeometry(0.09, 0.35, 8);
  flameGeom.rotateX(Math.PI);
  flameGeom.translate(0, -0.35, 0);
  const flameMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
  const flameL = new THREE.Mesh(flameGeom, flameMat);
  flameL.position.x = -0.2;
  const flameR = new THREE.Mesh(flameGeom, flameMat);
  flameR.position.x = 0.2;
  jetpackGroup.add(flameL, flameR);
  bodyGroup.add(jetpackGroup);

  // 6. Shield Holographic Bubble
  const shieldGeom = new THREE.SphereGeometry(1.2, 16, 16);
  const shieldMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    transparent: true,
    opacity: 0.35,
    roughness: 0.1,
    metalness: 0.9,
    emissive: 0x0891b2,
    emissiveIntensity: 0.8,
    wireframe: true
  });
  const shieldBubble = new THREE.Mesh(shieldGeom, shieldMat);
  shieldBubble.position.set(0, 0.9, 0);
  shieldBubble.visible = false;
  root.add(shieldBubble);

  // Animation controller
  const updateAnimation = (
    time: number,
    speed: number,
    isJumping: boolean,
    isSliding: boolean,
    isFlying: boolean,
    laneOffset: number
  ) => {
    // Lean into lane change
    bodyGroup.rotation.z = -laneOffset * 0.15;
    bodyGroup.rotation.y = -laneOffset * 0.1;

    if (isFlying) {
      // Flying pose: legs trailing, arms forward
      leftLegPivot.rotation.x = 0.3;
      rightLegPivot.rotation.x = 0.3;
      leftArmPivot.rotation.x = -1.2;
      rightArmPivot.rotation.x = -1.2;
      bodyGroup.rotation.x = 0.4;
      bodyGroup.position.y = 0;
      // Pulse thrusters
      const flicker = 0.8 + Math.sin(time * 30) * 0.2;
      flameL.scale.set(flicker, flicker * 1.2, flicker);
      flameR.scale.set(flicker, flicker * 1.2, flicker);
    } else if (isSliding) {
      // Slide pose: low forward lean, one leg stretched forward
      bodyGroup.position.y = -0.4;
      bodyGroup.rotation.x = -0.8;
      leftLegPivot.rotation.x = -1.2;
      rightLegPivot.rotation.x = -0.4;
      leftArmPivot.rotation.x = 0.6;
      rightArmPivot.rotation.x = 0.6;
    } else if (isJumping) {
      // Jump pose: knees tucked up, arms outstretched
      bodyGroup.position.y = 0;
      bodyGroup.rotation.x = 0.1;
      leftLegPivot.rotation.x = -0.8;
      rightLegPivot.rotation.x = -0.5;
      leftArmPivot.rotation.x = -1.1;
      rightArmPivot.rotation.x = -0.9;
    } else {
      // Running gait
      const strideFreq = speed * 0.55;
      const legAngle = Math.sin(time * strideFreq) * 0.75;
      const armAngle = Math.sin(time * strideFreq) * 0.65;

      leftLegPivot.rotation.x = legAngle;
      rightLegPivot.rotation.x = -legAngle;
      leftArmPivot.rotation.x = -armAngle;
      rightArmPivot.rotation.x = armAngle;

      bodyGroup.rotation.x = 0.08; // subtle forward sprint lean
      bodyGroup.position.y = Math.abs(Math.sin(time * strideFreq * 2)) * 0.08; // vertical bounce
    }

    if (shieldBubble.visible) {
      shieldBubble.rotation.y = time * 2;
      shieldBubble.rotation.x = time * 0.5;
    }
  };

  return {
    root,
    bodyGroup,
    head: headGroup,
    leftLegPivot,
    rightLegPivot,
    leftArmPivot,
    rightArmPivot,
    visorMesh,
    sneakerGlows,
    jetpackMesh: jetpackGroup,
    shieldBubble,
    updateAnimation
  };
}

// ---------------- ROBOT FOX SIDEKICK: KITSUNE-09 ----------------

export function createProceduralFox(): {
  root: THREE.Group;
  update: (time: number, speed: number, playerPos: THREE.Vector3) => void;
} {
  const root = new THREE.Group();

  const foxMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.3,
    metalness: 0.7
  });

  const neonOrangeMat = new THREE.MeshStandardMaterial({
    color: 0xf97316,
    emissive: 0xea580c,
    emissiveIntensity: 1.2,
    roughness: 0.2,
    metalness: 0.5
  });

  const cyanEyeMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });

  // Fox body
  const bodyGeom = new THREE.BoxGeometry(0.3, 0.22, 0.5);
  const body = new THREE.Mesh(bodyGeom, foxMat);
  body.position.y = 0.35;
  root.add(body);

  // Fox Head
  const headGeom = new THREE.ConeGeometry(0.18, 0.32, 4);
  headGeom.rotateX(Math.PI / 2);
  headGeom.rotateY(Math.PI / 4);
  const head = new THREE.Mesh(headGeom, foxMat);
  head.position.set(0, 0.42, 0.32);
  root.add(head);

  // Ears
  const earGeom = new THREE.ConeGeometry(0.08, 0.18, 4);
  const earL = new THREE.Mesh(earGeom, neonOrangeMat);
  earL.position.set(-0.1, 0.58, 0.26);
  earL.rotation.z = -0.3;
  const earR = new THREE.Mesh(earGeom, neonOrangeMat);
  earR.position.set(0.1, 0.58, 0.26);
  earR.rotation.z = 0.3;
  root.add(earL, earR);

  // Eyes
  const eyeGeom = new THREE.BoxGeometry(0.06, 0.03, 0.02);
  const eyeL = new THREE.Mesh(eyeGeom, cyanEyeMat);
  eyeL.position.set(-0.07, 0.44, 0.45);
  const eyeR = new THREE.Mesh(eyeGeom, cyanEyeMat);
  eyeR.position.set(0.07, 0.44, 0.45);
  root.add(eyeL, eyeR);

  // Twin Cyber Tails
  const tailGroupL = new THREE.Group();
  tailGroupL.position.set(-0.08, 0.38, -0.25);
  const tailGeom = new THREE.CylinderGeometry(0.02, 0.07, 0.45, 6);
  tailGeom.translate(0, 0.2, 0);
  tailGeom.rotateX(-0.7);
  const tailMeshL = new THREE.Mesh(tailGeom, neonOrangeMat);
  tailGroupL.add(tailMeshL);

  const tailGroupR = new THREE.Group();
  tailGroupR.position.set(0.08, 0.38, -0.25);
  const tailMeshR = new THREE.Mesh(tailGeom, neonOrangeMat);
  tailGroupR.add(tailMeshR);

  root.add(tailGroupL, tailGroupR);

  // 4 Legs
  const legGeom = new THREE.BoxGeometry(0.08, 0.22, 0.08);
  legGeom.translate(0, -0.1, 0);
  const legFL = new THREE.Mesh(legGeom, foxMat);
  legFL.position.set(-0.12, 0.22, 0.16);
  const legFR = new THREE.Mesh(legGeom, foxMat);
  legFR.position.set(0.12, 0.22, 0.16);
  const legBL = new THREE.Mesh(legGeom, foxMat);
  legBL.position.set(-0.12, 0.22, -0.16);
  const legBR = new THREE.Mesh(legGeom, foxMat);
  legBR.position.set(0.12, 0.22, -0.16);
  root.add(legFL, legFR, legBL, legBR);

  const update = (time: number, speed: number, playerPos: THREE.Vector3) => {
    // Hover / run smoothly alongside player with slight lag
    const targetX = playerPos.x - 1.4;
    const targetY = Math.max(0, playerPos.y);
    const targetZ = playerPos.z + 0.3;

    root.position.x += (targetX - root.position.x) * 0.1;
    root.position.y += (targetY - root.position.y) * 0.15;
    root.position.z = targetZ;

    // Running gait
    const gait = time * speed * 0.8;
    legFL.rotation.x = Math.sin(gait) * 0.8;
    legBR.rotation.x = Math.sin(gait) * 0.8;
    legFR.rotation.x = -Math.sin(gait) * 0.8;
    legBL.rotation.x = -Math.sin(gait) * 0.8;

    // Tail swishing
    tailGroupL.rotation.y = Math.sin(time * 6) * 0.4 + 0.2;
    tailGroupR.rotation.y = Math.sin(time * 6 + 0.5) * 0.4 - 0.2;
    tailGroupL.rotation.z = Math.sin(time * 8) * 0.2;
    tailGroupR.rotation.z = -Math.sin(time * 8) * 0.2;

    // Bounce
    body.position.y = 0.35 + Math.abs(Math.sin(gait * 2)) * 0.05;
  };

  return { root, update };
}

// ---------------- PATROL DRONE K-99 (CHASER DRONE) ----------------

export function createProceduralDrone(): {
  root: THREE.Group;
  update: (time: number, playerPos: THREE.Vector3, isStumbling: boolean) => void;
} {
  const root = new THREE.Group();

  const chassisMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.3,
    metalness: 0.9
  });

  const armorMat = new THREE.MeshStandardMaterial({
    color: 0xd97706, // Amber warning armor
    roughness: 0.4,
    metalness: 0.5
  });

  const rotorMat = new THREE.MeshBasicMaterial({
    color: 0x06b6d4,
    transparent: true,
    opacity: 0.7
  });

  const redStrobeMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

  // Central stealth hull (Hexagonal)
  const hullGeom = new THREE.CylinderGeometry(0.5, 0.4, 0.25, 6);
  const hull = new THREE.Mesh(hullGeom, chassisMat);
  root.add(hull);

  // Upper armor plate
  const armorPlateGeom = new THREE.BoxGeometry(0.65, 0.08, 0.65);
  const armorPlate = new THREE.Mesh(armorPlateGeom, armorMat);
  armorPlate.position.y = 0.14;
  root.add(armorPlate);

  // Camera eye
  const eyeGeom = new THREE.SphereGeometry(0.12, 12, 12);
  const eyeMesh = new THREE.Mesh(eyeGeom, redStrobeMat);
  eyeMesh.position.set(0, -0.06, 0.4);
  root.add(eyeMesh);

  // Outrigger arms and rotors
  const armGeom = new THREE.BoxGeometry(0.08, 0.06, 1.6);
  const arm1 = new THREE.Mesh(armGeom, chassisMat);
  arm1.rotation.y = Math.PI / 4;
  const arm2 = new THREE.Mesh(armGeom, chassisMat);
  arm2.rotation.y = -Math.PI / 4;
  root.add(arm1, arm2);

  const rotorGeom = new THREE.CylinderGeometry(0.24, 0.24, 0.02, 12);
  const rotors: THREE.Mesh[] = [];
  const rotorPositions = [
    [-0.56, 0.1, -0.56],
    [0.56, 0.1, -0.56],
    [-0.56, 0.1, 0.56],
    [0.56, 0.1, 0.56]
  ];

  rotorPositions.forEach(pos => {
    const rotor = new THREE.Mesh(rotorGeom, rotorMat);
    rotor.position.set(pos[0], pos[1], pos[2]);
    root.add(rotor);
    rotors.push(rotor);
  });

  // Twin Searchlight volumetric beams aiming down and ahead
  const spotLightGeom = new THREE.ConeGeometry(0.7, 5.0, 16, 1, true);
  spotLightGeom.rotateX(-Math.PI / 2.8);
  spotLightGeom.translate(0, -2.2, 1.8);
  const spotLightMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.18,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  const searchLightMesh = new THREE.Mesh(spotLightGeom, spotLightMat);
  root.add(searchLightMesh);

  let currentDist = 8.5;

  const update = (time: number, playerPos: THREE.Vector3, isStumbling: boolean) => {
    // When player stumbles or crashes, drone swoops in closer!
    const targetDist = isStumbling ? 3.0 : 8.5;
    currentDist += (targetDist - currentDist) * 0.08;

    // Follow player with natural hovering motion
    const hoverY = playerPos.y + 2.8 + Math.sin(time * 3.5) * 0.25;
    root.position.x += (playerPos.x * 0.7 - root.position.x) * 0.08;
    root.position.y += (hoverY - root.position.y) * 0.1;
    root.position.z = playerPos.z - currentDist;

    // Tilt into movement
    root.rotation.x = 0.2 + Math.sin(time * 2) * 0.05;
    root.rotation.z = Math.sin(time * 1.5) * 0.08;

    // Spin rotors fast
    rotors.forEach((r, idx) => {
      r.rotation.y += (idx % 2 === 0 ? 0.8 : -0.8);
    });

    // Strobe eye
    eyeMesh.scale.setScalar(0.9 + Math.abs(Math.sin(time * 8)) * 0.3);
  };

  return { root, update };
}

// ---------------- OBSTACLES ----------------

export function createBarrierLow(): THREE.Group {
  const group = new THREE.Group();

  // Left & Right Cyber Stanchions
  const postGeom = new THREE.BoxGeometry(0.35, 0.9, 0.35);
  const postL = new THREE.Mesh(postGeom, MAT_DARK_METAL);
  postL.position.set(-1.15, 0.45, 0);
  const postR = new THREE.Mesh(postGeom, MAT_DARK_METAL);
  postR.position.set(1.15, 0.45, 0);
  postL.castShadow = true;
  postR.castShadow = true;
  group.add(postL, postR);

  // Hazard striped lower guard
  const guardGeom = new THREE.BoxGeometry(2.1, 0.2, 0.15);
  const guard = new THREE.Mesh(guardGeom, MAT_HAZARD_YELLOW);
  guard.position.set(0, 0.18, 0);
  guard.castShadow = true;
  group.add(guard);

  // Twin Neon Laser Tubes (height 0.45 & 0.75m)
  const laserGeom = new THREE.CylinderGeometry(0.04, 0.04, 2.3, 8);
  laserGeom.rotateZ(Math.PI / 2);

  const laserMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xef4444,
    emissiveIntensity: 2.2,
    roughness: 0.1,
    metalness: 0.9
  });

  const laser1 = new THREE.Mesh(laserGeom, laserMat);
  laser1.position.set(0, 0.45, 0);
  const laser2 = new THREE.Mesh(laserGeom, laserMat);
  laser2.position.set(0, 0.75, 0);
  group.add(laser1, laser2);

  // Hologram Warning Arrow pointing UP (JUMP)
  const arrowGeom = new THREE.ConeGeometry(0.18, 0.3, 4);
  const arrowMat = new THREE.MeshBasicMaterial({ color: 0xef4444, wireframe: true });
  const arrow = new THREE.Mesh(arrowGeom, arrowMat);
  arrow.position.set(0, 1.15, 0);
  group.add(arrow);

  return group;
}

export function createOverheadBeam(): THREE.Group {
  const group = new THREE.Group();

  // Tall vertical support pillars
  const pillarGeom = new THREE.BoxGeometry(0.3, 3.2, 0.3);
  const pillarL = new THREE.Mesh(pillarGeom, MAT_DARK_METAL);
  pillarL.position.set(-1.25, 1.6, 0);
  const pillarR = new THREE.Mesh(pillarGeom, MAT_DARK_METAL);
  pillarR.position.set(1.25, 1.6, 0);
  pillarL.castShadow = true;
  pillarR.castShadow = true;
  group.add(pillarL, pillarR);

  // Heavy overhead gantry / industrial beam (player must slide under!)
  const beamGeom = new THREE.BoxGeometry(2.4, 0.9, 0.45);
  const beam = new THREE.Mesh(beamGeom, MAT_HAZARD_YELLOW);
  beam.position.set(0, 2.0, 0);
  beam.castShadow = true;
  group.add(beam);

  // Hazard stripe under-plate
  const stripeGeom = new THREE.BoxGeometry(2.4, 0.1, 0.46);
  const stripe = new THREE.Mesh(stripeGeom, MAT_HAZARD_STRIPE);
  stripe.position.set(0, 1.52, 0);
  group.add(stripe);

  // Downward Hologram Arrow (SLIDE)
  const arrowGeom = new THREE.ConeGeometry(0.2, 0.35, 4);
  arrowGeom.rotateZ(Math.PI);
  const arrowMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, wireframe: true });
  const arrow = new THREE.Mesh(arrowGeom, arrowMat);
  arrow.position.set(0, 2.7, 0);
  group.add(arrow);

  return group;
}

export function createMovingCart(): THREE.Group {
  const group = new THREE.Group();

  // Cyber Cargo Cart Chassis
  const chassisGeom = new THREE.BoxGeometry(1.4, 0.65, 2.2);
  const cartMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.35,
    metalness: 0.75
  });
  const chassis = new THREE.Mesh(chassisGeom, cartMat);
  chassis.position.y = 0.45;
  chassis.castShadow = true;
  group.add(chassis);

  // Glowing hover skirts
  const skirtGeom = new THREE.BoxGeometry(1.45, 0.1, 2.25);
  const skirtMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    emissive: 0x06b6d4,
    emissiveIntensity: 1.8
  });
  const skirt = new THREE.Mesh(skirtGeom, skirtMat);
  skirt.position.y = 0.12;
  group.add(skirt);

  // Top flashing hazard beacon
  const beaconGeom = new THREE.CylinderGeometry(0.12, 0.14, 0.2, 8);
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
  const beacon = new THREE.Mesh(beaconGeom, beaconMat);
  beacon.position.set(0, 0.85, 0);
  group.add(beacon);

  return group;
}

export function createFullBlocker(): THREE.Group {
  const group = new THREE.Group();

  // High-voltage HVAC & Rooftop Transformer Tower (blocks entire lane, height 3.2m)
  const mainGeom = new THREE.BoxGeometry(1.6, 3.2, 1.4);
  const tower = new THREE.Mesh(mainGeom, MAT_DARK_METAL);
  tower.position.y = 1.6;
  tower.castShadow = true;
  tower.receiveShadow = true;
  group.add(tower);

  // Dual cooling fan grilles
  const grilleGeom = new THREE.CylinderGeometry(0.42, 0.42, 0.08, 12);
  grilleGeom.rotateX(Math.PI / 2);
  const grille1 = new THREE.Mesh(grilleGeom, MAT_HAZARD_YELLOW);
  grille1.position.set(0, 2.2, 0.72);
  const grille2 = new THREE.Mesh(grilleGeom, MAT_HAZARD_YELLOW);
  grille2.position.set(0, 1.0, 0.72);
  group.add(grille1, grille2);

  // Warning flashing danger sign
  const signGeom = new THREE.PlaneGeometry(0.8, 0.4);
  const signMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide });
  const sign = new THREE.Mesh(signGeom, signMat);
  sign.position.set(0, 3.0, 0.72);
  group.add(sign);

  return group;
}

// ---------------- COLLECTIBLES & POWER-UPS ----------------

export function createEnergyOrb(): THREE.Group {
  const group = new THREE.Group();

  // Central Octahedron Core
  const coreGeom = new THREE.OctahedronGeometry(0.24, 0);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    emissive: 0x06b6d4,
    emissiveIntensity: 2.0,
    roughness: 0.1,
    metalness: 0.9
  });
  const core = new THREE.Mesh(coreGeom, coreMat);
  group.add(core);

  // Orbiting ring
  const ringGeom = new THREE.TorusGeometry(0.38, 0.03, 8, 16);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const ring = new THREE.Mesh(ringGeom, ringMat);
  group.add(ring);

  return group;
}

export function createGem(): THREE.Group {
  const group = new THREE.Group();

  // Prismatic Icosahedron Gem
  const gemGeom = new THREE.IcosahedronGeometry(0.32, 0);
  const gemMat = new THREE.MeshStandardMaterial({
    color: 0xec4899,
    emissive: 0xdb2777,
    emissiveIntensity: 2.2,
    roughness: 0.1,
    metalness: 0.95
  });
  const gem = new THREE.Mesh(gemGeom, gemMat);
  group.add(gem);

  // Outer wireframe shimmer
  const wireGeom = new THREE.IcosahedronGeometry(0.36, 0);
  const wireMat = new THREE.MeshBasicMaterial({ color: 0xf472b6, wireframe: true });
  const wire = new THREE.Mesh(wireGeom, wireMat);
  group.add(wire);

  return group;
}

export function createPowerUpCrate(type: PowerUpType): THREE.Group {
  const group = new THREE.Group();

  const colors: Record<PowerUpType, number> = {
    magnet: 0xef4444,     // Red / Crimson
    doubleScore: 0xf59e0b, // Gold
    jetpack: 0x06b6d4,    // Cyan
    shield: 0x10b981      // Emerald
  };
  const color = colors[type];

  // Holographic outer cube
  const boxGeom = new THREE.BoxGeometry(0.7, 0.7, 0.7);
  const boxMat = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 1.2,
    transparent: true,
    opacity: 0.55,
    roughness: 0.2,
    metalness: 0.8
  });
  const box = new THREE.Mesh(boxGeom, boxMat);
  group.add(box);

  // Wireframe border
  const wireGeom = new THREE.BoxGeometry(0.72, 0.72, 0.72);
  const wireMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
  const wire = new THREE.Mesh(wireGeom, wireMat);
  group.add(wire);

  // Inner 3D symbol representation
  if (type === 'magnet') {
    const magnetGeom = new THREE.TorusGeometry(0.18, 0.05, 8, 12, Math.PI);
    magnetGeom.rotateZ(Math.PI);
    const symbolMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff });
    const magnetMesh = new THREE.Mesh(magnetGeom, symbolMat);
    group.add(magnetMesh);
  } else if (type === 'doubleScore') {
    const starGeom = new THREE.OctahedronGeometry(0.2, 0);
    const starMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const starMesh = new THREE.Mesh(starGeom, starMat);
    group.add(starMesh);
  } else if (type === 'jetpack') {
    const rocketGeom = new THREE.ConeGeometry(0.14, 0.35, 6);
    const rocketMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const rocketMesh = new THREE.Mesh(rocketGeom, rocketMat);
    group.add(rocketMesh);
  } else if (type === 'shield') {
    const shieldGeom = new THREE.DodecahedronGeometry(0.22, 0);
    const shieldMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const shieldMesh = new THREE.Mesh(shieldGeom, shieldMat);
    group.add(shieldMesh);
  }

  return group;
}

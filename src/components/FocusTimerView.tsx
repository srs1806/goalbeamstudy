import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { Profile, LanguageMode, ActiveScreen } from '../types/tracker';
import {
  Play,
  Pause,
  RotateCcw,
  Trophy,
  TreeDeciduous,
  ShieldAlert,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSoftStartupChime } from '../utils/audio';
import { InfoTooltip } from './InfoTooltip';

interface FocusTimerViewProps {
  profile: Profile;
  onUpdateProfile?: (profile: Profile) => void;
  onNavigate?: (screen: ActiveScreen) => void;
  language?: LanguageMode;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  location: string;
  flag: string;
  focusMinutes: number;
  points: number;
  treesGrown: number;
  streakDays: number;
  tier: 'Grandmaster' | 'Master' | 'Diamond' | 'Platinum' | 'Gold';
  isCurrentUser?: boolean;
}

export interface TreeSpeciesDef {
  id: string;
  name: string;
  icon: string;
  canopyColor: number;
  accentColor: number;
  trunkColor: number;
  blossomColor: number;
  fruitColor: number;
  description: string;
}

export const TREE_SPECIES: TreeSpeciesDef[] = [
  {
    id: 'bodhi',
    name: 'Sacred Bodhi Tree (Ficus)',
    icon: '🌳',
    canopyColor: 0x15803d,
    accentColor: 0x166534,
    trunkColor: 0x3d2716,
    blossomColor: 0xfef08a,
    fruitColor: 0xb45309,
    description: 'Lush natural heart-shaped foliage canopy with rich organic wood bark',
  },
  {
    id: 'sakura',
    name: 'Japanese Cherry (Prunus)',
    icon: '🌸',
    canopyColor: 0x166534,
    accentColor: 0x22c55e,
    trunkColor: 0x292524,
    blossomColor: 0xfbcfe8,
    fruitColor: 0x9f1239,
    description: 'Natural weathered cherry bark adorned with authentic soft pink blossom sprays',
  },
  {
    id: 'maple',
    name: 'Japanese Autumn Maple',
    icon: '🍁',
    canopyColor: 0x991b1b,
    accentColor: 0x7f1d1d,
    trunkColor: 0x291810,
    blossomColor: 0xfef3c7,
    fruitColor: 0xc2410c,
    description: 'Natural scarlet vermilion and amber autumn foliage with dark timber limbs',
  },
  {
    id: 'apple',
    name: 'Apple Orchard Tree',
    icon: '🍎',
    canopyColor: 0x15803d,
    accentColor: 0x166534,
    trunkColor: 0x3a2214,
    blossomColor: 0xfff1f2,
    fruitColor: 0xdc2626,
    description: 'Natural spreading orchard canopy laden with realistic ruby apples and blossoms',
  },
  {
    id: 'citrus',
    name: 'Mediterranean Orange Tree',
    icon: '🍊',
    canopyColor: 0x14532d,
    accentColor: 0x166534,
    trunkColor: 0x3c2616,
    blossomColor: 0xffffff,
    fruitColor: 0xea580c,
    description: 'Glossy waxy evergreen leaves with fragrant white blossoms and ripe golden oranges',
  },
  {
    id: 'oak',
    name: 'English Heritage Oak',
    icon: '🌰',
    canopyColor: 0x166534,
    accentColor: 0x14532d,
    trunkColor: 0x362518,
    blossomColor: 0xfde047,
    fruitColor: 0x78350f,
    description: 'Grand spreading oak limbs with deeply fissured bark and natural leaf canopy',
  },
  {
    id: 'bonsai',
    name: 'Zen Evergreen Pine Bonsai',
    icon: '🌲',
    canopyColor: 0x064e3b,
    accentColor: 0x047857,
    trunkColor: 0x261910,
    blossomColor: 0xa7f3d0,
    fruitColor: 0x065f46,
    description: 'Weathered gnarled cedar bark with layered botanical evergreen needle pads',
  },
  {
    id: 'rose',
    name: 'Royal English Rose Arbor',
    icon: '🌹',
    canopyColor: 0x14532d,
    accentColor: 0x166534,
    trunkColor: 0x352113,
    blossomColor: 0xbe123c,
    fruitColor: 0x991b1b,
    description: 'Natural climbing briar stems with deep emerald foliage and velvet crimson roses',
  },
];

export interface GrowthStageDef {
  stage: number;
  title: string;
  shortName: string;
  icon: string;
  description: string;
  scaleMult: number;
  trunkHeight: number;
  canopyDensity: number;
  hasBlossoms: boolean;
  hasFruits: boolean;
}

export const GROWTH_STAGES: GrowthStageDef[] = [
  {
    stage: 1,
    title: 'Stage 1: Tender Sprout & Rootlet',
    shortName: 'Sprout',
    icon: '🌱',
    description: 'A tiny organic shoot breaking through moist loam soil',
    scaleMult: 0.35,
    trunkHeight: 0.35,
    canopyDensity: 0.2,
    hasBlossoms: false,
    hasFruits: false,
  },
  {
    stage: 2,
    title: 'Stage 2: Cotyledon Seedling',
    shortName: 'Seedling',
    icon: '🌿',
    description: 'Slender stem bearing two tender green baby leaves',
    scaleMult: 0.45,
    trunkHeight: 0.48,
    canopyDensity: 0.32,
    hasBlossoms: false,
    hasFruits: false,
  },
  {
    stage: 3,
    title: 'Stage 3: Branching Young Shoot',
    shortName: 'Branching',
    icon: '🪴',
    description: 'Sturdy stem dividing into initial branch forks',
    scaleMult: 0.55,
    trunkHeight: 0.62,
    canopyDensity: 0.46,
    hasBlossoms: false,
    hasFruits: false,
  },
  {
    stage: 4,
    title: 'Stage 4: Anchored Sapling Tree',
    shortName: 'Sapling',
    icon: '🎋',
    description: 'Woody trunk with root flares and primary boughs',
    scaleMult: 0.68,
    trunkHeight: 0.76,
    canopyDensity: 0.6,
    hasBlossoms: false,
    hasFruits: false,
  },
  {
    stage: 5,
    title: 'Stage 5: Budding Foliage Canopy',
    shortName: 'Budding',
    icon: '🍃',
    description: 'Layered botanical foliage pads expanding on scaffold limbs',
    scaleMult: 0.78,
    trunkHeight: 0.86,
    canopyDensity: 0.74,
    hasBlossoms: false,
    hasFruits: false,
  },
  {
    stage: 6,
    title: 'Stage 6: Lush Botanical Crown',
    shortName: 'Lush Crown',
    icon: '🌳',
    description: 'Full dense natural crown sheltering the floating soil',
    scaleMult: 0.86,
    trunkHeight: 0.94,
    canopyDensity: 0.88,
    hasBlossoms: false,
    hasFruits: false,
  },
  {
    stage: 7,
    title: 'Stage 7: Full Flower Blossom',
    shortName: 'Blossoming',
    icon: '🌸',
    description: 'Canopy adorned with delicate blooming blossoms and golden stamens',
    scaleMult: 0.92,
    trunkHeight: 1.0,
    canopyDensity: 0.95,
    hasBlossoms: true,
    hasFruits: false,
  },
  {
    stage: 8,
    title: 'Stage 8: Sovereign Fruitful Tree',
    shortName: 'Mature Tree',
    icon: '👑',
    description: 'Full mature botanical tree laden with ripe hanging fruits and blossoms',
    scaleMult: 0.96,
    trunkHeight: 1.05,
    canopyDensity: 1.0,
    hasBlossoms: true,
    hasFruits: true,
  },
];

export function createRealisticBlossom(species: TreeSpeciesDef): THREE.Group {
  const flower = new THREE.Group();
  // Golden Pistil / Stamen center
  const centerGeo = new THREE.SphereGeometry(0.03, 8, 8);
  const centerMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    roughness: 0.35,
  });
  const centerMesh = new THREE.Mesh(centerGeo, centerMat);
  flower.add(centerMesh);

  // 5 delicate petals
  const petalMat = new THREE.MeshStandardMaterial({
    color: species.blossomColor,
    roughness: 0.3,
  });
  for (let p = 0; p < 5; p++) {
    const pAngle = (p / 5) * Math.PI * 2;
    const petalGeo = new THREE.SphereGeometry(0.046, 8, 8);
    petalGeo.scale(1.25, 0.28, 0.8);
    const petal = new THREE.Mesh(petalGeo, petalMat);
    petal.position.set(Math.cos(pAngle) * 0.04, 0.005, Math.sin(pAngle) * 0.04);
    petal.rotation.y = -pAngle;
    petal.rotation.x = 0.35;
    flower.add(petal);
  }
  return flower;
}

export function createRealisticFruit(species: TreeSpeciesDef): THREE.Group {
  const fruitGroup = new THREE.Group();
  const fGeo = new THREE.SphereGeometry(0.072, 14, 14);
  fGeo.scale(1.05, 0.95, 1.05);
  const fMat = new THREE.MeshStandardMaterial({
    color: species.fruitColor,
    roughness: 0.35,
    metalness: 0.02,
  });
  const fMesh = new THREE.Mesh(fGeo, fMat);
  fruitGroup.add(fMesh);

  const stemGeo = new THREE.CylinderGeometry(0.009, 0.014, 0.065, 6);
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x3d2411, roughness: 0.8 });
  const stem = new THREE.Mesh(stemGeo, stemMat);
  stem.position.set(0.01, 0.065, 0);
  stem.rotation.z = -0.22;
  fruitGroup.add(stem);

  if (species.id === 'apple' || species.id === 'citrus') {
    const leafGeo = new THREE.SphereGeometry(0.028, 6, 6);
    leafGeo.scale(1.4, 0.25, 0.6);
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.5 });
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.position.set(0.026, 0.075, 0);
    leaf.rotation.z = -0.4;
    fruitGroup.add(leaf);
  }

  return fruitGroup;
}

export function buildRealisticTree(
  treeRootGroup: THREE.Group,
  stage: number,
  species: TreeSpeciesDef
) {
  treeRootGroup.clear();

  // 4 Core Botanical Tree Anatomical Components with Dedicated Growth Logic
  const rootComp = new THREE.Group();
  rootComp.name = 'tree_root_component';
  treeRootGroup.add(rootComp);

  const trunkComp = new THREE.Group();
  trunkComp.name = 'tree_trunk_component';
  treeRootGroup.add(trunkComp);

  const branchComp = new THREE.Group();
  branchComp.name = 'tree_branch_component';
  treeRootGroup.add(branchComp);

  const foliageComp = new THREE.Group();
  foliageComp.name = 'tree_foliage_component';
  treeRootGroup.add(foliageComp);

  const barkMat = new THREE.MeshStandardMaterial({
    color: species.trunkColor,
    roughness: 0.92,
    metalness: 0.02,
  });

  const foliageMat = new THREE.MeshStandardMaterial({
    color: species.canopyColor,
    roughness: 0.88,
    metalness: 0.02,
  });

  const accentFoliageMat = new THREE.MeshStandardMaterial({
    color: species.accentColor,
    roughness: 0.85,
    metalness: 0.02,
  });

  if (stage === 1) {
    // 1. Root component: Soil mound & seed bed
    const moundGeo = new THREE.CylinderGeometry(0.35, 0.55, 0.08, 16);
    const moundMat = new THREE.MeshStandardMaterial({ color: 0x331c0c, roughness: 0.95 });
    const mound = new THREE.Mesh(moundGeo, moundMat);
    mound.position.y = 0.04;
    rootComp.add(mound);

    const seedGeo = new THREE.SphereGeometry(0.1, 12, 12);
    seedGeo.scale(1.2, 0.7, 0.9);
    const seedMat = new THREE.MeshStandardMaterial({ color: 0x241408, roughness: 0.85 });
    const seed = new THREE.Mesh(seedGeo, seedMat);
    seed.position.set(0, 0.05, 0);
    rootComp.add(seed);

    // 2. Trunk component: Sprout stem
    const shootCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.01, 0.05, 0),
      new THREE.Vector3(0.04, 0.18, 0.02),
      new THREE.Vector3(0.02, 0.32, 0),
    ]);
    const shootGeo = new THREE.TubeGeometry(shootCurve, 10, 0.022, 8, false);
    const shootMat = new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.45 });
    const shoot = new THREE.Mesh(shootGeo, shootMat);
    trunkComp.add(shoot);

    // 4. Foliage component: Cotyledon baby leaves
    [-0.06, 0.06].forEach((xOff, idx) => {
      const leafGeo = new THREE.SphereGeometry(0.075, 10, 10);
      leafGeo.scale(1.4, 0.22, 0.7);
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x84cc16, roughness: 0.35 });
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.set(0.02 + xOff, 0.32, 0);
      leaf.rotation.z = idx === 0 ? 0.35 : -0.35;
      leaf.rotation.y = idx === 0 ? 0.2 : -0.2;
      foliageComp.add(leaf);
    });
  } else if (stage === 2) {
    // 2. Trunk component: Young seedling stem
    const stemCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.02, 0.22, 0.01),
      new THREE.Vector3(-0.01, 0.46, 0),
    ]);
    const stemGeo = new THREE.TubeGeometry(stemCurve, 12, 0.03, 8, false);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.5 });
    const stem = new THREE.Mesh(stemGeo, stemMat);
    trunkComp.add(stem);

    // 4. Foliage component: True leaves
    [-0.12, 0.12].forEach((xOff, idx) => {
      const leafGeo = new THREE.SphereGeometry(0.14, 12, 12);
      leafGeo.scale(1.5, 0.22, 0.75);
      const leaf = new THREE.Mesh(leafGeo, foliageMat);
      leaf.position.set(xOff, 0.46, 0);
      leaf.rotation.z = idx === 0 ? 0.42 : -0.42;
      foliageComp.add(leaf);
    });
  } else if (stage === 3) {
    // 2. Trunk component: Central stem
    const stemCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.02, 0.3, 0.01),
      new THREE.Vector3(0, 0.62, 0),
    ]);
    const stemGeo = new THREE.TubeGeometry(stemCurve, 14, 0.042, 8, false);
    const stem = new THREE.Mesh(stemGeo, barkMat);
    trunkComp.add(stem);

    // 3. Branches component: Two young lateral boughs
    [-0.16, 0.16].forEach((xOff, idx) => {
      const bCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.36, 0),
        new THREE.Vector3(xOff * 0.6, 0.48, idx === 0 ? 0.04 : -0.04),
        new THREE.Vector3(xOff, 0.56, 0),
      ]);
      const bGeo = new THREE.TubeGeometry(bCurve, 8, 0.026, 6, false);
      const bMesh = new THREE.Mesh(bGeo, barkMat);
      branchComp.add(bMesh);

      // 4. Foliage on branch ends
      const fGeo = new THREE.SphereGeometry(0.17, 12, 12);
      fGeo.scale(1.2, 0.6, 1.1);
      const fMesh = new THREE.Mesh(fGeo, foliageMat);
      fMesh.position.set(xOff, 0.58, 0);
      foliageComp.add(fMesh);
    });

    const topGeo = new THREE.SphereGeometry(0.2, 12, 12);
    topGeo.scale(1.2, 0.65, 1.1);
    const topLeaf = new THREE.Mesh(topGeo, foliageMat);
    topLeaf.position.set(0, 0.66, 0);
    foliageComp.add(topLeaf);
  } else {
    const stageMultiplier = 0.58 + (stage - 4) * 0.095;
    const trunkHeight = 0.95 * stageMultiplier;
    const baseRadius = 0.19 * stageMultiplier;
    const topRadius = 0.10 * stageMultiplier;

    // 1. Root Component: 4 organic buttress roots anchoring into earth
    const rootAngles = [0.2, 1.7, 3.3, 4.8];
    rootAngles.forEach((angle) => {
      const rDist = baseRadius * 1.5;
      const rootCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(Math.cos(angle) * baseRadius * 0.85, 0.14 * stageMultiplier, Math.sin(angle) * baseRadius * 0.85),
        new THREE.Vector3(Math.cos(angle) * (baseRadius + 0.12 * stageMultiplier), 0.06 * stageMultiplier, Math.sin(angle) * (baseRadius + 0.12 * stageMultiplier)),
        new THREE.Vector3(Math.cos(angle) * (rDist + 0.14 * stageMultiplier), 0.01, Math.sin(angle) * (rDist + 0.14 * stageMultiplier)),
      ]);
      const rootGeo = new THREE.TubeGeometry(rootCurve, 8, 0.038 * stageMultiplier, 6, false);
      const rootMesh = new THREE.Mesh(rootGeo, barkMat);
      rootMesh.castShadow = true;
      rootMesh.receiveShadow = true;
      rootComp.add(rootMesh);
    });

    // 2. Trunk Component: Tapered Main Trunk
    const trunkGeo = new THREE.CylinderGeometry(topRadius, baseRadius, trunkHeight, 16);
    trunkGeo.translate(0, trunkHeight / 2, 0);
    const trunkMesh = new THREE.Mesh(trunkGeo, barkMat);
    trunkMesh.castShadow = true;
    trunkMesh.receiveShadow = true;
    trunkComp.add(trunkMesh);

    // 3. Branches Component: Primary Scaffold Boughs & Secondary Branchlets
    const boughs = [
      { angle: 0.35, pitch: 0.70, len: 0.48 * stageMultiplier, thick: 0.055 * stageMultiplier },
      { angle: 1.95, pitch: 0.65, len: 0.46 * stageMultiplier, thick: 0.052 * stageMultiplier },
      { angle: 3.55, pitch: 0.72, len: 0.50 * stageMultiplier, thick: 0.054 * stageMultiplier },
      { angle: 5.15, pitch: 0.68, len: 0.45 * stageMultiplier, thick: 0.050 * stageMultiplier },
    ];

    boughs.forEach((b) => {
      const startY = trunkHeight * 0.88;
      const endX = Math.cos(b.angle) * b.len * 1.1;
      const endY = startY + Math.sin(b.pitch) * b.len;
      const endZ = Math.sin(b.angle) * b.len * 1.1;

      const bCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, startY, 0),
        new THREE.Vector3(endX * 0.5, startY + (endY - startY) * 0.45, endZ * 0.5),
        new THREE.Vector3(endX, endY, endZ),
      ]);
      const bGeo = new THREE.TubeGeometry(bCurve, 8, b.thick, 6, false);
      const bMesh = new THREE.Mesh(bGeo, barkMat);
      bMesh.castShadow = true;
      branchComp.add(bMesh);

      const subX = endX + Math.cos(b.angle + 0.5) * 0.24 * stageMultiplier;
      const subY = endY + 0.12 * stageMultiplier;
      const subZ = endZ + Math.sin(b.angle + 0.5) * 0.24 * stageMultiplier;
      const subCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(endX, endY, endZ),
        new THREE.Vector3(subX, subY, subZ),
      ]);
      const subGeo = new THREE.TubeGeometry(subCurve, 6, b.thick * 0.65, 6, false);
      const subMesh = new THREE.Mesh(subGeo, barkMat);
      subMesh.castShadow = true;
      branchComp.add(subMesh);

      // 4. Foliage Component: Botanical Foliage Pad at Branch End
      const padGroup = new THREE.Group();
      padGroup.position.set(endX, endY + 0.05, endZ);
      foliageComp.add(padGroup);

      const fGeo1 = new THREE.SphereGeometry(0.28 * stageMultiplier, 12, 12);
      fGeo1.scale(1.3, 0.65, 1.15);
      const fMesh1 = new THREE.Mesh(fGeo1, foliageMat);
      fMesh1.castShadow = true;
      padGroup.add(fMesh1);

      const fGeo2 = new THREE.SphereGeometry(0.21 * stageMultiplier, 10, 10);
      fGeo2.scale(1.2, 0.55, 1.1);
      const fMesh2 = new THREE.Mesh(fGeo2, accentFoliageMat);
      fMesh2.position.set(0.1 * stageMultiplier, 0.1 * stageMultiplier, 0.04 * stageMultiplier);
      fMesh2.castShadow = true;
      padGroup.add(fMesh2);

      // Realistic Blossoms (Stage 7 and 8)
      if (stage >= 7) {
        for (let fl = 0; fl < 3; fl++) {
          const flAngle = fl * 2.1;
          const blossom = createRealisticBlossom(species);
          blossom.position.set(
            Math.cos(flAngle) * 0.22 * stageMultiplier,
            0.08 * stageMultiplier,
            Math.sin(flAngle) * 0.22 * stageMultiplier
          );
          padGroup.add(blossom);
        }
      }

      // Realistic Hanging Fruits (Stage 8)
      if (stage >= 8) {
        const fruit = createRealisticFruit(species);
        fruit.position.set(0.04 * stageMultiplier, -0.12 * stageMultiplier, 0.06 * stageMultiplier);
        padGroup.add(fruit);
      }
    });

    // Central Top Crown Dome Foliage
    const crownGroup = new THREE.Group();
    crownGroup.position.set(0, trunkHeight + 0.15 * stageMultiplier, 0);
    foliageComp.add(crownGroup);

    const crownGeo1 = new THREE.SphereGeometry(0.36 * stageMultiplier, 14, 14);
    crownGeo1.scale(1.35, 0.75, 1.25);
    const crownMesh1 = new THREE.Mesh(crownGeo1, foliageMat);
    crownMesh1.castShadow = true;
    crownGroup.add(crownMesh1);

    const crownGeo2 = new THREE.SphereGeometry(0.26 * stageMultiplier, 12, 12);
    crownGeo2.scale(1.25, 0.65, 1.15);
    const crownMesh2 = new THREE.Mesh(crownGeo2, accentFoliageMat);
    crownMesh2.position.set(0, 0.14 * stageMultiplier, 0);
    crownMesh2.castShadow = true;
    crownGroup.add(crownMesh2);

    if (stage >= 7) {
      for (let fl = 0; fl < 4; fl++) {
        const flAngle = fl * 1.57;
        const blossom = createRealisticBlossom(species);
        blossom.position.set(
          Math.cos(flAngle) * 0.28 * stageMultiplier,
          0.1 * stageMultiplier,
          Math.sin(flAngle) * 0.28 * stageMultiplier
        );
        crownGroup.add(blossom);
      }
    }

    if (stage >= 8) {
      for (let fr = 0; fr < 3; fr++) {
        const frAngle = fr * 2.09;
        const fruit = createRealisticFruit(species);
        fruit.position.set(
          Math.cos(frAngle) * 0.24 * stageMultiplier,
          -0.10 * stageMultiplier,
          Math.sin(frAngle) * 0.24 * stageMultiplier
        );
        crownGroup.add(fruit);
      }
    }
  }
}

const GLOBAL_SCHOLARS_BASE: LeaderboardEntry[] = [
  {
    id: 's-1',
    name: 'Aarav Sharma',
    location: 'Delhi (DPS R.K. Puram)',
    flag: '🇮🇳',
    focusMinutes: 1840,
    points: 18400,
    treesGrown: 46,
    streakDays: 42,
    tier: 'Grandmaster',
  },
  {
    id: 's-2',
    name: 'Suhani Nair',
    location: 'Dubai, UAE (The Indian High School)',
    flag: '🇦🇪',
    focusMinutes: 1690,
    points: 16900,
    treesGrown: 41,
    streakDays: 38,
    tier: 'Grandmaster',
  },
  {
    id: 's-3',
    name: 'Tanmay Deshmukh',
    location: 'Mumbai (DAV Public School)',
    flag: '🇮🇳',
    focusMinutes: 1530,
    points: 15300,
    treesGrown: 37,
    streakDays: 35,
    tier: 'Master',
  },
  {
    id: 's-4',
    name: 'Priya Sundaram',
    location: 'Singapore (NPS International)',
    flag: '🇸🇬',
    focusMinutes: 1420,
    points: 14200,
    treesGrown: 34,
    streakDays: 31,
    tier: 'Master',
  },
  {
    id: 's-5',
    name: 'Rohan Mehra',
    location: 'Bengaluru (National Public School)',
    flag: '🇮🇳',
    focusMinutes: 1280,
    points: 12800,
    treesGrown: 30,
    streakDays: 28,
    tier: 'Diamond',
  },
];

export const formatDurationBadge = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
};

export const FocusTimerView: React.FC<FocusTimerViewProps> = ({
  profile,
  onUpdateProfile,
  onNavigate,
}) => {
  // 1. Species & Multi-Stage State (Different realistic tree variety grown on each visit!)
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>(() => {
    const varieties = ['bodhi', 'sakura', 'maple', 'apple', 'citrus', 'oak', 'bonsai', 'rose'];
    return varieties[Math.floor(Math.random() * varieties.length)];
  });

  const [previewStageOverride, setPreviewStageOverride] = useState<number | null>(null);

  // 2. Flexible Focus Duration: 1 min to 3 hours (180 mins) with direct typing block & scrolling bar
  const [customMinutes, setCustomMinutes] = useState<number>(() => {
    const initial = profile.pomodoroMinutes || 25;
    return Math.max(1, Math.min(180, initial));
  });
  const [inputMinutesText, setInputMinutesText] = useState<string>(() => {
    const initial = profile.pomodoroMinutes || 25;
    return String(Math.max(1, Math.min(180, initial)));
  });
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    const initial = profile.pomodoroMinutes || 25;
    const mins = Math.max(1, Math.min(180, initial));
    return mins * 60;
  });
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Calculate live session progress 0 -> 1
  const sessionTotalSeconds = Math.max(1, customMinutes * 60);
  const liveProgress = Math.max(0, Math.min(1, 1 - secondsRemaining / sessionTotalSeconds));

  // Dynamic growth stage: ALWAYS starts from Stage 1 (seed & sprout) and completes at Stage 8 (sovereign tree)
  const currentStageNumber = useMemo(() => {
    if (isCompleted || secondsRemaining <= 0) return 8;
    if (isRunning || liveProgress > 0) {
      // Maps progress 0 -> 1 smoothly across all 8 stages
      const stage = 1 + Math.floor(liveProgress * 7.999);
      return Math.min(8, Math.max(1, stage));
    }
    // When idle / not started, always Stage 1 (or preview if user selects)
    return previewStageOverride !== null ? previewStageOverride : 1;
  }, [isCompleted, secondsRemaining, isRunning, liveProgress, previewStageOverride]);

  const activeSpecies = useMemo(() => {
    return TREE_SPECIES.find((s) => s.id === selectedSpeciesId) || TREE_SPECIES[0];
  }, [selectedSpeciesId]);

  const activeStage = useMemo(() => {
    return GROWTH_STAGES.find((st) => st.stage === currentStageNumber) || GROWTH_STAGES[0];
  }, [currentStageNumber]);

  // 3. Tab Switch Anti-Distraction & Leaf Shedding State
  const [isDistracted, setIsDistracted] = useState<boolean>(false);
  const [distractionNotice, setDistractionNotice] = useState<string | null>(null);
  const [distractionCount, setDistractionCount] = useState<number>(0);
  const [sessionToast, setSessionToast] = useState<string | null>(null);
  const [selectedTone] = useState<'chime' | 'digital' | 'zen' | 'bell'>('chime');

  // Stats
  const userFocusPoints = profile.focusPoints || 0;
  const userTotalMinutes = profile.totalFocusMinutes || 0;
  const userTreesGrown = profile.treesGrown || 0;

  // 4. Three.js Refs
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Diorama 3D Groups
  const islandGroupRef = useRef<THREE.Group | null>(null);
  const treeRootGroupRef = useRef<THREE.Group | null>(null);
  const canopyGroupRef = useRef<THREE.Group | null>(null);
  const blossomsGroupRef = useRef<THREE.Group | null>(null);
  const fruitsGroupRef = useRef<THREE.Group | null>(null);
  const fallingLeavesGroupRef = useRef<THREE.Group | null>(null);
  const rimLightRef = useRef<THREE.PointLight | null>(null);

  // Audio Alarm Synth
  const playAlarm = (tone: 'chime' | 'digital' | 'zen' | 'bell') => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      if (tone === 'chime') {
        const freqs = [523.25, 659.25, 783.99, 1046.5];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.16);
          gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.16);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.16 + 0.9);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.16);
          osc.stop(ctx.currentTime + idx * 0.16 + 0.95);
        });
      } else if (tone === 'zen') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(329.63, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.0);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 3.0);
      } else if (tone === 'digital') {
        [0, 0.14, 0.28, 0.42].forEach((tNote) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(880, ctx.currentTime + tNote);
          gain.gain.setValueAtTime(0.18, ctx.currentTime + tNote);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + tNote + 0.1);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + tNote);
          osc.stop(ctx.currentTime + tNote + 0.11);
        });
      } else {
        [0, 0.22, 0.44].forEach((tNote) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(698.46, ctx.currentTime + tNote);
          gain.gain.setValueAtTime(0.22, ctx.currentTime + tNote);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + tNote + 0.6);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + tNote);
          osc.stop(ctx.currentTime + tNote + 0.65);
        });
      }
    } catch {
      // AudioContext unavailable
    }
  };

  // -------------------------------------------------------------
  // 5. Initialize Next-Level 3D Diorama & Organic Tree
  // -------------------------------------------------------------
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || 320;
    const height = mountRef.current.clientHeight || 340;

    // A. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 1.45, 6.8);
    camera.lookAt(0, 0.55, 0);
    cameraRef.current = camera;

    // B. Transparent WebGL Renderer so background curved semicircle timer shines through!
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0); // 100% transparent background!
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    rendererRef.current = renderer;

    mountRef.current.replaceChildren(renderer.domElement);

    // C. Dynamic 3D Lighting Setup with Continuous 3D Rotation
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfffbeb, 1.3);
    dirLight.position.set(4, 7, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.bias = -0.001;
    scene.add(dirLight);

    const rimLight = new THREE.PointLight(activeSpecies.accentColor, 2.0, 10);
    rimLight.position.set(-3.5, 2.5, -3);
    scene.add(rimLight);
    rimLightRef.current = rimLight;

    // D. Floating Diorama Island with Rich Virtual Land
    const islandGroup = new THREE.Group();
    islandGroup.position.set(0, -0.65, 0);
    scene.add(islandGroup);
    islandGroupRef.current = islandGroup;

    // Ambient floating island shadow disk beneath land
    const shadowGeo = new THREE.CircleGeometry(2.6, 32);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.45,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -0.92;
    islandGroup.add(shadowMesh);

    // Smooth Grass Top
    const grassGeo = new THREE.CylinderGeometry(2.7, 2.5, 0.32, 40);
    const grassMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.65,
      metalness: 0.05,
    });
    const grassMesh = new THREE.Mesh(grassGeo, grassMat);
    grassMesh.receiveShadow = true;
    islandGroup.add(grassMesh);

    // Rich Soil Substratum Layer
    const subGeo = new THREE.CylinderGeometry(2.52, 2.22, 0.26, 40);
    const subMat = new THREE.MeshStandardMaterial({
      color: 0x451a03,
      roughness: 0.9,
    });
    const subMesh = new THREE.Mesh(subGeo, subMat);
    subMesh.position.y = -0.22;
    subMesh.receiveShadow = true;
    islandGroup.add(subMesh);

    // Bedrock base underneath
    const earthGeo = new THREE.CylinderGeometry(2.22, 1.6, 0.55, 40);
    const earthMat = new THREE.MeshStandardMaterial({
      color: 0x27272a,
      roughness: 0.85,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthMesh.position.y = -0.55;
    earthMesh.receiveShadow = true;
    islandGroup.add(earthMesh);

    // Cute Miniature Elements on Island: Soft Rounded Mushrooms & Moss Pillows
    const mushroomPositions = [
      { x: 1.25, z: 0.6, s: 0.85 },
      { x: 1.45, z: 0.4, s: 0.6 },
      { x: -1.2, z: 0.9, s: 0.75 },
    ];
    mushroomPositions.forEach((pos) => {
      const mGroup = new THREE.Group();
      mGroup.position.set(pos.x, 0.16, pos.z);
      mGroup.scale.setScalar(pos.s);

      const stalkGeo = new THREE.CylinderGeometry(0.05, 0.07, 0.25, 16);
      const stalkMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.7 });
      const stalk = new THREE.Mesh(stalkGeo, stalkMat);
      stalk.position.y = 0.12;
      mGroup.add(stalk);

      const capGeo = new THREE.SphereGeometry(0.16, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.55);
      const capMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.35 });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.y = 0.24;
      mGroup.add(cap);

      for (let d = 0; d < 3; d++) {
        const dotAngle = (d / 3) * Math.PI * 2;
        const dotGeo = new THREE.SphereGeometry(0.03, 10, 10);
        const dotMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
        const dot = new THREE.Mesh(dotGeo, dotMat);
        dot.position.set(Math.cos(dotAngle) * 0.1, 0.32, Math.sin(dotAngle) * 0.1);
        mGroup.add(dot);
      }
      islandGroup.add(mGroup);
    });

    // Rounded Moss Pillows
    const mossConfigs = [
      { x: -1.1, z: -0.7, r: 0.3 },
      { x: 0.95, z: -0.9, r: 0.26 },
      { x: -0.5, z: 1.3, r: 0.22 },
    ];
    mossConfigs.forEach((mp) => {
      const mossGeo = new THREE.SphereGeometry(mp.r, 20, 16);
      const mossMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.8 });
      const moss = new THREE.Mesh(mossGeo, mossMat);
      moss.position.set(mp.x, 0.14, mp.z);
      moss.scale.set(1.4, 0.45, 1.2);
      islandGroup.add(moss);
    });

    // E. Tree Root Group: PROCEDURAL 8-STAGE REALISTIC BOTANICAL TREE
    const treeRootGroup = new THREE.Group();
    treeRootGroup.position.set(0, 0.16, 0);
    islandGroup.add(treeRootGroup);
    treeRootGroupRef.current = treeRootGroup;

    buildRealisticTree(treeRootGroup, activeStage.stage, activeSpecies);

    // I. Ambient Floating Spores & Fireflies (Atmospheric Next-Level Glow)
    const sporesGroup = new THREE.Group();
    scene.add(sporesGroup);

    const sporeCount = 28;
    const sporeGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const sporeMat = new THREE.MeshStandardMaterial({
      color: activeSpecies.accentColor,
      emissive: activeSpecies.accentColor,
      emissiveIntensity: 0.9,
      roughness: 0.1,
    });

    const sporeList: Array<{
      mesh: THREE.Mesh;
      baseY: number;
      speed: number;
      angle: number;
      radius: number;
    }> = [];

    for (let i = 0; i < sporeCount; i++) {
      const sMesh = new THREE.Mesh(sporeGeo, sporeMat);
      const rad = 1.0 + Math.random() * 2.2;
      const ang = Math.random() * Math.PI * 2;
      const y = 0.4 + Math.random() * 3.2;
      sMesh.position.set(Math.cos(ang) * rad, y, Math.sin(ang) * rad);
      sporesGroup.add(sMesh);

      sporeList.push({
        mesh: sMesh,
        baseY: y,
        speed: 0.3 + Math.random() * 0.7,
        angle: ang,
        radius: rad,
      });
    }

    // J. REALISTIC LEAF SHEDDING FLOCK (Activated upon Tab Switch / Window Blur)
    const fallingLeavesGroup = new THREE.Group();
    scene.add(fallingLeavesGroup);
    fallingLeavesGroupRef.current = fallingLeavesGroup;

    const leafParticlesCount = 45;
    const leafGeo = new THREE.PlaneGeometry(0.14, 0.18);
    const leafMat = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      side: THREE.DoubleSide,
      roughness: 0.8,
    });

    const leafPhysicsList: Array<{
      vx: number;
      vy: number;
      vz: number;
      rotSpeed: number;
      initialY: number;
      initialX: number;
      initialZ: number;
    }> = [];

    for (let i = 0; i < leafParticlesCount; i++) {
      const lMesh = new THREE.Mesh(leafGeo, leafMat);
      const sx = (Math.random() - 0.5) * 1.6;
      const sy = 1.3 + Math.random() * 1.5;
      const sz = (Math.random() - 0.5) * 1.6;
      lMesh.position.set(sx, sy, sz);
      lMesh.visible = false;
      fallingLeavesGroup.add(lMesh);

      leafPhysicsList.push({
        vx: (Math.random() - 0.5) * 0.02,
        vy: -0.018 - Math.random() * 0.028,
        vz: (Math.random() - 0.5) * 0.02,
        rotSpeed: 0.03 + Math.random() * 0.05,
        initialY: sy,
        initialX: sx,
        initialZ: sz,
      });
    }

    // K. Interactive Mouse / Touch Orbit Drag
    let isDragging = false;
    let prevMouseX = 0;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      prevMouseX = clientX;
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !islandGroupRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const deltaX = clientX - prevMouseX;
      prevMouseX = clientX;
      islandGroupRef.current.rotation.y += deltaX * 0.009;
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    domElem.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);

    // L. Animation Loop: CONTINUOUS 3D ROTATION OF ISLAND, TREE & LIGHTING WITH THREE.Timer
    const timer = new THREE.Timer();
    timer.connect(document);

    // Smooth botanical growth scale transition!
    let currentAnimScale = activeStage.scaleMult * 0.92;

    const animate = (timestamp?: number) => {
      animationFrameRef.current = requestAnimationFrame(animate);
      timer.update(timestamp);
      const elapsedTime = timer.getElapsed();
      const delta = Math.min(timer.getDelta(), 0.05);

      // Smooth botanical growth scale transition (no sudden jumps/pops!)
      if (treeRootGroupRef.current) {
        const liveGrowthMult = 0.95 + liveProgress * 0.12;
        const targetScale = activeStage.scaleMult * liveGrowthMult;
        currentAnimScale = THREE.MathUtils.damp(currentAnimScale, targetScale, 3.2, delta);
        treeRootGroupRef.current.scale.setScalar(currentAnimScale);

        // 4 Anatomical Botanical Components Growth Logic:
        // 1. Root component: Spreads anchors deeper into soil as focus progresses
        const rootComp = treeRootGroupRef.current.getObjectByName('tree_root_component');
        if (rootComp) {
          const rootTarget = 0.94 + liveProgress * 0.14;
          rootComp.scale.x = THREE.MathUtils.damp(rootComp.scale.x, rootTarget, 2.5, delta);
          rootComp.scale.z = THREE.MathUtils.damp(rootComp.scale.z, rootTarget, 2.5, delta);
        }

        // 2. Trunk component: Thrushes and thickens organically
        const trunkComp = treeRootGroupRef.current.getObjectByName('tree_trunk_component');
        if (trunkComp) {
          const trunkTarget = 0.95 + liveProgress * 0.10;
          trunkComp.scale.x = THREE.MathUtils.damp(trunkComp.scale.x, trunkTarget, 2.5, delta);
          trunkComp.scale.y = THREE.MathUtils.damp(trunkComp.scale.y, trunkTarget, 2.5, delta);
          trunkComp.scale.z = THREE.MathUtils.damp(trunkComp.scale.z, trunkTarget, 2.5, delta);
        }

        // 3. Branch component: Primary and scaffold limbs reach outward
        const branchComp = treeRootGroupRef.current.getObjectByName('tree_branch_component');
        if (branchComp) {
          const branchTarget = 0.92 + liveProgress * 0.16;
          branchComp.scale.x = THREE.MathUtils.damp(branchComp.scale.x, branchTarget, 2.5, delta);
          branchComp.scale.y = THREE.MathUtils.damp(branchComp.scale.y, branchTarget, 2.5, delta);
          branchComp.scale.z = THREE.MathUtils.damp(branchComp.scale.z, branchTarget, 2.5, delta);
        }

        // 4. Foliage & fruit component: Leaf pads swell, blossoms unfold, and fruits mature
        const foliageComp = treeRootGroupRef.current.getObjectByName('tree_foliage_component');
        if (foliageComp) {
          const foliageTarget = 0.90 + liveProgress * 0.20;
          foliageComp.scale.x = THREE.MathUtils.damp(foliageComp.scale.x, foliageTarget, 2.5, delta);
          foliageComp.scale.y = THREE.MathUtils.damp(foliageComp.scale.y, foliageTarget, 2.5, delta);
          foliageComp.scale.z = THREE.MathUtils.damp(foliageComp.scale.z, foliageTarget, 2.5, delta);
        }
      }

      // CONTINUOUS 3D ROTATION OF LAND & TREE!
      if (islandGroupRef.current && !isDragging) {
        islandGroupRef.current.rotation.y += 0.006;
      }

      // Rotating rim light
      if (rimLightRef.current) {
        rimLightRef.current.position.x = Math.sin(elapsedTime * 0.6) * 4;
        rimLightRef.current.position.z = Math.cos(elapsedTime * 0.6) * 4;
      }

      // Spores floating orbit
      sporeList.forEach((p, idx) => {
        p.mesh.position.y = p.baseY + Math.sin(elapsedTime * p.speed + idx) * 0.22;
        p.angle += 0.0025;
        p.mesh.position.x = Math.cos(p.angle) * p.radius;
        p.mesh.position.z = Math.sin(p.angle) * p.radius;
      });

      // Realistic leaf shedding particle animation
      if (fallingLeavesGroupRef.current && fallingLeavesGroupRef.current.visible) {
        fallingLeavesGroupRef.current.children.forEach((child, idx) => {
          const phys = leafPhysicsList[idx];
          child.position.y += phys.vy;
          child.position.x += phys.vx + Math.sin(elapsedTime * 2.5 + idx) * 0.008;
          child.position.z += phys.vz + Math.cos(elapsedTime * 2.5 + idx) * 0.008;
          child.rotation.x += phys.rotSpeed;
          child.rotation.y += phys.rotSpeed * 0.9;
          child.rotation.z += phys.rotSpeed * 0.5;

          // Recycle falling leaf when it touches land
          if (child.position.y < 0.15) {
            child.position.y = phys.initialY;
            child.position.x = (Math.random() - 0.5) * 1.6;
            child.position.z = (Math.random() - 0.5) * 1.6;
          }
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const newW = mountRef.current.clientWidth || 300;
      const newH = mountRef.current.clientHeight || 340;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    if (mountRef.current) {
      resizeObserver.observe(mountRef.current);
    }

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      timer.dispose();

      domElem.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);

      domElem.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);

      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.domElement.remove();
        rendererRef.current.dispose();
      }

      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          if (mesh.material) {
            if (Array.isArray(mesh.material)) mesh.material.forEach((m) => m.dispose());
            else mesh.material.dispose();
          }
        }
      });
    };
  }, [selectedSpeciesId, currentStageNumber, activeSpecies, activeStage]);

  // -------------------------------------------------------------
  // 6. Synchronize Tree Growth, Sprouting & Shedding State
  // -------------------------------------------------------------
  useEffect(() => {
    if (!treeRootGroupRef.current) return;

    // Tree scaling is smoothly damped frame-by-frame in animate loop to avoid pops!

    // Canopy coloring and leaf shedding behavior if canopy exists
    if (canopyGroupRef.current) {
      canopyGroupRef.current.children.forEach((pMesh) => {
        const mat = (pMesh as THREE.Mesh).material as THREE.MeshStandardMaterial;
        if (mat) {
          if (isDistracted) {
            // Wilted autumn shed leaves
            mat.color.setHex(0xb45309);
          } else if (liveProgress >= 0.95) {
            mat.color.setHex(activeSpecies.accentColor);
          } else {
            mat.color.setHex(activeSpecies.canopyColor);
          }
        }
      });
    }

    // Shedding leaf particles visibility
    if (fallingLeavesGroupRef.current) {
      fallingLeavesGroupRef.current.visible = isDistracted;
      fallingLeavesGroupRef.current.children.forEach((c) => {
        c.visible = isDistracted;
      });
    }

    // Blossoms & fruits visibility during session maturity
    if (blossomsGroupRef.current) {
      blossomsGroupRef.current.visible = activeStage.hasBlossoms || liveProgress >= 0.8;
    }
    if (fruitsGroupRef.current) {
      fruitsGroupRef.current.visible = activeStage.hasFruits || liveProgress >= 0.95;
    }
  }, [liveProgress, isDistracted, activeSpecies, activeStage]);

  // -------------------------------------------------------------
  // 7. Page Visibility API: Detect Tab Switch & Trigger Leaf Shedding
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isRunning) {
      setIsDistracted(false);
      setDistractionNotice(null);
      return;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        triggerDistraction('Switched tab / Minimized window');
      } else {
        clearDistraction();
      }
    };

    const handleWindowBlur = () => {
      triggerDistraction('Window lost focus');
    };

    const handleWindowFocus = () => {
      clearDistraction();
    };

    const triggerDistraction = (reason: string) => {
      setIsDistracted(true);
      setDistractionCount((prev) => prev + 1);
      playAlarm('digital');
      setDistractionNotice(
        `🍂 TAB SWITCHED: Left CBSE study tab (${reason})! Leaves are shedding and growth is paused!`
      );
    };

    const clearDistraction = () => {
      setIsDistracted(false);
      setDistractionNotice(`🌱 Welcome back! Leaves are sprouting and your ${activeSpecies.name} is blooming!`);
      setTimeout(() => {
        setDistractionNotice(null);
      }, 4000);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [isRunning, activeSpecies]);

  // -------------------------------------------------------------
  // 8. Timer Countdown Tick
  // -------------------------------------------------------------
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isRunning && secondsRemaining > 0 && !isDistracted) {
      timer = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            handleCompleteSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, secondsRemaining, isDistracted]);

  // -------------------------------------------------------------
  // 9. Session Completion
  // -------------------------------------------------------------
  const handleCompleteSession = () => {
    setIsRunning(false);
    setIsCompleted(true);
    setIsDistracted(false);
    setPreviewStageOverride(8);

    const earnedPoints = customMinutes * 10;

    playAlarm(selectedTone);
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#38bdf8', '#facc15', '#f472b6', '#a855f7'],
      });
      playSoftStartupChime();
    } catch {}

    if (onUpdateProfile) {
      onUpdateProfile({
        ...profile,
        focusPoints: (profile.focusPoints || 0) + earnedPoints,
        totalFocusMinutes: (profile.totalFocusMinutes || 0) + customMinutes,
        treesGrown: (profile.treesGrown || 0) + 1,
      });
    }

    setSessionToast(
      `🎉 Focus Session Complete! +${earnedPoints} Points! Your ${activeSpecies.name} matured to Stage 8 Sovereign Tree! 👑🌳`
    );
  };

  const handleStartTimer = () => {
    if (secondsRemaining <= 0 || isCompleted) {
      setSecondsRemaining(customMinutes * 60);
      setIsCompleted(false);
      setDistractionCount(0);
    }
    setPreviewStageOverride(null);
    setIsRunning(true);
    setIsDistracted(false);
    setDistractionNotice(null);
  };

  const handlePauseTimer = () => {
    setIsRunning(false);
    setIsDistracted(false);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setSecondsRemaining(customMinutes * 60);
    setIsCompleted(false);
    setIsDistracted(false);
    setDistractionNotice(null);
    setDistractionCount(0);
    setPreviewStageOverride(1); // Always restart cleanly at Stage 1
  };

  const updateFocusMinutes = (mins: number) => {
    if (isRunning) return;
    const clamped = Math.max(1, Math.min(180, Math.round(mins) || 25));
    setCustomMinutes(clamped);
    setInputMinutesText(String(clamped));
    setSecondsRemaining(clamped * 60);
    setIsCompleted(false);
    setDistractionCount(0);
    setPreviewStageOverride(1);
    if (onUpdateProfile) {
      onUpdateProfile({
        ...profile,
        pomodoroMinutes: clamped,
      });
    }
  };

  const handleInputChange = (rawVal: string) => {
    setInputMinutesText(rawVal);
    const parsed = parseInt(rawVal, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 180) {
      setCustomMinutes(parsed);
      setSecondsRemaining(parsed * 60);
      setIsCompleted(false);
      setDistractionCount(0);
      setPreviewStageOverride(1);
      if (onUpdateProfile) {
        onUpdateProfile({
          ...profile,
          pomodoroMinutes: parsed,
        });
      }
    }
  };

  const handleInputBlur = () => {
    const parsed = parseInt(inputMinutesText, 10);
    if (isNaN(parsed) || parsed < 1) {
      updateFocusMinutes(25);
    } else if (parsed > 180) {
      updateFocusMinutes(180);
    } else {
      updateFocusMinutes(parsed);
    }
  };

  const formatTime = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Horizontal Background Curved Arc geometry:
  // Center (300, 230), Radius 210, from Angle 180° (left) to 0° (right)
  // Arc length = PI * 210 ≈ 659.73
  const arcRadius = 210;
  const arcLength = Math.PI * arcRadius;
  const arcDashOffset = arcLength * (1 - liveProgress);

  const fullLeaderboard = useMemo(() => {
    const currentUserEntry: LeaderboardEntry = {
      id: profile.id,
      name: `${profile.name || 'Class 10 Scholar'} (You)`,
      location: 'CBSE Candidate',
      flag: '🇮🇳',
      focusMinutes: userTotalMinutes,
      points: userFocusPoints,
      treesGrown: userTreesGrown,
      streakDays: profile.streak?.count ?? 0,
      tier:
        userFocusPoints >= 15000
          ? 'Grandmaster'
          : userFocusPoints >= 10000
          ? 'Master'
          : userFocusPoints >= 5000
          ? 'Diamond'
          : userFocusPoints >= 2000
          ? 'Platinum'
          : 'Gold',
      isCurrentUser: true,
    };

    const combined = [...GLOBAL_SCHOLARS_BASE, currentUserEntry];
    return combined.sort((a, b) => b.points - a.points);
  }, [profile, userFocusPoints, userTotalMinutes, userTreesGrown]);

  const currentUserRank = useMemo(() => {
    const idx = fullLeaderboard.findIndex((e) => e.isCurrentUser);
    return idx >= 0 ? idx + 1 : fullLeaderboard.length;
  }, [fullLeaderboard]);

  return (
    <div className="space-y-3 pb-16 animate-in fade-in min-w-0 max-w-5xl mx-auto">
      {/* Toast Alert */}
      {sessionToast && (
        <div className="fixed top-16 right-3 left-3 sm:left-auto sm:right-4 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center justify-between gap-3 border border-emerald-400 text-xs font-bold max-w-sm sm:max-w-md ml-auto animate-in slide-in-from-top-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-200 shrink-0" />
            <span>{sessionToast}</span>
          </div>
          <button
            onClick={() => setSessionToast(null)}
            className="text-white hover:text-emerald-200 text-sm font-black cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* COMPACT TOP BAR: Minimal Vertical Space + Permanent Dropdowns */}
      <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-3 sm:p-3.5 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <TreeDeciduous className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex items-center gap-1.5 flex-wrap">
            <h1 className="text-sm sm:text-base font-black text-[var(--text-primary)] leading-snug break-words">
              3D Miniature Focus Garden
            </h1>
            <InfoTooltip text="Continuous 3D rotating island with anti-distraction tab-switch leaf shedding." />
          </div>
        </div>

        {/* Compact Dropdown Menus: Tree Species & Stages (Permanently Unlocked) */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Tree Species Dropdown */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={selectedSpeciesId}
              onChange={(e) => {
                setSelectedSpeciesId(e.target.value);
                localStorage.setItem('zenith_tree_species', e.target.value);
              }}
              className="w-full sm:w-52 appearance-none pl-3 pr-8 py-1.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              {TREE_SPECIES.map((sp) => (
                <option key={sp.id} value={sp.id} className="bg-[var(--bg-card)]">
                  {sp.icon} {sp.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-cyan-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Growth Stage Dropdown (Permanently Unlocked 1 through 8) */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={currentStageNumber}
              onChange={(e) => {
                const num = Number(e.target.value);
                setPreviewStageOverride(num);
              }}
              className="w-full sm:w-48 appearance-none pl-3 pr-8 py-1.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs font-bold text-emerald-300 focus:outline-none focus:border-emerald-400 cursor-pointer"
            >
              {GROWTH_STAGES.map((st) => (
                <option key={st.stage} value={st.stage} className="bg-[var(--bg-card)]">
                  {st.icon} Stage {st.stage}: {st.shortName} {isRunning && currentStageNumber === st.stage ? '● Growing' : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-emerald-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Leaderboard Rank Pill */}
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('leaderboard')}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Open Leaderboard"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>#{currentUserRank}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Switch & Shedding Alert Notification */}
      {distractionNotice && (
        <div
          className={`keep-dark-surface p-2.5 rounded-xl border flex items-center justify-between gap-2.5 text-xs font-bold animate-in zoom-in-95 ${
            isDistracted
              ? 'bg-rose-950/85 border-rose-500 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
              : 'bg-emerald-950/85 border-emerald-500 text-emerald-200'
          }`}
        >
          <div className="flex items-start sm:items-center gap-2 min-w-0 flex-1">
            <ShieldAlert className={`w-4 h-4 shrink-0 mt-0.5 sm:mt-0 ${isDistracted ? 'animate-bounce text-rose-400' : 'text-emerald-400'}`} />
            <span className="break-words [overflow-wrap:anywhere]">{distractionNotice}</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 shrink-0">
            {distractionCount} tab switches
          </span>
        </div>
      )}

      {/* UNIFIED COMPACT 3D FOCUS GARDEN DIORAMA: TIMER IN THE BACKGROUND AROUND VIRTUAL LAND */}
      <div className="keep-dark-surface relative rounded-3xl bg-gradient-to-b from-[#04070e] via-[#0b101c] to-[#04070e] border border-[var(--border-color)] overflow-hidden shadow-2xl h-[420px] sm:h-[460px] flex flex-col justify-between">
        
        {/* BACKGROUND HORIZONTAL CURVED TIMER ARC AROUND VIRTUAL LAND */}
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-start pt-2 sm:pt-4 overflow-hidden select-none">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[300px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Background Digital Countdown & Status Display (Above/Behind virtual land) */}
          <div className="relative z-0 flex flex-col items-center justify-center text-center mt-1 sm:mt-2">
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-cyan-400 drop-shadow">
              {isDistracted ? '⚠️ DISTRACTION PAUSED' : isRunning ? '⚡ FOCUS SPRINT' : 'READY TO GROW'}
            </span>
            <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)] mt-0.5">
              {formatTime(secondsRemaining)}
            </div>
            <span className="text-[10px] text-cyan-300 font-semibold mt-0.5 drop-shadow">
              {activeSpecies.name} • {activeStage.shortName}
            </span>
          </div>

          {/* Wide Horizontal SVG Arc Wrapping Behind Virtual Land */}
          <div className="relative w-full max-w-2xl h-56 sm:h-64 mx-auto -mt-6 sm:-mt-8 flex items-center justify-center">
            <svg
              viewBox="0 0 600 280"
              className="w-full h-full overflow-visible filter drop-shadow-[0_0_15px_rgba(56,189,248,0.4)]"
            >
              <defs>
                <linearGradient id="bgSemicircleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="50%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
                <linearGradient id="bgSemicircleTrack" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0.14)" />
                </linearGradient>
              </defs>

              {/* Background Arc Track */}
              <path
                d="M 90 230 A 210 210 0 0 1 510 230"
                fill="none"
                stroke="url(#bgSemicircleTrack)"
                strokeWidth="10"
                strokeLinecap="round"
              />

              {/* Glowing Progress Semicircle Arc */}
              <path
                d="M 90 230 A 210 210 0 0 1 510 230"
                fill="none"
                stroke="url(#bgSemicircleGrad)"
                strokeWidth="10"
                strokeDasharray={arcLength}
                strokeDashoffset={arcDashOffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
              />

              {/* Glowing ticks */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                const angle = Math.PI - pct * Math.PI;
                const tx1 = 300 + Math.cos(angle) * 196;
                const ty1 = 230 - Math.sin(angle) * 196;
                const tx2 = 300 + Math.cos(angle) * 224;
                const ty2 = 230 - Math.sin(angle) * 224;
                return (
                  <line
                    key={idx}
                    x1={tx1}
                    y1={ty1}
                    x2={tx2}
                    y2={ty2}
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                );
              })}
            </svg>
          </div>
        </div>

        {/* 3D WebGL Canvas Layer (Transparent, Virtual Land & Tree in 3D Center Foreground) */}
        <div
          ref={mountRef}
          className="absolute inset-0 z-10 w-full h-full cursor-grab active:cursor-grabbing"
          title="Click and drag to orbit your 3D miniature virtual land and tree diorama"
        />

        {/* FOREGROUND UI OVERLAYS */}
        <div className="relative z-20 pointer-events-none p-3 sm:p-4 flex flex-col justify-between h-full">
          {/* Top Status Bar: Live status & Quick dropdown selectors */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span
              className={`pointer-events-auto px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border shadow-sm ${
                isDistracted
                  ? 'bg-rose-950/80 text-rose-300 border-rose-500 animate-pulse'
                  : isRunning
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                  : 'bg-black/60 text-slate-300 border-white/10'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isDistracted ? 'bg-rose-500' : isRunning ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'
                }`}
              />
              <span>
                {isDistracted
                  ? 'Leaves Shedding 🍂'
                  : isRunning
                  ? '3D Orbiting Growth 🌱'
                  : `${activeStage.shortName} Tree`}
              </span>
            </span>

            {/* Quick species dropdown on top right */}
            <div className="pointer-events-auto flex items-center gap-1.5">
              <div className="relative">
                <select
                  value={selectedSpeciesId}
                  onChange={(e) => {
                    setSelectedSpeciesId(e.target.value);
                    localStorage.setItem('zenith_tree_species', e.target.value);
                  }}
                  className="appearance-none pl-2 pr-6 py-1 rounded-lg bg-black/75 border border-white/20 text-[11px] font-bold text-cyan-300 focus:outline-none cursor-pointer"
                >
                  {TREE_SPECIES.map((sp) => (
                    <option key={sp.id} value={sp.id} className="bg-slate-900 text-white">
                      {sp.icon} {sp.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-cyan-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Bottom Floating Control Dock */}
          <div className="pointer-events-auto p-2 sm:p-2.5 rounded-2xl bg-black/80 backdrop-blur-md border border-white/10 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-2">
            {/* Direct Typing Input Block (1 min to 3 hours = 180 min) */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-black/70 border border-white/20 hover:border-cyan-400/50 rounded-xl px-3 py-1.5 focus-within:border-cyan-400 transition-colors shadow-inner">
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Duration:</span>
                <input
                  type="number"
                  min={1}
                  max={180}
                  value={inputMinutesText}
                  disabled={isRunning}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onBlur={handleInputBlur}
                  className="w-14 bg-transparent text-cyan-300 font-mono font-black text-sm text-center focus:outline-none border-b border-cyan-500/40"
                  placeholder="25"
                  title="Type focus minutes (1 to 180 mins) - automatically updates"
                />
                <span className="text-xs text-slate-300 font-semibold">min</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-mono font-bold">
                  {formatDurationBadge(customMinutes)}
                </span>
              </div>
            </div>

            {/* Quick Controls: Play/Pause & Reset */}
            <div className="flex items-center gap-1.5">
              {/* Play / Pause button */}
              {isRunning ? (
                <button
                  type="button"
                  onClick={handlePauseTimer}
                  className="py-1.5 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-md"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartTimer}
                  className="py-1.5 px-4 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:opacity-95 text-slate-950 font-black text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-lg"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{secondsRemaining === 0 ? 'Plant Next' : 'Start Focus'}</span>
                </button>
              )}

              {/* Reset button */}
              <button
                type="button"
                onClick={handleResetTimer}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-300 hover:text-white cursor-pointer transition-colors"
                title="Reset timer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* COMPACT BOTTOM STATS STRIP: Minimal Space */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Focus Points</span>
          <span className="text-base font-black text-amber-400">{userFocusPoints.toLocaleString()}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Trees Cultivated</span>
          <span className="text-base font-black text-emerald-400">{userTreesGrown} Grown</span>
        </div>
        <div className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Total Focus Time</span>
          <span className="text-base font-black text-cyan-400">{userTotalMinutes} Mins</span>
        </div>
      </div>
    </div>
  );
};

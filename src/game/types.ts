/**
 * Neon Dash - Core Game Types and Interfaces
 * 100% Original Game Design
 */

export type GameState = 'menu' | 'playing' | 'paused' | 'gameover' | 'reviving';

export type Lane = -1 | 0 | 1; // Left, Center, Right

export type PowerUpType = 'magnet' | 'doubleScore' | 'jetpack' | 'shield';

export interface PowerUpActive {
  type: PowerUpType;
  duration: number; // in seconds
  maxDuration: number;
}

export interface PlayerStats {
  score: number;
  distance: number; // in meters
  orbs: number;
  gems: number;
  multiplier: number;
  speed: number; // in units/sec
  maxSpeed: number;
}

export interface CharacterConfig {
  id: string;
  name: string;
  title: string;
  description: string;
  priceOrbs: number;
  priceGems?: number;
  jacketColor: number;
  visorColor: number;
  pantsColor: number;
  sneakerGlow: number;
  hairColor: number;
  perkName: string;
  perkDesc: string;
}

export interface TrailConfig {
  id: string;
  name: string;
  color: number;
  price: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  rewardOrbs: number;
  rewardGems?: number;
  claimed: boolean;
  type: 'collect_orbs' | 'jump_times' | 'slide_times' | 'distance_run' | 'use_powerups' | 'collect_gems';
}

export interface HighScoreRecord {
  id: string;
  score: number;
  distance: number;
  orbs: number;
  characterName: string;
  date: string;
}

export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  showOnScreenControls: boolean;
  graphicsQuality: 'high' | 'medium' | 'low';
}

export interface ObstacleData {
  id: number;
  type: 'barrier_low' | 'overhead_beam' | 'moving_cart' | 'full_blocker' | 'chasm_gap';
  lane: Lane;
  z: number;
  speed?: number; // for moving cart
  dir?: number;
  passed?: boolean;
}

export interface CollectibleData {
  id: number;
  type: 'orb' | 'gem' | 'powerup';
  powerUpType?: PowerUpType;
  lane: Lane;
  z: number;
  y: number;
  collected?: boolean;
}

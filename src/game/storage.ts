/**
 * Neon Dash - Local Storage & Game Progression Persistence
 */

import { CharacterConfig, GameSettings, HighScoreRecord, Mission, TrailConfig } from './types';

export const CHARACTERS: CharacterConfig[] = [
  {
    id: 'kaelen',
    name: 'Kaelen Voss',
    title: 'The Sunset Courier',
    description: 'A nimble rooftop messenger with a high-voltage teal windbreaker and pulse sneakers.',
    priceOrbs: 0,
    jacketColor: 0x06b6d4, // Cyan / Teal
    visorColor: 0x22d3ee,  // Cyan Visor
    pantsColor: 0x1e293b,  // Dark slate
    sneakerGlow: 0x00f0ff, // Bright Cyan
    hairColor: 0x0f172a,   // Dark
    perkName: 'Pulse Magnet',
    perkDesc: '+20% Magnet attraction radius'
  },
  {
    id: 'nyx',
    name: 'Nyx Cipher',
    title: 'Netrunner Rogue',
    description: 'An elite data thief draped in an obsidian trenchcoat with fiber-optic ultraviolet streaks.',
    priceOrbs: 350,
    jacketColor: 0x9333ea, // Neon Purple / Magenta
    visorColor: 0xf43f5e,  // Rose / Magenta Visor
    pantsColor: 0x0f172a,  // Midnight Black
    sneakerGlow: 0xe879f9, // Neon Fuchsia
    hairColor: 0xd946ef,   // Magenta hair
    perkName: 'Data Surge',
    perkDesc: '+15% bonus orbs per run'
  },
  {
    id: 'aero',
    name: 'Aero Jax',
    title: 'Sky Courier Veteran',
    description: 'Veteran roof runner wearing an amber industrial flight rig and solar impulse thrusters.',
    priceOrbs: 700,
    jacketColor: 0xf59e0b, // Amber Gold
    visorColor: 0xfbbf24,  // Amber Visor
    pantsColor: 0x292524,  // Dark Bronze
    sneakerGlow: 0xf59e0b, // Amber Glow
    hairColor: 0x78716c,   // Grey
    perkName: 'Sky Bound',
    perkDesc: '+2.5s Jetpack flight duration'
  },
  {
    id: 'vesper',
    name: 'Vesper Volt',
    title: 'Cyber Acrobat',
    description: 'A legendary rooftop daredevil with an iridescent prism suit and electric lime boosters.',
    priceOrbs: 1200,
    priceGems: 5,
    jacketColor: 0x10b981, // Emerald / Lime
    visorColor: 0xa3e635,  // Lime Visor
    pantsColor: 0x022c22,  // Deep Pine
    sneakerGlow: 0x22c55e, // Neon Green
    hairColor: 0x84cc16,   // Lime
    perkName: 'Holo Shield',
    perkDesc: 'Starts every run with 1 active Shield!'
  }
];

export const TRAILS: TrailConfig[] = [
  { id: 'cyan_laser', name: 'Cyan Laser', color: 0x06b6d4, price: 0 },
  { id: 'neon_pink', name: 'Cyber Fuchsia', color: 0xec4899, price: 200 },
  { id: 'solar_amber', name: 'Solar Flare', color: 0xf59e0b, price: 300 },
  { id: 'matrix_lime', name: 'Matrix Emerald', color: 0x10b981, price: 450 }
];

export const DEFAULT_MISSIONS: Mission[] = [
  {
    id: 'm_orbs_100',
    title: 'Orb Runner',
    description: 'Collect 100 energy orbs',
    target: 100,
    current: 0,
    rewardOrbs: 150,
    claimed: false,
    type: 'collect_orbs'
  },
  {
    id: 'm_jump_15',
    title: 'Rooftop Leap',
    description: 'Perform 15 jumps over barriers',
    target: 15,
    current: 0,
    rewardOrbs: 100,
    claimed: false,
    type: 'jump_times'
  },
  {
    id: 'm_slide_10',
    title: 'Low Profile',
    description: 'Slide under 10 overhead hazards',
    target: 10,
    current: 0,
    rewardOrbs: 120,
    claimed: false,
    type: 'slide_times'
  },
  {
    id: 'm_dist_1000',
    title: 'Sunset Sprint',
    description: 'Run 1,000 meters in a single run',
    target: 1000,
    current: 0,
    rewardOrbs: 200,
    rewardGems: 2,
    claimed: false,
    type: 'distance_run'
  },
  {
    id: 'm_power_3',
    title: 'Overcharged',
    description: 'Grab 3 power-up crates',
    target: 3,
    current: 0,
    rewardOrbs: 150,
    claimed: false,
    type: 'use_powerups'
  },
  {
    id: 'm_gems_2',
    title: 'Synth Jewel',
    description: 'Snag 2 rare prismatic gems',
    target: 2,
    current: 0,
    rewardOrbs: 250,
    rewardGems: 1,
    claimed: false,
    type: 'collect_gems'
  }
];

const STORAGE_KEYS = {
  ORBS: 'neondash_orbs_v1',
  GEMS: 'neondash_gems_v1',
  HIGHSCORES: 'neondash_highscores_v1',
  UNLOCKED_CHARS: 'neondash_unlocked_chars_v1',
  SELECTED_CHAR: 'neondash_selected_char_v1',
  UNLOCKED_TRAILS: 'neondash_unlocked_trails_v1',
  SELECTED_TRAIL: 'neondash_selected_trail_v1',
  FOX_COMPANION: 'neondash_fox_companion_v1',
  MISSIONS: 'neondash_missions_v1',
  SETTINGS: 'neondash_settings_v1',
  STATS: 'neondash_lifetime_stats_v1'
};

export class StorageManager {
  public static getOrbs(): number {
    const val = localStorage.getItem(STORAGE_KEYS.ORBS);
    return val ? parseInt(val, 10) : 50; // Starter bonus
  }

  public static addOrbs(amount: number): number {
    const current = this.getOrbs();
    const updated = Math.max(0, current + amount);
    localStorage.setItem(STORAGE_KEYS.ORBS, updated.toString());
    return updated;
  }

  public static getGems(): number {
    const val = localStorage.getItem(STORAGE_KEYS.GEMS);
    return val ? parseInt(val, 10) : 2; // Starter bonus
  }

  public static addGems(amount: number): number {
    const current = this.getGems();
    const updated = Math.max(0, current + amount);
    localStorage.setItem(STORAGE_KEYS.GEMS, updated.toString());
    return updated;
  }

  public static getHighScores(): HighScoreRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HIGHSCORES);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // ignore
    }
    // Default initial records for a competitive feel
    return [
      { id: '1', score: 14500, distance: 1820, orbs: 185, characterName: 'Nyx Cipher', date: '2026-11-05' },
      { id: '2', score: 9800, distance: 1340, orbs: 110, characterName: 'Kaelen Voss', date: '2026-11-06' },
      { id: '3', score: 6200, distance: 910, orbs: 72, characterName: 'Aero Jax', date: '2026-11-06' }
    ];
  }

  public static saveHighScore(newRecord: Omit<HighScoreRecord, 'id'>): { isNewBest: boolean; rank: number } {
    const scores = this.getHighScores();
    const fullRecord: HighScoreRecord = {
      ...newRecord,
      id: Date.now().toString()
    };

    const isNewBest = scores.length === 0 || newRecord.score > scores[0].score;
    scores.push(fullRecord);
    scores.sort((a, b) => b.score - a.score);
    const trimmed = scores.slice(0, 10);
    localStorage.setItem(STORAGE_KEYS.HIGHSCORES, JSON.stringify(trimmed));

    const rank = trimmed.findIndex(s => s.id === fullRecord.id) + 1;
    return { isNewBest, rank: rank > 0 ? rank : 11 };
  }

  public static getUnlockedCharacters(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.UNLOCKED_CHARS);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return ['kaelen'];
  }

  public static unlockCharacter(id: string): string[] {
    const unlocked = this.getUnlockedCharacters();
    if (!unlocked.includes(id)) {
      unlocked.push(id);
      localStorage.setItem(STORAGE_KEYS.UNLOCKED_CHARS, JSON.stringify(unlocked));
    }
    return unlocked;
  }

  public static getSelectedCharacterId(): string {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_CHAR) || 'kaelen';
  }

  public static setSelectedCharacterId(id: string) {
    localStorage.setItem(STORAGE_KEYS.SELECTED_CHAR, id);
  }

  public static getUnlockedTrails(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.UNLOCKED_TRAILS);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return ['cyan_laser'];
  }

  public static unlockTrail(id: string): string[] {
    const list = this.getUnlockedTrails();
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(STORAGE_KEYS.UNLOCKED_TRAILS, JSON.stringify(list));
    }
    return list;
  }

  public static getSelectedTrailId(): string {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_TRAIL) || 'cyan_laser';
  }

  public static setSelectedTrailId(id: string) {
    localStorage.setItem(STORAGE_KEYS.SELECTED_TRAIL, id);
  }

  public static isFoxCompanionUnlocked(): boolean {
    return localStorage.getItem(STORAGE_KEYS.FOX_COMPANION) === 'true';
  }

  public static unlockFoxCompanion() {
    localStorage.setItem(STORAGE_KEYS.FOX_COMPANION, 'true');
  }

  public static getMissions(): Mission[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MISSIONS);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return DEFAULT_MISSIONS;
  }

  public static saveMissions(missions: Mission[]) {
    localStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(missions));
  }

  public static updateMissions(runData: {
    orbsCollected: number;
    jumpsCount: number;
    slidesCount: number;
    distance: number;
    powerupsUsed: number;
    gemsCollected: number;
  }): { completedMissions: Mission[] } {
    const missions = this.getMissions();
    const completedMissions: Mission[] = [];

    missions.forEach(m => {
      if (m.claimed) return;

      const wasComplete = m.current >= m.target;

      switch (m.type) {
        case 'collect_orbs':
          m.current += runData.orbsCollected;
          break;
        case 'jump_times':
          m.current += runData.jumpsCount;
          break;
        case 'slide_times':
          m.current += runData.slidesCount;
          break;
        case 'distance_run':
          if (runData.distance > m.current) {
            m.current = Math.floor(runData.distance);
          }
          break;
        case 'use_powerups':
          m.current += runData.powerupsUsed;
          break;
        case 'collect_gems':
          m.current += runData.gemsCollected;
          break;
      }

      if (!wasComplete && m.current >= m.target) {
        completedMissions.push(m);
      }
    });

    this.saveMissions(missions);
    return { completedMissions };
  }

  public static getSettings(): GameSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return {
      musicVolume: 0.6,
      sfxVolume: 0.8,
      musicEnabled: true,
      sfxEnabled: true,
      showOnScreenControls: true, // Default enabled for seamless mobile and desktop play
      graphicsQuality: 'high'
    };
  }

  public static saveSettings(settings: GameSettings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }
}

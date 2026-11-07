/**
 * Neon Dash - Locker & Shop Modal
 * Character locker, outfit trails, and Kitsune-09 cyber fox companion unlocks.
 */

import React, { useState } from 'react';
import { X, Check, Lock, Sparkles, User, Footprints, Bot } from 'lucide-react';
import { CHARACTERS, StorageManager, TRAILS } from '../game/storage';
import { soundEngine } from '../game/audio';

interface ShopModalProps {
  orbs: number;
  gems: number;
  onClose: () => void;
  onDataChanged: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  orbs,
  gems,
  onClose,
  onDataChanged
}) => {
  const [activeTab, setActiveTab] = useState<'characters' | 'trails' | 'companion'>('characters');
  const [unlockedChars, setUnlockedChars] = useState<string[]>(StorageManager.getUnlockedCharacters());
  const [selectedCharId, setSelectedCharId] = useState<string>(StorageManager.getSelectedCharacterId());
  const [unlockedTrails, setUnlockedTrails] = useState<string[]>(StorageManager.getUnlockedTrails());
  const [selectedTrailId, setSelectedTrailId] = useState<string>(StorageManager.getSelectedTrailId());
  const [hasFox, setHasFox] = useState<boolean>(StorageManager.isFoxCompanionUnlocked());

  const handleSelectChar = (id: string) => {
    StorageManager.setSelectedCharacterId(id);
    setSelectedCharId(id);
    soundEngine.playClick();
    onDataChanged();
  };

  const handleBuyChar = (char: typeof CHARACTERS[0]) => {
    if (char.priceGems && gems >= char.priceGems) {
      StorageManager.addGems(-char.priceGems);
    } else if (orbs >= char.priceOrbs) {
      StorageManager.addOrbs(-char.priceOrbs);
    } else {
      return;
    }

    const updated = StorageManager.unlockCharacter(char.id);
    StorageManager.setSelectedCharacterId(char.id);
    setUnlockedChars(updated);
    setSelectedCharId(char.id);
    soundEngine.playPowerup();
    onDataChanged();
  };

  const handleSelectTrail = (id: string) => {
    StorageManager.setSelectedTrailId(id);
    setSelectedTrailId(id);
    soundEngine.playClick();
    onDataChanged();
  };

  const handleBuyTrail = (trail: typeof TRAILS[0]) => {
    if (orbs < trail.price) return;
    StorageManager.addOrbs(-trail.price);
    const updated = StorageManager.unlockTrail(trail.id);
    StorageManager.setSelectedTrailId(trail.id);
    setUnlockedTrails(updated);
    setSelectedTrailId(trail.id);
    soundEngine.playPowerup();
    onDataChanged();
  };

  const handleBuyFox = () => {
    const foxCost = 500;
    if (orbs < foxCost || hasFox) return;
    StorageManager.addOrbs(-foxCost);
    StorageManager.unlockFoxCompanion();
    setHasFox(true);
    soundEngine.playPowerup();
    onDataChanged();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="text-xs uppercase tracking-wider text-pink-400 font-heading font-semibold">
              Cybernetics Locker
            </div>
            <h2 className="text-2xl sm:text-3xl font-cyber font-extrabold text-white">
              RUNNER GEAR
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-cyan-500/30 flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4]" />
              <span className="font-cyber font-bold text-cyan-200 text-sm">{orbs}</span>
            </div>
            {gems > 0 && (
              <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-pink-500/30 flex items-center gap-1.5">
                <div className="w-3 h-3 rotate-45 bg-pink-500 shadow-[0_0_6px_#ec4899]" />
                <span className="font-cyber font-bold text-pink-200 text-sm">{gems}</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 my-4 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('characters')}
            className={`flex-1 py-2 px-3 rounded-xl font-cyber text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'characters'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Characters</span>
          </button>
          <button
            onClick={() => setActiveTab('trails')}
            className={`flex-1 py-2 px-3 rounded-xl font-cyber text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'trails'
                ? 'bg-pink-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Footprints className="w-4 h-4" />
            <span>Pulse Trails</span>
          </button>
          <button
            onClick={() => setActiveTab('companion')}
            className={`flex-1 py-2 px-3 rounded-xl font-cyber text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'companion'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Sidekick</span>
          </button>
        </div>

        {/* Tab Content List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {activeTab === 'characters' && (
            CHARACTERS.map(char => {
              const isUnlocked = unlockedChars.includes(char.id);
              const isSelected = selectedCharId === char.id;
              const canAfford = orbs >= char.priceOrbs || (char.priceGems ? gems >= char.priceGems : false);

              return (
                <div
                  key={char.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-cyber font-bold text-lg text-white">{char.name}</span>
                        <span className="text-[11px] font-heading font-semibold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                          {char.title}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{char.description}</p>
                      <div className="mt-2 text-xs font-cyber text-amber-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Perk: {char.perkName} — {char.perkDesc}</span>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-2">
                      {isSelected ? (
                        <div className="px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-cyber font-bold text-xs flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          EQUIPPED
                        </div>
                      ) : isUnlocked ? (
                        <button
                          onClick={() => handleSelectChar(char.id)}
                          className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 font-cyber font-bold text-xs transition-colors"
                        >
                          EQUIP
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBuyChar(char)}
                          disabled={!canAfford}
                          className={`px-4 py-1.5 rounded-xl font-cyber font-bold text-xs flex items-center gap-1.5 transition-all ${
                            canAfford
                              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:opacity-90'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>
                            {char.priceGems ? `${char.priceGems} Gems` : `${char.priceOrbs} Orbs`}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {activeTab === 'trails' && (
            TRAILS.map(trail => {
              const isUnlocked = unlockedTrails.includes(trail.id);
              const isSelected = selectedTrailId === trail.id;
              const canAfford = orbs >= trail.price;

              return (
                <div
                  key={trail.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-pink-950/40 border-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.25)]'
                      : 'bg-slate-950/70 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded-full shadow-lg border border-white/20"
                      style={{ backgroundColor: `#${trail.color.toString(16).padStart(6, '0')}` }}
                    />
                    <div>
                      <div className="font-cyber font-bold text-white text-sm sm:text-base">{trail.name}</div>
                      <div className="text-[11px] text-slate-400">Particle runner sole trail</div>
                    </div>
                  </div>

                  <div>
                    {isSelected ? (
                      <div className="px-3 py-1.5 rounded-xl bg-pink-500 text-slate-950 font-cyber font-bold text-xs flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        ACTIVE
                      </div>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => handleSelectTrail(trail.id)}
                        className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-pink-300 border border-pink-500/40 font-cyber font-bold text-xs"
                      >
                        EQUIP
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuyTrail(trail)}
                        disabled={!canAfford}
                        className={`px-4 py-1.5 rounded-xl font-cyber font-bold text-xs flex items-center gap-1.5 ${
                          canAfford
                            ? 'bg-pink-600 text-white hover:bg-pink-500'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>{trail.price} Orbs</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {activeTab === 'companion' && (
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-3xl bg-amber-950/50 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-3 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
                <Bot className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-cyber font-extrabold text-white">Kitsune-09</h3>
              <p className="text-xs text-amber-400 font-heading font-semibold uppercase tracking-wider mb-2">
                Cyber Fox Autonomous Companion
              </p>
              <p className="text-xs text-slate-300 max-w-sm mb-4">
                A sleek, low-poly origami robotic fox with twin glowing thruster tails that bounds and runs alongside you across the rooftops, cheering every gem you collect.
              </p>

              {hasFox ? (
                <div className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-cyber font-bold text-sm flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  COMPANION ACTIVE IN RUN
                </div>
              ) : (
                <button
                  onClick={handleBuyFox}
                  disabled={orbs < 500}
                  className={`px-6 py-2.5 rounded-2xl font-cyber font-bold text-sm flex items-center gap-2 shadow-lg transition-all ${
                    orbs >= 500
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:brightness-110 active:scale-95'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>UNLOCK FOR 500 ORBS</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

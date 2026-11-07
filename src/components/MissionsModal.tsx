/**
 * Neon Dash - Daily Missions Modal
 * Tracks daily & progression missions with progress bars, rewards, and claim buttons.
 */

import React, { useState } from 'react';
import { X, Check, Award, Gift, Target } from 'lucide-react';
import { Mission } from '../game/types';
import { StorageManager } from '../game/storage';
import { soundEngine } from '../game/audio';

interface MissionsModalProps {
  onClose: () => void;
  onRewardClaimed: () => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({
  onClose,
  onRewardClaimed
}) => {
  const [missions, setMissions] = useState<Mission[]>(StorageManager.getMissions());

  const handleClaim = (mission: Mission) => {
    if (mission.claimed || mission.current < mission.target) return;

    if (mission.rewardOrbs) {
      StorageManager.addOrbs(mission.rewardOrbs);
    }
    if (mission.rewardGems) {
      StorageManager.addGems(mission.rewardGems);
    }

    const updated = missions.map(m => (m.id === mission.id ? { ...m, claimed: true } : m));
    setMissions(updated);
    StorageManager.saveMissions(updated);
    soundEngine.playGem();
    onRewardClaimed();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[85vh] relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-amber-400 font-heading font-semibold">
                Daily Directives
              </div>
              <h2 className="text-2xl font-cyber font-extrabold text-white">
                ROOFTOP MISSIONS
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mission List */}
        <div className="flex-1 overflow-y-auto space-y-3.5 my-4 pr-1">
          {missions.map(mission => {
            const isCompleted = mission.current >= mission.target;
            const pct = Math.min(100, Math.round((mission.current / mission.target) * 100));

            return (
              <div
                key={mission.id}
                className={`p-4 rounded-2xl border transition-all ${
                  mission.claimed
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                    : isCompleted
                    ? 'bg-amber-950/20 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                    : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h4 className="font-cyber font-bold text-white text-base">
                      {mission.title}
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {mission.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800">
                    <Gift className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-cyber font-bold text-amber-300 text-xs">
                      +{mission.rewardOrbs} Orbs
                    </span>
                    {mission.rewardGems && (
                      <span className="font-cyber font-bold text-pink-300 text-xs ml-1">
                        +{mission.rewardGems} Gems
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar & Status / Claim */}
                <div className="flex items-center justify-between gap-3 mt-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-[11px] font-cyber text-slate-400 mb-1">
                      <span>Progress</span>
                      <span>
                        {Math.min(mission.current, mission.target)} / {mission.target} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          isCompleted ? 'bg-amber-400' : 'bg-cyan-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="shrink-0">
                    {mission.claimed ? (
                      <div className="px-3 py-1 rounded-xl bg-slate-800/80 text-slate-400 font-cyber font-bold text-xs flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        CLAIMED
                      </div>
                    ) : isCompleted ? (
                      <button
                        onClick={() => handleClaim(mission)}
                        className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-cyber font-extrabold text-xs shadow-md active:scale-95 transition-all"
                      >
                        CLAIM
                      </button>
                    ) : (
                      <div className="px-3 py-1 text-slate-500 font-cyber text-xs">
                        In Progress
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

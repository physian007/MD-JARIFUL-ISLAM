/**
 * Neon Dash - Game Over Modal
 * Run statistics summary, new high score alert, and Revive option (spend orbs or free daily rescue).
 */

import React, { useState } from 'react';
import { PlayerStats } from '../game/types';
import { RotateCcw, Home, Heart, Award, ArrowUpRight } from 'lucide-react';

interface GameOverModalProps {
  stats: PlayerStats;
  isNewBest: boolean;
  rank: number;
  totalOrbs: number;
  reviveCount: number;
  onRevive: () => void;
  onRetry: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  isNewBest,
  rank,
  totalOrbs,
  reviveCount,
  onRevive,
  onRetry,
  onHome
}) => {
  const [hasRevived, setHasRevived] = useState(false);
  const reviveCost = reviveCount === 0 ? 0 : 35; // First revive free rescue!
  const canAffordRevive = totalOrbs >= reviveCost;

  const handleReviveClick = () => {
    if (canAffordRevive && !hasRevived) {
      setHasRevived(true);
      onRevive();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Glowing Top Ambient Edge */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-pink-500 to-amber-500" />

        <div className="text-xs uppercase tracking-widest text-red-400 font-heading font-semibold mb-1">
          Surveillance Caught You
        </div>
        <h2 className="text-3xl sm:text-4xl font-cyber font-extrabold text-white mb-4 tracking-tight">
          RUN COMPLETED
        </h2>

        {isNewBest && (
          <div className="mb-4 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-cyber font-bold flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            NEW PERSONAL RECORD! (Rank #{rank})
          </div>
        )}

        {/* Score Display Card */}
        <div className="w-full bg-slate-950/70 border border-slate-800 rounded-2xl p-4 mb-4">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-heading">
            Total Score
          </div>
          <div className="text-4xl font-cyber font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400">
            {stats.score.toLocaleString()}
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-left">
            <div>
              <div className="text-[10px] uppercase text-slate-400">Distance</div>
              <div className="text-base font-cyber font-bold text-amber-300">{stats.distance}m</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-slate-400">Orbs</div>
              <div className="text-base font-cyber font-bold text-cyan-300">+{stats.orbs}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-slate-400">Gems</div>
              <div className="text-base font-cyber font-bold text-pink-300">+{stats.gems}</div>
            </div>
          </div>
        </div>

        {/* Revive Button Card */}
        <div className="w-full mb-4">
          <button
            onClick={handleReviveClick}
            disabled={!canAffordRevive || hasRevived}
            className={`w-full py-3.5 px-4 rounded-2xl border flex items-center justify-between font-cyber font-bold text-sm transition-all ${
              canAffordRevive && !hasRevived
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 border-pink-400 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)] active:scale-98'
                : 'bg-slate-800/50 border-slate-700/50 text-slate-500 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Heart className="w-5 h-5 fill-current text-white" />
              <span>REVIVE RUNNER</span>
            </div>
            <div className="text-xs bg-slate-950/60 px-2.5 py-1 rounded-lg border border-pink-400/30 flex items-center gap-1">
              {reviveCost === 0 ? (
                <span className="text-emerald-400 font-bold uppercase">Free Rescue</span>
              ) : (
                <>
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  <span>{reviveCost} Orbs</span>
                </>
              )}
            </div>
          </button>
        </div>

        {/* Primary Action Buttons */}
        <div className="w-full grid grid-cols-2 gap-3">
          <button
            onClick={onRetry}
            className="py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-cyber font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            RUN AGAIN
          </button>

          <button
            onClick={onHome}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-cyber font-bold text-sm flex items-center justify-center gap-2 transition-all border border-slate-700"
          >
            <Home className="w-4 h-4" />
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};

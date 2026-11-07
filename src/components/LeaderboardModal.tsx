/**
 * Neon Dash - High Score Leaderboard Modal
 * Local records with ranking medals, run distance, orbs collected, and runner details.
 */

import React from 'react';
import { X, Trophy, Medal, Calendar } from 'lucide-react';
import { StorageManager } from '../game/storage';

interface LeaderboardModalProps {
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ onClose }) => {
  const records = StorageManager.getHighScores();

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-sm shadow-[0_0_10px_#f59e0b]">
            <Medal className="w-5 h-5 fill-current" />
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 rounded-full bg-slate-300 text-slate-950 font-black flex items-center justify-center text-sm shadow-[0_0_10px_#cbd5e1]">
            <Medal className="w-5 h-5 fill-current" />
          </div>
        );
      case 3:
        return (
          <div className="w-8 h-8 rounded-full bg-amber-700 text-slate-100 font-black flex items-center justify-center text-sm shadow-[0_0_10px_#b45309]">
            <Medal className="w-5 h-5 fill-current" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 font-cyber font-bold flex items-center justify-center text-xs">
            #{rank}
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[85vh] relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-cyan-400 font-heading font-semibold">
                Rooftop Hall of Fame
              </div>
              <h2 className="text-2xl font-cyber font-extrabold text-white">
                HIGH SCORES
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

        {/* Score List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 my-4 pr-1">
          {records.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              No runs recorded yet. Start your first dash!
            </div>
          ) : (
            records.map((rec, idx) => {
              const rank = idx + 1;
              return (
                <div
                  key={rec.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                    rank === 1
                      ? 'bg-amber-950/20 border-amber-500/50'
                      : 'bg-slate-950/70 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getRankBadge(rank)}
                    <div>
                      <div className="font-cyber font-bold text-white text-base">
                        {rec.score.toLocaleString()} <span className="text-xs text-cyan-400">pts</span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2">
                        <span>{rec.characterName}</span>
                        <span>•</span>
                        <span>{rec.distance}m</span>
                        <span>•</span>
                        <span className="text-cyan-300">+{rec.orbs} orbs</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3" />
                    <span>{rec.date}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

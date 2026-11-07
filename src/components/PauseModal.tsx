/**
 * Neon Dash - Pause Modal
 */

import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onHome,
  isMuted,
  onToggleMute
}) => {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-xs bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
        <h2 className="text-2xl font-cyber font-extrabold text-white mb-6">
          GAME PAUSED
        </h2>

        <div className="w-full space-y-3">
          <button
            onClick={onResume}
            className="w-full py-3.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-cyber font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            RESUME RUN
          </button>

          <button
            onClick={onRestart}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-cyber font-bold text-sm flex items-center justify-center gap-2 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            RESTART
          </button>

          <button
            onClick={onToggleMute}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 font-cyber text-xs flex items-center justify-center gap-2 transition-all"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            <span>{isMuted ? 'UNMUTE AUDIO' : 'MUTE AUDIO'}</span>
          </button>

          <button
            onClick={onHome}
            className="w-full py-2.5 px-4 rounded-xl text-slate-400 hover:text-white font-cyber text-xs flex items-center justify-center gap-2 transition-all"
          >
            <Home className="w-4 h-4" />
            QUIT TO MENU
          </button>
        </div>
      </div>
    </div>
  );
};

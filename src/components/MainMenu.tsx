/**
 * Neon Dash - Main Menu Screen
 * Sunset Cyber theme, character preview, daily missions badge, play button, and modal launchers.
 */

import React from 'react';
import { Play, Trophy, ShoppingBag, Target, Info, Settings, Sparkles } from 'lucide-react';
import { CharacterConfig } from '../game/types';

interface MainMenuProps {
  orbs: number;
  gems: number;
  selectedChar: CharacterConfig;
  unclaimedMissionsCount: number;
  onPlay: () => void;
  onOpenShop: () => void;
  onOpenMissions: () => void;
  onOpenLeaderboard: () => void;
  onOpenSettings: () => void;
  onOpenCredits: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  orbs,
  gems,
  selectedChar,
  unclaimedMissionsCount,
  onPlay,
  onOpenShop,
  onOpenMissions,
  onOpenLeaderboard,
  onOpenSettings,
  onOpenCredits
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 select-none">
      {/* Top Bar with Currency & Quick Settings */}
      <div className="flex items-center justify-between pointer-events-auto">
        {/* Currencies */}
        <div className="flex items-center gap-2.5">
          <div className="bg-slate-950/80 backdrop-blur-md border border-cyan-500/30 rounded-xl px-3.5 py-2 flex items-center gap-2 shadow-lg">
            <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
            <span className="font-cyber font-bold text-cyan-200 text-sm sm:text-base">
              {orbs.toLocaleString()}
            </span>
          </div>

          <div className="bg-slate-950/80 backdrop-blur-md border border-pink-500/30 rounded-xl px-3.5 py-2 flex items-center gap-2 shadow-lg">
            <div className="w-3.5 h-3.5 rotate-45 bg-pink-500 shadow-[0_0_8px_#ec4899]" />
            <span className="font-cyber font-bold text-pink-200 text-sm sm:text-base">
              {gems}
            </span>
          </div>
        </div>

        {/* Settings & Credits */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCredits}
            className="p-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-300 transition-colors shadow-lg"
            title="Credits & Legal"
          >
            <Info className="w-5 h-5 text-cyan-400" />
          </button>
          <button
            onClick={onOpenSettings}
            className="p-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-300 transition-colors shadow-lg"
            title="Settings"
          >
            <Settings className="w-5 h-5 text-slate-300" />
          </button>
        </div>
      </div>

      {/* Center Branding & Logo */}
      <div className="flex flex-col items-center justify-center text-center -mt-10 sm:-mt-12 pointer-events-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-semibold uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          3D Cyber Rooftop Runner
        </div>

        <h1 className="text-5xl sm:text-7xl font-cyber font-extrabold tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-500 to-amber-400 drop-shadow-[0_0_30px_rgba(6,182,212,0.6)]">
          NEON DASH
        </h1>

        <p className="text-slate-300 text-sm sm:text-base max-w-sm mt-2 font-heading font-medium tracking-wide">
          Sprint across sunset skyscrapers. Collect energy orbs. Outrun the drone.
        </p>

        {/* Selected Character Preview Badge */}
        <div className="mt-5 bg-slate-950/80 backdrop-blur-md border border-slate-700/60 rounded-2xl px-4 py-2 flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          <div className="text-left">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-heading">
              Current Runner
            </div>
            <div className="text-sm font-cyber font-bold text-white">
              {selectedChar.name}
            </div>
          </div>
          <span className="text-xs text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
            {selectedChar.perkName}
          </span>
        </div>
      </div>

      {/* Bottom Action Menu */}
      <div className="flex flex-col items-center gap-4 max-w-md mx-auto w-full pointer-events-auto pb-4">
        {/* Big Main Play Button */}
        <button
          onClick={onPlay}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-cyan-400 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-cyber font-extrabold text-xl sm:text-2xl tracking-wider flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all transform active:scale-98"
        >
          <Play className="w-7 h-7 fill-current" />
          START RUN
        </button>

        {/* Secondary Navigation Row */}
        <div className="grid grid-cols-3 gap-2.5 w-full">
          {/* Daily Missions */}
          <button
            onClick={onOpenMissions}
            className="relative py-3 px-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-700/70 hover:border-amber-500/50 text-slate-200 font-cyber text-xs sm:text-sm font-bold flex flex-col items-center gap-1.5 transition-all"
          >
            {unclaimedMissionsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                {unclaimedMissionsCount}
              </span>
            )}
            <Target className="w-5 h-5 text-amber-400" />
            <span>Missions</span>
          </button>

          {/* Character & Outfit Shop */}
          <button
            onClick={onOpenShop}
            className="py-3 px-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-700/70 hover:border-pink-500/50 text-slate-200 font-cyber text-xs sm:text-sm font-bold flex flex-col items-center gap-1.5 transition-all"
          >
            <ShoppingBag className="w-5 h-5 text-pink-400" />
            <span>Locker</span>
          </button>

          {/* High Scores Leaderboard */}
          <button
            onClick={onOpenLeaderboard}
            className="py-3 px-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-700/70 hover:border-cyan-500/50 text-slate-200 font-cyber text-xs sm:text-sm font-bold flex flex-col items-center gap-1.5 transition-all"
          >
            <Trophy className="w-5 h-5 text-cyan-400" />
            <span>Ranks</span>
          </button>
        </div>
      </div>
    </div>
  );
};

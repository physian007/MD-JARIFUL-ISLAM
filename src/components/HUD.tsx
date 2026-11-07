/**
 * Neon Dash - In-Game HUD Overlay
 * Clean futuristic typography, power-up timers, distance, orbs, and responsive touch controls.
 */

import React from 'react';
import { PlayerStats, PowerUpActive } from '../game/types';
import { Pause, Volume2, VolumeX, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Zap, Shield, Magnet, Flame, Sparkles } from 'lucide-react';

interface HUDProps {
  stats: PlayerStats;
  powerups: PowerUpActive[];
  onPause: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  showOnScreenControls: boolean;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onJump: () => void;
  onSlide: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  powerups,
  onPause,
  isMuted,
  onToggleMute,
  showOnScreenControls,
  onMoveLeft,
  onMoveRight,
  onJump,
  onSlide
}) => {
  const getPowerUpIcon = (type: string) => {
    switch (type) {
      case 'magnet':
        return <Magnet className="w-5 h-5 text-rose-400" />;
      case 'doubleScore':
        return <Flame className="w-5 h-5 text-amber-400" />;
      case 'jetpack':
        return <Zap className="w-5 h-5 text-cyan-400" />;
      case 'shield':
        return <Shield className="w-5 h-5 text-emerald-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getPowerUpColor = (type: string) => {
    switch (type) {
      case 'magnet':
        return 'border-rose-500/50 bg-rose-950/40 text-rose-300';
      case 'doubleScore':
        return 'border-amber-500/50 bg-amber-950/40 text-amber-300';
      case 'jetpack':
        return 'border-cyan-500/50 bg-cyan-950/40 text-cyan-300';
      case 'shield':
        return 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300';
      default:
        return 'border-cyan-500/50 bg-cyan-950/40 text-cyan-300';
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 select-none overflow-hidden">
      {/* Top Bar Header */}
      <div className="flex items-start justify-between gap-3">
        {/* Left: Score & Multiplier */}
        <div className="bg-slate-950/85 backdrop-blur-md border border-cyan-500/30 rounded-xl px-4 py-2.5 shadow-lg flex items-center gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-cyan-400/80 font-heading font-semibold">
              Score
            </div>
            <div className="text-2xl sm:text-3xl font-cyber font-bold tracking-tight text-white leading-tight">
              {stats.score.toLocaleString()}
            </div>
          </div>

          {stats.multiplier > 1 && (
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs px-2 py-1 rounded-md tracking-wider">
              {stats.multiplier}X
            </div>
          )}
        </div>

        {/* Center: Distance and Velocity */}
        <div className="bg-slate-950/85 backdrop-blur-md border border-slate-700/50 rounded-xl px-3.5 py-2 shadow-lg flex items-center gap-3 text-center">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-heading">
              Distance
            </div>
            <div className="text-lg sm:text-xl font-cyber font-bold text-amber-300">
              {stats.distance} <span className="text-xs font-normal text-slate-400">m</span>
            </div>
          </div>
          <div className="w-[1px] h-6 bg-slate-800" />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-heading">
              Speed
            </div>
            <div className="text-sm sm:text-base font-cyber font-bold text-cyan-300">
              {stats.speed} <span className="text-[10px] font-normal text-slate-400">m/s</span>
            </div>
          </div>
        </div>

        {/* Right: Currency & Pause Controls */}
        <div className="flex items-center gap-2">
          {/* Orbs */}
          <div className="bg-slate-950/85 backdrop-blur-md border border-cyan-500/30 rounded-xl px-3 py-2 shadow-lg flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
            <span className="text-base sm:text-lg font-cyber font-bold text-cyan-200">
              {stats.orbs}
            </span>
          </div>

          {/* Gems */}
          {stats.gems > 0 && (
            <div className="bg-slate-950/85 backdrop-blur-md border border-pink-500/30 rounded-xl px-2.5 py-2 shadow-lg flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rotate-45 bg-pink-500 shadow-[0_0_8px_#ec4899]" />
              <span className="text-base sm:text-lg font-cyber font-bold text-pink-200">
                {stats.gems}
              </span>
            </div>
          )}

          {/* Sound Mute Toggle */}
          <button
            onClick={onToggleMute}
            className="pointer-events-auto bg-slate-900/80 hover:bg-slate-800 border border-slate-700 p-2.5 rounded-xl text-slate-300 transition-colors"
            title="Toggle Audio"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-cyan-400" />}
          </button>

          {/* Pause Button */}
          <button
            onClick={onPause}
            className="pointer-events-auto bg-slate-900/80 hover:bg-slate-800 border border-slate-700 p-2.5 rounded-xl text-slate-300 transition-colors"
            title="Pause Game"
          >
            <Pause className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Active Power-ups Bar (Mid-Top) */}
      <div className="flex flex-col items-center gap-2 mt-3">
        {powerups.map(p => {
          const pct = Math.max(0, Math.min(100, (p.duration / p.maxDuration) * 100));
          const isInfinite = p.maxDuration > 1000;

          return (
            <div
              key={p.type}
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border backdrop-blur-md ${getPowerUpColor(p.type)}`}
            >
              {getPowerUpIcon(p.type)}
              <span className="text-xs font-cyber font-semibold uppercase tracking-wider">
                {p.type === 'doubleScore' ? '2X Score' : p.type}
              </span>
              {!isInfinite && (
                <div className="w-16 h-1.5 bg-slate-900/80 rounded-full overflow-hidden border border-slate-700/50">
                  <div
                    className="h-full bg-current transition-all duration-100 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}
              {!isInfinite && (
                <span className="text-xs font-mono font-bold w-6 text-right">
                  {Math.ceil(p.duration)}s
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Controls Area */}
      <div className="flex items-end justify-between w-full">
        {/* On-screen tactile arrow buttons (ideal for mobile and accessibility) */}
        {showOnScreenControls && (
          <div className="w-full flex items-center justify-between pb-2 sm:pb-3 pointer-events-auto">
            {/* Left & Right Steering */}
            <div className="flex items-center gap-3">
              <button
                onTouchStart={e => { e.preventDefault(); onMoveLeft(); }}
                onClick={onMoveLeft}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-950/80 active:bg-cyan-600/40 border-2 border-cyan-500/40 active:border-cyan-400 flex items-center justify-center text-cyan-300 shadow-xl transition-transform active:scale-95"
                aria-label="Move Left"
              >
                <ArrowLeft className="w-7 h-7" />
              </button>
              <button
                onTouchStart={e => { e.preventDefault(); onMoveRight(); }}
                onClick={onMoveRight}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-950/80 active:bg-cyan-600/40 border-2 border-cyan-500/40 active:border-cyan-400 flex items-center justify-center text-cyan-300 shadow-xl transition-transform active:scale-95"
                aria-label="Move Right"
              >
                <ArrowRight className="w-7 h-7" />
              </button>
            </div>

            {/* Jump & Slide Actions */}
            <div className="flex items-center gap-3">
              <button
                onTouchStart={e => { e.preventDefault(); onSlide(); }}
                onClick={onSlide}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-950/80 active:bg-amber-600/40 border-2 border-amber-500/40 active:border-amber-400 flex flex-col items-center justify-center text-amber-300 shadow-xl transition-transform active:scale-95"
                aria-label="Slide"
              >
                <ArrowDown className="w-6 h-6" />
                <span className="text-[9px] font-cyber font-bold uppercase tracking-wider">Slide</span>
              </button>
              <button
                onTouchStart={e => { e.preventDefault(); onJump(); }}
                onClick={onJump}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-950/80 active:bg-pink-600/40 border-2 border-pink-500/40 active:border-pink-400 flex flex-col items-center justify-center text-pink-300 shadow-xl transition-transform active:scale-95"
                aria-label="Jump"
              >
                <ArrowUp className="w-6 h-6" />
                <span className="text-[9px] font-cyber font-bold uppercase tracking-wider">Jump</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Neon Dash - Credits & Legal Compliance Modal
 * Complete transparency on 100% original procedural artwork, Web Audio synthesis, and CC0 licenses.
 */

import React from 'react';
import { X, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

interface CreditsModalProps {
  onClose: () => void;
}

export const CreditsModal: React.FC<CreditsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[85vh] relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-emerald-400 font-heading font-semibold">
                Originality & Legal Notice
              </div>
              <h2 className="text-2xl font-cyber font-extrabold text-white">
                ASSET CREDITS
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-4 my-4 pr-1 text-slate-300 text-xs sm:text-sm">
          <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-cyber font-bold text-emerald-300 text-sm">
                100% Original Intellectual Property
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Neon Dash is built from scratch. All character models, names, level obstacles, audio synthesis, and visual shaders are entirely original and do not copy or infringe upon Subway Surfers or any third-party franchise.
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-cyber font-bold text-white text-sm uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-cyan-400" />
              Original Procedural Characters
            </h4>
            <div className="space-y-1.5 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <p><strong className="text-white">Kaelen Voss (The Sunset Courier):</strong> Original 3D courier model with teal windbreaker, cyan visor, and glowing impulse high-tops.</p>
              <p><strong className="text-white">Nyx Cipher:</strong> Netrunner Rogue with obsidian coat and ultraviolet fiberoptics.</p>
              <p><strong className="text-white">Aero Jax:</strong> Sky Courier Veteran with amber industrial harness.</p>
              <p><strong className="text-white">Vesper Volt:</strong> Cyber Acrobat with iridescent prismatic suit.</p>
              <p><strong className="text-white">Kitsune-09:</strong> Low-poly origami cyber fox sidekick with twin thruster tails.</p>
              <p><strong className="text-white">Patrol Drone K-99:</strong> Autonomous surveillance quad-rotor with dynamic searchlights.</p>
            </div>
          </div>

          <div>
            <h4 className="font-cyber font-bold text-white text-sm uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-pink-400" />
              Web Audio Synthesis
            </h4>
            <div className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
              <p>All music and sound effects are generated <strong>100% in real-time code</strong> using the browser Web Audio API oscillator nodes, filters, and procedural sequencers. Zero external copyrighted audio files.</p>
              <p className="text-slate-400 mt-1">License: CC0 1.0 Universal / Public Domain equivalent.</p>
            </div>
          </div>

          <div>
            <h4 className="font-cyber font-bold text-white text-sm uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-400" />
              Open Source Fonts & Icons
            </h4>
            <div className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
              <p><strong className="text-white">Fonts:</strong> Chakra Petch & Rajdhani (Google Fonts, SIL Open Font License 1.1).</p>
              <p><strong className="text-white">Icons:</strong> Lucide Icons (ISC License).</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

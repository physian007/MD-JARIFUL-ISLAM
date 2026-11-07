/**
 * Neon Dash - Settings Modal
 * Audio volume controls, mute toggles, tactile on-screen controls preference.
 */

import React, { useState } from 'react';
import { X, Volume2, VolumeX, Smartphone, Sliders } from 'lucide-react';
import { GameSettings } from '../game/types';
import { StorageManager } from '../game/storage';
import { soundEngine } from '../game/audio';

interface SettingsModalProps {
  onClose: () => void;
  onSettingsChanged: (settings: GameSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  onSettingsChanged
}) => {
  const [settings, setSettings] = useState<GameSettings>(StorageManager.getSettings());

  const handleToggleMusic = () => {
    const updated = { ...settings, musicEnabled: !settings.musicEnabled };
    setSettings(updated);
    StorageManager.saveSettings(updated);
    soundEngine.setMusicEnabled(updated.musicEnabled);
    onSettingsChanged(updated);
  };

  const handleToggleSfx = () => {
    const updated = { ...settings, sfxEnabled: !settings.sfxEnabled };
    setSettings(updated);
    StorageManager.saveSettings(updated);
    soundEngine.setSfxEnabled(updated.sfxEnabled);
    onSettingsChanged(updated);
  };

  const handleMusicVolume = (val: number) => {
    const updated = { ...settings, musicVolume: val };
    setSettings(updated);
    StorageManager.saveSettings(updated);
    soundEngine.setMusicVolume(val);
    onSettingsChanged(updated);
  };

  const handleSfxVolume = (val: number) => {
    const updated = { ...settings, sfxVolume: val };
    setSettings(updated);
    StorageManager.saveSettings(updated);
    soundEngine.setSfxVolume(val);
    onSettingsChanged(updated);
  };

  const handleToggleControls = () => {
    const updated = { ...settings, showOnScreenControls: !settings.showOnScreenControls };
    setSettings(updated);
    StorageManager.saveSettings(updated);
    onSettingsChanged(updated);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Sliders className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-cyber font-extrabold text-white">
              SETTINGS
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Setting options */}
        <div className="space-y-4 my-4">
          {/* Music */}
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="font-cyber font-bold text-sm text-white flex items-center gap-2">
                {settings.musicEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
                Synthwave Music
              </span>
              <button
                onClick={handleToggleMusic}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  settings.musicEnabled ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.musicEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.musicVolume}
              onChange={e => handleMusicVolume(parseFloat(e.target.value))}
              disabled={!settings.musicEnabled}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* SFX */}
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="font-cyber font-bold text-sm text-white flex items-center gap-2">
                {settings.sfxEnabled ? <Volume2 className="w-4 h-4 text-pink-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
                Sound Effects
              </span>
              <button
                onClick={handleToggleSfx}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  settings.sfxEnabled ? 'bg-pink-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.sfxEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.sfxVolume}
              onChange={e => handleSfxVolume(parseFloat(e.target.value))}
              disabled={!settings.sfxEnabled}
              className="w-full accent-pink-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* On-Screen Mobile Buttons */}
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-4 h-4 text-amber-400" />
              <div>
                <div className="font-cyber font-bold text-sm text-white">Touch Buttons</div>
                <div className="text-[11px] text-slate-400">On-screen jump/slide/turn arrows</div>
              </div>
            </div>
            <button
              onClick={handleToggleControls}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.showOnScreenControls ? 'bg-amber-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.showOnScreenControls ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

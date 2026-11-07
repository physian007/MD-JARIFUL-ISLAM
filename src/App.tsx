/**
 * Neon Dash - Main React Application Coordinator
 * Implements swipe gesture recognition, keyboard controls, 3D engine lifecycle,
 * state transitions, modals, and Web Audio unlock.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { NeonDashEngine } from './game/threeEngine';
import { GameState, PlayerStats, PowerUpActive, GameSettings } from './game/types';
import { CHARACTERS, StorageManager } from './game/storage';
import { soundEngine } from './game/audio';
import { HUD } from './components/HUD';
import { MainMenu } from './components/MainMenu';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';
import { ShopModal } from './components/ShopModal';
import { MissionsModal } from './components/MissionsModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { CreditsModal } from './components/CreditsModal';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<NeonDashEngine | null>(null);

  // Game UI State
  const [gameState, setGameState] = useState<GameState>('menu');
  const [stats, setStats] = useState<PlayerStats>({
    score: 0,
    distance: 0,
    orbs: 0,
    gems: 0,
    multiplier: 1,
    speed: 22,
    maxSpeed: 46
  });
  const [powerups, setPowerups] = useState<PowerUpActive[]>([]);

  // Persistent Currency & Settings
  const [walletOrbs, setWalletOrbs] = useState<number>(StorageManager.getOrbs());
  const [walletGems, setWalletGems] = useState<number>(StorageManager.getGems());
  const [settings, setSettings] = useState<GameSettings>(StorageManager.getSettings());
  const [isMuted, setIsMuted] = useState<boolean>(!settings.musicEnabled);

  // Selected Character
  const [selectedCharId, setSelectedCharId] = useState<string>(StorageManager.getSelectedCharacterId());
  const currentChar = CHARACTERS.find(c => c.id === selectedCharId) || CHARACTERS[0];

  // Active Modals
  const [activeModal, setActiveModal] = useState<
    'none' | 'shop' | 'missions' | 'leaderboard' | 'settings' | 'credits'
  >('none');

  // Game Over Details
  const [lastRunStats, setLastRunStats] = useState<PlayerStats | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [newRank, setNewRank] = useState(1);
  const [reviveCount, setReviveCount] = useState(0);

  // Unclaimed missions counter for badge
  const [unclaimedMissions, setUnclaimedMissions] = useState(0);

  const refreshUserData = useCallback(() => {
    setWalletOrbs(StorageManager.getOrbs());
    setWalletGems(StorageManager.getGems());
    setSelectedCharId(StorageManager.getSelectedCharacterId());

    const missions = StorageManager.getMissions();
    const ready = missions.filter(m => !m.claimed && m.current >= m.target).length;
    setUnclaimedMissions(ready);
  }, []);

  useEffect(() => {
    refreshUserData();
  }, [refreshUserData]);

  // Touch Swipe Gesture Handling
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const minSwipeDist = 32;

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    soundEngine.unlockAudio();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    touchStartPos.current = { x: clientX, y: clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (!touchStartPos.current || !engineRef.current || gameState !== 'playing') {
      touchStartPos.current = null;
      return;
    }

    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : e.clientY;

    const dx = clientX - touchStartPos.current.x;
    const dy = clientY - touchStartPos.current.y;
    touchStartPos.current = null;

    if (Math.abs(dx) < minSwipeDist && Math.abs(dy) < minSwipeDist) {
      return; // Tap, not swipe
    }

    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal swipe
      if (dx > 0) {
        engineRef.current.moveRight();
      } else {
        engineRef.current.moveLeft();
      }
    } else {
      // Vertical swipe
      if (dy < 0) {
        engineRef.current.jump();
      } else {
        engineRef.current.slide();
      }
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      soundEngine.unlockAudio();

      if (!engineRef.current) return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        engineRef.current.moveLeft();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        engineRef.current.moveRight();
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
        e.preventDefault();
        engineRef.current.jump();
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        engineRef.current.slide();
      } else if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (gameState === 'playing') {
          handlePause();
        } else if (gameState === 'paused') {
          handleResume();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Initialize Three.js Engine once on mount
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const engine = new NeonDashEngine(canvasMountRef.current, {
      onStatsUpdate: newStats => {
        setStats(newStats);
      },
      onPowerUpsUpdate: activeList => {
        setPowerups([...activeList]);
      },
      onGameOver: finalStats => {
        setGameState('gameover');
        setLastRunStats(finalStats);

        // Add run currency to wallet
        StorageManager.addOrbs(finalStats.orbs);
        if (finalStats.gems > 0) {
          StorageManager.addGems(finalStats.gems);
        }

        // Save High Score
        const today = new Date().toISOString().split('T')[0];
        const res = StorageManager.saveHighScore({
          score: finalStats.score,
          distance: finalStats.distance,
          orbs: finalStats.orbs,
          characterName: currentChar.name,
          date: today
        });

        setIsNewRecord(res.isNewBest);
        setNewRank(res.rank);
        refreshUserData();
      },
      onMissionProgress: data => {
        StorageManager.updateMissions(data);
        refreshUserData();
      }
    });

    engineRef.current = engine;

    const handleResize = () => {
      engine.handleResize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Controls Callbacks
  const handleStartRun = () => {
    soundEngine.unlockAudio();
    if (engineRef.current) {
      setReviveCount(0);
      setGameState('playing');
      engineRef.current.startGame();
    }
  };

  const handlePause = () => {
    if (engineRef.current && gameState === 'playing') {
      engineRef.current.pauseGame();
      setGameState('paused');
    }
  };

  const handleResume = () => {
    if (engineRef.current && gameState === 'paused') {
      engineRef.current.resumeGame();
      setGameState('playing');
    }
  };

  const handleRevive = () => {
    if (engineRef.current && gameState === 'gameover') {
      const cost = reviveCount === 0 ? 0 : 35;
      if (walletOrbs >= cost) {
        if (cost > 0) {
          StorageManager.addOrbs(-cost);
          setWalletOrbs(StorageManager.getOrbs());
        }
        setReviveCount(prev => prev + 1);
        setGameState('playing');
        engineRef.current.revive();
      }
    }
  };

  const handleRetry = () => {
    handleStartRun();
  };

  const handleReturnHome = () => {
    if (engineRef.current) {
      engineRef.current.gameState = 'menu';
      soundEngine.stopMusic();
      setGameState('menu');
      refreshUserData();
    }
  };

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    soundEngine.setMusicEnabled(!nextMute);
    soundEngine.setSfxEnabled(!nextMute);
    const updated = {
      ...settings,
      musicEnabled: !nextMute,
      sfxEnabled: !nextMute
    };
    setSettings(updated);
    StorageManager.saveSettings(updated);
  };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-slate-950 game-touch-surface"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
    >
      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={canvasMountRef}
        className="absolute inset-0 w-full h-full pointer-events-auto"
      />

      {/* Main Menu Screen */}
      {gameState === 'menu' && (
        <MainMenu
          orbs={walletOrbs}
          gems={walletGems}
          selectedChar={currentChar}
          unclaimedMissionsCount={unclaimedMissions}
          onPlay={handleStartRun}
          onOpenShop={() => setActiveModal('shop')}
          onOpenMissions={() => setActiveModal('missions')}
          onOpenLeaderboard={() => setActiveModal('leaderboard')}
          onOpenSettings={() => setActiveModal('settings')}
          onOpenCredits={() => setActiveModal('credits')}
        />
      )}

      {/* Active In-Game HUD */}
      {gameState === 'playing' && (
        <HUD
          stats={stats}
          powerups={powerups}
          onPause={handlePause}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          showOnScreenControls={settings.showOnScreenControls}
          onMoveLeft={() => engineRef.current?.moveLeft()}
          onMoveRight={() => engineRef.current?.moveRight()}
          onJump={() => engineRef.current?.jump()}
          onSlide={() => engineRef.current?.slide()}
        />
      )}

      {/* Pause Screen Modal */}
      {gameState === 'paused' && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleStartRun}
          onHome={handleReturnHome}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Game Over Modal */}
      {gameState === 'gameover' && lastRunStats && (
        <GameOverModal
          stats={lastRunStats}
          isNewBest={isNewRecord}
          rank={newRank}
          totalOrbs={walletOrbs}
          reviveCount={reviveCount}
          onRevive={handleRevive}
          onRetry={handleRetry}
          onHome={handleReturnHome}
        />
      )}

      {/* Modal Dialogs */}
      {activeModal === 'shop' && (
        <ShopModal
          orbs={walletOrbs}
          gems={walletGems}
          onClose={() => {
            setActiveModal('none');
            refreshUserData();
            engineRef.current?.loadUserData();
            engineRef.current?.setupPlayer();
          }}
          onDataChanged={() => {
            refreshUserData();
            engineRef.current?.loadUserData();
            engineRef.current?.setupPlayer();
          }}
        />
      )}

      {activeModal === 'missions' && (
        <MissionsModal
          onClose={() => {
            setActiveModal('none');
            refreshUserData();
          }}
          onRewardClaimed={refreshUserData}
        />
      )}

      {activeModal === 'leaderboard' && (
        <LeaderboardModal onClose={() => setActiveModal('none')} />
      )}

      {activeModal === 'settings' && (
        <SettingsModal
          onClose={() => setActiveModal('none')}
          onSettingsChanged={newSettings => {
            setSettings(newSettings);
            setIsMuted(!newSettings.musicEnabled);
          }}
        />
      )}

      {activeModal === 'credits' && (
        <CreditsModal onClose={() => setActiveModal('none')} />
      )}
    </div>
  );
}

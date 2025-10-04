import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { FightingGameScene, type FighterConfig } from '@/lib/phaser-fighting-game';

interface PhaserGameProps {
  playerConfig: FighterConfig;
  opponentConfig: FighterConfig;
  arenaKey: string;
  onGameEnd: (playerWon: boolean) => void;
  playerSuperMove?: string;
  opponentSuperMove?: string;
}

export const PhaserGame = ({ playerConfig, opponentConfig, arenaKey, onGameEnd, playerSuperMove, opponentSuperMove }: PhaserGameProps) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 1000,
      height: 600,
      parent: containerRef.current,
      backgroundColor: '#1a1a2e',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 800 },
          debug: false
        }
      },
      scene: FightingGameScene
    };

    gameRef.current = new Phaser.Game(config);

    // Wait for scene to be ready then pass data
    gameRef.current.events.once('ready', () => {
      const scene = gameRef.current?.scene.getScene('FightingGameScene') as FightingGameScene;
      if (scene) {
        scene.scene.restart({
          playerConfig,
          opponentConfig,
          arenaKey,
          playerSuperMove,
          opponentSuperMove
        });
        (scene as any).onGameEnd = onGameEnd;
      }
    });

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [playerConfig, opponentConfig, arenaKey, onGameEnd]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div 
        ref={containerRef} 
        className="border-4 border-primary rounded-lg overflow-hidden shadow-2xl"
        style={{ width: '1000px', height: '600px' }}
      />
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          <strong>Controls:</strong> Arrow Keys = Move • ↑ = Jump • J = Light Attack • K = Heavy Attack • L = Block
        </p>
        <p className="text-xs text-muted-foreground">
          Special Moves: ↓→J (Hadouken) • →↓J (Shoryuken)
        </p>
      </div>
    </div>
  );
};

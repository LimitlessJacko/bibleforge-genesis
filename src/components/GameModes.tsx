import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Swords, Crown, BookOpen } from "lucide-react";
import chessMode from "@/assets/chess-mode.jpg";
import { toast } from "sonner";

const gameModes = [
  {
    id: "arcade",
    icon: Swords,
    title: "Arcade Fighting",
    description: "1v1 or 2v2 arena battles with real-time combat",
    features: [
      "Active abilities & ultimates",
      "Combo system based on scripture themes",
      "180-second intense matches",
      "Skill-based matchmaking"
    ],
    color: "from-destructive to-primary",
    details: {
      matchLength: "180 seconds",
      winConditions: ["KO", "Spirit Surrender Threshold"],
      gameplay: "Fast-paced arena combat where characters use active abilities, cooldowns, and spiritual ultimates inspired by Biblical themes. Chain combos and master your warrior's unique moveset."
    }
  },
  {
    id: "chess",
    icon: Crown,
    title: "Biblical Chess",
    description: "Strategic 8x8 chess variant with character classes",
    features: [
      "Each piece is a unique character",
      "Special abilities per piece type",
      "Capture battles use combat stats",
      "King = Moses/Christ tier characters"
    ],
    color: "from-primary to-accent",
    image: chessMode,
    details: {
      boardSize: "8x8",
      pieceMapping: {
        King: "Moses/Christ (Legendary)",
        Queen: "Deborah/Esther (Epic)",
        Rook: "Angel Guardian (Rare)",
        Knight: "Prophet Warrior (Rare)",
        Bishop: "Priest/Levite (Uncommon)",
        Pawn: "Disciple/Follower (Common)"
      },
      gameplay: "Each chess piece represents a character class with unique movement rules and one-time special abilities. When pieces capture, they engage in combat using their stats."
    }
  },
  {
    id: "trivia",
    icon: BookOpen,
    title: "Scripture Trivia",
    description: "Test your Biblical knowledge in timed rounds",
    features: [
      "Easy to Expert difficulty tiers",
      "Earn tokens & XP for correct answers",
      "Speed & streak bonuses",
      "Chance to win Limitless Boots"
    ],
    color: "from-secondary to-accent",
    details: {
      difficultyTiers: ["Easy", "Medium", "Hard", "Expert"],
      scoring: {
        correctBase: 10,
        speedBonus: "timeRemaining × 0.5",
        streakBonus: "+5 per consecutive correct"
      },
      gameplay: "Answer scripture-based questions under time pressure. Build streaks for bonus points and earn chances at rare Limitless Boots drops."
    }
  }
];

const GameModes = () => {
  const [selectedMode, setSelectedMode] = useState<typeof gameModes[0] | null>(null);

  const handlePlayNow = (modeTitle: string) => {
    toast.success(`Launching ${modeTitle}...`, {
      description: "Get ready to enter the battlefield!"
    });
  };

  return (
    <>
      <section id="game-modes" className="py-24 px-4 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent">
              Game Modes
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three unique ways to experience Biblical warfare and test your skills
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {gameModes.map((mode) => {
              const Icon = mode.icon;
              return (
                <Card 
                  key={mode.id} 
                  className="bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/50 transition-all duration-300 overflow-hidden group"
                >
                  {mode.image && (
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={mode.image} 
                        alt={mode.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent"></div>
                    </div>
                  )}
                  
                  <CardHeader>
                    <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${mode.color} mb-4 w-fit glow-subtle`}>
                      <Icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-2xl text-secondary">{mode.title}</CardTitle>
                    <CardDescription className="text-base">{mode.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {mode.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-primary mt-0.5">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setSelectedMode(mode)}
                      >
                        Learn More
                      </Button>
                      <Button 
                        variant="default" 
                        className="flex-1"
                        onClick={() => handlePlayNow(mode.title)}
                      >
                        Play Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <Dialog open={!!selectedMode} onOpenChange={(open) => !open && setSelectedMode(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedMode && (
            <>
              <DialogHeader>
                <DialogTitle className="text-3xl text-secondary flex items-center gap-3">
                  {(() => {
                    const Icon = selectedMode.icon;
                    return <Icon className="w-8 h-8" />;
                  })()}
                  {selectedMode.title}
                </DialogTitle>
                <DialogDescription className="text-base">
                  {selectedMode.description}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 mt-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Gameplay</h4>
                  <p className="text-muted-foreground">{selectedMode.details.gameplay}</p>
                </div>

                {selectedMode.id === "chess" && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Piece Mapping</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(selectedMode.details.pieceMapping).map(([piece, character]) => (
                        <div key={piece} className="p-3 bg-background/50 rounded-lg border border-border/50">
                          <div className="font-medium text-primary">{piece}</div>
                          <div className="text-sm text-muted-foreground">{character}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedMode.id === "trivia" && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Scoring System</h4>
                    <ul className="space-y-2">
                      <li className="flex justify-between p-2 bg-background/30 rounded">
                        <span className="text-muted-foreground">Base Score</span>
                        <span className="font-semibold text-foreground">{selectedMode.details.scoring.correctBase} points</span>
                      </li>
                      <li className="flex justify-between p-2 bg-background/30 rounded">
                        <span className="text-muted-foreground">Speed Bonus</span>
                        <span className="font-semibold text-foreground">{selectedMode.details.scoring.speedBonus}</span>
                      </li>
                      <li className="flex justify-between p-2 bg-background/30 rounded">
                        <span className="text-muted-foreground">Streak Bonus</span>
                        <span className="font-semibold text-foreground">{selectedMode.details.scoring.streakBonus}</span>
                      </li>
                    </ul>
                  </div>
                )}

                {selectedMode.id === "arcade" && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Match Details</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-background/50 rounded-lg border border-border/50">
                        <div className="text-sm text-muted-foreground mb-1">Match Length</div>
                        <div className="font-semibold text-foreground">{selectedMode.details.matchLength}</div>
                      </div>
                      <div className="p-3 bg-background/50 rounded-lg border border-border/50">
                        <div className="text-sm text-muted-foreground mb-1">Win Conditions</div>
                        <div className="font-semibold text-foreground">{selectedMode.details.winConditions.join(", ")}</div>
                      </div>
                    </div>
                  </div>
                )}

                <Button 
                  variant="hero" 
                  className="w-full"
                  onClick={() => {
                    handlePlayNow(selectedMode.title);
                    setSelectedMode(null);
                  }}
                >
                  Launch {selectedMode.title}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GameModes;

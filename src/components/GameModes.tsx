import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Swords, Crown, BookOpen } from "lucide-react";
import chessMode from "@/assets/chess-mode.jpg";

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
    color: "from-destructive to-primary"
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
    image: chessMode
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
    color: "from-secondary to-accent"
  }
];

const GameModes = () => {
  return (
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
                  <Button variant="outline" className="w-full">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default GameModes;

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Sword, Zap, Heart, Target, Brain } from "lucide-react";

const characters = [
  {
    id: "char_0001",
    name: "Michael",
    alignment: "Good",
    role: "Guardian/Striker",
    rarity: "Legendary",
    description: "The Archangel Michael leads heavenly forces with divine power and strategic mastery.",
    scripture: ["Daniel 10:13", "Revelation 12:7-9"],
    stats: {
      health: 800,
      attack: 220,
      defense: 150,
      spirit: 400,
      agility: 120,
      wisdom: 180
    },
    abilities: [
      { name: "Spear of Dawn", type: "Active", description: "High single-target damage with Spirit drain" },
      { name: "Host Command", type: "Passive", description: "Nearby allied Spirit regen +3/sec" }
    ]
  },
  {
    id: "char_0002",
    name: "David",
    alignment: "Good",
    role: "Ranged/Strategist",
    rarity: "Epic",
    description: "The shepherd king who defeated Goliath, combining faith with precision.",
    scripture: ["1 Samuel 17", "Psalm 23"],
    stats: {
      health: 600,
      attack: 190,
      defense: 100,
      spirit: 350,
      agility: 200,
      wisdom: 240
    },
    abilities: [
      { name: "Stone of Faith", type: "Active", description: "Long-range critical strike" },
      { name: "Psalms of Courage", type: "Passive", description: "Increases team morale and Spirit" }
    ]
  },
  {
    id: "char_0003",
    name: "Deborah",
    alignment: "Good",
    role: "Leader/Tactician",
    rarity: "Epic",
    description: "Prophet and judge who led Israel to victory with divine wisdom.",
    scripture: ["Judges 4-5"],
    stats: {
      health: 550,
      attack: 140,
      defense: 120,
      spirit: 450,
      agility: 110,
      wisdom: 380
    },
    abilities: [
      { name: "Prophetic Vision", type: "Active", description: "Reveals enemy positions and weaknesses" },
      { name: "Divine Authority", type: "Passive", description: "Boosts allied attack speed" }
    ]
  }
];

const statIcons: Record<string, any> = {
  health: Heart,
  attack: Sword,
  defense: Shield,
  spirit: Zap,
  agility: Target,
  wisdom: Brain
};

const Characters = () => {
  return (
    <section id="characters" className="py-24 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent">
            Divine Warriors
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose from legendary Biblical characters, each with unique abilities inspired by scripture
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {characters.map((character) => (
            <Card key={character.id} className="bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/50 transition-all duration-300 glow-subtle">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant={character.rarity === "Legendary" ? "default" : "secondary"} className="glow-divine">
                    {character.rarity}
                  </Badge>
                  <Badge variant="outline">{character.role}</Badge>
                </div>
                <CardTitle className="text-2xl text-secondary">{character.name}</CardTitle>
                <CardDescription className="text-base">{character.description}</CardDescription>
                <div className="text-xs text-muted-foreground/60 mt-2">
                  📖 {character.scripture.join(", ")}
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {Object.entries(character.stats).map(([stat, value]) => {
                    const Icon = statIcons[stat];
                    return (
                      <div key={stat} className="flex flex-col items-center p-2 bg-background/50 rounded-lg">
                        <Icon className="w-4 h-4 mb-1 text-primary" />
                        <span className="text-xs text-muted-foreground capitalize">{stat}</span>
                        <span className="text-sm font-bold text-foreground">{value}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Abilities */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground">Abilities</h4>
                  {character.abilities.map((ability, idx) => (
                    <div key={idx} className="p-2 bg-background/30 rounded border border-border/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-primary">{ability.name}</span>
                        <Badge variant="outline" className="text-xs">{ability.type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{ability.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Characters;

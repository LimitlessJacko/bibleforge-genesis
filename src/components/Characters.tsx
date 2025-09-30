import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield, Sword, Zap, Heart, Target, Brain, BookOpen } from "lucide-react";
import { toast } from "sonner";

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
      { name: "Spear of Dawn", type: "Active", description: "High single-target damage with Spirit drain", cooldown: "12s" },
      { name: "Host Command", type: "Passive", description: "Nearby allied Spirit regen +3/sec", cooldown: "N/A" }
    ],
    lore: "Michael the Archangel stands as heaven's champion warrior, commanding legions of angels in the eternal battle against darkness. His presence on the battlefield inspires allies and strikes fear into enemies."
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
      { name: "Stone of Faith", type: "Active", description: "Long-range critical strike", cooldown: "10s" },
      { name: "Psalms of Courage", type: "Passive", description: "Increases team morale and Spirit", cooldown: "N/A" }
    ],
    lore: "From humble shepherd to mighty king, David's faith and skill with the sling made him a legend. His psalms still echo through the ages, bringing courage to all who fight for righteousness."
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
      { name: "Prophetic Vision", type: "Active", description: "Reveals enemy positions and weaknesses", cooldown: "15s" },
      { name: "Divine Authority", type: "Passive", description: "Boosts allied attack speed", cooldown: "N/A" }
    ],
    lore: "Deborah served as both prophet and judge, leading Israel with wisdom and courage. Her strategic brilliance and unwavering faith led to decisive victories against overwhelming odds."
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
  const [selectedCharacter, setSelectedCharacter] = useState<typeof characters[0] | null>(null);

  const handleMintNFT = (characterName: string) => {
    toast.success(`Minting ${characterName} NFT...`, {
      description: "Your legendary warrior will be ready soon!"
    });
  };

  return (
    <>
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
              <Card 
                key={character.id} 
                className="bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/50 transition-all duration-300 glow-subtle cursor-pointer"
                onClick={() => setSelectedCharacter(character)}
              >
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
                  <div className="space-y-2 mb-4">
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

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCharacter(character);
                    }}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Dialog open={!!selectedCharacter} onOpenChange={(open) => !open && setSelectedCharacter(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedCharacter && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between mb-4">
                  <DialogTitle className="text-4xl text-secondary">{selectedCharacter.name}</DialogTitle>
                  <div className="flex gap-2">
                    <Badge variant={selectedCharacter.rarity === "Legendary" ? "default" : "secondary"} className="glow-divine text-base px-3 py-1">
                      {selectedCharacter.rarity}
                    </Badge>
                    <Badge variant="outline" className="text-base px-3 py-1">{selectedCharacter.role}</Badge>
                  </div>
                </div>
                <DialogDescription className="text-lg">
                  {selectedCharacter.description}
                </DialogDescription>
                <div className="text-sm text-muted-foreground mt-2">
                  📖 Scripture References: {selectedCharacter.scripture.join(", ")}
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Lore */}
                <div className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg border border-primary/20">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-secondary" />
                    Lore
                  </h4>
                  <p className="text-muted-foreground">{selectedCharacter.lore}</p>
                </div>

                {/* Stats */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Character Stats</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(selectedCharacter.stats).map(([stat, value]) => {
                      const Icon = statIcons[stat];
                      return (
                        <div key={stat} className="p-4 bg-background/50 rounded-lg border border-border/50">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className="w-5 h-5 text-primary" />
                            <span className="text-sm text-muted-foreground capitalize">{stat}</span>
                          </div>
                          <div className="text-2xl font-bold text-foreground">{value}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Abilities */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Abilities</h4>
                  <div className="space-y-3">
                    {selectedCharacter.abilities.map((ability, idx) => (
                      <div key={idx} className="p-4 bg-background/50 rounded-lg border border-border/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-medium text-primary">{ability.name}</span>
                          <div className="flex gap-2">
                            <Badge variant="outline">{ability.type}</Badge>
                            <Badge variant="secondary">{ability.cooldown}</Badge>
                          </div>
                        </div>
                        <p className="text-muted-foreground">{ability.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="hero" 
                    className="flex-1"
                    onClick={() => {
                      handleMintNFT(selectedCharacter.name);
                      setSelectedCharacter(null);
                    }}
                  >
                    Mint as NFT
                  </Button>
                  <Button 
                    variant="divine" 
                    className="flex-1"
                    onClick={() => {
                      toast.success(`${selectedCharacter.name} selected!`, {
                        description: "Ready for battle!"
                      });
                      setSelectedCharacter(null);
                    }}
                  >
                    Select Character
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Characters;

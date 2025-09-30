import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Shield, Sparkles } from "lucide-react";
import bootsImage from "@/assets/limitless-boots.jpg";

const bootsTiers = [
  {
    tier: "I",
    name: "Boots of Steadfastness",
    rarity: "Uncommon",
    effects: [
      { type: "Passive", stat: "Defense", modifier: "+5% per level" }
    ],
    price: "1,000 SPW"
  },
  {
    tier: "II",
    name: "Boots of Swiftness",
    rarity: "Rare",
    effects: [
      { type: "Active", ability: "Dash", cooldown: "6s" }
    ],
    price: "5,000 SPW"
  },
  {
    tier: "III",
    name: "Limitless Boots",
    rarity: "Legendary",
    effects: [
      { type: "Ultimate", ability: "Heavenly Stride", description: "2x Spirit + Invulnerability 3s", cooldown: "300s" }
    ],
    price: "25,000 SPW"
  }
];

const LimitlessBoots = () => {
  return (
    <section id="boots" className="py-24 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent">
              Limitless Boots
            </h2>
            <p className="text-xl text-muted-foreground mb-6">
              Equippable boosters that grant powerful passive and active modifiers to your warriors
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <Sparkles className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Tiered Progression</h4>
                  <p className="text-sm text-muted-foreground">Upgrade from Steadfastness to Swiftness to ultimate Limitless tier</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Powerful Effects</h4>
                  <p className="text-sm text-muted-foreground">Each boot grants unique passive bonuses and active abilities</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">NFT Collectibles</h4>
                  <p className="text-sm text-muted-foreground">Own, trade, and upgrade your boots on-chain</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl animate-pulse-glow"></div>
            <img 
              src={bootsImage} 
              alt="Limitless Boots"
              className="relative rounded-lg glow-divine animate-float"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {bootsTiers.map((boot) => (
            <Card 
              key={boot.tier} 
              className="bg-card/50 backdrop-blur-sm border-primary/20 hover:border-secondary/50 transition-all duration-300 glow-subtle"
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="default" className="text-lg px-4 py-1">
                    Tier {boot.tier}
                  </Badge>
                  <Badge variant={boot.rarity === "Legendary" ? "default" : "secondary"}>
                    {boot.rarity}
                  </Badge>
                </div>
                <CardTitle className="text-2xl text-secondary">{boot.name}</CardTitle>
                <CardDescription className="text-lg font-semibold text-primary">
                  {boot.price}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3 mb-6">
                  <h4 className="text-sm font-semibold text-foreground">Effects</h4>
                  {boot.effects.map((effect, idx) => (
                    <div key={idx} className="p-3 bg-background/50 rounded-lg border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-primary">
                          {effect.ability || effect.stat}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {effect.type}
                        </Badge>
                      </div>
                      {effect.modifier && (
                        <p className="text-sm text-foreground font-semibold">{effect.modifier}</p>
                      )}
                      {effect.description && (
                        <p className="text-xs text-muted-foreground">{effect.description}</p>
                      )}
                      {effect.cooldown && (
                        <p className="text-xs text-muted-foreground">Cooldown: {effect.cooldown}</p>
                      )}
                    </div>
                  ))}
                </div>
                <Button variant={boot.tier === "III" ? "hero" : "outline"} className="w-full">
                  {boot.tier === "III" ? "Mint Now" : "Purchase"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LimitlessBoots;

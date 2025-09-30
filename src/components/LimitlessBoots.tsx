import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Shield, Sparkles, Flame, Cross } from "lucide-react";
import bootsImage from "@/assets/limitless-boots.jpg";
import holySpiritImg from "@/assets/boosters/holy-spirit.jpg";
import armorOfGodImg from "@/assets/boosters/armor-of-god.jpg";
import { toast } from "sonner";

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

const divineBoosters = [
  {
    id: "holy_spirit",
    name: "The Holy Spirit",
    rarity: "Divine",
    image: holySpiritImg,
    scripture: ["Acts 1:8", "John 14:26", "1 Corinthians 12:4-11"],
    description: "The third person of the Trinity, empowering believers with supernatural gifts and divine presence.",
    effects: [
      { type: "Passive", ability: "Divine Empowerment", description: "All stats +15%, Spirit regeneration +50%" },
      { type: "Active", ability: "Tongues of Fire", description: "Unleash pentecostal fire dealing Spirit damage to all enemies", cooldown: "45s" },
      { type: "Ultimate", ability: "Baptism of Fire", description: "Full team revival + complete status cleanse + invulnerability for 5s", cooldown: "180s" }
    ],
    price: "100,000 SPW",
    unlock: "Complete 50 victories with Good alignment characters"
  },
  {
    id: "armor_of_god",
    name: "Armor of God",
    rarity: "Divine",
    image: armorOfGodImg,
    scripture: ["Ephesians 6:10-18"],
    description: "The full spiritual armor: Helmet of Salvation, Breastplate of Righteousness, Belt of Truth, Shield of Faith, Sword of Spirit, Boots of Gospel.",
    effects: [
      { type: "Passive", ability: "Full Armor", description: "Defense +40%, Wisdom +30%, immunity to confusion and fear" },
      { type: "Active", ability: "Shield of Faith", description: "Block all incoming damage for 4 seconds", cooldown: "60s" },
      { type: "Ultimate", ability: "Sword of the Spirit", description: "Deal massive true damage ignoring all defenses + purify all debuffs", cooldown: "120s" }
    ],
    price: "100,000 SPW",
    unlock: "Defeat 25 Evil alignment characters"
  }
];

const LimitlessBoots = () => {
  const handlePurchase = (itemName: string, price: string) => {
    toast.success(`Purchasing ${itemName}...`, {
      description: `Cost: ${price} tokens`
    });
  };

  const handleMint = (itemName: string) => {
    toast.success(`Minting ${itemName}...`, {
      description: "Your divine equipment will be ready soon!"
    });
  };

  const handleEquip = (itemName: string) => {
    toast.success(`${itemName} Equipped!`, {
      description: "Divine power flows through you!"
    });
  };

  return (
    <section id="boots" className="py-24 px-4 bg-gradient-to-b from-boots-luxury via-background to-background">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-boots-emerald via-boots-glow to-secondary bg-clip-text text-transparent">
              Limitless Boots
            </h2>
            <p className="text-xl text-muted-foreground mb-6">
              Equippable boosters that grant powerful passive and active modifiers to your warriors
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <Sparkles className="w-6 h-6 text-boots-emerald flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Tiered Progression</h4>
                  <p className="text-sm text-muted-foreground">Upgrade from Steadfastness to Swiftness to ultimate Limitless tier</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="w-6 h-6 text-boots-glow flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Powerful Effects</h4>
                  <p className="text-sm text-muted-foreground">Each boot grants unique passive bonuses and active abilities</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-boots-emerald flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">NFT Collectibles</h4>
                  <p className="text-sm text-muted-foreground">Own, trade, and upgrade your boots on-chain</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-boots-emerald/20 to-boots-glow/20 blur-3xl animate-pulse-glow"></div>
            <img 
              src={bootsImage} 
              alt="Limitless Boots"
              className="relative rounded-lg glow-boots animate-float"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {bootsTiers.map((boot) => (
            <Card 
              key={boot.tier} 
              className="bg-gradient-to-br from-boots-luxury to-card/50 backdrop-blur-sm border-boots-emerald/30 hover:border-boots-glow/60 transition-all duration-300 glow-boots"
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <Badge className="text-lg px-4 py-1 bg-boots-emerald text-white">
                    Tier {boot.tier}
                  </Badge>
                  <Badge variant={boot.rarity === "Legendary" ? "default" : "secondary"} className={boot.rarity === "Legendary" ? "bg-boots-glow text-boots-luxury" : ""}>
                    {boot.rarity}
                  </Badge>
                </div>
                <CardTitle className="text-2xl text-boots-glow">{boot.name}</CardTitle>
                <CardDescription className="text-lg font-semibold text-boots-emerald">
                  {boot.price}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3 mb-6">
                  <h4 className="text-sm font-semibold text-foreground">Effects</h4>
                  {boot.effects.map((effect, idx) => (
                    <div key={idx} className="p-3 bg-background/50 rounded-lg border border-boots-emerald/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-boots-emerald">
                          {effect.ability || effect.stat}
                        </span>
                        <Badge variant="outline" className="text-xs border-boots-emerald/50">
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
                <Button 
                  variant={boot.tier === "III" ? "default" : "outline"} 
                  className={boot.tier === "III" ? "w-full bg-gradient-to-r from-boots-emerald to-boots-glow hover:from-boots-glow hover:to-boots-emerald text-boots-luxury font-bold" : "w-full border-boots-emerald/50 text-boots-emerald hover:bg-boots-emerald/10"}
                  onClick={() => boot.tier === "III" ? handleMint(boot.name) : handlePurchase(boot.name, boot.price)}
                >
                  {boot.tier === "III" ? "Mint Now" : "Purchase"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Divine Boosters Section */}
        <div className="mt-24">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold mb-4 bg-gradient-to-r from-accent via-primary to-secondary bg-clip-text text-transparent">
              Divine Equippable Boosters
            </h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Unlock ultimate spiritual power with these sacred Biblical enhancements
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {divineBoosters.map((booster) => (
              <Card 
                key={booster.id}
                className="overflow-hidden bg-card/50 backdrop-blur-sm border-accent/30 hover:border-accent/60 transition-all duration-300 shadow-[0_0_40px_rgba(var(--accent),0.3)] hover:shadow-[0_0_60px_rgba(var(--accent),0.5)]"
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={booster.image} 
                    alt={booster.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/70 to-transparent"></div>
                  <Badge className="absolute top-4 right-4 bg-gradient-to-r from-accent to-primary text-lg px-4 py-2 animate-pulse">
                    {booster.rarity}
                  </Badge>
                </div>

                <CardHeader>
                  <CardTitle className="text-3xl text-secondary flex items-center gap-3">
                    {booster.id === "holy_spirit" ? <Flame className="w-8 h-8 text-accent" /> : <Cross className="w-8 h-8 text-primary" />}
                    {booster.name}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {booster.description}
                  </CardDescription>
                  <div className="text-xs text-muted-foreground/60 mt-2">
                    📖 {booster.scripture.join(", ")}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground">Divine Effects</h4>
                    {booster.effects.map((effect, idx) => (
                      <div key={idx} className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg border border-accent/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-accent">
                            {effect.ability}
                          </span>
                          <Badge variant="outline" className="text-xs bg-background/50">
                            {effect.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">{effect.description}</p>
                        {effect.cooldown && (
                          <p className="text-xs text-primary font-semibold">⏱ {effect.cooldown}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                    <p className="text-xs text-muted-foreground mb-2">🔓 Unlock Requirement:</p>
                    <p className="text-sm font-semibold text-foreground">{booster.unlock}</p>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      variant="outline"
                      className="flex-1"
                      onClick={() => handlePurchase(booster.name, booster.price)}
                    >
                      Purchase ({booster.price})
                    </Button>
                    <Button 
                      variant="hero"
                      className="flex-1"
                      onClick={() => handleEquip(booster.name)}
                    >
                      Equip
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LimitlessBoots;

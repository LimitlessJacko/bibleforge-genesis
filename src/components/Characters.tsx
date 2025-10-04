import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield, Sword, Zap, Heart, Target, Brain, BookOpen } from "lucide-react";
import { toast } from "sonner";
import michaelImg from "@/assets/characters/michael.png";
import davidImg from "@/assets/characters/david.png";
import deborahImg from "@/assets/characters/deborah.png";
import solomonImg from "@/assets/characters/solomon.png";
import jesusImg from "@/assets/characters/jesus.png";
import nehemiahImg from "@/assets/characters/nehemiah.png";
import satanImg from "@/assets/characters/satan.png";
import goliathImg from "@/assets/characters/goliath.png";
import jezebelImg from "@/assets/characters/jezebel.png";
import pharaohImg from "@/assets/characters/pharaoh.png";
import judasImg from "@/assets/characters/judas.png";
import herodImg from "@/assets/characters/herod.png";
import ancientOfDaysImg from "@/assets/characters/ancient-of-days.png";
import elijahImg from "@/assets/characters/elijah.png";
import beastImg from "@/assets/characters/beast.png";

const characters = [
  {
    id: "char_0001",
    name: "Michael",
    alignment: "Good",
    role: "Guardian/Striker",
    rarity: "Legendary",
    description: "The Archangel Michael leads heavenly forces with divine power and strategic mastery.",
    scripture: ["Daniel 10:13", "Revelation 12:7-9"],
    image: michaelImg,
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
    image: davidImg,
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
    image: deborahImg,
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
  },
  {
    id: "char_0004",
    name: "Solomon",
    alignment: "Good",
    role: "Sage/Support",
    rarity: "Legendary",
    description: "The wisest king who ever lived, builder of the Temple, blessed with divine insight.",
    scripture: ["1 Kings 3:12", "1 Kings 4:29-34", "Proverbs 1:1"],
    image: solomonImg,
    stats: {
      health: 650,
      attack: 130,
      defense: 140,
      spirit: 380,
      agility: 90,
      wisdom: 500
    },
    abilities: [
      { name: "Judgment of Solomon", type: "Active", description: "Reveals truth and weakens enemy resolve", cooldown: "18s" },
      { name: "Wisdom's Blessing", type: "Passive", description: "Grants allies increased XP gain and resource efficiency", cooldown: "N/A" }
    ],
    lore: "King Solomon was granted divine wisdom beyond all others. His judgments were legendary, his wealth unmatched, and his temple stood as a monument to faith. In battle, his wisdom turns the tide through strategy rather than brute force."
  },
  {
    id: "char_0005",
    name: "Jesus",
    alignment: "Good",
    role: "Divine Savior/Healer",
    rarity: "Divine",
    description: "The Son of God, Messiah and Redeemer, wielding ultimate divine authority.",
    scripture: ["John 1:1-14", "Matthew 28:18", "Revelation 19:16"],
    image: jesusImg,
    stats: {
      health: 1000,
      attack: 250,
      defense: 200,
      spirit: 600,
      agility: 150,
      wisdom: 500
    },
    abilities: [
      { name: "Resurrection Power", type: "Ultimate", description: "Revives fallen allies with full health and grants invulnerability", cooldown: "180s" },
      { name: "Divine Presence", type: "Passive", description: "Continuously heals all allies and purifies negative effects", cooldown: "N/A" }
    ],
    lore: "Jesus Christ stands as the ultimate expression of divine love and power. As both fully God and fully human, He brings salvation, healing, and redemption. His sacrifice and resurrection conquered death itself, and His presence on the battlefield ensures victory over all darkness."
  },
  {
    id: "char_0006",
    name: "Nehemiah",
    alignment: "Good",
    role: "Builder/Defender",
    rarity: "Epic",
    description: "Cupbearer turned governor who rebuilt Jerusalem's walls against all opposition.",
    scripture: ["Nehemiah 2:17-18", "Nehemiah 4:14", "Nehemiah 6:15-16"],
    image: nehemiahImg,
    stats: {
      health: 720,
      attack: 160,
      defense: 240,
      spirit: 320,
      agility: 100,
      wisdom: 280
    },
    abilities: [
      { name: "Fortify Walls", type: "Active", description: "Creates protective barrier that absorbs damage for all allies", cooldown: "20s" },
      { name: "Rally the Builders", type: "Passive", description: "Increases team defense and restores structures/shields over time", cooldown: "N/A" }
    ],
    lore: "Nehemiah left comfort and security to rebuild Jerusalem's broken walls in just 52 days. Despite threats, mockery, and opposition, his unwavering determination and organizational brilliance unified the people. His defensive mastery makes him an invaluable protector on any battlefield."
  },
  {
    id: "char_0007",
    name: "Satan",
    alignment: "Evil",
    role: "Deceiver/Destroyer",
    rarity: "Divine",
    description: "The adversary, the fallen angel who wages war against God and mankind.",
    scripture: ["Isaiah 14:12-15", "Ezekiel 28:12-17", "Revelation 12:9"],
    image: satanImg,
    stats: {
      health: 950,
      attack: 240,
      defense: 180,
      spirit: 580,
      agility: 170,
      wisdom: 450
    },
    abilities: [
      { name: "Temptation", type: "Active", description: "Corrupts enemy abilities and drains spirit continuously", cooldown: "16s" },
      { name: "Father of Lies", type: "Passive", description: "All attacks have a chance to confuse and misdirect opponents", cooldown: "N/A" }
    ],
    lore: "Once Lucifer, the morning star, Satan fell from heaven through pride. As the adversary and accuser, he seeks to devour and destroy. His cunning and malice know no bounds, making him the ultimate enemy in spiritual warfare."
  },
  {
    id: "char_0008",
    name: "Goliath",
    alignment: "Evil",
    role: "Giant Warrior",
    rarity: "Epic",
    description: "The Philistine champion, a giant warrior of immense strength and intimidation.",
    scripture: ["1 Samuel 17:4-7", "1 Samuel 17:23-24"],
    image: goliathImg,
    stats: {
      health: 900,
      attack: 280,
      defense: 220,
      spirit: 200,
      agility: 70,
      wisdom: 110
    },
    abilities: [
      { name: "Giant's Wrath", type: "Active", description: "Devastating ground slam that stuns nearby enemies", cooldown: "14s" },
      { name: "Intimidating Presence", type: "Passive", description: "Reduces enemy attack power when nearby", cooldown: "N/A" }
    ],
    lore: "Standing over nine feet tall and clad in bronze armor, Goliath terrorized Israel for forty days. His massive size and brutal strength made him seemingly invincible, until he met his match in a shepherd boy with faith."
  },
  {
    id: "char_0009",
    name: "Jezebel",
    alignment: "Evil",
    role: "Queen Sorceress",
    rarity: "Legendary",
    description: "The wicked queen who promoted Baal worship and persecuted God's prophets.",
    scripture: ["1 Kings 16:31", "1 Kings 19:1-2", "2 Kings 9:30-37"],
    image: jezebelImg,
    stats: {
      health: 680,
      attack: 170,
      defense: 140,
      spirit: 420,
      agility: 130,
      wisdom: 380
    },
    abilities: [
      { name: "Witchcraft", type: "Active", description: "Curses target with damage over time and reduced healing", cooldown: "15s" },
      { name: "Royal Manipulation", type: "Passive", description: "Steals a portion of damage dealt to allies", cooldown: "N/A" }
    ],
    lore: "As queen of Israel, Jezebel led the nation into Baal worship and orchestrated the murder of God's prophets. Her name has become synonymous with spiritual seduction and false teaching. Her wickedness was legendary, and her end was prophesied and gruesome."
  },
  {
    id: "char_0010",
    name: "Pharaoh",
    alignment: "Evil",
    role: "Tyrant King",
    rarity: "Legendary",
    description: "The Egyptian king who enslaved Israel and hardened his heart against God.",
    scripture: ["Exodus 5:2", "Exodus 7-14"],
    image: pharaohImg,
    stats: {
      health: 820,
      attack: 200,
      defense: 190,
      spirit: 300,
      agility: 100,
      wisdom: 250
    },
    abilities: [
      { name: "Plague Caller", type: "Active", description: "Summons a plague that damages and weakens all enemies", cooldown: "20s" },
      { name: "Hardened Heart", type: "Passive", description: "Becomes more resistant to damage as health decreases", cooldown: "N/A" }
    ],
    lore: "The Pharaoh who knew not Joseph enslaved the Hebrew people for generations. Despite witnessing ten devastating plagues, he hardened his heart against God repeatedly. His pride and stubbornness led to his army's destruction in the Red Sea."
  },
  {
    id: "char_0011",
    name: "Judas Iscariot",
    alignment: "Evil",
    role: "Betrayer/Assassin",
    rarity: "Rare",
    description: "The disciple who betrayed Jesus for thirty pieces of silver.",
    scripture: ["Matthew 26:14-16", "Matthew 26:47-50", "Matthew 27:3-5"],
    image: judasImg,
    stats: {
      health: 650,
      attack: 210,
      defense: 110,
      spirit: 250,
      agility: 160,
      wisdom: 200
    },
    abilities: [
      { name: "Kiss of Betrayal", type: "Active", description: "Backstab attack dealing massive damage from behind", cooldown: "12s" },
      { name: "Greed", type: "Passive", description: "Gains bonus attack power for each enemy defeated", cooldown: "N/A" }
    ],
    lore: "One of the twelve disciples, Judas walked with Jesus for three years yet betrayed Him for silver. His kiss in the Garden of Gethsemane marked the Savior for arrest. Consumed by guilt, he met a tragic end, his name forever synonymous with treachery."
  },
  {
    id: "char_0012",
    name: "Herod",
    alignment: "Evil",
    role: "Cruel Monarch",
    rarity: "Epic",
    description: "The paranoid king who ordered the massacre of innocent children.",
    scripture: ["Matthew 2:16-18", "Luke 23:8-11"],
    image: herodImg,
    stats: {
      health: 750,
      attack: 180,
      defense: 160,
      spirit: 280,
      agility: 90,
      wisdom: 220
    },
    abilities: [
      { name: "Massacre", type: "Active", description: "Area attack that hits all nearby enemies with cruel efficiency", cooldown: "18s" },
      { name: "Paranoid Fury", type: "Passive", description: "Attack speed increases when health is below 50%", cooldown: "N/A" }
    ],
    lore: "King Herod the Great ruled with an iron fist, paranoid of losing power. When he heard of a newborn king, he ordered all male children under two in Bethlehem killed. His cruelty and fear drove him to unspeakable acts, yet he could not thwart God's plan."
  },
  {
    id: "char_0013",
    name: "The Ancient of Days",
    alignment: "Good",
    role: "Supreme Deity",
    rarity: "Mythic",
    description: "The eternal God, the Alpha and Omega, Creator of all existence.",
    scripture: ["Daniel 7:9-14", "Revelation 1:8", "Isaiah 46:9-10"],
    image: ancientOfDaysImg,
    unlockable: true,
    stats: {
      health: 9999,
      attack: 999,
      defense: 999,
      spirit: 9999,
      agility: 500,
      wisdom: 9999
    },
    abilities: [
      { name: "Let There Be Light", type: "Ultimate", description: "Instantly defeats all evil enemies and fully restores all allies", cooldown: "Once per match" },
      { name: "Omnipotence", type: "Passive", description: "Cannot be defeated. All stats increase continuously. Immune to all debuffs", cooldown: "N/A" }
    ],
    lore: "The Ancient of Days sits enthroned above all creation, eternal and unchanging. His power is absolute, His wisdom infinite, His presence overwhelming. Before Him every knee will bow, and every tongue confess His sovereignty over all existence."
  },
  {
    id: "char_0014",
    name: "Elijah",
    alignment: "Good",
    role: "Prophet of Fire",
    rarity: "Mythic",
    description: "The fiery prophet who called down fire from heaven and never tasted death.",
    scripture: ["1 Kings 18:36-39", "2 Kings 2:11", "Malachi 4:5"],
    image: elijahImg,
    unlockable: true,
    stats: {
      health: 850,
      attack: 320,
      defense: 200,
      spirit: 750,
      agility: 180,
      wisdom: 450
    },
    abilities: [
      { name: "Fire From Heaven", type: "Active", description: "Calls down devastating fire that deals massive area damage and burns continuously", cooldown: "25s" },
      { name: "Chariot of Fire", type: "Ultimate", description: "Summons the whirlwind and fiery chariot, becoming invulnerable and dealing extreme damage", cooldown: "120s" },
      { name: "Prophet's Mantle", type: "Passive", description: "Cannot be killed by normal means. Revives once with full health", cooldown: "Once per match" }
    ],
    lore: "Elijah the Tishbite stood alone against 450 prophets of Baal and called down fire from heaven. He never died but was taken up in a whirlwind by chariots of fire. His return is prophesied before the great and terrible day of the Lord."
  },
  {
    id: "char_0015",
    name: "The Beast",
    alignment: "Evil",
    role: "Apocalyptic Destroyer",
    rarity: "Mythic",
    description: "The Antichrist, the seven-headed beast from the sea who makes war against the saints.",
    scripture: ["Revelation 13:1-8", "Revelation 17:8-14", "2 Thessalonians 2:3-4"],
    image: beastImg,
    unlockable: true,
    stats: {
      health: 1200,
      attack: 350,
      defense: 280,
      spirit: 666,
      agility: 150,
      wisdom: 400
    },
    abilities: [
      { name: "Mark of the Beast", type: "Active", description: "Curses all enemies with 666 damage over time and prevents healing", cooldown: "30s" },
      { name: "Seven Heads", type: "Ultimate", description: "Splits into seven deadly forms that attack simultaneously", cooldown: "150s" },
      { name: "Dragon's Authority", type: "Passive", description: "Gains power from defeated enemies. Takes reduced damage from non-divine attacks", cooldown: "N/A" }
    ],
    lore: "Rising from the sea with seven heads and ten horns, the Beast embodies the ultimate evil rebellion against God. Empowered by the dragon, it wages war against the saints and demands worship. Its power seems unstoppable until the return of the King of Kings."
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
                className={`overflow-hidden bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/50 transition-all duration-300 glow-subtle cursor-pointer hover:scale-105 group ${
                  character.unlockable ? 'border-accent/50 shadow-[0_0_30px_rgba(var(--accent),0.3)]' : ''
                }`}
                onClick={() => setSelectedCharacter(character)}
              >
                {character.image && (
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={character.image} 
                      alt={character.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent"></div>
                    {character.unlockable && (
                      <Badge 
                        className="absolute top-3 left-3 text-sm px-3 py-1 bg-accent/90 animate-pulse"
                      >
                        🔒 UNLOCKABLE
                      </Badge>
                    )}
                    <Badge 
                      variant={character.alignment === "Good" ? "default" : "destructive"}
                      className="absolute top-3 right-3 text-sm px-3 py-1"
                    >
                      {character.alignment}
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge 
                      variant={character.rarity === "Mythic" ? "default" : character.rarity === "Divine" || character.rarity === "Legendary" ? "default" : "secondary"} 
                      className={`${character.rarity === "Mythic" ? "bg-gradient-to-r from-accent via-primary to-secondary animate-pulse glow-divine" : "glow-divine"}`}
                    >
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
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
          {selectedCharacter && (
            <>
              {selectedCharacter.image && (
                <div className="relative -mt-6 -mx-6 mb-6 overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
                  <img 
                    src={selectedCharacter.image} 
                    alt={selectedCharacter.name}
                    className="w-full h-[600px] object-contain"
                  />
                  <div className="absolute top-4 right-6 flex gap-2 flex-wrap">
                    {selectedCharacter.unlockable && (
                      <Badge className="text-lg px-4 py-2 bg-accent/90 animate-pulse">
                        🔒 UNLOCKABLE
                      </Badge>
                    )}
                    <Badge 
                      variant={selectedCharacter.alignment === "Good" ? "default" : "destructive"}
                      className="text-lg px-4 py-2"
                    >
                      {selectedCharacter.alignment}
                    </Badge>
                    <Badge 
                      variant={selectedCharacter.rarity === "Mythic" || selectedCharacter.rarity === "Divine" || selectedCharacter.rarity === "Legendary" ? "default" : "secondary"} 
                      className={`text-lg px-4 py-2 ${selectedCharacter.rarity === "Mythic" ? "bg-gradient-to-r from-accent via-primary to-secondary glow-divine" : "glow-divine"}`}
                    >
                      {selectedCharacter.rarity}
                    </Badge>
                    <Badge variant="outline" className="text-lg px-4 py-2">{selectedCharacter.role}</Badge>
                  </div>
                </div>
              )}
              <DialogHeader>
                <DialogTitle className="text-4xl text-secondary">{selectedCharacter.name}</DialogTitle>
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

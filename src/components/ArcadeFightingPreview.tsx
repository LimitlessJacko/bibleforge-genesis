import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Swords, Zap, Trophy, Shield } from "lucide-react";
import davidVsGoliath from "@/assets/gameplay/david-vs-goliath.png";
import elijahVsJezebel from "@/assets/gameplay/elijah-vs-jezebel.png";
import michaelVsLucifer from "@/assets/gameplay/michael-vs-lucifer.png";

const ArcadeFightingPreview = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Swords,
      title: "Epic Battles",
      description: "Engage in intense 2D fighting matches with biblical characters"
    },
    {
      icon: Zap,
      title: "Special Moves",
      description: "Execute powerful combos and devastating special attacks"
    },
    {
      icon: Shield,
      title: "Power-Ups",
      description: "Unlock boosters like Armor of God and Holy Spirit"
    },
    {
      icon: Trophy,
      title: "Unlock Characters",
      description: "Win battles to unlock new fighters and abilities"
    }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-background/50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Arcade Fighting Mode
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience biblical battles like never before in our action-packed fighting game
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="hover-scale cursor-pointer border-primary/20 hover:border-primary/50 transition-all"
            >
              <CardHeader>
                <feature.icon className="h-12 w-12 mb-2 text-primary" />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={() => navigate("/arcade-fighting")}
              className="text-lg px-8 py-6 hover-scale"
            >
              <Swords className="mr-2 h-5 w-5" />
              Play Now
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/arcade-fighting")}
              className="text-lg px-8 py-6"
            >
              View Controls
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Choose your champion, select your arena, and prove your worth in battle!
          </p>
        </div>

        {/* Gameplay Screenshots Gallery */}
        <div className="mt-12 space-y-4">
          <h3 className="text-2xl font-bold text-center mb-6">Gameplay Screenshots</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-lg overflow-hidden border-4 border-primary/30 shadow-2xl hover-scale">
              <img 
                src={davidVsGoliath} 
                alt="David vs Goliath gameplay screenshot showing epic battle"
                className="w-full h-auto"
              />
              <div className="p-3 bg-card">
                <p className="text-sm font-semibold">David vs Goliath</p>
                <p className="text-xs text-muted-foreground">Classic matchup in ancient arena</p>
              </div>
            </div>
            <div className="rounded-lg overflow-hidden border-4 border-primary/30 shadow-2xl hover-scale">
              <img 
                src={elijahVsJezebel} 
                alt="Elijah vs Jezebel with fire and dark magic combat"
                className="w-full h-auto"
              />
              <div className="p-3 bg-card">
                <p className="text-sm font-semibold">Elijah vs Jezebel</p>
                <p className="text-xs text-muted-foreground">7-hit combo with divine fire power</p>
              </div>
            </div>
            <div className="rounded-lg overflow-hidden border-4 border-primary/30 shadow-2xl hover-scale">
              <img 
                src={michaelVsLucifer} 
                alt="Michael vs Lucifer ultimate special move battle"
                className="w-full h-auto"
              />
              <div className="p-3 bg-card">
                <p className="text-sm font-semibold">Michael vs Lucifer</p>
                <p className="text-xs text-muted-foreground">Ultimate super move clash</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArcadeFightingPreview;

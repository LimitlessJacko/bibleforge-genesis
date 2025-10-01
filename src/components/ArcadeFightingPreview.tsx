import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Swords, Zap, Trophy, Shield } from "lucide-react";

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

        {/* Preview Image Placeholder */}
        <div className="mt-12 rounded-lg overflow-hidden border-4 border-primary/30 shadow-2xl">
          <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
            <div className="text-center space-y-4">
              <Swords className="h-24 w-24 mx-auto text-primary opacity-50" />
              <p className="text-muted-foreground">Game Preview</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArcadeFightingPreview;

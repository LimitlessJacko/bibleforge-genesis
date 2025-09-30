import { Button } from "@/components/ui/button";
import { Swords, Shield, Crown } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBanner})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="animate-float">
          <Crown className="w-20 h-20 mx-auto mb-6 text-secondary animate-pulse-glow" />
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent">
          Spiritual Warfare
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto">
          Enter the ultimate Biblical battleground where faith meets strategy
        </p>
        
        <p className="text-lg text-muted-foreground/80 mb-8 max-w-2xl mx-auto">
          Choose your divine warriors, master legendary abilities, and compete in epic game modes inspired by scripture
        </p>

        <div className="flex flex-wrap gap-4 justify-center mb-12">
          <Button variant="hero" size="lg" className="text-lg">
            <Swords className="w-5 h-5" />
            Start Playing
          </Button>
          <Button variant="divine" size="lg" className="text-lg">
            <Shield className="w-5 h-5" />
            View Characters
          </Button>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap gap-4 justify-center text-sm">
          <div className="px-6 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-primary/20">
            ⚔️ Arcade Fighting
          </div>
          <div className="px-6 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-accent/20">
            ♟️ Biblical Chess
          </div>
          <div className="px-6 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-secondary/20">
            📖 Scripture Trivia
          </div>
          <div className="px-6 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-primary/20">
            🔥 NFT Warriors
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

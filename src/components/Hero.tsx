import { Button } from "@/components/ui/button";
import { Swords, Shield } from "lucide-react";
import heroBanner from "@/assets/hero-banner.png";
import logo from "@/assets/logo.png";

const Hero = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Logo - Top Left */}
      <div className="absolute top-2 left-2 z-20 animate-float">
        <img src={logo} alt="Spiritual Warfare Logo" className="w-32 h-32 object-contain" />
      </div>

      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBanner})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        
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
          <Button 
            variant="hero" 
            size="lg" 
            className="text-lg"
            onClick={() => scrollToSection('game-modes')}
          >
            <Swords className="w-5 h-5" />
            Start Playing
          </Button>
          <Button 
            variant="divine" 
            size="lg" 
            className="text-lg"
            onClick={() => scrollToSection('characters')}
          >
            <Shield className="w-5 h-5" />
            View Characters
          </Button>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap gap-4 justify-center text-sm">
          <button
            onClick={() => scrollToSection('game-modes')}
            className="px-6 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-primary/20 hover:border-primary/50 transition-all cursor-pointer hover:scale-105"
          >
            ⚔️ Arcade Fighting
          </button>
          <button
            onClick={() => scrollToSection('game-modes')}
            className="px-6 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-accent/20 hover:border-accent/50 transition-all cursor-pointer hover:scale-105"
          >
            ♟️ Biblical Chess
          </button>
          <button
            onClick={() => scrollToSection('game-modes')}
            className="px-6 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-secondary/20 hover:border-secondary/50 transition-all cursor-pointer hover:scale-105"
          >
            📖 Scripture Trivia
          </button>
          <button
            onClick={() => scrollToSection('characters')}
            className="px-6 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-primary/20 hover:border-primary/50 transition-all cursor-pointer hover:scale-105"
          >
            🔥 NFT Warriors
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;

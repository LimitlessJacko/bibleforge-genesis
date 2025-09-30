import { Crown } from "lucide-react";

const Footer = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="py-12 px-4 border-t border-border/50 bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <button 
            onClick={scrollToTop}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Crown className="w-8 h-8 text-secondary" />
            <div className="text-left">
              <div className="text-xl font-bold text-foreground">Spiritual Warfare</div>
              <div className="text-sm text-muted-foreground">Biblical Gaming Universe</div>
            </div>
          </button>
          
          <div className="flex gap-6 text-sm text-muted-foreground">
            <button 
              onClick={() => scrollToSection('characters')} 
              className="hover:text-secondary transition-colors"
            >
              Characters
            </button>
            <button 
              onClick={() => scrollToSection('game-modes')} 
              className="hover:text-secondary transition-colors"
            >
              Game Modes
            </button>
            <button 
              onClick={() => scrollToSection('boots')} 
              className="hover:text-secondary transition-colors"
            >
              Limitless Boots
            </button>
            <button 
              onClick={() => scrollToSection('tokenomics')} 
              className="hover:text-secondary transition-colors"
            >
              Tokenomics
            </button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            © 2025 Spiritual Warfare. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

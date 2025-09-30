import { Crown } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 px-4 border-t border-border/50 bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Crown className="w-8 h-8 text-secondary" />
            <div>
              <div className="text-xl font-bold text-foreground">Spiritual Warfare</div>
              <div className="text-sm text-muted-foreground">Biblical Gaming Universe</div>
            </div>
          </div>
          
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#characters" className="hover:text-secondary transition-colors">Characters</a>
            <a href="#game-modes" className="hover:text-secondary transition-colors">Game Modes</a>
            <a href="#boots" className="hover:text-secondary transition-colors">Limitless Boots</a>
            <a href="#tokenomics" className="hover:text-secondary transition-colors">Tokenomics</a>
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

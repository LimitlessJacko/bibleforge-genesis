import Hero from "@/components/Hero";
import Characters from "@/components/Characters";
import GameModes from "@/components/GameModes";
import LimitlessBoots from "@/components/LimitlessBoots";
import Tokenomics from "@/components/Tokenomics";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Characters />
      <GameModes />
      <LimitlessBoots />
      <Tokenomics />
      <Footer />
    </div>
  );
};

export default Index;

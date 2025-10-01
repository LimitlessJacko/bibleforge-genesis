import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Lock, Unlock, Dices, Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const LudiUnlock = () => {
  const navigate = useNavigate();
  const [wins, setWins] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUnlockStatus();
  }, []);

  const checkUnlockStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setIsLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("wins")
      .eq("id", user.id)
      .single();

    if (profile) {
      setWins(profile.wins);
      setIsUnlocked(profile.wins >= 5);
    }
    
    setIsLoading(false);
  };

  const progress = Math.min((wins / 5) * 100, 100);

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-orange-500/10 via-red-500/10 to-pink-500/10">
      <div className="container mx-auto max-w-4xl">
        <Card className="relative overflow-hidden border-4 border-orange-500/50 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-sm">
          {/* Jamaican Flag Colors Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-yellow-500 to-green-500" />
          </div>

          <div className="relative p-8 md:p-12">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <Dices className={`w-20 h-20 ${isUnlocked ? 'text-yellow-500 animate-bounce' : 'text-muted-foreground'}`} />
                {!isUnlocked && (
                  <Lock className="absolute -bottom-2 -right-2 w-8 h-8 text-orange-500" />
                )}
              </div>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
              🇯🇲 Jamaican Ludi 🎲
            </h2>
            
            <p className="text-center text-lg text-muted-foreground mb-8">
              Secret Bonus Game - Classic Board Game
            </p>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              </div>
            ) : !isUnlocked ? (
              <div className="space-y-6">
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center gap-3 text-2xl font-bold">
                    <Trophy className="w-8 h-8 text-yellow-500" />
                    <span>{wins} / 5 Wins</span>
                  </div>
                  <Progress value={progress} className="h-4" />
                  <p className="text-sm text-muted-foreground">
                    Win {5 - wins} more Arcade Fighting {5 - wins === 1 ? 'match' : 'matches'} to unlock!
                  </p>
                </div>

                <Card className="p-6 bg-gradient-to-br from-amber-100/10 to-orange-100/10 border-amber-500/30">
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Dices className="w-5 h-5 text-orange-500" />
                    What is Ludi?
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Classic Jamaican board game (Ludo variant)</li>
                    <li>• Race your 4 pieces around the board</li>
                    <li>• Roll dice, capture opponents, reach home first</li>
                    <li>• Play against 3 AI opponents</li>
                    <li>• Beautiful Caribbean-themed design</li>
                  </ul>
                </Card>

                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={() => navigate("/arcade-fighting")}
                >
                  Play Arcade Fighting to Unlock
                </Button>
              </div>
            ) : (
              <div className="space-y-6 text-center">
                <div className="flex items-center justify-center gap-3 text-3xl font-bold text-green-500 animate-bounce">
                  <Unlock className="w-10 h-10" />
                  <span>UNLOCKED!</span>
                </div>

                <div className="p-6 bg-gradient-to-br from-green-100/10 to-emerald-100/10 border-2 border-green-500/50 rounded-lg">
                  <p className="text-lg mb-4">
                    Congratulations! You've unlocked the secret Ludi game! 🎉
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Experience the classic Jamaican board game with beautiful graphics and exciting gameplay.
                  </p>
                  
                  <div className="grid md:grid-cols-3 gap-4 mb-6 text-sm">
                    <div className="p-3 bg-card/50 rounded-lg">
                      <div className="font-bold text-red-500">4 Players</div>
                      <div className="text-muted-foreground">You vs 3 AI</div>
                    </div>
                    <div className="p-3 bg-card/50 rounded-lg">
                      <div className="font-bold text-blue-500">Strategic</div>
                      <div className="text-muted-foreground">Dice & tactics</div>
                    </div>
                    <div className="p-3 bg-card/50 rounded-lg">
                      <div className="font-bold text-yellow-500">Classic</div>
                      <div className="text-muted-foreground">Authentic rules</div>
                    </div>
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600"
                  onClick={() => navigate("/ludi")}
                >
                  <Dices className="mr-2" />
                  Play Jamaican Ludi Now!
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </section>
  );
};

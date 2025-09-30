import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Hero from "@/components/Hero";
import Characters from "@/components/Characters";
import GameModes from "@/components/GameModes";
import LimitlessBoots from "@/components/LimitlessBoots";
import Tokenomics from "@/components/Tokenomics";
import Footer from "@/components/Footer";
import { LogOut, Trophy, User as UserIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => {
          fetchProfile(session.user.id);
        }, 0);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (data) {
      setProfile(data);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen">
      {/* User Profile Bar */}
      <div className="fixed top-0 right-0 z-50 p-4">
        {user && profile ? (
          <Card className="p-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-primary" />
              <div className="text-sm">
                <div className="font-semibold">{profile.username}</div>
                <div className="text-muted-foreground flex items-center gap-1">
                  <Trophy className="h-3 w-3" />
                  Rating: {profile.chess_rating}
                </div>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </Card>
        ) : (
          <Button onClick={() => navigate("/auth")}>
            Sign In
          </Button>
        )}
      </div>

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

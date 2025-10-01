import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Hero from "@/components/Hero";
import Characters from "@/components/Characters";
import GameModes from "@/components/GameModes";
import ArcadeFightingPreview from "@/components/ArcadeFightingPreview";
import LimitlessBoots from "@/components/LimitlessBoots";
import Tokenomics from "@/components/Tokenomics";
import Footer from "@/components/Footer";
import { AnimationsShowcase } from "@/components/AnimationsShowcase";
import { LudiUnlock } from "@/components/LudiUnlock";
import { LogOut, Trophy, User as UserIcon, Volume2, VolumeX } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Howl } from "howler";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [musicInitialized, setMusicInitialized] = useState(false);
  const backgroundMusicRef = useRef<Howl | null>(null);

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

  // Initialize orchestral background music
  useEffect(() => {
    return () => {
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.unload();
        backgroundMusicRef.current = null;
      }
    };
  }, []);

  const toggleMusic = () => {
    if (!musicInitialized) {
      // First click - initialize and play
      backgroundMusicRef.current = new Howl({
        src: ['https://cdn.pixabay.com/audio/2022/03/10/audio_4f15ab7fa8.mp3'],
        loop: true,
        volume: 0.25,
        onload: () => {
          console.log('Music loaded successfully');
        },
        onloaderror: (id, error) => {
          console.error('Failed to load music:', error);
        },
      });
      backgroundMusicRef.current.play();
      setMusicInitialized(true);
      setIsMuted(false);
    } else {
      // Toggle mute/unmute
      const newMuted = !isMuted;
      setIsMuted(newMuted);
      if (backgroundMusicRef.current) {
        if (newMuted) {
          backgroundMusicRef.current.pause();
        } else {
          backgroundMusicRef.current.play();
        }
      }
    }
  };

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
      {/* Volume Control - Fixed Position */}
      <div className="fixed top-4 left-4 z-50">
        <Button
          onClick={toggleMusic}
          variant="outline"
          size="icon"
          className="shadow-lg"
          title={!musicInitialized ? "Click to start music" : isMuted ? "Unmute music" : "Pause music"}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </Button>
      </div>

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
      <AnimationsShowcase />
      <GameModes />
      <LudiUnlock />
      <ArcadeFightingPreview />
      <LimitlessBoots />
      <Tokenomics />
      <Footer />
    </div>
  );
};

export default Index;

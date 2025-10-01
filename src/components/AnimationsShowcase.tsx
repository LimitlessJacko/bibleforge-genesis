import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const AnimationsShowcase = () => {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-background/50">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-primary">
          Combat Animations & Effects
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Experience fluid, dynamic combat with sakuga-inspired animations
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Light Attack Demo */}
          <Card 
            className={`p-6 transition-all duration-300 cursor-pointer hover:scale-105 ${
              activeDemo === 'light' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setActiveDemo(activeDemo === 'light' ? null : 'light')}
          >
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-primary">Light Attack</h3>
              <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg flex items-center justify-center overflow-hidden relative">
                {activeDemo === 'light' && (
                  <div className="absolute inset-0 animate-pulse">
                    <div className="w-16 h-16 bg-primary/50 rounded-full blur-xl animate-[scale-in_0.2s_ease-out]" />
                  </div>
                )}
                <span className={`text-2xl ${activeDemo === 'light' ? 'animate-fade-in' : ''}`}>👊</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Fast startup • Quick recovery • Combo starter
              </p>
            </div>
          </Card>

          {/* Heavy Attack Demo */}
          <Card 
            className={`p-6 transition-all duration-300 cursor-pointer hover:scale-105 ${
              activeDemo === 'heavy' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setActiveDemo(activeDemo === 'heavy' ? null : 'heavy')}
          >
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-primary">Heavy Attack</h3>
              <div className="h-32 bg-gradient-to-r from-destructive/20 to-destructive/5 rounded-lg flex items-center justify-center overflow-hidden relative">
                {activeDemo === 'heavy' && (
                  <div className="absolute inset-0">
                    <div className="w-24 h-24 bg-destructive/50 rounded-full blur-2xl animate-[scale-in_0.4s_ease-out]" />
                  </div>
                )}
                <span className={`text-3xl ${activeDemo === 'heavy' ? 'animate-[scale-in_0.3s_ease-out]' : ''}`}>💥</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Slow startup • High damage • Knockback effect
              </p>
            </div>
          </Card>

          {/* Special Move Demo */}
          <Card 
            className={`p-6 transition-all duration-300 cursor-pointer hover:scale-105 ${
              activeDemo === 'special' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setActiveDemo(activeDemo === 'special' ? null : 'special')}
          >
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-primary">Special Move</h3>
              <div className="h-32 bg-gradient-to-r from-accent/20 to-accent/5 rounded-lg flex items-center justify-center overflow-hidden relative">
                {activeDemo === 'special' && (
                  <>
                    <div className="absolute inset-0 animate-[slide-in-right_0.3s_ease-out]">
                      <div className="w-full h-2 bg-accent/70 mt-16" />
                    </div>
                    <div className="absolute inset-0 animate-pulse">
                      <div className="w-20 h-20 bg-accent/40 rounded-full blur-xl" />
                    </div>
                  </>
                )}
                <span className={`text-3xl ${activeDemo === 'special' ? 'animate-[slide-in-right_0.3s_ease-out]' : ''}`}>⚡</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Projectile • Spirit cost • Long range
              </p>
            </div>
          </Card>

          {/* Block Demo */}
          <Card 
            className={`p-6 transition-all duration-300 cursor-pointer hover:scale-105 ${
              activeDemo === 'block' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setActiveDemo(activeDemo === 'block' ? null : 'block')}
          >
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-primary">Defensive Block</h3>
              <div className="h-32 bg-gradient-to-r from-blue-500/20 to-blue-500/5 rounded-lg flex items-center justify-center overflow-hidden relative">
                {activeDemo === 'block' && (
                  <div className="absolute inset-0 border-4 border-blue-500/50 rounded-lg animate-fade-in" />
                )}
                <span className={`text-3xl ${activeDemo === 'block' ? 'animate-fade-in' : ''}`}>🛡️</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Reduces damage • Chip damage • Guard break risk
              </p>
            </div>
          </Card>

          {/* Jump Attack Demo */}
          <Card 
            className={`p-6 transition-all duration-300 cursor-pointer hover:scale-105 ${
              activeDemo === 'jump' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setActiveDemo(activeDemo === 'jump' ? null : 'jump')}
          >
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-primary">Aerial Attack</h3>
              <div className="h-32 bg-gradient-to-r from-purple-500/20 to-purple-500/5 rounded-lg flex items-center justify-center overflow-hidden relative">
                {activeDemo === 'jump' && (
                  <div className="absolute inset-0">
                    <div className="w-16 h-16 bg-purple-500/30 rounded-full blur-lg animate-[fade-in_0.2s_ease-out]" 
                         style={{ animation: 'bounce 0.6s ease-in-out' }} />
                  </div>
                )}
                <span className={`text-3xl ${activeDemo === 'jump' ? 'animate-[scale-in_0.3s_ease-out]' : ''}`}>🦅</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Air combo • Overhead attack • Mix-up potential
              </p>
            </div>
          </Card>

          {/* Hit Effect Demo */}
          <Card 
            className={`p-6 transition-all duration-300 cursor-pointer hover:scale-105 ${
              activeDemo === 'hit' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setActiveDemo(activeDemo === 'hit' ? null : 'hit')}
          >
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-primary">Impact Effect</h3>
              <div className="h-32 bg-gradient-to-r from-yellow-500/20 to-yellow-500/5 rounded-lg flex items-center justify-center overflow-hidden relative">
                {activeDemo === 'hit' && (
                  <>
                    <div className="absolute inset-0 bg-white/20 animate-[fade-out_0.3s_ease-out]" />
                    <div className="absolute inset-0">
                      {[...Array(6)].map((_, i) => (
                        <div 
                          key={i}
                          className="absolute w-2 h-2 bg-yellow-500 rounded-full animate-[scale-out_0.4s_ease-out]"
                          style={{
                            left: `${50 + Math.cos(i * Math.PI / 3) * 30}%`,
                            top: `${50 + Math.sin(i * Math.PI / 3) * 30}%`,
                          }}
                        />
                      ))}
                    </div>
                  </>
                )}
                <span className={`text-3xl ${activeDemo === 'hit' ? 'animate-[scale-in_0.2s_ease-out]' : ''}`}>💫</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Screen shake • Particle burst • Sound effect
              </p>
            </div>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <Button size="lg" onClick={() => setActiveDemo(null)} variant="outline">
            Reset Demos
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Click on each card to see the animation in action
          </p>
        </div>
      </div>
    </section>
  );
};

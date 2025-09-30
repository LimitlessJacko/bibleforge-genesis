import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, TrendingUp, Lock, Users, Flame, Droplet } from "lucide-react";

const allocation = [
  { category: "Treasury", percentage: 25, icon: Lock, color: "text-primary" },
  { category: "Staking Rewards", percentage: 30, icon: TrendingUp, color: "text-secondary" },
  { category: "Team", percentage: 10, icon: Users, color: "text-accent" },
  { category: "Community", percentage: 20, icon: Coins, color: "text-primary" },
  { category: "Liquidity", percentage: 10, icon: Droplet, color: "text-accent" },
  { category: "Burnable Reserve", percentage: 5, icon: Flame, color: "text-destructive" }
];

const earnSources = [
  "Trivia rewards for correct answers",
  "Match victory rewards in all modes",
  "Seasonal quest completions",
  "Tournament placements",
  "Daily login bonuses"
];

const sinkMechanisms = [
  "Boot upgrades & equipment",
  "NFT minting fees",
  "Ranked match entry fees",
  "Seasonal shop purchases",
  "Character unlocks"
];

const Tokenomics = () => {
  return (
    <section id="tokenomics" className="py-24 px-4 bg-gradient-to-b from-muted/20 to-background">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent">
            Tokenomics
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            Balanced economy designed for sustainable growth and player rewards
          </p>
          <div className="inline-flex items-center gap-3 px-8 py-4 bg-card/50 backdrop-blur-sm rounded-lg border border-primary/20">
            <Coins className="w-8 h-8 text-secondary" />
            <div className="text-left">
              <div className="text-3xl font-bold text-foreground">SPW Token</div>
              <div className="text-sm text-muted-foreground">Total Supply: 1,000,000,000</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Allocation */}
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl text-secondary">Token Allocation</CardTitle>
              <CardDescription>Distribution across key areas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allocation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.category} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${item.color}`} />
                        <span className="text-sm text-foreground">{item.category}</span>
                      </div>
                      <span className="text-lg font-bold text-primary">{item.percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Earn */}
          <Card className="bg-card/50 backdrop-blur-sm border-secondary/20">
            <CardHeader>
              <CardTitle className="text-2xl text-secondary">Earn SPW</CardTitle>
              <CardDescription>Multiple ways to earn tokens</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {earnSources.map((source, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground p-3 bg-background/30 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                    {source}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Sink */}
          <Card className="bg-card/50 backdrop-blur-sm border-accent/20">
            <CardHeader>
              <CardTitle className="text-2xl text-secondary">Token Sinks</CardTitle>
              <CardDescription>Deflationary mechanisms</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {sinkMechanisms.map((sink, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground p-3 bg-background/30 rounded-lg">
                    <Flame className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                    {sink}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Staking Info */}
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30 glow-subtle">
          <CardHeader>
            <CardTitle className="text-3xl text-secondary">Staking Rewards</CardTitle>
            <CardDescription className="text-base">Earn passive income by staking your SPW tokens</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-background/50 rounded-lg">
                <Lock className="w-10 h-10 text-primary mx-auto mb-3" />
                <div className="text-2xl font-bold text-foreground mb-1">1,000 SPW</div>
                <div className="text-sm text-muted-foreground">Minimum Stake</div>
              </div>
              <div className="text-center p-6 bg-background/50 rounded-lg">
                <TrendingUp className="w-10 h-10 text-secondary mx-auto mb-3" />
                <div className="text-2xl font-bold text-foreground mb-1">Variable APY</div>
                <div className="text-sm text-muted-foreground">By Epoch</div>
              </div>
              <div className="text-center p-6 bg-background/50 rounded-lg">
                <Coins className="w-10 h-10 text-accent mx-auto mb-3" />
                <div className="text-2xl font-bold text-foreground mb-1">30%</div>
                <div className="text-sm text-muted-foreground">Allocated to Rewards</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Tokenomics;

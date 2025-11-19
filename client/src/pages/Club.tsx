import { CLUB_MEMBERS, SUPERLATIVES, ASSETS } from "@/lib/mockData";
import { Link } from "wouter";
import { Trophy, Crown, Utensils, Plus, ThumbsUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function Club() {
  return (
    <div className="space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <img src={ASSETS.mascot} alt="Mascot" className="w-24 h-24 mx-auto object-contain animate-bounce-slow" />
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">The Restaurant Club</h1>
        <p className="text-muted-foreground text-lg">Est. 2024 • 5 Members • 14 Dinners</p>
        
        <div className="flex justify-center pt-2">
           <Button asChild className="rounded-full font-bold bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105">
             <Link href="/create-club">
                <Plus className="w-4 h-4 mr-2" /> Start New Club
             </Link>
           </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Members List */}
        <Card className="border-none shadow-soft h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading">
              <UsersIcon className="w-5 h-5 text-primary" />
              The Squad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {CLUB_MEMBERS.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 border-2 border-background shadow-sm">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>{member.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-foreground">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.status}</p>
                  </div>
                </div>
                {member.status === "Picker" && (
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none">
                    Current Picker
                  </Badge>
                )}
              </div>
            ))}
            <Button variant="outline" className="w-full mt-4 border-dashed border-2 h-12 text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5">
              <Plus className="w-4 h-4 mr-2" /> Invite New Member
            </Button>
          </CardContent>
        </Card>

        {/* Superlatives */}
        <Card className="border-none shadow-soft h-full bg-gradient-to-br from-card to-secondary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Hall of Fame
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {SUPERLATIVES.map((award, i) => (
              <div key={i} className="bg-card/80 backdrop-blur-sm p-4 rounded-xl border shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 shrink-0">
                  <award.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wide">{award.title}</p>
                  <p className="font-bold text-lg text-foreground">{award.winner}</p>
                </div>
                <Crown className="w-5 h-5 text-yellow-400 opacity-20" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Wishlist Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
           <h2 className="text-2xl font-heading font-bold">Wishlist</h2>
           <Button size="sm">Add Spot</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {[
             { name: "Sushi Nakazawa", votes: 4, type: "Japanese" },
             { name: "Peter Luger", votes: 3, type: "Steakhouse" },
             { name: "Carbone", votes: 2, type: "Italian" }
           ].map((spot, i) => (
             <div key={i} className="bg-card p-4 rounded-xl border shadow-sm flex justify-between items-center">
               <div>
                 <p className="font-bold">{spot.name}</p>
                 <p className="text-xs text-muted-foreground">{spot.type}</p>
               </div>
               <div className="flex flex-col items-end">
                 <div className="flex items-center gap-1 text-sm font-medium text-primary">
                   <ThumbsUp className="w-3 h-3" /> {spot.votes}
                 </div>
                 <Progress value={spot.votes * 25} className="w-16 h-1 mt-1" />
               </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}

function UsersIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

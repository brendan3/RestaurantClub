import { useState } from "react";
import { NEXT_EVENT, CURRENT_USER, SOCIAL_FEED, ASSETS } from "@/lib/mockData";
import { Calendar, Clock, MapPin, MessageSquare, Heart, Share2, ChefHat } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-muted-foreground font-medium mb-1">Welcome back,</p>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
            Hungry, {CURRENT_USER.name}? 😋
          </h1>
        </div>
        <Button variant="outline" className="hidden md:flex gap-2 rounded-full border-primary/20 text-primary hover:bg-primary/10 hover:text-primary">
          <Share2 className="w-4 h-4" /> Invite Friend
        </Button>
      </div>

      {/* Hero Card - Next Event */}
      <div className="relative overflow-hidden rounded-3xl bg-foreground text-background shadow-2xl group">
        <div className="absolute inset-0">
          <img 
            src={NEXT_EVENT.image} 
            alt="Next Event" 
            className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        </div>
        
        <div className="relative p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-end justify-between h-full min-h-[300px]">
          <div className="space-y-4 max-w-lg">
            <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 border-none px-3 py-1 text-sm font-medium rounded-full w-fit">
              Upcoming Dinner
            </Badge>
            <div>
              <h2 className="text-4xl md:text-5xl font-heading font-bold mb-2 text-white">{NEXT_EVENT.restaurant}</h2>
              <div className="flex flex-wrap gap-4 text-white/80">
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(NEXT_EVENT.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {new Date(NEXT_EVENT.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {NEXT_EVENT.location}</span>
              </div>
            </div>
            <div className="flex -space-x-3 pt-2">
              {NEXT_EVENT.attendees.map((id, i) => (
                 <Avatar key={i} className="border-2 border-black w-10 h-10 ring-2 ring-white/10">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`} />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              ))}
              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border-2 border-black flex items-center justify-center text-xs font-bold text-white">
                +2
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-center min-w-[120px]">
            <span className="block text-xs text-white/70 uppercase tracking-wider font-bold mb-1">Days Left</span>
            <span className="block text-4xl font-heading font-black text-white">12</span>
            <Button size="sm" className="mt-3 w-full bg-white text-black hover:bg-white/90 rounded-full font-bold">
              I'm In!
            </Button>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column: Status & Actions */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Picker Status */}
          <Card className="border-none shadow-soft bg-secondary/30 overflow-hidden relative">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
             <CardHeader className="pb-2">
               <CardTitle className="flex items-center gap-2 text-xl">
                 <ChefHat className="w-6 h-6 text-primary" />
                 Who's Picking?
               </CardTitle>
             </CardHeader>
             <CardContent className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="w-16 h-16 border-4 border-background shadow-lg">
                    <AvatarImage src={NEXT_EVENT.picker.avatar} />
                    <AvatarFallback>PK</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 bg-primary text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-sm">
                    Picker
                  </div>
                </div>
                <div>
                  <p className="font-bold text-lg">{NEXT_EVENT.picker.name} is choosing!</p>
                  <p className="text-muted-foreground text-sm">Selection locked in. Get your appetites ready.</p>
                </div>
             </CardContent>
          </Card>

          {/* Recent Activity */}
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-xl">Recent Buzz 🐝</h3>
            {SOCIAL_FEED.map((post) => (
              <Card key={post.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={post.user.avatar} />
                      <AvatarFallback>{post.user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-sm">{post.user.name}</span>
                        <span className="text-xs text-muted-foreground">{post.time}</span>
                      </div>
                      
                      {post.type === 'comment' && (
                        <p className="text-sm mt-1 text-foreground/80">{post.content}</p>
                      )}
                      
                      {post.type === 'photo' && (
                        <div className="mt-2 rounded-lg overflow-hidden">
                           <p className="text-sm mb-2 text-foreground/80">{post.content}</p>
                           <img src={post.image} alt="Post" className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500" />
                        </div>
                      )}

                      <div className="flex gap-4 mt-3">
                        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                          <Heart className="w-4 h-4" /> {post.likes} Likes
                        </button>
                        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                          <MessageSquare className="w-4 h-4" /> Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column: Stats & Mascot */}
        <div className="space-y-6">
          <div className="bg-card rounded-3xl p-6 border shadow-soft text-center relative overflow-hidden">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl" />
             <img src={ASSETS.mascot} alt="Chef" className="w-32 h-32 mx-auto object-contain mb-4 drop-shadow-lg animate-bounce-slow" />
             <h3 className="font-heading font-bold text-lg mb-1">Dining Stats</h3>
             <p className="text-sm text-muted-foreground mb-4">You're on a roll!</p>
             
             <div className="grid grid-cols-2 gap-3 text-left">
               <div className="bg-secondary/20 p-3 rounded-xl">
                 <span className="block text-xs text-muted-foreground font-medium">Dinners</span>
                 <span className="block text-2xl font-bold text-secondary-foreground">14</span>
               </div>
               <div className="bg-primary/10 p-3 rounded-xl">
                 <span className="block text-xs text-muted-foreground font-medium">Avg Bill</span>
                 <span className="block text-2xl font-bold text-primary">$45</span>
               </div>
             </div>
          </div>

          <div className="bg-card rounded-3xl p-6 border shadow-soft">
            <h3 className="font-heading font-bold text-lg mb-4">Wishlist Highlights</h3>
            <ul className="space-y-3">
              <li className="flex items-center justify-between text-sm p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer">
                <span className="font-medium">Mama's Ramen</span>
                <Badge variant="outline" className="text-[10px]">Japanese</Badge>
              </li>
              <li className="flex items-center justify-between text-sm p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer">
                <span className="font-medium">The Golden Steer</span>
                <Badge variant="outline" className="text-[10px]">Steakhouse</Badge>
              </li>
              <li className="flex items-center justify-between text-sm p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer">
                <span className="font-medium">Spice Route</span>
                <Badge variant="outline" className="text-[10px]">Indian</Badge>
              </li>
            </ul>
            <Button variant="ghost" size="sm" className="w-full mt-4 text-primary hover:text-primary hover:bg-primary/10">View All</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

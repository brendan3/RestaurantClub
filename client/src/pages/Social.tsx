import { useState } from "react";
import { PUBLIC_FEED, SOCIAL_FEED, DISCOVERABLE_CLUBS, ASSETS } from "@/lib/mockData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Heart, MessageSquare, Search, Users, Globe, Lock, Star, Trophy } from "lucide-react";

export default function Social() {
  const [activeTab, setActiveTab] = useState("public");

  return (
    <div className="space-y-8">
      {/* Header & Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">Social Feed 💬</h1>
          <p className="text-muted-foreground">See what's cooking in your circles and beyond.</p>
        </div>
        
        <div className="bg-muted/50 p-1 rounded-full flex gap-1">
           <button 
             onClick={() => setActiveTab("public")}
             className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === "public" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`}
           >
             Public & Discovery
           </button>
           <button 
             onClick={() => setActiveTab("my-clubs")}
             className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === "my-clubs" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`}
           >
             My Clubs
           </button>
        </div>
      </div>

      {/* PUBLIC FEED CONTENT */}
      {activeTab === "public" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
          
          {/* Discovery Carousel */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <h2 className="text-xl font-heading font-bold flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" /> Discover Clubs
              </h2>
              <div className="relative w-48 md:w-64">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                 <Input placeholder="Find a club..." className="pl-9 h-9 bg-card rounded-full text-sm" />
              </div>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
              {DISCOVERABLE_CLUBS.map(club => (
                <div key={club.id} className="min-w-[280px] md:min-w-[320px] bg-card rounded-2xl overflow-hidden border shadow-sm hover:shadow-md transition-all group">
                  <div className="h-32 overflow-hidden relative">
                    <img src={club.image} alt={club.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="backdrop-blur-md bg-black/50 text-white border-none">
                        {club.type === "Private" ? <Lock className="w-3 h-3 mr-1" /> : <Globe className="w-3 h-3 mr-1" />}
                        {club.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-lg leading-tight">{club.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{club.members} Members • {club.tags.join(", ")}</p>
                    </div>
                    <p className="text-sm text-foreground/80 line-clamp-2">{club.description}</p>
                    <Button size="sm" className="w-full rounded-full font-bold" variant={club.type === "Private" ? "outline" : "default"}>
                      {club.type === "Private" ? "Request to Join" : "Join Club"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Public Activity Feed */}
          <div className="space-y-4 max-w-2xl mx-auto">
            <h2 className="text-xl font-heading font-bold">Trending Across Clubs 🔥</h2>
            {PUBLIC_FEED.map(post => (
              <Card key={post.id} className="border-none shadow-soft overflow-hidden">
                <CardHeader className="pb-3 flex flex-row items-start gap-4 space-y-0">
                   <Avatar className="w-10 h-10 border shadow-sm">
                     <AvatarImage src={post.user.avatar} />
                     <AvatarFallback>{post.user.name[0]}</AvatarFallback>
                   </Avatar>
                   <div className="flex-1">
                     <div className="flex justify-between items-start">
                       <div>
                         <p className="font-bold text-sm">
                           {post.user.name} <span className="font-normal text-muted-foreground">in</span> {post.clubName}
                         </p>
                         <p className="text-xs text-muted-foreground">{post.time}</p>
                       </div>
                       <Badge variant="outline" className="flex items-center gap-1 text-[10px]">
                         {post.type === "review" && <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />}
                         {post.type === "milestone" && <Trophy className="w-3 h-3 text-primary" />}
                         {post.type === "review" ? "Review" : "Milestone"}
                       </Badge>
                     </div>
                   </div>
                </CardHeader>
                
                <CardContent className="pb-4">
                  <p className="text-sm mb-3">{post.content}</p>
                  
                  {post.image && (
                    <div className="rounded-xl overflow-hidden mb-3 relative group">
                      <img src={post.image} alt="Post" className="w-full h-64 object-cover" />
                      {post.restaurant && (
                        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
                          <MapPinIcon className="w-4 h-4" /> {post.restaurant}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-4 pt-2 border-t border-border/40">
                    <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
                      <Heart className="w-4 h-4" /> {post.likes}
                    </button>
                    <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
                      <MessageSquare className="w-4 h-4" /> {post.comments}
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* MY CLUBS FEED CONTENT */}
      {activeTab === "my-clubs" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto space-y-6">
           <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-center gap-3">
              <img src={ASSETS.mascot} className="w-12 h-12 object-contain" alt="Mascot" />
              <div>
                <h3 className="font-bold text-primary">Restaurant Club Private Feed</h3>
                <p className="text-xs text-muted-foreground">Only members of your club can see this.</p>
              </div>
           </div>

           {SOCIAL_FEED.map(post => (
             <Card key={post.id} className="border-none shadow-soft">
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
                     
                     <p className="text-sm mt-1 text-foreground/90">{post.content}</p>
                     
                     {post.image && (
                       <div className="mt-3 rounded-xl overflow-hidden">
                          <img src={post.image} alt="Post" className="w-full h-56 object-cover hover:scale-105 transition-transform duration-500" />
                       </div>
                     )}

                     <div className="flex gap-4 mt-3">
                       <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors font-bold">
                         <Heart className="w-4 h-4" /> {post.likes} Likes
                       </button>
                       <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors font-bold">
                         <MessageSquare className="w-4 h-4" /> Reply
                       </button>
                     </div>
                   </div>
                 </div>
               </CardContent>
             </Card>
           ))}
        </div>
      )}
    </div>
  );
}

function MapPinIcon(props: any) {
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
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

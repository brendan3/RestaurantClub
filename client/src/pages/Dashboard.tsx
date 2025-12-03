import { useState, useEffect } from "react";
import { SOCIAL_FEED, ASSETS } from "@/lib/mockData";
import { Calendar, Clock, MapPin, MessageSquare, Heart, Share2, ChefHat, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { getUpcomingEvents, getUserRsvp, rsvpToEvent, getEventRsvps } from "@/lib/api";
import { toast } from "sonner";

export default function Dashboard() {
  const { user } = useAuth();
  const [upcomingEvent, setUpcomingEvent] = useState<any>(null);
  const [userRsvp, setUserRsvp] = useState<any>(null);
  const [eventRsvps, setEventRsvps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRsvping, setIsRsvping] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const events = await getUpcomingEvents();
      if (events.length > 0) {
        const nextEvent = events[0];
        setUpcomingEvent(nextEvent);
        
        // Load user's RSVP
        const rsvp = await getUserRsvp(nextEvent.id);
        setUserRsvp(rsvp);
        
        // Load all RSVPs
        const rsvps = await getEventRsvps(nextEvent.id);
        setEventRsvps(rsvps);
      }
    } catch (error: any) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRsvp = async (status: "attending" | "declined") => {
    if (!upcomingEvent) return;
    
    setIsRsvping(true);
    try {
      await rsvpToEvent(upcomingEvent.id, status);
      toast.success(status === "attending" ? "You're in! 🎉" : "RSVP updated");
      
      // Reload RSVP data
      const rsvp = await getUserRsvp(upcomingEvent.id);
      setUserRsvp(rsvp);
      const rsvps = await getEventRsvps(upcomingEvent.id);
      setEventRsvps(rsvps);
    } catch (error: any) {
      toast.error(error.message || "Failed to RSVP");
    } finally {
      setIsRsvping(false);
    }
  };

  const calculateDaysUntil = (dateString: string) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const attendingCount = eventRsvps.filter(r => r.status === "attending").length;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-muted-foreground font-medium mb-1">Welcome back,</p>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground tracking-tight">
            Hungry, {user?.name}? 😋
          </h1>
        </div>
        <Button variant="ghost" className="hidden md:flex gap-2 rounded-full bg-white shadow-sm border border-white/50 text-foreground hover:bg-primary/10 hover:text-primary transition-all hover:scale-105">
          <Share2 className="w-4 h-4" /> Invite Friend
        </Button>
      </div>

      {/* Hero Card - Next Event */}
      {isLoading ? (
        <div className="relative overflow-hidden rounded-[2.5rem] bg-muted shadow-float min-h-[350px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading upcoming dinner...</p>
          </div>
        </div>
      ) : upcomingEvent ? (
        <div className="relative overflow-hidden rounded-[2.5rem] bg-foreground text-background shadow-float group">
          <div className="absolute inset-0">
            <img 
              src={upcomingEvent.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80"} 
              alt="Next Event" 
              className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-1000 ease-out" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </div>
          
          <div className="relative p-8 md:p-10 flex flex-col md:flex-row gap-8 md:items-end justify-between h-full min-h-[350px]">
            <div className="space-y-6 max-w-lg">
              <Badge className="bg-white/20 backdrop-blur-md text-white hover:bg-white/30 border-none px-4 py-1.5 text-sm font-medium rounded-full w-fit">
                Upcoming Dinner
              </Badge>
              <div>
                <h2 className="text-4xl md:text-6xl font-heading font-bold mb-3 text-white leading-none">
                  {upcomingEvent.restaurantName}
                </h2>
                <div className="flex flex-wrap gap-4 text-white/90 font-medium">
                  <span className="flex items-center gap-1.5 bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <Calendar className="w-4 h-4" /> 
                    {new Date(upcomingEvent.eventDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1.5 bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <Clock className="w-4 h-4" /> 
                    {new Date(upcomingEvent.eventDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <div className="flex -space-x-3">
                  {eventRsvps.filter(r => r.status === "attending").slice(0, 5).map((rsvp, i) => (
                    <Avatar key={i} className="border-2 border-white/20 w-10 h-10 ring-2 ring-black/20">
                      <AvatarImage src={rsvp.avatar || undefined} />
                      <AvatarFallback>{rsvp.name[0]}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <span className="text-sm font-medium text-white/80">
                  {attendingCount} attending
                </span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-[2rem] text-center min-w-[140px] shadow-lg">
              <span className="block text-xs text-white/80 uppercase tracking-wider font-bold mb-1">Countdown</span>
              <span className="block text-5xl font-heading font-black text-white">
                {calculateDaysUntil(upcomingEvent.eventDate)}
              </span>
              <span className="block text-sm font-medium text-white/80 mb-3">days left</span>
              
              {userRsvp?.status === "attending" ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-white text-sm font-bold mb-2">
                    <Check className="w-4 h-4" /> You're In!
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handleRsvp("declined")}
                    disabled={isRsvping}
                    className="w-full bg-white/20 text-white hover:bg-white/30 rounded-full font-bold shadow-sm"
                  >
                    Can't Make It
                  </Button>
                </div>
              ) : (
                <Button 
                  size="sm" 
                  onClick={() => handleRsvp("attending")}
                  disabled={isRsvping}
                  className="w-full bg-white text-black hover:bg-white/90 rounded-full font-bold shadow-sm"
                >
                  {isRsvping ? "..." : "I'm In!"}
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-[2.5rem] bg-muted shadow-float p-10 text-center">
          <h3 className="text-2xl font-heading font-bold mb-2">No Upcoming Dinners</h3>
          <p className="text-muted-foreground mb-4">Time to plan your next culinary adventure!</p>
          <Button className="rounded-full font-bold">
            Create Event
          </Button>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column: Status & Actions */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Picker Status */}
          {upcomingEvent && (
            <Card className="border-none shadow-soft bg-white/60 backdrop-blur-sm overflow-hidden relative">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl text-foreground/80">
                  <ChefHat className="w-6 h-6 text-primary" strokeWidth={2.5} />
                  Who's Picking?
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="w-20 h-20 border-4 border-white shadow-float">
                    <AvatarFallback>PK</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 bg-primary text-white text-xs px-3 py-1 rounded-full font-bold shadow-sm border-2 border-white">
                    Picker
                  </div>
                </div>
                <div>
                  <p className="font-heading font-bold text-2xl text-foreground">
                    {upcomingEvent.pickerId === user?.id ? "You" : "Someone"}
                  </p>
                  <p className="text-muted-foreground text-base">
                    {upcomingEvent.pickerId === user?.id ? "are" : "is"} calling the shots this month.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <div className="space-y-5">
            <h3 className="font-heading font-bold text-xl text-foreground/80 px-2">Recent Buzz 🐝</h3>
            {SOCIAL_FEED.map((post) => (
              <Card key={post.id} className="border-none shadow-sm hover:shadow-soft transition-all duration-300 bg-white/80">
                <CardContent className="p-5">
                  <div className="flex gap-4">
                    <Avatar className="w-12 h-12 border border-border shadow-sm">
                      <AvatarImage src={post.user.avatar} />
                      <AvatarFallback>{post.user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-base text-foreground">{post.user.name}</span>
                        <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-1 rounded-full">{post.time}</span>
                      </div>
                      
                      {post.type === 'comment' && (
                        <p className="text-base text-foreground/80 leading-relaxed">{post.content}</p>
                      )}
                      
                      {post.type === 'photo' && (
                        <div className="mt-3 space-y-3">
                          <p className="text-base text-foreground/80">{post.content}</p>
                          <div className="rounded-2xl overflow-hidden shadow-sm">
                            <img src={post.image} alt="Post" className="w-full h-56 object-cover hover:scale-105 transition-transform duration-700" />
                          </div>
                        </div>
                      )}

                      <div className="flex gap-6 mt-4">
                        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-medium group">
                          <div className="p-1.5 rounded-full bg-transparent group-hover:bg-primary/10 transition-colors">
                            <Heart className="w-4 h-4" /> 
                          </div>
                          {post.likes}
                        </button>
                        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-medium group">
                          <div className="p-1.5 rounded-full bg-transparent group-hover:bg-primary/10 transition-colors">
                            <MessageSquare className="w-4 h-4" />
                          </div>
                          Reply
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
          <div className="bg-gradient-to-b from-white to-secondary/30 rounded-[2rem] p-6 border border-white shadow-soft text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/5 to-transparent" />
            <img src={ASSETS.mascot} alt="Chef" className="w-40 h-40 mx-auto object-contain mb-2 drop-shadow-xl animate-bounce-slow relative z-10" />
            <h3 className="font-heading font-bold text-xl mb-1">Dining Stats</h3>
            <p className="text-sm text-muted-foreground mb-6">You're on a roll!</p>
            
            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-border/50">
                <span className="block text-xs text-muted-foreground font-bold uppercase tracking-wide mb-1">Dinners</span>
                <span className="block text-3xl font-heading font-bold text-foreground">
                  {user?.stats?.totalDinners || 0}
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-border/50">
                <span className="block text-xs text-muted-foreground font-bold uppercase tracking-wide mb-1">Avg Bill</span>
                <span className="block text-3xl font-heading font-bold text-primary">
                  ${user?.stats?.avgBill || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-[2rem] p-6 border border-white shadow-soft">
            <h3 className="font-heading font-bold text-xl mb-4 px-2">Wishlist</h3>
            <ul className="space-y-2">
              <li className="flex items-center justify-between p-3 hover:bg-white rounded-2xl transition-all duration-300 cursor-pointer group border border-transparent hover:border-border/50 hover:shadow-sm">
                <span className="font-medium text-foreground/90">Mama's Ramen</span>
                <Badge variant="secondary" className="text-[10px] bg-secondary text-secondary-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">Japanese</Badge>
              </li>
              <li className="flex items-center justify-between p-3 hover:bg-white rounded-2xl transition-all duration-300 cursor-pointer group border border-transparent hover:border-border/50 hover:shadow-sm">
                <span className="font-medium text-foreground/90">The Golden Steer</span>
                <Badge variant="secondary" className="text-[10px] bg-secondary text-secondary-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">Steakhouse</Badge>
              </li>
              <li className="flex items-center justify-between p-3 hover:bg-white rounded-2xl transition-all duration-300 cursor-pointer group border border-transparent hover:border-border/50 hover:shadow-sm">
                <span className="font-medium text-foreground/90">Spice Route</span>
                <Badge variant="secondary" className="text-[10px] bg-secondary text-secondary-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">Indian</Badge>
              </li>
            </ul>
            <Button variant="ghost" size="sm" className="w-full mt-4 text-primary hover:bg-primary/5 rounded-xl font-bold">View All</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

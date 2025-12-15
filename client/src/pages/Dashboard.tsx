import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { SOCIAL_FEED, ASSETS } from "@/lib/mockData";
import { Calendar, Clock, MapPin, MessageSquare, Heart, Share2, ChefHat, Check, X, Plus, ExternalLink, ChevronLeft, ChevronRight, Copy, Mail, MessageCircle as MessageCircleIcon, Utensils, CheckCircle2, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import { useEventModal } from "@/lib/event-modal-context";
import { getUpcomingEvents, getPastEvents, getUserRsvp, rsvpToEvent, getEventRsvps, getUserClubs, getWishlist, removeFromWishlist, getEventImageUrl, type Event, type Club, type WishlistRestaurant } from "@/lib/api";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { setIsAddEventOpen, setOnEventCreatedCallback } = useEventModal();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userRsvp, setUserRsvp] = useState<any>(null);
  const [eventRsvps, setEventRsvps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRsvping, setIsRsvping] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [currentClub, setCurrentClub] = useState<Club | null>(null);
  const [copied, setCopied] = useState(false);
  const [wishlist, setWishlist] = useState<WishlistRestaurant[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [allUserRsvps, setAllUserRsvps] = useState<Map<string, any>>(new Map());

  // Current event based on index
  const upcomingEvent = upcomingEvents.length > 0 ? upcomingEvents[currentIndex] : null;

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Register callback for when events are created from the global modal
  useEffect(() => {
    setOnEventCreatedCallback(loadDashboardData);
    return () => setOnEventCreatedCallback(null);
  }, [setOnEventCreatedCallback]);

  // Load RSVPs when current event changes
  useEffect(() => {
    if (upcomingEvent) {
      loadEventRsvps(upcomingEvent.id);
    }
  }, [currentIndex, upcomingEvents]);

  const loadDashboardData = async () => {
    try {
      const [events, clubs, wishlistData, pastEventsData] = await Promise.all([
        getUpcomingEvents(),
        getUserClubs(),
        getWishlist(),
        getPastEvents(),
      ]);
      
      setUpcomingEvents(events);
      setWishlist(wishlistData);
      setPastEvents(pastEventsData);
      
      if (clubs.length > 0) {
        setCurrentClub(clubs[0]);
      }
      
      if (events.length > 0) {
        // Load RSVPs for the first event
        await loadEventRsvps(events[0].id);
        
        // Load user RSVPs for all upcoming events to determine pending decisions
        const rsvpPromises = events.map(async (event) => {
          try {
            const rsvp = await getUserRsvp(event.id);
            return { eventId: event.id, rsvp };
          } catch {
            return { eventId: event.id, rsvp: null };
          }
        });
        const rsvpResults = await Promise.all(rsvpPromises);
        const rsvpMap = new Map<string, any>();
        rsvpResults.forEach(({ eventId, rsvp }) => {
          rsvpMap.set(eventId, rsvp);
        });
        setAllUserRsvps(rsvpMap);
      }
    } catch (error: any) {
      console.error("Failed to load dashboard data:", error);
      // Only show toast for non-auth errors (auth errors handled by apiRequest)
      if (!error.message?.includes("session")) {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadEventRsvps = async (eventId: string) => {
    try {
      const [rsvp, rsvps] = await Promise.all([
        getUserRsvp(eventId),
        getEventRsvps(eventId),
      ]);
      setUserRsvp(rsvp);
      setEventRsvps(rsvps);
    } catch (error: any) {
      console.error("Failed to load RSVPs:", error);
    }
  };

  const handleRsvp = async (status: "attending" | "declined") => {
    if (!upcomingEvent) return;
    
    setIsRsvping(true);
    try {
      await rsvpToEvent(upcomingEvent.id, status);
      toast.success(status === "attending" ? "You're in! 🎉" : "RSVP updated");
      
      // Reload RSVP data
      await loadEventRsvps(upcomingEvent.id);
    } catch (error: any) {
      const message = error.message || "Failed to RSVP";
      // Special handling for capacity errors
      if (message.includes("Event is full")) {
        toast.error("This event is full. You can't RSVP right now.");
      } else {
        toast.error(message);
      }
    } finally {
      setIsRsvping(false);
    }
  };

  // Carousel navigation (circular)
  const goToPrevEvent = () => {
    setCurrentIndex(prev => 
      prev === 0 ? upcomingEvents.length - 1 : prev - 1
    );
  };

  const goToNextEvent = () => {
    setCurrentIndex(prev => 
      prev === upcomingEvents.length - 1 ? 0 : prev + 1
    );
  };

  const calculateDaysUntil = (dateString: string) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    // Reset both to start of day for accurate day comparison
    eventDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    // Clamp to 0 minimum (shouldn't show negative days)
    return Math.max(0, diffDays);
  };

  const getDaysUntilLabel = (days: number) => {
    if (days === 0) return "Today";
    if (days === 1) return "1 day left";
    return `${days} days left`;
  };

  const attendingCount = eventRsvps.filter(r => r.status === "attending").length;
  
  // Capacity display helper
  const getCapacityDisplay = () => {
    if (!upcomingEvent?.maxSeats) {
      return `${attendingCount} attending`;
    }
    const remaining = upcomingEvent.maxSeats - attendingCount;
    if (remaining <= 0) {
      return `${attendingCount} attending · Full`;
    }
    return `${attendingCount} attending · ${remaining} seat${remaining === 1 ? '' : 's'} left`;
  };

  // Invite functionality
  const getInviteText = () => {
    const name = currentClub?.name || "our dinner club";
    const code = currentClub?.joinCode || "";
    return `🍽️ Join my dinner club "${name}" on Restaurant Club!

Use code: ${code}

We use it to organize group dinners, track our favorite spots, and decide who picks the restaurant next.

Sign up at the app and enter the code to join!`;
  };

  const handleCopyInvite = async () => {
    try {
      await navigator.clipboard.writeText(getInviteText());
      setCopied(true);
      toast.success("Invite text copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  const handleRemoveFromWishlist = async (id: string) => {
    try {
      await removeFromWishlist(id);
      setWishlist(prev => prev.filter(item => item.id !== id));
      toast.success("Removed from wishlist");
    } catch (error: any) {
      toast.error(error.message || "Failed to remove from wishlist");
    }
  };

  // "What's Next" helpers
  const nextEvent = upcomingEvents.length > 0 ? upcomingEvents[0] : null;
  const lastEvent = pastEvents.length > 0 ? pastEvents[0] : null;
  
  // Count events needing RSVP decision (no RSVP or status is null/undefined)
  const eventsNeedingRsvp = upcomingEvents.filter(event => {
    const rsvp = allUserRsvps.get(event.id);
    return !rsvp || !rsvp.status;
  });
  const pendingDecisionCount = eventsNeedingRsvp.length;
  const firstEventNeedingRsvp = eventsNeedingRsvp.length > 0 ? eventsNeedingRsvp[0] : null;

  const formatCompactDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatCompactTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  };

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
        <div className="hidden md:flex gap-2">
          <Button 
            onClick={() => setIsAddEventOpen(true)}
            className="gap-2 rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" /> Add Event
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setIsInviteOpen(true)}
            className="gap-2 rounded-full bg-white shadow-sm border border-white/50 text-foreground hover:bg-primary/10 hover:text-primary transition-all hover:scale-105"
          >
          <Share2 className="w-4 h-4" /> Invite Friend
        </Button>
        </div>
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
              src={getEventImageUrl(upcomingEvent, 1200)} 
              alt="Next Event" 
              className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-1000 ease-out" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </div>

          {/* Carousel Navigation Arrows */}
          {upcomingEvents.length > 1 && (
            <>
              <button
                onClick={goToPrevEvent}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white transition-all hover:scale-110"
                aria-label="Previous event"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={goToNextEvent}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white transition-all hover:scale-110"
                aria-label="Next event"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Event Counter Indicator */}
          {upcomingEvents.length > 1 && (
            <div className="absolute top-4 right-4 z-10 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-sm font-medium">
              {currentIndex + 1} / {upcomingEvents.length}
            </div>
          )}
          
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
                  {getCapacityDisplay()}
                </span>
              </div>
              <Button 
                asChild
                variant="ghost" 
                className="mt-4 text-white/80 hover:text-white hover:bg-white/10 rounded-full gap-2"
              >
                <Link href={`/event/${upcomingEvent.id}`}>
                  View Details <ExternalLink className="w-4 h-4" />
                </Link>
              </Button>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-[2rem] text-center min-w-[140px] shadow-lg">
              <span className="block text-xs text-white/80 uppercase tracking-wider font-bold mb-1">Countdown</span>
              {calculateDaysUntil(upcomingEvent.eventDate) === 0 ? (
                <>
                  <span className="block text-3xl font-heading font-black text-white mt-2">🎉</span>
                  <span className="block text-lg font-bold text-white mb-3">Today!</span>
                </>
              ) : (
                <>
              <span className="block text-5xl font-heading font-black text-white">
                {calculateDaysUntil(upcomingEvent.eventDate)}
              </span>
                  <span className="block text-sm font-medium text-white/80 mb-3">
                    {calculateDaysUntil(upcomingEvent.eventDate) === 1 ? "day left" : "days left"}
                  </span>
                </>
              )}
              
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
          <h3 className="text-2xl font-heading font-bold mb-2">
            {currentClub ? "No Upcoming Dinners" : "Welcome to Restaurant Club!"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {currentClub ? "Time to plan your next culinary adventure!" : "Start by creating your first dinner club."}
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
            {currentClub ? (
              <>
                <Button
                  className="rounded-full font-bold"
                  onClick={() => setIsAddEventOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full font-bold bg-white shadow-sm border border-white/50 text-foreground hover:bg-primary/10 hover:text-primary transition-all"
                >
                  <Link href="/join">Join with Code</Link>
                </Button>
              </>
            ) : (
              <>
                <Button
                  asChild
                  className="rounded-full font-bold"
                >
                  <Link href="/create-club">Create Your Club</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full font-bold bg-white shadow-sm border border-white/50 text-foreground hover:bg-primary/10 hover:text-primary transition-all"
                >
                  <Link href="/join">Join with Code</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* What's Next Section */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Next Dinner */}
          <div
            onClick={() => {
              if (nextEvent) {
                navigate(`/event/${nextEvent.id}`);
              } else {
                setIsAddEventOpen(true);
              }
            }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-white/50 shadow-soft cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
          >
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                <Utensils className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Next Dinner</p>
                {nextEvent ? (
                  <>
                    <p className="font-heading font-bold text-foreground truncate">{nextEvent.restaurantName}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCompactDate(nextEvent.eventDate)} · {formatCompactTime(nextEvent.eventDate)}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-foreground">No dinners planned</p>
                    <p className="text-sm text-primary font-medium">Create one →</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Your Actions */}
          <div
            onClick={() => {
              if (firstEventNeedingRsvp) {
                navigate(`/event/${firstEventNeedingRsvp.id}`);
              } else {
                navigate('/social');
              }
            }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-white/50 shadow-soft cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
          >
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl transition-colors ${
                pendingDecisionCount > 0 
                  ? 'bg-amber-100 group-hover:bg-amber-200' 
                  : 'bg-green-100 group-hover:bg-green-200'
              }`}>
                <CheckCircle2 className={`w-5 h-5 ${
                  pendingDecisionCount > 0 ? 'text-amber-600' : 'text-green-600'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Your Actions</p>
                {pendingDecisionCount > 0 ? (
                  <>
                    <p className="font-heading font-bold text-foreground">
                      {pendingDecisionCount} dinner{pendingDecisionCount !== 1 ? 's' : ''} to decide on
                    </p>
                    <p className="text-sm text-amber-600 font-medium">RSVP needed →</p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-foreground">You're all set!</p>
                    <p className="text-sm text-muted-foreground">No decisions pending</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Card 3: Last Dinner */}
          <div
            onClick={() => navigate('/history')}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-white/50 shadow-soft cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
          >
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-secondary/50 rounded-xl group-hover:bg-secondary/70 transition-colors">
                <History className="w-5 h-5 text-foreground/70" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Last Dinner</p>
                {lastEvent ? (
                  <>
                    <p className="font-heading font-bold text-foreground truncate">{lastEvent.restaurantName}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCompactDate(lastEvent.eventDate)}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-foreground">No past dinners yet</p>
                    <p className="text-sm text-muted-foreground">Your history will appear here</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[1.5rem] p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-primary/10 to-secondary/20 p-6 pb-4">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading font-bold flex items-center gap-2">
                <Share2 className="w-6 h-6 text-primary" />
                Invite Friends
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Share this with friends to invite them to {currentClub?.name || "your club"}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-5">
            {/* Join Code Display */}
            {currentClub?.joinCode ? (
              <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-4 text-center">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wide mb-2">Invite Code</p>
                <p className="text-3xl font-heading font-black text-primary tracking-widest">
                  {currentClub.joinCode}
                </p>
              </div>
            ) : (
              <div className="bg-muted/50 rounded-2xl p-4 text-center">
                <p className="text-sm text-muted-foreground">Loading invite code...</p>
              </div>
            )}

            {/* Invite Text Preview */}
            <div className="bg-muted/50 rounded-xl p-4 text-sm text-foreground/80 whitespace-pre-wrap border border-border/50">
              {getInviteText()}
            </div>

            {/* Copy Button */}
            <Button 
              onClick={handleCopyInvite}
              className="w-full rounded-full font-bold h-12 gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" /> Copy Invite Text
                </>
              )}
            </Button>

            {/* Future: Share Options */}
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground text-center mb-3">
                More sharing options coming soon
              </p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" size="icon" className="rounded-full w-10 h-10 opacity-50 cursor-not-allowed" disabled>
                  <Mail className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full w-10 h-10 opacity-50 cursor-not-allowed" disabled>
                  <MessageCircleIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
            {wishlist.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground text-sm mb-2">No saved restaurants yet</p>
                <p className="text-xs text-muted-foreground">Add restaurants to your wishlist from events!</p>
              </div>
            ) : (
            <ul className="space-y-2">
                {wishlist.slice(0, 5).map((item) => (
                  <li key={item.id} className="flex items-center justify-between p-3 hover:bg-white rounded-2xl transition-all duration-300 group border border-transparent hover:border-border/50 hover:shadow-sm">
                    <span className="font-medium text-foreground/90 truncate flex-1">{item.name}</span>
                    <div className="flex items-center gap-2">
                      {item.cuisine && (
                        <Badge variant="secondary" className="text-[10px] bg-secondary text-secondary-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          {item.cuisine}
                        </Badge>
                      )}
                      <button 
                        onClick={() => handleRemoveFromWishlist(item.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded-full"
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </button>
                    </div>
              </li>
                ))}
            </ul>
            )}
            {wishlist.length > 5 && (
              <Button variant="ghost" size="sm" className="w-full mt-4 text-primary hover:bg-primary/5 rounded-xl font-bold">
                View All ({wishlist.length})
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

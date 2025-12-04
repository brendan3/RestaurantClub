import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Home, Map, Users, User, MessageCircle, Plus, Camera } from "lucide-react";
import { ASSETS } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useEventModal } from "@/lib/event-modal-context";
import { getUpcomingEvents, type Event } from "@/lib/api";
import AddEventModal from "@/components/AddEventModal";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { toast } = useToast();
  const { isAddEventOpen, setIsAddEventOpen, onEventCreated } = useEventModal();
  const [nextEvent, setNextEvent] = useState<Event | null>(null);

  // Fetch next upcoming event for the sidebar
  useEffect(() => {
    const fetchNextEvent = async () => {
      try {
        const events = await getUpcomingEvents();
        if (events.length > 0) {
          setNextEvent(events[0]);
        }
      } catch (error) {
        // Silently fail - user might not be logged in yet
      }
    };
    fetchNextEvent();
  }, [location]); // Refetch when location changes

  const handleComingSoon = (feature: string) => {
    toast({
      title: "Coming Soon! 🚀",
      description: `${feature} will be available in the next update.`,
    });
  };

  // Calculate days until event
  const getDaysUntil = (dateString: string) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/social", icon: MessageCircle, label: "Social" },
    // Middle slot reserved for Post button on mobile
    { href: "/history", icon: Map, label: "History" },
    { href: "/profile", icon: User, label: "Me" },
  ];

  // Split items for mobile layout (2 on left, 2 on right)
  const mobileNavLeft = navItems.slice(0, 2);
  const mobileNavRight = navItems.slice(2);

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col md:flex-row max-w-screen-2xl mx-auto overflow-hidden">
      
      {/* Desktop Sidebar - Floating Style */}
      <aside className="hidden md:flex flex-col w-20 lg:w-64 p-4 shrink-0 sticky top-0 h-screen">
        <div className="bg-card/50 h-full rounded-[2rem] border border-white/50 shadow-sm p-4 flex flex-col">
            <Link href="/" className="flex items-center justify-center lg:justify-start gap-3 mb-8 p-2 cursor-pointer hover:opacity-80 transition-opacity">
              <img src={ASSETS.mascot} alt="Mascot" className="w-10 h-10 object-contain drop-shadow-sm hover:scale-110 transition-transform duration-500" />
              <div className="hidden lg:block">
                <h1 className="font-heading font-bold text-xl text-primary leading-tight tracking-tight">Restaurant<br/><span className="text-foreground/80">Club</span></h1>
              </div>
            </Link>

            {/* Desktop Add Event Button */}
            <div className="mb-6 hidden lg:block">
                <Button onClick={() => setIsAddEventOpen(true)} className="w-full rounded-2xl font-bold shadow-soft hover:shadow-lg hover:-translate-y-1 transition-all bg-primary text-white h-12">
                    <Plus className="w-5 h-5 mr-2" /> Add Event
                </Button>
            </div>
            <div className="mb-6 lg:hidden flex justify-center">
                <Button onClick={() => setIsAddEventOpen(true)} size="icon" className="rounded-2xl font-bold shadow-soft bg-primary text-white h-10 w-10">
                    <Plus className="w-5 h-5" />
                </Button>
            </div>

            <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
                const isActive = location === item.href;
                return (
                <Link key={item.href} href={item.href} className={`flex items-center justify-center lg:justify-start gap-3 px-3 py-3 rounded-2xl transition-all duration-300 font-medium group relative ${
                    isActive 
                        ? "bg-white shadow-sm text-primary" 
                        : "text-muted-foreground hover:bg-white/60 hover:text-foreground"
                    }`}>
                    <item.icon className={`w-6 h-6 lg:w-5 lg:h-5 ${isActive ? "fill-current" : "group-hover:scale-110 transition-transform"}`} strokeWidth={2.5} />
                    <span className="hidden lg:block">{item.label}</span>
                    {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full lg:hidden" />}
                </Link>
                );
            })}
            {/* Add Club Link Explicitly for Desktop if not in main items */}
            <Link href="/club" className={`flex items-center justify-center lg:justify-start gap-3 px-3 py-3 rounded-2xl transition-all duration-300 font-medium group relative ${
                    location === "/club" 
                        ? "bg-white shadow-sm text-primary" 
                        : "text-muted-foreground hover:bg-white/60 hover:text-foreground"
                    }`}>
                <Users className={`w-6 h-6 lg:w-5 lg:h-5 ${location === "/club" ? "fill-current" : "group-hover:scale-110 transition-transform"}`} strokeWidth={2.5} />
                <span className="hidden lg:block">Club</span>
            </Link>
            </nav>

            {nextEvent && (
              <div className="mt-auto pt-6 border-t border-border/50 hidden lg:block">
                <Link href={`/event/${nextEvent.id}`}>
                  <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 hover:bg-primary/10 transition-colors cursor-pointer">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Next Up</p>
                    <p className="text-sm font-bold text-foreground">{nextEvent.restaurantName}</p>
                    <p className="text-xs text-primary font-medium mt-1">
                      in {getDaysUntil(nextEvent.eventDate)} day{getDaysUntil(nextEvent.eventDate) !== 1 ? 's' : ''}
                    </p>
                  </div>
                </Link>
              </div>
            )}
        </div>
      </aside>

      {/* Mobile Header */}
      <header 
        className="md:hidden sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/20 px-4 flex items-center justify-between"
        style={{ 
          paddingTop: 'max(3.5rem, calc(env(safe-area-inset-top, 44px) + 0.75rem))',
          paddingBottom: '0.75rem'
        }}
      >
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
           <img src={ASSETS.mascot} alt="Mascot" className="w-8 h-8 object-contain" />
           <span className="font-heading font-bold text-lg text-foreground/90">Restaurant Club</span>
        </Link>
        <div className="flex items-center gap-3">
            {/* Header Add Button */}
            <button onClick={() => setIsAddEventOpen(true)} className="w-9 h-9 rounded-full bg-primary text-white shadow-sm flex items-center justify-center active:scale-95 transition-transform">
                <Plus className="w-5 h-5" />
            </button>
            <Link href="/profile">
                <button className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-foreground/80">
                    <User className="w-4 h-4" />
                </button>
            </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full pb-32 md:pb-0 overflow-x-hidden" style={{ paddingBottom: 'max(8rem, calc(env(safe-area-inset-bottom) + 8rem))' }}>
        <div className="container mx-auto max-w-5xl p-4 md:p-8 pt-4 md:pt-8 animate-in fade-in zoom-in-95 duration-700 ease-out">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav - Curve Style */}
      <nav className="md:hidden fixed left-4 right-4 z-50" style={{ bottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))' }}>
        <div className="absolute inset-0 bg-white/90 backdrop-blur-xl border border-white/50 shadow-float rounded-[2.5rem]" />
        
        <div className="relative flex justify-between items-center px-2 py-2">
            {/* Left Items */}
            {mobileNavLeft.map((item) => {
                const isActive = location === item.href;
                return (
                <Link key={item.href} href={item.href} className={`flex-1 flex flex-col items-center justify-center py-2 rounded-2xl transition-all duration-300 ${
                    isActive ? "text-primary scale-105" : "text-muted-foreground active:scale-95"
                }`}>
                    <item.icon className={`w-6 h-6 ${isActive ? "fill-current" : ""}`} strokeWidth={2.5} />
                </Link>
                );
            })}

            {/* Center Action Button (Floating) */}
            <div className="relative -top-8">
                <button onClick={() => handleComingSoon("Photo Upload")} className="w-16 h-16 rounded-full bg-primary text-white shadow-lg shadow-primary/30 flex items-center justify-center transform transition-transform active:scale-95 border-4 border-background">
                    <Camera className="w-7 h-7" />
                </button>
            </div>

            {/* Right Items */}
            {mobileNavRight.map((item) => {
                const isActive = location === item.href;
                return (
                <Link key={item.href} href={item.href} className={`flex-1 flex flex-col items-center justify-center py-2 rounded-2xl transition-all duration-300 ${
                    isActive ? "text-primary scale-105" : "text-muted-foreground active:scale-95"
                }`}>
                    <item.icon className={`w-6 h-6 ${isActive ? "fill-current" : ""}`} strokeWidth={2.5} />
                </Link>
                );
            })}
        </div>
      </nav>

      {/* Global Add Event Modal */}
      <AddEventModal
        open={isAddEventOpen}
        onOpenChange={setIsAddEventOpen}
        onEventCreated={onEventCreated}
      />
    </div>
  );
}

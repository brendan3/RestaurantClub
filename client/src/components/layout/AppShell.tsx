import { Link, useLocation } from "wouter";
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { Calendar, Camera, ChevronLeft, Home, Map, MessageCircle, Plus, Upload, User, Users } from "lucide-react";
import { ASSETS } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useEventModal } from "@/lib/event-modal-context";
import { getPastEvents, getUpcomingEvents, uploadEventPhoto, type Event } from "@/lib/api";
import AddEventModal from "@/components/AddEventModal";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ToastAction } from "@/components/ui/toast";

export default function AppShell({ children }: { children: ReactNode }) {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { isAddEventOpen, setIsAddEventOpen, addEventDefaults, setAddEventDefaults, onEventCreated } = useEventModal();
  const [nextEvent, setNextEvent] = useState<Event | null>(null);

  // Mobile "Add Photos" flow state (camera button)
  const [isPhotoFlowOpen, setIsPhotoFlowOpen] = useState(false);
  const [photoFlowStep, setPhotoFlowStep] = useState<"photos" | "event" | "done">("photos");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const cleanupPreviews = (urls: string[]) => {
    urls.forEach((u) => {
      try {
        URL.revokeObjectURL(u);
      } catch {
        // ignore
      }
    });
  };

  const resetPhotoFlow = () => {
    setPhotoFlowStep("photos");
    setSelectedEventId(null);
    setSelectedFiles([]);
    cleanupPreviews(previews);
    setPreviews([]);
    setIsUploading(false);
    setIsLoadingEvents(false);
    setUpcomingEvents([]);
    setPastEvents([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openPhotoFlow = () => {
    resetPhotoFlow();
    setIsPhotoFlowOpen(true);
  };

  const handlePickPhotos = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, 4);

    cleanupPreviews(previews);
    setSelectedFiles(fileArray);
    setPreviews(fileArray.map((f) => URL.createObjectURL(f)));
  };

  const selectedEvent = useMemo(() => {
    if (!selectedEventId) return null;
    return (
      upcomingEvents.find((e) => e.id === selectedEventId) ||
      pastEvents.find((e) => e.id === selectedEventId) ||
      null
    );
  }, [selectedEventId, upcomingEvents, pastEvents]);

  const loadEventsForPicker = async () => {
    setIsLoadingEvents(true);
    try {
      const [upcoming, past] = await Promise.all([getUpcomingEvents(), getPastEvents()]);
      setUpcomingEvents(upcoming);
      setPastEvents(past);
    } catch (err) {
      console.error("Failed to load events for picker", err);
      toast({
        title: "Couldn't load your dinners",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const goToEventStep = async () => {
    setPhotoFlowStep("event");
    setSelectedEventId(null);
    await loadEventsForPicker();
  };

  const handleUploadToEvent = async () => {
    if (!selectedEventId || selectedFiles.length === 0) return;
    setIsUploading(true);
    try {
      for (const file of selectedFiles) {
        await uploadEventPhoto(selectedEventId, file);
      }

      const restaurantName = selectedEvent?.restaurantName ?? "your event";
      toast({
        title: "Photos added",
        description: `Photos added to ${restaurantName}.`,
        action: (
          <ToastAction
            altText="View event"
            onClick={() => {
              setIsPhotoFlowOpen(false);
              navigate(`/event/${selectedEventId}`);
            }}
          >
            View event
          </ToastAction>
        ),
      });

      setIsPhotoFlowOpen(false);
      resetPhotoFlow();
    } catch (err: any) {
      console.error("Upload failed", err);
      const msg = err?.message?.includes("not configured")
        ? "Photo uploads not available right now."
        : "Couldn't upload photos. Please try again.";
      toast({
        title: "Upload failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Calculate days until event (clamped to 0 minimum)
  const getDaysUntil = (dateString: string) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    // Reset both to start of day for accurate day comparison
    eventDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Format days until label
  const getDaysLabel = (days: number) => {
    if (days === 0) return "Today!";
    if (days === 1) return "in 1 day";
    return `in ${days} days`;
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
                      {getDaysLabel(getDaysUntil(nextEvent.eventDate))}
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
                <button
                  onClick={openPhotoFlow}
                  className="w-16 h-16 rounded-full bg-primary text-white shadow-lg shadow-primary/30 flex items-center justify-center transform transition-transform active:scale-95 border-4 border-background"
                >
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

      {/* Mobile Photo Upload Flow */}
      <Sheet
        open={isPhotoFlowOpen}
        onOpenChange={(open) => {
          setIsPhotoFlowOpen(open);
          if (!open) resetPhotoFlow();
        }}
      >
        <SheetContent side="bottom" className="rounded-t-[2rem] px-5 pb-6">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            capture="environment"
            className="hidden"
            onChange={handleFilesSelected}
          />

          {photoFlowStep === "photos" && (
            <>
              <SheetHeader className="text-left">
                <SheetTitle className="font-heading">Add dinner photos</SheetTitle>
                <SheetDescription>
                  Take or choose a few photos, then pick which event they’re for.
                </SheetDescription>
              </SheetHeader>

              <div className="mt-4 space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-2xl"
                  onClick={handlePickPhotos}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Take / choose photos
                </Button>

                {previews.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {previews.map((src, idx) => (
                      <div
                        key={src}
                        className="relative aspect-square overflow-hidden rounded-xl bg-muted border border-border/50"
                        aria-label={`Selected photo ${idx + 1}`}
                      >
                        <img src={src} alt={`Selected ${idx + 1}`} className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  {selectedFiles.length > 0 ? `${selectedFiles.length} selected (max 4)` : "Select 1–4 photos"}
                </div>
              </div>

              <SheetFooter className="mt-6">
                <Button
                  type="button"
                  className="w-full rounded-2xl"
                  disabled={selectedFiles.length === 0}
                  onClick={goToEventStep}
                >
                  Next
                </Button>
              </SheetFooter>
            </>
          )}

          {photoFlowStep === "event" && (
            <>
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setPhotoFlowStep("photos")}
                  disabled={isUploading}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
                <div className="text-center">
                  <div className="font-heading font-semibold">Pick an event</div>
                  <div className="text-xs text-muted-foreground">Where should these photos go?</div>
                </div>
                <div className="w-9" aria-hidden="true" />
              </div>

              <div className="mt-4 max-h-[55vh] overflow-y-auto pr-1 space-y-6">
                {isLoadingEvents ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    Loading your dinners…
                  </div>
                ) : upcomingEvents.length === 0 && pastEvents.length === 0 ? (
                  <div className="py-10 text-center">
                    <div className="font-medium">No dinners yet</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Create an event first, then come back to add photos.
                    </div>
                  </div>
                ) : (
                  <>
                    {upcomingEvents.length > 0 && (
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                          Upcoming dinners
                        </div>
                        <div className="space-y-2">
                          {upcomingEvents.map((evt) => {
                            const isSelected = selectedEventId === evt.id;
                            return (
                              <button
                                key={evt.id}
                                type="button"
                                onClick={() => setSelectedEventId(evt.id)}
                                className={`w-full text-left rounded-2xl border px-4 py-3 transition-colors ${
                                  isSelected
                                    ? "border-primary bg-primary/5"
                                    : "border-border/50 hover:bg-muted"
                                }`}
                              >
                                <div className="font-semibold text-foreground">{evt.restaurantName}</div>
                                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {new Date(evt.eventDate).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {pastEvents.length > 0 && (
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                          Past dinners
                        </div>
                        <div className="space-y-2">
                          {pastEvents.map((evt) => {
                            const isSelected = selectedEventId === evt.id;
                            return (
                              <button
                                key={evt.id}
                                type="button"
                                onClick={() => setSelectedEventId(evt.id)}
                                className={`w-full text-left rounded-2xl border px-4 py-3 transition-colors ${
                                  isSelected
                                    ? "border-primary bg-primary/5"
                                    : "border-border/50 hover:bg-muted"
                                }`}
                              >
                                <div className="font-semibold text-foreground">{evt.restaurantName}</div>
                                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {new Date(evt.eventDate).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-2xl"
                  onClick={loadEventsForPicker}
                  disabled={isLoadingEvents || isUploading}
                >
                  Refresh
                </Button>
                <Button
                  type="button"
                  className="flex-[2] rounded-2xl"
                  disabled={!selectedEventId || isUploading || selectedFiles.length === 0}
                  onClick={handleUploadToEvent}
                >
                  {isUploading ? "Uploading..." : "Upload to this event"}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Global Add Event Modal */}
      <AddEventModal
        open={isAddEventOpen}
        defaultValues={addEventDefaults ?? undefined}
        onOpenChange={(open) => {
          setIsAddEventOpen(open);
          if (!open) setAddEventDefaults(null);
        }}
        onEventCreated={onEventCreated}
      />
    </div>
  );
}

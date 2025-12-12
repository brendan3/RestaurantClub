import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Star, MapPin, Calendar, Filter, Search, UtensilsCrossed } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getPastEvents, getEventImageUrl, type Event } from "@/lib/api";
import { toast } from "sonner";

export default function History() {
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadPastEvents();
  }, []);

  const loadPastEvents = async () => {
    try {
      const events = await getPastEvents();
      setPastEvents(events);
    } catch (error: any) {
      console.error("Failed to load past events:", error);
      if (!error.message?.includes("session")) {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Filter events by search query
  const filteredEvents = pastEvents.filter(event => 
    event.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.cuisine?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">Where We've Been 🌎</h1>
          <p className="text-muted-foreground mt-2">A delicious archive of our culinary adventures.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search restaurants..." 
              className="pl-9 rounded-full bg-card border-none shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="rounded-full w-10 h-10 p-0 shrink-0">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading your dining history...</p>
          </div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-20">
          <UtensilsCrossed className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-heading font-bold mb-2">
            {searchQuery ? "No matching dinners found" : "No past dinners yet"}
          </h3>
          <p className="text-muted-foreground">
            {searchQuery 
              ? "Try a different search term." 
              : "Your culinary adventures will appear here after they happen!"}
          </p>
      </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
          <Card key={event.id} className="border-none shadow-soft group overflow-hidden flex flex-col h-full">
              <div className="relative h-48 overflow-hidden bg-muted">
              <img 
                  src={getEventImageUrl(event, 800)} 
                  alt={event.restaurantName} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    // Fallback to placeholder on error
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80";
                  }}
              />
                {event.rating && (
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold shadow-sm text-foreground">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {event.rating}
              </div>
                )}
                {event.cuisine && (
                  <div className="absolute bottom-3 left-3">
                    <Badge className="bg-black/50 hover:bg-black/70 text-white backdrop-blur-md border-none text-[10px]">
                      {event.cuisine}
                  </Badge>
              </div>
                )}
            </div>
            
            <CardContent className="p-5 flex-1">
              <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="font-heading font-bold text-xl text-foreground group-hover:text-primary transition-colors">{event.restaurantName}</h3>
                    {event.location && (
                      <p className="text-sm text-muted-foreground truncate max-w-[200px]">{event.location}</p>
                    )}
                </div>
                  {event.totalBill && (
                <div className="text-right">
                      <span className="block text-sm font-bold text-foreground">${event.totalBill}</span>
                  <span className="block text-[10px] text-muted-foreground">Total Bill</span>
                </div>
                  )}
              </div>
              
              <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                  {new Date(event.eventDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>

                {event.notes && (
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                    {event.notes}
                  </p>
                )}
            </CardContent>

            <CardFooter className="p-5 pt-0 border-t border-border/50 mt-auto">
              <div className="flex items-center justify-between w-full pt-4">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Event</span>
                  </div>
                  <Button asChild variant="ghost" size="sm" className="text-xs h-8 text-primary hover:text-primary hover:bg-primary/10">
                    <Link href={`/event/${event.id}`}>View Details</Link>
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
      )}
    </div>
  );
}

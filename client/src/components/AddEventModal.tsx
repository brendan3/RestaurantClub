import { useState } from "react";
import { CalendarIcon, MapPin, UtensilsCrossed, Clock, Users, FileText, Navigation, Search, Star, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createEvent, searchNearbyRestaurants, type NearbyPlace } from "@/lib/api";
import { toast } from "sonner";

interface AddEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventCreated?: () => void;
}

export default function AddEventModal({ open, onOpenChange, onEventCreated }: AddEventModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    restaurantName: "",
    cuisine: "",
    date: "",
    time: "19:00",
    location: "",
    notes: "",
    maxSeats: "",
  });

  // Nearby restaurant search state
  const [isSearchingNearby, setIsSearchingNearby] = useState(false);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [showNearbyResults, setShowNearbyResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.restaurantName.trim()) {
      toast.error("Restaurant name is required");
      return;
    }
    if (!formData.cuisine.trim()) {
      toast.error("Cuisine type is required");
      return;
    }
    if (!formData.date) {
      toast.error("Date is required");
      return;
    }

    setIsSubmitting(true);
    try {
      // Combine date and time into ISO string
      const eventDateTime = new Date(`${formData.date}T${formData.time}`);
      
      await createEvent({
        restaurantName: formData.restaurantName.trim(),
        cuisine: formData.cuisine.trim(),
        eventDate: eventDateTime.toISOString(),
        location: formData.location.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        maxSeats: formData.maxSeats ? parseInt(formData.maxSeats, 10) : undefined,
      });

      toast.success("Event created! 🎉");
      
      // Reset form
      setFormData({
        restaurantName: "",
        cuisine: "",
        date: "",
        time: "19:00",
        location: "",
        notes: "",
        maxSeats: "",
      });
      
      onOpenChange(false);
      onEventCreated?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to create event");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSearchNearby = async () => {
    setIsSearchingNearby(true);
    setNearbyPlaces([]);
    
    try {
      // Get user's current location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        });
      });

      const { latitude, longitude } = position.coords;
      const result = await searchNearbyRestaurants(latitude, longitude, searchQuery || undefined);
      
      setNearbyPlaces(result.places);
      setShowNearbyResults(true);
      
      if (result.places.length === 0) {
        toast.info("No restaurants found nearby. Try a different search term.");
      }
    } catch (error: any) {
      if (error.code === 1) {
        // Permission denied
        toast.error("Location access denied. Please enable location permissions.");
      } else if (error.code === 2) {
        // Position unavailable
        toast.error("Couldn't determine your location. Please try again.");
      } else if (error.code === 3) {
        // Timeout
        toast.error("Location request timed out. Please try again.");
      } else if (error.message?.includes("Places API not configured")) {
        toast.info("Restaurant search not configured yet. You can still type a name manually.");
      } else {
        // Generic error - could be from Google API or network
        toast.error("Couldn't load nearby restaurants. Please try again.");
      }
    } finally {
      setIsSearchingNearby(false);
    }
  };

  const handleSelectPlace = (place: NearbyPlace) => {
    // Map primaryType to a more readable cuisine format
    const formatCuisine = (primaryType?: string): string | undefined => {
      if (!primaryType) return undefined;
      // Convert snake_case to Title Case (e.g., "italian_restaurant" -> "Italian")
      const cleaned = primaryType
        .replace(/_restaurant$/, "")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      return cleaned;
    };

    setFormData(prev => ({
      ...prev,
      restaurantName: place.name,
      location: place.address,
      cuisine: formatCuisine(place.primaryType) || prev.cuisine,
    }));
    setShowNearbyResults(false);
    setNearbyPlaces([]);
    setSearchQuery("");
    toast.success(`Selected: ${place.name}`);
  };

  // Get tomorrow's date as minimum date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] rounded-[1.5rem] p-0 overflow-hidden flex flex-col">
        <div className="bg-gradient-to-br from-primary/10 to-secondary/20 p-6 pb-4 shrink-0">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading font-bold flex items-center gap-2">
              <UtensilsCrossed className="w-6 h-6 text-primary" />
              Plan a Dinner
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Pick a spot and set the date. Your crew will get notified!
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-5 overflow-y-auto flex-1">
          {/* Find Nearby Restaurants */}
          <div className="space-y-3 p-4 bg-muted/50 rounded-xl border border-border/50">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Navigation className="w-4 h-4 text-primary" />
              Find Nearby Restaurants
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="Search cuisine or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-xl h-10 flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearchNearby();
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleSearchNearby}
                disabled={isSearchingNearby}
                className="rounded-xl h-10 px-4"
              >
                {isSearchingNearby ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            {/* Nearby Results */}
            {showNearbyResults && nearbyPlaces.length > 0 && (
              <div className="max-h-48 overflow-y-auto space-y-1 border border-border/50 rounded-xl bg-white">
                {nearbyPlaces.map((place) => (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => handleSelectPlace(place)}
                    className="w-full text-left p-3 hover:bg-primary/5 transition-colors border-b border-border/30 last:border-b-0"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{place.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{place.address}</p>
                      </div>
                      {place.rating && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {place.rating}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {showNearbyResults && nearbyPlaces.length === 0 && !isSearchingNearby && (
              <p className="text-xs text-muted-foreground text-center py-2">
                No restaurants found. Try a different search or enter manually below.
              </p>
            )}
          </div>

          {/* Restaurant Name */}
          <div className="space-y-2">
            <Label htmlFor="restaurantName" className="text-sm font-medium flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-muted-foreground" />
              Restaurant Name *
            </Label>
            <Input
              id="restaurantName"
              placeholder="e.g., Mama's Ramen House"
              value={formData.restaurantName}
              onChange={handleChange("restaurantName")}
              className="rounded-xl h-11"
            />
          </div>

          {/* Cuisine */}
          <div className="space-y-2">
            <Label htmlFor="cuisine" className="text-sm font-medium">
              Cuisine Type *
            </Label>
            <Input
              id="cuisine"
              placeholder="e.g., Japanese, Italian, Mexican"
              value={formData.cuisine}
              onChange={handleChange("cuisine")}
              className="rounded-xl h-11"
            />
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                Date *
              </Label>
              <Input
                id="date"
                type="date"
                min={minDate}
                value={formData.date}
                onChange={handleChange("date")}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time" className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                Time
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={handleChange("time")}
                className="rounded-xl h-11"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              Location
            </Label>
            <Input
              id="location"
              placeholder="e.g., 123 Main St, New York"
              value={formData.location}
              onChange={handleChange("location")}
              className="rounded-xl h-11"
            />
          </div>

          {/* Max Seats */}
          <div className="space-y-2">
            <Label htmlFor="maxSeats" className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              Max Seats (optional)
            </Label>
            <Input
              id="maxSeats"
              type="number"
              min="1"
              max="50"
              placeholder="e.g., 8"
              value={formData.maxSeats}
              onChange={handleChange("maxSeats")}
              className="rounded-xl h-11 w-32"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              Notes / Description
            </Label>
            <Textarea
              id="notes"
              placeholder="Any special details? Dress code, occasion, menu highlights..."
              value={formData.notes}
              onChange={handleChange("notes")}
              className="rounded-xl min-h-[80px] resize-none"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full font-bold bg-primary hover:bg-primary/90 px-6"
            >
              {isSubmitting ? "Creating..." : "Create Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


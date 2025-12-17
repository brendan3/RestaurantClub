import { useEffect, useState } from "react";
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
import { createEvent, searchNearbyRestaurants, searchRestaurants, getRestaurantPhotoUrl, type NearbyPlace } from "@/lib/api";
import { toast } from "sonner";
import type { AddEventDefaults } from "@/lib/event-modal-context";

/**
 * Geolocation helper that always settles (resolves or rejects) within timeoutMs.
 * This avoids hanging forever in environments where WKWebView never calls the
 * success or error callbacks.
 */
const getCurrentPositionSafe = (timeoutMs = 10000): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      const err: any = new Error("Geolocation not supported");
      err.code = 0;
      console.warn("RC: geolocation NOT available in navigator");
      reject(err);
      return;
    }

    let settled = false;

    const finish = (fn: (value: any) => void, value: any) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      fn(value);
    };

    const timer = setTimeout(() => {
      if (settled) return;
      const err: any = new Error("Geolocation timeout");
      // Align with standard TIMEOUT code (3)
      err.code = 3;
      console.warn("RC: geolocation manual timeout fired");
      finish(reject, err);
    }, timeoutMs);

    console.log("RC: calling navigator.geolocation.getCurrentPosition");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log("RC: geolocation SUCCESS", {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        finish(resolve, pos);
      },
      (error) => {
        console.error("RC: geolocation ERROR", error);
        finish(reject, error);
      },
      {
        enableHighAccuracy: true,
        timeout: timeoutMs,
        maximumAge: 60000,
      }
    );
  });
};

interface AddEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventCreated?: () => void;
  defaultValues?: AddEventDefaults;
}

export default function AddEventModal({ open, onOpenChange, onEventCreated, defaultValues }: AddEventModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    restaurantName: "",
    cuisine: "",
    date: "",
    time: "19:00",
    location: "",
    notes: "",
    maxSeats: "",
    imageUrl: "",
  });

  // Nearby restaurant search state
  const [isSearchingNearby, setIsSearchingNearby] = useState(false);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [showNearbyResults, setShowNearbyResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Selected Google Place info (for photo persistence)
  const [selectedPlace, setSelectedPlace] = useState<{ placeId: string; photoName?: string } | null>(null);

  useEffect(() => {
    if (!open || !defaultValues) return;
    setFormData((prev) => ({
      ...prev,
      restaurantName: defaultValues.restaurantName ?? prev.restaurantName,
      date: defaultValues.date ?? prev.date,
      time: defaultValues.time ?? prev.time,
    }));
    // Defaults represent a manual entry; don't pin to a Google Place
    if (defaultValues.restaurantName) {
      setSelectedPlace(null);
    }
  }, [open, defaultValues?.restaurantName, defaultValues?.date, defaultValues?.time]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.restaurantName.trim()) {
      toast.error("Restaurant name is required");
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
        cuisine: formData.cuisine.trim() || undefined,
        eventDate: eventDateTime.toISOString(),
        location: formData.location.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        maxSeats: formData.maxSeats ? parseInt(formData.maxSeats, 10) : undefined,
        placeId: selectedPlace?.placeId || null,
        placePhotoName: selectedPlace?.photoName || null,
        imageUrl: formData.imageUrl.trim() || undefined,
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
        imageUrl: "",
      });
      setSelectedPlace(null);
      
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
    // Clear selected place if user manually edits restaurant name
    if (field === "restaurantName") {
      setSelectedPlace(null);
    }
  };

  // Build a search query from the form fields and search input
  const buildRestaurantQuery = (): string => {
    const parts: string[] = [];
    
    // Add the search box query first (most specific)
    if (searchQuery.trim()) {
      parts.push(searchQuery.trim());
    }
    
    // Add restaurant name if entered
    if (formData.restaurantName.trim()) {
      parts.push(formData.restaurantName.trim());
    }
    
    // Add cuisine type if entered
    if (formData.cuisine.trim()) {
      parts.push(formData.cuisine.trim());
    }
    
    return parts.join(" ").trim();
  };

  const handleSearchNearby = async () => {
    console.log("RC: handleSearchNearby START");
    setIsSearchingNearby(true);
    setNearbyPlaces([]);
    
    const query = buildRestaurantQuery();
    console.log("RC: built restaurant query", { query });

    try {
      let places: NearbyPlace[];
      let latitude: number | undefined;
      let longitude: number | undefined;
      
      // Try to get user's location (optional for text search)
      try {
        const position = await getCurrentPositionSafe(8000);
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      } catch (geoError: any) {
        console.warn("RC: geolocation failed, falling back", geoError);

        // If we have a query, we can still do text search without location
        if (query) {
          if (geoError.code === 1) {
            toast.info("Location access denied. Searching without location bias.");
          } else if (geoError.code === 2) {
            toast.info("Couldn't determine your location. Searching without location bias.");
          } else if (geoError.code === 3) {
            toast.info("Location request timed out. Searching without location bias.");
          }
          // Continue without lat/lng
        } else {
          // No query and no location - can't do anything
          if (geoError.code === 1) {
            toast.error("Location access denied. Please enable location permissions or enter a search term.");
          } else if (geoError.code === 2) {
            toast.error("Couldn't determine your location. Please try again or enter a search term.");
          } else if (geoError.code === 3) {
            toast.error("Location request timed out. Please try again or enter a search term.");
          } else {
            toast.error("Couldn't access your location. Please try again or enter a search term.");
          }
          setIsSearchingNearby(false);
          console.log("RC: handleSearchNearby EARLY RETURN (no query + no location)");
          return;
        }
      }
      
      // Decide which API to use based on whether we have a query
      if (query) {
        console.log("RC: calling searchRestaurants", { query, latitude, longitude });
        places = await searchRestaurants(query, latitude, longitude);
      } else {
        // Use nearby search (requires location)
        if (latitude === undefined || longitude === undefined) {
          toast.error("Location is required for nearby search. Please enter a search term or allow location access.");
          setIsSearchingNearby(false);
          console.log("RC: handleSearchNearby EARLY RETURN (nearby without location)");
          return;
        }
        console.log("RC: calling searchNearbyRestaurants", { latitude, longitude });
        const result = await searchNearbyRestaurants(latitude, longitude);
        places = result.places;
      }
      
      console.log("RC: places result", { count: places.length });
      setNearbyPlaces(places);
      setShowNearbyResults(true);
      
      if (places.length === 0) {
        toast.info("No restaurants found. Try a different search term.");
      }
    } catch (error: any) {
      console.error("RC: handleSearchNearby ERROR", error);
      if (error.message?.includes("not configured")) {
        toast.info("Restaurant search not configured yet. You can still type a name manually.");
      } else {
        // Generic error - could be from Google API or network
        toast.error("Couldn't load restaurants. Please try again.");
      }
    } finally {
      setIsSearchingNearby(false);
      console.log("RC: handleSearchNearby FINISH");
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
    
    // Capture Google Places info for photo persistence
    setSelectedPlace({
      placeId: place.id,
      photoName: place.photoNames?.[0],
    });
    
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
              Find Restaurants
            </Label>
            <p className="text-xs text-muted-foreground -mt-1">
              Search by name or cuisine, or leave empty to see what's nearby
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., mexican, sushi, La Trattoria..."
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
              <div className="max-h-64 overflow-y-auto space-y-1 border border-border/50 rounded-xl bg-white">
                {nearbyPlaces.map((place) => {
                  const photoUrl = place.photoNames?.length ? getRestaurantPhotoUrl(place.photoNames[0], 200) : undefined;
                  return (
                    <button
                      key={place.id}
                      type="button"
                      onClick={() => handleSelectPlace(place)}
                      className="w-full text-left p-2 hover:bg-primary/5 transition-colors border-b border-border/30 last:border-b-0"
                    >
                      <div className="flex gap-3 items-center">
                        {/* Photo thumbnail */}
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          {photoUrl ? (
                            <img
                              src={photoUrl}
                              alt={place.name}
                              loading="lazy"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Hide broken images
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <UtensilsCrossed className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        
                        {/* Place info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{place.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{place.address}</p>
                          {place.primaryType && (
                            <p className="text-xs text-primary/70 capitalize">
                              {place.primaryType.replace(/_/g, ' ').replace(' restaurant', '')}
                            </p>
                          )}
                        </div>
                        
                        {/* Rating */}
                        {place.rating && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {place.rating}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
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
              Cuisine Type
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

          {/* Cover Image URL */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="text-sm font-medium">
              Cover Image URL (optional)
            </Label>
            <Input
              id="imageUrl"
              placeholder="https://example.com/photo.jpg"
              value={formData.imageUrl}
              onChange={handleChange("imageUrl")}
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

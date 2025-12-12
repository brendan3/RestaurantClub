import { useState, useEffect, useRef } from "react";
import { useRoute, Link } from "wouter";
import { 
  Calendar, Clock, MapPin, Users, ArrowLeft, Edit2, Save, X, 
  Camera, Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { getEventById, updateEvent, getEventRsvps, getUserRsvp, rsvpToEvent, addToWishlist, getEventImageUrl, getEventPhotos, uploadEventPhoto, type EventPhoto } from "@/lib/api";
import { Heart } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export default function EventDetail() {
  const [, params] = useRoute("/event/:id");
  const { user } = useAuth();
  const eventId = params?.id;

  const [event, setEvent] = useState<any>(null);
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [userRsvp, setUserRsvp] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRsvping, setIsRsvping] = useState(false);

  // Notes editing state
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Event recap photo gallery
  const [photos, setPhotos] = useState<EventPhoto[]>([]);
  const [isPhotosLoading, setIsPhotosLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeHeroPhotoIndex, setActiveHeroPhotoIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [addedToWishlist, setAddedToWishlist] = useState(false);

  // Details editing state
  const canEditDetails = user && event && user.id === event.pickerId;
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editValues, setEditValues] = useState({
    restaurantName: "",
    cuisine: "",
    eventDate: "",
    location: "",
    notes: "",
    maxSeats: undefined as number | undefined,
    imageUrl: "",
    rating: undefined as number | undefined,
    totalBill: undefined as number | undefined,
    status: "confirmed" as "pending" | "confirmed" | "past",
  });
  const [isSavingDetails, setIsSavingDetails] = useState(false);

  useEffect(() => {
    if (eventId) {
      loadEventData();
    }
  }, [eventId]);

  useEffect(() => {
    if (!event?.id) return;
    let cancelled = false;

    const loadPhotos = async () => {
      try {
        setIsPhotosLoading(true);
        const res = await getEventPhotos(event.id);
        if (!cancelled) setPhotos(res);
      } catch (err) {
        console.error("Failed to load photos", err);
      } finally {
        if (!cancelled) setIsPhotosLoading(false);
      }
    };

    loadPhotos();
    return () => {
      cancelled = true;
    };
  }, [event?.id]);

  // Keep active hero index in range as photos change
  useEffect(() => {
    if (photos.length === 0) {
      if (activeHeroPhotoIndex !== 0) setActiveHeroPhotoIndex(0);
      return;
    }
    if (activeHeroPhotoIndex > photos.length - 1) {
      setActiveHeroPhotoIndex(0);
    }
  }, [photos.length, activeHeroPhotoIndex]);

  const loadEventData = async () => {
    if (!eventId) return;
    
    try {
      const [eventData, rsvpData, userRsvpData] = await Promise.all([
        getEventById(eventId),
        getEventRsvps(eventId),
        getUserRsvp(eventId),
      ]);
      
      setEvent(eventData);
      setRsvps(rsvpData);
      setUserRsvp(userRsvpData);
      setNotesValue(eventData.notes || "");
      setEditValues({
        restaurantName: eventData.restaurantName || "",
        cuisine: eventData.cuisine || "",
        eventDate: eventData.eventDate || "",
        location: eventData.location || "",
        notes: eventData.notes || "",
        maxSeats: eventData.maxSeats ?? undefined,
        imageUrl: eventData.imageUrl || "",
        rating: eventData.rating ?? undefined,
        totalBill: eventData.totalBill ?? undefined,
        status: eventData.status,
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to load event");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDetails = async () => {
    if (!eventId) return;
    setIsSavingDetails(true);
    try {
      const updated = await updateEvent(eventId, {
        restaurantName: editValues.restaurantName,
        cuisine: editValues.cuisine,
        eventDate: editValues.eventDate ? new Date(editValues.eventDate).toISOString() : undefined,
        location: editValues.location,
        notes: editValues.notes,
        maxSeats: editValues.maxSeats,
        imageUrl: editValues.imageUrl,
        rating: editValues.rating,
        totalBill: editValues.totalBill,
        status: editValues.status,
      });
      setEvent(updated);
      setNotesValue(updated.notes || "");
      setIsEditingDetails(false);
      toast.success("Event details updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to update event");
    } finally {
      setIsSavingDetails(false);
    }
  };

  const handleRsvp = async (status: "attending" | "declined") => {
    if (!eventId) return;
    
    setIsRsvping(true);
    try {
      await rsvpToEvent(eventId, status);
      toast.success(status === "attending" ? "You're in! 🎉" : "RSVP updated");
      
      const [rsvpData, userRsvpData] = await Promise.all([
        getEventRsvps(eventId),
        getUserRsvp(eventId),
      ]);
      setRsvps(rsvpData);
      setUserRsvp(userRsvpData);
    } catch (error: any) {
      const message = error.message || "Failed to RSVP";
      // Special handling for capacity errors
      if (message.includes("Event is full")) {
        toast.error("This event is full. You can't RSVP right now.");
        // Reload RSVPs to update the UI with current state
        const rsvpData = await getEventRsvps(eventId);
        setRsvps(rsvpData);
      } else {
        toast.error(message);
      }
    } finally {
      setIsRsvping(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!eventId) return;
    
    setIsSavingNotes(true);
    try {
      const updated = await updateEvent(eventId, { notes: notesValue });
      setEvent(updated);
      setIsEditingNotes(false);
      toast.success("Notes saved!");
    } catch (error: any) {
      toast.error(error.message || "Failed to save notes");
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleCancelEditNotes = () => {
    setNotesValue(event?.notes || "");
    setIsEditingNotes(false);
  };

  const isPastEvent = !!event && new Date(event.eventDate) < new Date();
  const hasRecapPhotos = isPastEvent && photos.length > 0;

  const heroImageUrl = (() => {
    // If event is in the past and we have recap photos, use them
    if (hasRecapPhotos) {
      return photos[activeHeroPhotoIndex]?.imageUrl ?? photos[0].imageUrl;
    }
    // Otherwise, fallback to existing behavior
    return event ? getEventImageUrl(event, 1200) : undefined;
  })();

  const goToPrevHeroPhoto = () => {
    if (photos.length <= 1) return;
    setActiveHeroPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const goToNextHeroPhoto = () => {
    if (photos.length <= 1) return;
    setActiveHeroPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const handlePhotoClick = () => {
    if (!isPastEvent) return;
    fileInputRef.current?.click();
  };

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !event) return;

    const fileArray = Array.from(files).filter(f => f.type.startsWith("image/")).slice(0, 4);
    if (fileArray.length === 0) return;

    setIsUploading(true);
    try {
      const uploaded: EventPhoto[] = [];
      for (const file of fileArray) {
        const photo = await uploadEventPhoto(event.id, file);
        uploaded.push(photo);
      }
      // newest first in UI
      setPhotos(prev => [...uploaded, ...prev]);
      setActiveHeroPhotoIndex(0);
      toast.success(`Uploaded ${uploaded.length} photo${uploaded.length !== 1 ? "s" : ""}`);
    } catch (err: any) {
      console.error("Upload failed", err);
      const msg = err?.message?.includes("not configured")
        ? "Photo uploads not available right now."
        : "Failed to upload photos. Please try again.";
      toast.error(msg);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleAddToWishlist = async () => {
    if (!event) return;
    
    setIsAddingToWishlist(true);
    try {
      await addToWishlist({
        name: event.restaurantName,
        cuisine: event.cuisine || null,
        address: event.location || null,
      });
      setAddedToWishlist(true);
      toast.success("Added to wishlist! 💖");
    } catch (error: any) {
      toast.error(error.message || "Failed to add to wishlist");
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  // no preview cleanup needed (Cloudinary URLs)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-heading font-bold mb-2">Event Not Found</h2>
        <p className="text-muted-foreground mb-4">This event doesn't exist or you don't have access.</p>
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    );
  }

  const attendingCount = rsvps.filter(r => r.status === "attending").length;
  const eventDate = new Date(event.eventDate);
  
  // Capacity display helper
  const getCapacityDisplay = () => {
    if (!event.maxSeats) {
      return `${attendingCount} attending`;
    }
    const remaining = event.maxSeats - attendingCount;
    if (remaining <= 0) {
      return `${attendingCount} attending · Full`;
    }
    return `${attendingCount} attending · ${remaining} seat${remaining === 1 ? '' : 's'} left`;
  };

  const isFull = event.maxSeats && attendingCount >= event.maxSeats;

  const formatDateTimeLocal = (value: string) => {
    if (!value) return "";
    const d = new Date(value);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Button variant="ghost" asChild className="gap-2 -ml-2">
        <Link href="/">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </Button>

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-foreground text-background shadow-float">
        <div className="absolute inset-0">
          <img 
            src={heroImageUrl} 
            alt={event.restaurantName} 
            className="w-full h-full object-cover opacity-50" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>

        {/* Hero gallery controls (past events with recap photos) */}
        {hasRecapPhotos && photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={goToPrevHeroPhoto}
              aria-label="Previous photo"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white transition-all hover:scale-110"
            >
              <span className="sr-only">Previous</span>
              ‹
            </button>
            <button
              type="button"
              onClick={goToNextHeroPhoto}
              aria-label="Next photo"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white transition-all hover:scale-110"
            >
              <span className="sr-only">Next</span>
              ›
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-4 right-4 z-10 flex gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full">
              {photos.map((p, idx) => (
                <button
                  key={p.id}
                  type="button"
                  aria-label={`Show photo ${idx + 1}`}
                  onClick={() => setActiveHeroPhotoIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx === activeHeroPhotoIndex ? "bg-white" : "bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          </>
        )}
        
        <div className="relative p-8 md:p-10 min-h-[300px] flex flex-col justify-end">
          <Badge className="bg-white/20 backdrop-blur-md text-white hover:bg-white/30 border-none px-4 py-1.5 text-sm font-medium rounded-full w-fit mb-4">
            {event.cuisine}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-3 text-white">
            {event.restaurantName}
          </h1>
          <div className="flex flex-wrap gap-4 text-white/90 font-medium">
            <span className="flex items-center gap-1.5 bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full">
              <Calendar className="w-4 h-4" /> 
              {eventDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
            <span className="flex items-center gap-1.5 bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full">
              <Clock className="w-4 h-4" /> 
              {eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </span>
            {event.location && (
              <span className="flex items-center gap-1.5 bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full">
                <MapPin className="w-4 h-4" /> 
                {event.location}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Editable Details */}
          <Card className="border-none shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 font-heading">
                🧾 Event Details
              </CardTitle>
              {canEditDetails && (
                !isEditingDetails ? (
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => setIsEditingDetails(true)}>
                    <Edit2 className="w-4 h-4 mr-1" /> Edit details
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" className="rounded-full" onClick={() => {
                      setEditValues({
                        restaurantName: event.restaurantName || "",
                        cuisine: event.cuisine || "",
                        eventDate: event.eventDate || "",
                        location: event.location || "",
                        notes: event.notes || "",
                        maxSeats: event.maxSeats ?? undefined,
                        imageUrl: event.imageUrl || "",
                        rating: event.rating ?? undefined,
                        totalBill: event.totalBill ?? undefined,
                        status: event.status,
                      });
                      setIsEditingDetails(false);
                    }}>
                      <X className="w-4 h-4 mr-1" /> Cancel
                    </Button>
                    <Button size="sm" className="rounded-full" onClick={handleSaveDetails} disabled={isSavingDetails}>
                      <Save className="w-4 h-4 mr-1" /> {isSavingDetails ? "Saving..." : "Save"}
                    </Button>
                  </div>
                )
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditingDetails ? (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Restaurant Name</label>
                      <input
                        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                        value={editValues.restaurantName}
                        onChange={(e) => setEditValues(prev => ({ ...prev, restaurantName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Cuisine</label>
                      <input
                        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                        value={editValues.cuisine}
                        onChange={(e) => setEditValues(prev => ({ ...prev, cuisine: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date & Time</label>
                      <input
                        type="datetime-local"
                        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                        value={formatDateTimeLocal(editValues.eventDate)}
                        onChange={(e) => setEditValues(prev => ({ ...prev, eventDate: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Location</label>
                      <input
                        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                        value={editValues.location}
                        onChange={(e) => setEditValues(prev => ({ ...prev, location: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Cover Image URL</label>
                      <input
                        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                        value={editValues.imageUrl}
                        onChange={(e) => setEditValues(prev => ({ ...prev, imageUrl: e.target.value }))}
                        placeholder="https://example.com/photo.jpg"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Max Seats</label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                        value={editValues.maxSeats ?? ""}
                        onChange={(e) => setEditValues(prev => ({ ...prev, maxSeats: e.target.value ? parseInt(e.target.value, 10) : undefined }))}
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Rating (1-5)</label>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        step={0.1}
                        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                        value={editValues.rating ?? ""}
                        onChange={(e) => setEditValues(prev => ({ ...prev, rating: e.target.value ? parseFloat(e.target.value) : undefined }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Total Bill</label>
                      <input
                        type="number"
                        min={0}
                        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                        value={editValues.totalBill ?? ""}
                        onChange={(e) => setEditValues(prev => ({ ...prev, totalBill: e.target.value ? parseFloat(e.target.value) : undefined }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <select
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                      value={editValues.status}
                      onChange={(e) => setEditValues(prev => ({ ...prev, status: e.target.value as "pending" | "confirmed" | "past" }))}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="past">Past</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notes</label>
                    <Textarea
                      value={editValues.notes}
                      onChange={(e) => setEditValues(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Add notes about this event... dress code, menu highlights, special occasion, etc."
                      className="min-h-[100px] rounded-xl resize-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <p className="font-semibold text-foreground">Restaurant</p>
                    <p>{event.restaurantName}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Cuisine</p>
                    <p>{event.cuisine}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Date</p>
                    <p>{eventDate.toLocaleString()}</p>
                  </div>
                  {event.location && (
                    <div>
                      <p className="font-semibold text-foreground">Location</p>
                      <p>{event.location}</p>
                    </div>
                  )}
                  {event.maxSeats && (
                    <div>
                      <p className="font-semibold text-foreground">Capacity</p>
                      <p>{event.maxSeats} seats</p>
                    </div>
                  )}
                  {event.totalBill && (
                    <div>
                      <p className="font-semibold text-foreground">Total Bill</p>
                      <p>${event.totalBill}</p>
                    </div>
                  )}
                  {event.rating && (
                    <div>
                      <p className="font-semibold text-foreground">Rating</p>
                      <p>{event.rating}/5</p>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-foreground">Status</p>
                    <p className="capitalize">{event.status}</p>
                  </div>
                  {event.notes && (
                    <div className="md:col-span-2">
                      <p className="font-semibold text-foreground">Notes</p>
                      <p className="text-muted-foreground whitespace-pre-wrap">{event.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          {/* Notes Section */}
          <Card className="border-none shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 font-heading">
                📝 Notes
              </CardTitle>
              {!isEditingNotes ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsEditingNotes(true)}
                  className="gap-1 text-muted-foreground hover:text-primary"
                >
                  <Edit2 className="w-4 h-4" /> Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleCancelEditNotes}
                    disabled={isSavingNotes}
                    className="gap-1"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes}
                    className="gap-1 bg-primary"
                  >
                    <Save className="w-4 h-4" /> {isSavingNotes ? "Saving..." : "Save"}
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {isEditingNotes ? (
                <Textarea
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  placeholder="Add notes about this event... dress code, menu highlights, special occasion, etc."
                  className="min-h-[120px] rounded-xl resize-none"
                  autoFocus
                />
              ) : (
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {event.notes || "No notes yet. Click Edit to add some!"}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Photos Section */}
          <Card className="border-none shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading">
                <Camera className="w-5 h-5 text-primary" />
                Photos
              </CardTitle>
              {isPastEvent ? (
                <p className="text-xs text-muted-foreground">Add recap photos after your dinner.</p>
              ) : (
                <p className="text-xs text-muted-foreground">Recap photos unlock after this dinner happens.</p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Scrollable gallery */}
              {isPhotosLoading ? (
                <p className="text-sm text-muted-foreground">Loading photos…</p>
              ) : photos.length > 0 ? (
                <div className="overflow-x-auto pb-2">
                  <div className="flex gap-3">
                    {photos.map((photo, idx) => (
                      <div
                        key={photo.id}
                        className="relative flex-shrink-0 w-32 h-32 rounded-xl overflow-hidden border border-muted/40 bg-muted"
                      >
                        <img
                          src={photo.imageUrl}
                          alt="Event photo"
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onClick={() => setActiveHeroPhotoIndex(idx)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No recap photos yet.
                </p>
              )}

              {/* Upload area */}
              {isPastEvent ? (
                <button
                  type="button"
                  onClick={handlePhotoClick}
                  disabled={isUploading}
                  className="w-full border-2 border-dashed border-muted-foreground/20 rounded-2xl py-8 flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-colors disabled:opacity-60"
                >
                  <span className="text-2xl">📷</span>
                  <span className="text-sm font-medium">
                    {isUploading ? "Uploading..." : "Upload Photos"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Up to 3–4 images per dinner
                  </span>
                </button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Come back after{" "}
                  {new Date(event.eventDate).toLocaleDateString()} to add your recap.
                </p>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFilesSelected}
                className="hidden"
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* RSVP Card */}
          <Card className="border-none shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading">
                <Users className="w-5 h-5 text-primary" />
                Who's Coming?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Capacity Display */}
              <div className={`text-sm font-medium text-center py-2 px-3 rounded-full ${
                isFull 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-primary/10 text-primary'
              }`}>
                {getCapacityDisplay()}
              </div>

              {/* Attendee List */}
              <div className="space-y-3">
                {rsvps.filter(r => r.status === "attending").map(rsvp => (
                  <div key={rsvp.id} className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border-2 border-background shadow-sm">
                      <AvatarImage src={rsvp.avatar || undefined} />
                      <AvatarFallback>{rsvp.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{rsvp.name}</p>
                    </div>
                    <Check className="w-4 h-4 text-green-500" />
                  </div>
                ))}
                
                {attendingCount === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No RSVPs yet. Be the first!
                  </p>
                )}
              </div>

              {/* Max Seats Progress Bar */}
              {event.maxSeats && (
                <div className="space-y-1">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        isFull ? 'bg-red-500' : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min((attendingCount / event.maxSeats) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    {attendingCount} / {event.maxSeats} seats
                  </p>
                </div>
              )}

              {/* RSVP Buttons */}
              <div className="pt-2">
                {userRsvp?.status === "attending" ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-green-600 font-medium py-2">
                      <Check className="w-5 h-5" /> You're attending!
                    </div>
                    <Button 
                      variant="outline"
                      className="w-full rounded-full"
                      onClick={() => handleRsvp("declined")}
                      disabled={isRsvping}
                    >
                      Can't Make It
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="w-full rounded-full bg-primary font-bold"
                    onClick={() => handleRsvp("attending")}
                    disabled={isRsvping || (isFull && userRsvp?.status !== "attending")}
                  >
                    {isRsvping ? "..." : isFull ? "Event Full" : "I'm In! 🎉"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Add to Wishlist */}
          <Button
            variant="outline"
            className="w-full rounded-full gap-2"
            onClick={handleAddToWishlist}
            disabled={isAddingToWishlist || addedToWishlist}
          >
            <Heart className={`w-4 h-4 ${addedToWishlist ? 'fill-red-500 text-red-500' : ''}`} />
            {addedToWishlist ? "In Wishlist" : isAddingToWishlist ? "Adding..." : "Add to Wishlist"}
          </Button>

          {/* Event Info */}
          <Card className="border-none shadow-soft bg-gradient-to-br from-card to-secondary/20">
            <CardContent className="pt-6 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-bold mb-1">Status</p>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                  {event.status === "confirmed" ? "Confirmed" : event.status}
                </Badge>
              </div>
              
              {event.rating && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-bold mb-1">Rating</p>
                  <p className="text-2xl font-bold">⭐ {event.rating}/5</p>
                </div>
              )}
              
              {event.totalBill && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-bold mb-1">Total Bill</p>
                  <p className="text-2xl font-bold">${event.totalBill}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


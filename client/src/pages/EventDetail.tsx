import { useState, useEffect, useRef } from "react";
import { useRoute, Link } from "wouter";
import { 
  Calendar, Clock, MapPin, Users, ArrowLeft, Edit2, Save, X, 
  Camera, Image as ImageIcon, Trash2, Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { getEventById, updateEvent, getEventRsvps, getUserRsvp, rsvpToEvent, addToWishlist } from "@/lib/api";
import { Heart } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

interface PhotoPreview {
  id: string;
  file: File;
  preview: string;
}

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

  // Photo upload state (client-side only for now)
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [addedToWishlist, setAddedToWishlist] = useState(false);

  useEffect(() => {
    if (eventId) {
      loadEventData();
    }
  }, [eventId]);

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
    } catch (error: any) {
      toast.error(error.message || "Failed to load event");
    } finally {
      setIsLoading(false);
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

  // Photo handling (client-side preview only)
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPhotos: PhotoPreview[] = [];
    
    Array.from(files).forEach(file => {
      if (file.type.startsWith("image/")) {
        const preview = URL.createObjectURL(file);
        newPhotos.push({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
          preview,
        });
      }
    });

    setPhotos(prev => [...prev, ...newPhotos]);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (newPhotos.length > 0) {
      toast.success(`${newPhotos.length} photo(s) added (preview only)`);
    }
  };

  const handleRemovePhoto = (photoId: string) => {
    setPhotos(prev => {
      const photo = prev.find(p => p.id === photoId);
      if (photo) {
        URL.revokeObjectURL(photo.preview);
      }
      return prev.filter(p => p.id !== photoId);
    });
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

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      photos.forEach(photo => URL.revokeObjectURL(photo.preview));
    };
  }, []);

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
            src={event.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80"} 
            alt={event.restaurantName} 
            className="w-full h-full object-cover opacity-50" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
        
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
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Photo Grid */}
              {photos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photos.map(photo => (
                    <div 
                      key={photo.id} 
                      className="relative group aspect-square rounded-xl overflow-hidden bg-muted"
                    >
                      <img 
                        src={photo.preview} 
                        alt="Event photo" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleRemovePhoto(photo.id)}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {/* Preview indicator */}
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded-full">
                        Preview
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Button */}
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-muted-foreground/20 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="w-10 h-10 text-muted-foreground mb-3" />
                <p className="font-medium text-foreground mb-1">Upload Photos</p>
                <p className="text-sm text-muted-foreground text-center">
                  Click to select images from your device
                </p>
                <p className="text-xs text-muted-foreground/60 mt-2">
                  (Preview only — real storage coming soon)
                </p>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoSelect}
                className="hidden"
              />

              {/* TODO: Integrate real photo storage (S3, Supabase, etc.)
                  When implementing:
                  1. Upload files to storage on selection
                  2. Store URLs in event.photos array in DB
                  3. Load existing photos from event data
                  4. Handle delete by removing from storage + DB
              */}
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


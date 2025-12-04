import { useState } from "react";
import { CalendarIcon, MapPin, UtensilsCrossed, Clock, Users, FileText } from "lucide-react";
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
import { createEvent } from "@/lib/api";
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
              autoFocus
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


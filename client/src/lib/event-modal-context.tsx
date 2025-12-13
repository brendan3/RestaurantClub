import { createContext, useContext, useState, useRef, useCallback, ReactNode } from "react";

export type AddEventDefaults = {
  restaurantName?: string;
  date?: string; // YYYY-MM-DD (local)
  time?: string; // HH:mm (local)
};

interface EventModalContextType {
  isAddEventOpen: boolean;
  setIsAddEventOpen: (open: boolean) => void;
  addEventDefaults: AddEventDefaults | null;
  setAddEventDefaults: (defaults: AddEventDefaults | null) => void;
  isInviteOpen: boolean;
  setIsInviteOpen: (open: boolean) => void;
  // Callback that gets called when an event is created
  onEventCreated: () => void;
  setOnEventCreatedCallback: (callback: (() => void) | null) => void;
}

const EventModalContext = createContext<EventModalContextType | undefined>(undefined);

export function EventModalProvider({ children }: { children: ReactNode }) {
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [addEventDefaults, setAddEventDefaults] = useState<AddEventDefaults | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const onEventCreatedRef = useRef<(() => void) | null>(null);

  const setOnEventCreatedCallback = useCallback((callback: (() => void) | null) => {
    onEventCreatedRef.current = callback;
  }, []);

  const onEventCreated = useCallback(() => {
    onEventCreatedRef.current?.();
  }, []);

  return (
    <EventModalContext.Provider value={{ 
      isAddEventOpen, 
      setIsAddEventOpen,
      addEventDefaults,
      setAddEventDefaults,
      isInviteOpen,
      setIsInviteOpen,
      onEventCreated,
      setOnEventCreatedCallback,
    }}>
      {children}
    </EventModalContext.Provider>
  );
}

export function useEventModal() {
  const context = useContext(EventModalContext);
  if (context === undefined) {
    throw new Error("useEventModal must be used within an EventModalProvider");
  }
  return context;
}


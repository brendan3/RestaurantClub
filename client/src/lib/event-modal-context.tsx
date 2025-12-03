import { createContext, useContext, useState, ReactNode } from "react";

interface EventModalContextType {
  isAddEventOpen: boolean;
  setIsAddEventOpen: (open: boolean) => void;
  isInviteOpen: boolean;
  setIsInviteOpen: (open: boolean) => void;
}

const EventModalContext = createContext<EventModalContextType | undefined>(undefined);

export function EventModalProvider({ children }: { children: ReactNode }) {
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  return (
    <EventModalContext.Provider value={{ 
      isAddEventOpen, 
      setIsAddEventOpen,
      isInviteOpen,
      setIsInviteOpen
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


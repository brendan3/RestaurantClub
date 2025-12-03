import { PAST_EVENTS } from "@/lib/mockData";
import { Link } from "wouter";
import { Star, MapPin, Calendar, Filter, Search } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function History() {
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
            <Input placeholder="Search restaurants..." className="pl-9 rounded-full bg-card border-none shadow-sm" />
          </div>
          <Button variant="outline" className="rounded-full w-10 h-10 p-0 shrink-0">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {["All Cuisines", "Italian", "Japanese", "Mexican", "American", "Thai", "Indian"].map((tag, i) => (
          <Badge 
            key={tag} 
            variant={i === 0 ? "default" : "secondary"} 
            className={`rounded-full px-4 py-2 text-sm cursor-pointer whitespace-nowrap ${i === 0 ? "bg-primary hover:bg-primary/90" : "bg-card hover:bg-muted"}`}
          >
            {tag}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PAST_EVENTS.map((event) => (
          <Card key={event.id} className="border-none shadow-soft group overflow-hidden flex flex-col h-full">
            <div className="relative h-48 overflow-hidden">
              <img 
                src={event.image} 
                alt={event.restaurant} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold shadow-sm text-foreground">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {event.rating}
              </div>
              <div className="absolute bottom-3 left-3 flex gap-1">
                {event.tags.map(tag => (
                  <Badge key={tag} className="bg-black/50 hover:bg-black/70 text-white backdrop-blur-md border-none text-[10px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            <CardContent className="p-5 flex-1">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-heading font-bold text-xl text-foreground group-hover:text-primary transition-colors">{event.restaurant}</h3>
                  <p className="text-sm text-muted-foreground">{event.cuisine}</p>
                </div>
                <div className="text-right">
                  <span className="block text-sm font-bold text-foreground">${event.bill}</span>
                  <span className="block text-[10px] text-muted-foreground">Total Bill</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {new Date(event.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
            </CardContent>

            <CardFooter className="p-5 pt-0 border-t border-border/50 mt-auto">
              <div className="flex items-center justify-between w-full pt-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Picked by</span>
                  <div className="flex items-center gap-1.5">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={event.picker.avatar} />
                      <AvatarFallback>PK</AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium">{event.picker.name}</span>
                  </div>
                </div>
                <Button asChild variant="ghost" size="sm" className="text-xs h-8 text-primary hover:text-primary hover:bg-primary/10">
                  <Link href={`/event/${event.id}`}>View Details</Link>
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { SUPERLATIVES, ASSETS } from "@/lib/mockData";
import { Link } from "wouter";
import { Trophy, Crown, Plus, Users as UsersIcon, Copy, Check, Share2, Mail, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getUserClubs, getWishlist, type Club as ClubType, type WishlistRestaurant } from "@/lib/api";
import { toast } from "sonner";
import { useEventModal } from "@/lib/event-modal-context";

export default function Club() {
  const [clubs, setClubs] = useState<ClubType[]>([]);
  const [wishlist, setWishlist] = useState<WishlistRestaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { setIsAddEventOpen } = useEventModal();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userClubs, wishlistData] = await Promise.all([
        getUserClubs(),
        getWishlist(),
      ]);
      setClubs(userClubs);
      setWishlist(wishlistData);
    } catch (error: any) {
      toast.error(error.message || "Failed to load clubs");
    } finally {
      setIsLoading(false);
    }
  };

  const getInviteText = (club: ClubType) => {
    const code = club.joinCode || "";
    return `🍽️ Join my dinner club "${club.name}" on Restaurant Club!

Use code: ${code}

We use it to organize group dinners, track our favorite spots, and decide who picks the restaurant next.

Sign up at the app and enter the code to join!`;
  };

  const handleCopyInvite = async () => {
    if (clubs.length === 0) return;
    
    try {
      await navigator.clipboard.writeText(getInviteText(clubs[0]));
      setCopied(true);
      toast.success("Invite text copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading club...</p>
        </div>
      </div>
    );
  }

  // If user has no club, show create club or join club prompt
  if (clubs.length === 0) {
    return (
      <div className="space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <img src={ASSETS.mascot} alt="Mascot" className="w-24 h-24 mx-auto object-contain animate-bounce-slow" />
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">Join the Fun!</h1>
          <p className="text-muted-foreground text-lg">You're not part of a club yet. Start your culinary journey!</p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <Button asChild className="rounded-full font-bold bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <Link href="/create-club">
                <Plus className="w-4 h-4 mr-2" /> Create Your Club
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full font-bold shadow-sm hover:shadow-md transition-all hover:scale-105">
              <Link href="/join">
                <UsersIcon className="w-4 h-4 mr-2" /> Join with Code
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const club = clubs[0]; // MVP: one club per user

  return (
    <div className="space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <img src={ASSETS.mascot} alt="Mascot" className="w-24 h-24 mx-auto object-contain animate-bounce-slow" />
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">{club.name}</h1>
        <p className="text-muted-foreground text-lg">
          Est. {new Date(club.createdAt).getFullYear()} • {club.members} Member{club.members !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Members List */}
        <Card className="border-none shadow-soft h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading">
              <UsersIcon className="w-5 h-5 text-primary" />
              The Squad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {club.membersList.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 border-2 border-background shadow-sm">
                    <AvatarImage src={member.avatar || undefined} />
                    <AvatarFallback>{member.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-foreground">{member.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{member.role || 'Member'}</p>
                  </div>
                </div>
                {member.role === "owner" && (
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none">
                    <Crown className="w-3 h-3 mr-1" />
                    Owner
                  </Badge>
                )}
              </div>
            ))}
            <Button 
              variant="outline" 
              className="w-full mt-4 border-dashed border-2 h-12 text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5"
              onClick={() => setIsInviteOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" /> Invite New Member
            </Button>
          </CardContent>
        </Card>

        {/* Superlatives */}
        <Card className="border-none shadow-soft h-full bg-gradient-to-br from-card to-secondary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Hall of Fame
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {SUPERLATIVES.map((award, i) => (
              <div key={i} className="bg-card/80 backdrop-blur-sm p-4 rounded-xl border shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 shrink-0">
                  <award.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wide">{award.title}</p>
                  <p className="font-bold text-lg text-foreground">{award.winner}</p>
                </div>
                <Crown className="w-5 h-5 text-yellow-400 opacity-20" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Wishlist Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-heading font-bold">Wishlist</h2>
          <Button size="sm" onClick={() => setIsAddEventOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> Plan Event
          </Button>
        </div>
        {wishlist.length === 0 ? (
          <div className="bg-card p-8 rounded-xl border shadow-sm text-center">
            <p className="text-muted-foreground mb-2">No saved restaurants yet</p>
            <p className="text-xs text-muted-foreground">Add restaurants to your wishlist from event pages!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {wishlist.slice(0, 6).map((spot) => (
              <div key={spot.id} className="bg-card p-4 rounded-xl border shadow-sm flex justify-between items-center">
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{spot.name}</p>
                  {spot.cuisine && (
                    <p className="text-xs text-muted-foreground">{spot.cuisine}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {wishlist.length > 6 && (
          <Button variant="ghost" size="sm" className="w-full text-primary">
            View All ({wishlist.length})
          </Button>
        )}
      </div>

      {/* Invite Modal */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[1.5rem] p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-primary/10 to-secondary/20 p-6 pb-4">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading font-bold flex items-center gap-2">
                <Share2 className="w-6 h-6 text-primary" />
                Invite Friends
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Share this with friends to invite them to {club.name}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-5">
            {/* Join Code Display */}
            {club.joinCode ? (
              <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-4 text-center">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wide mb-2">Invite Code</p>
                <p className="text-3xl font-heading font-black text-primary tracking-widest">
                  {club.joinCode}
                </p>
              </div>
            ) : (
              <div className="bg-muted/50 rounded-2xl p-4 text-center">
                <p className="text-sm text-muted-foreground">Loading invite code...</p>
              </div>
            )}

            {/* Invite Text Preview */}
            <div className="bg-muted/50 rounded-xl p-4 text-sm text-foreground/80 whitespace-pre-wrap border border-border/50">
              {getInviteText(club)}
            </div>

            {/* Copy Button */}
            <Button 
              onClick={handleCopyInvite}
              className="w-full rounded-full font-bold h-12 gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" /> Copy Invite Text
                </>
              )}
            </Button>

            {/* Future: Share Options */}
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground text-center mb-3">
                More sharing options coming soon
              </p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" size="icon" className="rounded-full w-10 h-10 opacity-50 cursor-not-allowed" disabled>
                  <Mail className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full w-10 h-10 opacity-50 cursor-not-allowed" disabled>
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

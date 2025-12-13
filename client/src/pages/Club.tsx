import { useEffect, useState } from "react";
import { SUPERLATIVES, ASSETS } from "@/lib/mockData";
import { Link } from "wouter";
import { Calendar, Clock, Trophy, Crown, Plus, Users as UsersIcon, Copy, Check, Share2, Mail, MessageCircle } from "lucide-react";
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
import {
  closeDatePoll,
  createDatePoll,
  getActiveDatePoll,
  getUpcomingEvents,
  voteOnDatePoll,
  type ActiveDatePollResponse,
  type Club as ClubType,
  type DatePollOptionSummary,
  type Event,
  type WishlistRestaurant,
  getUserClubs,
  getWishlist,
  updateClub,
} from "@/lib/api";
import { toast } from "sonner";
import { useEventModal } from "@/lib/event-modal-context";
import { useAuth } from "@/lib/auth-context";

export default function Club() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<ClubType[]>([]);
  const [wishlist, setWishlist] = useState<WishlistRestaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);

  // Date poll state
  const [activePoll, setActivePoll] = useState<ActiveDatePollResponse | null>(null);
  const [isLoadingPoll, setIsLoadingPoll] = useState(false);
  const [isCreatePollOpen, setIsCreatePollOpen] = useState(false);
  const [pollTitle, setPollTitle] = useState("");
  const [pollRestaurantName, setPollRestaurantName] = useState("");
  const [pollOptionInputs, setPollOptionInputs] = useState<string[]>(["", "", ""]);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [isSavingVotes, setIsSavingVotes] = useState(false);
  const [isClosingPoll, setIsClosingPoll] = useState(false);
  const [closedWinning, setClosedWinning] = useState<{
    pollId: string;
    winningOptionId: string | null;
    options: DatePollOptionSummary[];
  } | null>(null);

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [isSavingClub, setIsSavingClub] = useState(false);
  const { setIsAddEventOpen, setAddEventDefaults } = useEventModal();

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

      // Fetch upcoming events and active poll after we know clubId
      try {
        const upcoming = await getUpcomingEvents();
        setUpcomingEvents(upcoming);
      } catch {
        // ignore (user may be mid-auth)
      }

      if (userClubs.length > 0) {
        setIsLoadingPoll(true);
        try {
          const poll = await getActiveDatePoll(userClubs[0].id);
          setActivePoll(poll);
          setClosedWinning(null);
          if (poll?.options) {
            const preselected = poll.options.filter((o) => o.currentUserCanAttend).map((o) => o.id);
            setSelectedOptionIds(preselected);
          } else {
            setSelectedOptionIds([]);
          }
        } catch (e: any) {
          // For non-members, API returns 403; for others, just show nothing
          console.error("Failed to load active poll:", e);
        } finally {
          setIsLoadingPoll(false);
        }
      }
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
  const isOwner = user && club.membersList?.some(m => m.id === user.id && m.role === "owner");
  const isPollChooser = !!user && !!activePoll?.poll && activePoll.poll.createdById === user.id;

  const hasUpcomingEvent = upcomingEvents.length > 0;

  const closesInLabel = (() => {
       if (!activePoll?.poll?.closesAt) return null;
       const closesAt = new Date(activePoll.poll.closesAt);
       const ms = closesAt.getTime() - Date.now();
       const mins = Math.max(0, Math.floor(ms / 60000));
       const hrs = Math.floor(mins / 60);
       const remMins = mins % 60;
       if (hrs <= 0) return `closes in ${remMins}m`;
       if (remMins === 0) return `closes in ${hrs}h`;
       return `closes in ${hrs}h ${remMins}m`; })();

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const toLocalDateAndTime = (iso: string) => {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    return { date, time };
  };

  const handleStartPoll = async () => {
    if (!club) return;
    const cleaned = pollOptionInputs.map((v) => v.trim()).filter(Boolean);
    if (cleaned.length < 3 || cleaned.length > 5) {
      toast.error("Please enter 3–5 date options.");
      return;
    }

    const optionDates = cleaned
      .map((val) => new Date(val))
      .filter((d) => !Number.isNaN(d.getTime()))
      .map((d) => d.toISOString());

    if (optionDates.length < 3 || optionDates.length > 5) {
      toast.error("All date options must be valid.");
      return;
    }

    try {
      const created = await createDatePoll(club.id, {
        title: pollTitle.trim() || undefined,
        restaurantName: pollRestaurantName.trim() || undefined,
        optionDates,
      });
      setActivePoll(created);
      setClosedWinning(null);
      setSelectedOptionIds(created.options.filter((o) => o.currentUserCanAttend).map((o) => o.id));
      setIsCreatePollOpen(false);
      setPollTitle("");
      setPollRestaurantName("");
      setPollOptionInputs(["", "", ""]);
      toast.success("Poll started");
    } catch (e: any) {
      toast.error(e?.message || "Failed to start poll");
    }
  };

  const handleSaveAvailability = async () => {
    if (!activePoll?.poll?.id) return;
    setIsSavingVotes(true);
    try {
      await voteOnDatePoll(activePoll.poll.id, selectedOptionIds);
      toast.success("Availability saved");
      const refreshed = await getActiveDatePoll(club.id);
      setActivePoll(refreshed);
      if (refreshed?.options) {
        const preselected = refreshed.options.filter((o) => o.currentUserCanAttend).map((o) => o.id);
        setSelectedOptionIds(preselected);
      }
    } catch (e: any) {
      toast.error(e?.message || "Couldn't save availability. Please try again.");
    } finally {
      setIsSavingVotes(false);
    }
  };

  const handleClosePoll = async () => {
    if (!activePoll?.poll?.id) return;
    setIsClosingPoll(true);
    try {
      const res = await closeDatePoll(activePoll.poll.id);
      setClosedWinning({
        pollId: activePoll.poll.id,
        winningOptionId: res.winningOptionId,
        options: res.options,
      });
      setActivePoll(null);
      toast.success("Poll closed");
    } catch (e: any) {
      toast.error(e?.message || "Couldn't close poll");
    } finally {
      setIsClosingPoll(false);
    }
  };

  const handleCreateEventFromWinner = () => {
    if (!closedWinning?.winningOptionId) {
      toast.error("No winning date to create an event from.");
      return;
    }
    const win = closedWinning.options.find((o) => o.id === closedWinning.winningOptionId);
    if (!win) return;
    const { date, time } = toLocalDateAndTime(win.optionDate);
    setAddEventDefaults({
      restaurantName: pollRestaurantName.trim() || activePoll?.poll?.restaurantName || undefined,
      date,
      time,
    });
    setIsAddEventOpen(true);
  };

  return (
    <div className="space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <img src={ASSETS.mascot} alt="Mascot" className="w-24 h-24 mx-auto object-contain animate-bounce-slow" />
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">{club.name}</h1>
          {isOwner && (
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              onClick={() => { setNewName(club.name); setIsEditingName(true); }}
            >
              Edit name
            </Button>
          )}
        </div>
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

      {/* Date Polls */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-heading font-bold">Planning</h2>
          {!hasUpcomingEvent && !activePoll && (
            <Button size="sm" onClick={() => setIsCreatePollOpen(true)}>
              Plan next dinner dates
            </Button>
          )}
        </div>

        {isLoadingPoll ? (
          <div className="bg-card p-6 rounded-xl border shadow-sm text-center">
            <p className="text-sm text-muted-foreground">Loading poll...</p>
          </div>
        ) : activePoll ? (
          <Card className="border-none shadow-soft">
            <CardHeader>
              <CardTitle className="font-heading">Vote on our next dinner date</CardTitle>
              <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                <span>Date poll</span>
                {activePoll.poll.restaurantName ? (
                  <span>• {activePoll.poll.restaurantName}</span>
                ) : null}
                {activePoll.isExpired ? (
                  <Badge className="bg-yellow-500/10 text-yellow-700 border-none">Expired</Badge>
                ) : closesInLabel ? (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {closesInLabel}
                  </span>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedOptionIds.length === 0 && !activePoll.isExpired && (
                <div className="text-xs text-muted-foreground">
                  You haven’t voted yet — pick any dates you can make.
                </div>
              )}

              <div className="space-y-2">
                {activePoll.options.map((opt) => {
                  const checked = selectedOptionIds.includes(opt.id);
                  return (
                    <label
                      key={opt.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border/50 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setSelectedOptionIds((prev) =>
                              checked ? prev.filter((id) => id !== opt.id) : [...prev, opt.id]
                            );
                          }}
                          disabled={activePoll.isExpired || activePoll.poll.status !== "open"}
                          className="h-4 w-4"
                        />
                        <div>
                          <div className="font-semibold text-foreground flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            {formatDateTime(opt.optionDate)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {opt.yesCount} can attend
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-primary/10 text-primary border-none">
                        {opt.yesCount}
                      </Badge>
                    </label>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {activePoll.poll.status === "open" && !activePoll.isExpired ? (
                  <Button
                    className="rounded-full"
                    onClick={handleSaveAvailability}
                    disabled={isSavingVotes}
                  >
                    {isSavingVotes ? "Saving..." : "Save my availability"}
                  </Button>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    This poll is closed.
                  </div>
                )}

                {(isPollChooser || isOwner) && (
                  <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={handleClosePoll}
                    disabled={isClosingPoll}
                  >
                    {isClosingPoll ? "Closing..." : "Close poll & pick date"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : closedWinning ? (
          <Card className="border-none shadow-soft">
            <CardHeader>
              <CardTitle className="font-heading">Poll results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {closedWinning.winningOptionId ? (
                (() => {
                  const win = closedWinning.options.find((o) => o.id === closedWinning.winningOptionId);
                  if (!win) return null;
                  return (
                    <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
                      <div className="text-xs text-muted-foreground font-bold uppercase tracking-wide">
                        Winning date
                      </div>
                      <div className="mt-1 font-heading font-bold text-lg text-foreground">
                        {formatDateTime(win.optionDate)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {win.yesCount} can attend
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="text-sm text-muted-foreground">
                  No winning date (no “yes” votes).
                </div>
              )}

              <Button
                className="rounded-full"
                onClick={handleCreateEventFromWinner}
                disabled={!closedWinning.winningOptionId}
              >
                Create event from this date
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="bg-card p-6 rounded-xl border shadow-sm text-center">
            <p className="text-sm text-muted-foreground">
              {hasUpcomingEvent ? "You already have an upcoming dinner." : "No active poll right now."}
            </p>
          </div>
        )}
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

      {/* Edit Club Name Modal */}
      {isOwner && (
        <Dialog open={isEditingName} onOpenChange={setIsEditingName}>
          <DialogContent className="sm:max-w-[420px] rounded-[1.25rem]">
            <DialogHeader>
              <DialogTitle>Edit Club Name</DialogTitle>
              <DialogDescription>Update the name of your club.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <label className="text-sm font-medium">Club Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Club name"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={() => setIsEditingName(false)}>Cancel</Button>
              <Button
                onClick={async () => {
                  if (!newName.trim()) {
                    toast.error("Club name cannot be empty");
                    return;
                  }
                  setIsSavingClub(true);
                  try {
                    const updated = await updateClub(club.id, { name: newName.trim() });
                    setClubs([updated, ...clubs.slice(1)]);
                    toast.success("Club name updated");
                    setIsEditingName(false);
                  } catch (error: any) {
                    toast.error(error.message || "Failed to update club");
                  } finally {
                    setIsSavingClub(false);
                  }
                }}
                disabled={isSavingClub}
              >
                {isSavingClub ? "Saving..." : "Save"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Poll Modal */}
      <Dialog open={isCreatePollOpen} onOpenChange={setIsCreatePollOpen}>
        <DialogContent className="sm:max-w-[520px] rounded-[1.25rem]">
          <DialogHeader>
            <DialogTitle>Plan next dinner dates</DialogTitle>
            <DialogDescription>
              Add 3–5 date options. Everyone can pick the dates they can attend.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title (optional)</label>
              <input
                type="text"
                value={pollTitle}
                onChange={(e) => setPollTitle(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="October dinner poll"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Restaurant (optional for now)</label>
              <input
                type="text"
                value={pollRestaurantName}
                onChange={(e) => setPollRestaurantName(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Sushi place?"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date options</label>
              <div className="space-y-2">
                {pollOptionInputs.map((val, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="datetime-local"
                      value={val}
                      onChange={(e) => {
                        const next = [...pollOptionInputs];
                        next[idx] = e.target.value;
                        setPollOptionInputs(next);
                      }}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {pollOptionInputs.length > 3 && (
                      <Button
                        type="button"
                        variant="ghost"
                        className="rounded-full"
                        onClick={() => setPollOptionInputs((prev) => prev.filter((_, i) => i !== idx))}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => {
                    if (pollOptionInputs.length >= 5) return;
                    setPollOptionInputs((prev) => [...prev, ""]);
                  }}
                  disabled={pollOptionInputs.length >= 5}
                >
                  Add option
                </Button>
                <div className="text-xs text-muted-foreground self-center">
                  {pollOptionInputs.length}/5
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsCreatePollOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStartPoll}>Start poll</Button>
          </div>
        </DialogContent>
      </Dialog>

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

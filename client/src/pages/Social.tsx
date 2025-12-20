import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { ASSETS } from "@/lib/mockData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MessageSquare, UtensilsCrossed, Star, Send, X } from "lucide-react";
import { 
  getPhotoFeed, 
  getPhotoComments, 
  addPhotoComment,
  getEventReviews,
  postEventReview,
  getUserClubs,
  type PhotoFeedItem,
  type PhotoComment,
  type EventReview,
} from "@/lib/api";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function Social() {
  const [photoFeed, setPhotoFeed] = useState<PhotoFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [userClubs, setUserClubs] = useState<any[]>([]);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentTexts, setCommentTexts] = useState<Map<string, string>>(new Map());
  const [isPostingComment, setIsPostingComment] = useState<Set<string>>(new Set());
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedEventForReview, setSelectedEventForReview] = useState<{ eventId: string; restaurantName: string } | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isPostingReview, setIsPostingReview] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const clubs = await getUserClubs();
        setUserClubs(clubs);
        
        if (clubs.length > 0) {
          const data = await getPhotoFeed({ limit: 2, offset: 0 });
          setPhotoFeed(data.items);
          setHasMore(data.hasMore);
          setOffset(2);
        }
      } catch (error: any) {
        console.error("Failed to load photo feed:", error);
        if (!error.message?.includes("session")) {
          toast.error("Failed to load feed");
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const loadMorePhotos = useCallback(async () => {
    if (!hasMore || isLoading) return;
    
    setIsLoading(true);
    try {
      const data = await getPhotoFeed({ limit: 2, offset });
      if (data.items.length > 0) {
        setPhotoFeed(prev => [...prev, ...data.items]);
        setHasMore(data.hasMore);
        setOffset(prev => prev + data.items.length);
      } else {
        setHasMore(false);
      }
    } catch (error: any) {
      console.error("Failed to load more photos:", error);
      toast.error("Failed to load more photos");
    } finally {
      setIsLoading(false);
    }
  }, [hasMore, isLoading, offset]);

  useEffect(() => {
    if (!loadMoreRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMorePhotos();
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(loadMoreRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoading, loadMorePhotos]);

  const handleToggleComments = async (photoId: string) => {
    if (expandedComments.has(photoId)) {
      setExpandedComments(prev => {
        const next = new Set(prev);
        next.delete(photoId);
        return next;
      });
    } else {
      setExpandedComments(prev => new Set(prev).add(photoId));
      // Load comments if not already loaded
      try {
        await getPhotoComments(photoId);
      } catch (error) {
        console.error("Failed to load comments:", error);
      }
    }
  };

  const handlePostComment = async (photoId: string) => {
    const text = commentTexts.get(photoId)?.trim();
    if (!text) return;

    setIsPostingComment(prev => new Set(prev).add(photoId));
    try {
      await addPhotoComment(photoId, text);
      setCommentTexts(prev => {
        const next = new Map(prev);
        next.delete(photoId);
        return next;
      });
      toast.success("Comment posted");
      // Reload comments
      const comments = await getPhotoComments(photoId);
      // Update photo feed item with new comment count
      setPhotoFeed(prev => prev.map(item => 
        item.photo.id === photoId 
          ? { ...item, commentCount: comments.length }
          : item
      ));
    } catch (error: any) {
      toast.error(error.message || "Failed to post comment");
    } finally {
      setIsPostingComment(prev => {
        const next = new Set(prev);
        next.delete(photoId);
        return next;
      });
    }
  };

  const handleOpenReviewModal = (eventId: string, restaurantName: string) => {
    setSelectedEventForReview({ eventId, restaurantName });
    setReviewRating(0);
    setReviewText("");
    setReviewModalOpen(true);
  };

  const handlePostReview = async () => {
    if (!selectedEventForReview || reviewRating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsPostingReview(true);
    try {
      await postEventReview(selectedEventForReview.eventId, reviewRating, reviewText || undefined);
      toast.success("Review posted!");
      setReviewModalOpen(false);
      setSelectedEventForReview(null);
      setReviewRating(0);
      setReviewText("");
      // Optionally reload photo feed to show new review
    } catch (error: any) {
      toast.error(error.message || "Failed to post review");
    } finally {
      setIsPostingReview(false);
    }
  };

  const isInClub = userClubs.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">Social Feed 💬</h1>
          <p className="text-muted-foreground">See what's cooking in your circles and beyond.</p>
        </div>
      </div>

      {/* Photo Feed */}
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-center gap-3">
          <img src={ASSETS.mascot} className="w-12 h-12 object-contain" alt="Mascot" />
          <div>
            <h3 className="font-bold text-primary">Your Club Activity</h3>
            <p className="text-xs text-muted-foreground">Photos and reviews from your club events.</p>
          </div>
        </div>

        {isLoading && photoFeed.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading feed...</p>
          </div>
        ) : !isInClub ? (
          <Card className="border-none shadow-soft">
            <CardContent className="p-8 text-center">
              <UtensilsCrossed className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-heading font-bold text-lg mb-2">No Club Yet</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Join a club or create some events to see activity here!
              </p>
              <Button asChild className="rounded-full">
                <Link href="/join">Join a Club</Link>
              </Button>
            </CardContent>
          </Card>
        ) : photoFeed.length === 0 ? (
          <Card className="border-none shadow-soft">
            <CardContent className="p-8 text-center">
              <UtensilsCrossed className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-heading font-bold text-lg mb-2">No Photos Yet</h3>
              <p className="text-muted-foreground text-sm">
                Photos from your club events will appear here once they're uploaded!
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {photoFeed.map((item) => (
              <PhotoCard
                key={item.photo.id}
                item={item}
                expandedComments={expandedComments.has(item.photo.id)}
                onToggleComments={() => handleToggleComments(item.photo.id)}
                commentText={commentTexts.get(item.photo.id) || ""}
                onCommentTextChange={(text) => setCommentTexts(prev => new Map(prev).set(item.photo.id, text))}
                onPostComment={() => handlePostComment(item.photo.id)}
                isPostingComment={isPostingComment.has(item.photo.id)}
              />
            ))}
            
            {/* Infinite scroll trigger */}
            <div ref={loadMoreRef} className="h-10" />
            
            {isLoading && photoFeed.length > 0 && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Review Modal */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[1.25rem]">
          <DialogHeader>
            <DialogTitle>Review {selectedEventForReview?.restaurantName}</DialogTitle>
            <DialogDescription>
              Share your experience at this restaurant
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setReviewRating(rating)}
                    className={`p-2 rounded-lg transition-colors ${
                      reviewRating >= rating
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    <Star className={`w-6 h-6 ${reviewRating >= rating ? "fill-current" : ""}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Review (optional)</label>
              <Textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your thoughts about the food, service, atmosphere..."
                className="min-h-[100px]"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={() => setReviewModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handlePostReview}
                disabled={reviewRating === 0 || isPostingReview}
              >
                {isPostingReview ? "Posting..." : "Post Review"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PhotoCard({
  item,
  expandedComments,
  onToggleComments,
  commentText,
  onCommentTextChange,
  onPostComment,
  isPostingComment,
}: {
  item: PhotoFeedItem;
  expandedComments: boolean;
  onToggleComments: () => void;
  commentText: string;
  onCommentTextChange: (text: string) => void;
  onPostComment: () => void;
  isPostingComment: boolean;
}) {
  const [comments, setComments] = useState<PhotoComment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [reviews, setReviews] = useState<EventReview[]>([]);

  useEffect(() => {
    if (expandedComments) {
      loadComments();
    }
  }, [expandedComments, item.photo.id]);

  useEffect(() => {
    loadReviews();
  }, [item.event.id]);

  const loadComments = async () => {
    setIsLoadingComments(true);
    try {
      const data = await getPhotoComments(item.photo.id);
      setComments(data);
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const loadReviews = async () => {
    try {
      const data = await getEventReviews(item.event.id);
      setReviews(data);
    } catch (error) {
      console.error("Failed to load reviews:", error);
    }
  };

  return (
    <Card className="border-none shadow-soft overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-4 flex items-center gap-3 border-b border-border/40">
          <Avatar className="w-10 h-10 border shadow-sm">
            <AvatarImage src={item.user.avatar || undefined} />
            <AvatarFallback>{item.user.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-bold text-sm">{item.user.name}</p>
            <p className="text-xs text-muted-foreground">
              {item.club.name} • {formatDistanceToNow(new Date(item.photo.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>

        {/* Photo */}
        <div className="relative">
          <img
            src={item.photo.imageUrl}
            alt={item.photo.caption || "Event photo"}
            className="w-full object-cover"
            style={{ maxHeight: "600px" }}
          />
          {item.photo.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <p className="text-white text-sm">{item.photo.caption}</p>
            </div>
          )}
        </div>

        {/* Event Info */}
        <div className="p-4 border-b border-border/40">
          <Link href={`/event/${item.event.id}`} className="block">
            <p className="font-bold text-lg hover:text-primary transition-colors">
              {item.event.restaurantName}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(item.event.eventDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </Link>
        </div>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <div className="p-4 border-b border-border/40 space-y-3">
            <h4 className="text-sm font-bold">Reviews</h4>
            {reviews.map((review) => (
              <div key={review.id} className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={review.user.avatar || undefined} />
                  <AvatarFallback>{review.user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-sm">{review.user.name}</p>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((r) => (
                        <Star
                          key={r}
                          className={`w-3 h-3 ${r <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.text && (
                    <p className="text-sm text-foreground/80">{review.text}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Comments Section */}
        <div className="p-4">
          <button
            onClick={onToggleComments}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-3"
          >
            <MessageSquare className="w-4 h-4" />
            {item.commentCount} {item.commentCount === 1 ? "comment" : "comments"}
          </button>

          {expandedComments && (
            <div className="space-y-4">
              {isLoadingComments ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : (
                <>
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={comment.user.avatar || undefined} />
                        <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-bold text-sm">{comment.user.name}</p>
                        <p className="text-sm text-foreground/80">{comment.text}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add Comment */}
                  <div className="flex gap-2">
                    <Input
                      value={commentText}
                      onChange={(e) => onCommentTextChange(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          onPostComment();
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={onPostComment}
                      disabled={!commentText.trim() || isPostingComment}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

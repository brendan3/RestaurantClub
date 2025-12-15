import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Settings, Award, Star, LogOut, Users, User, Bell, ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { logout, getUserClubs, getWishlist, removeFromWishlist, updateUserProfile, uploadUserAvatar, type Club, type WishlistRestaurant } from "@/lib/api";
import { toast } from "sonner";
import { Trash2, Heart } from "lucide-react";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [, setLocation] = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [userClubs, setUserClubs] = useState<Club[]>([]);
  const [wishlist, setWishlist] = useState<WishlistRestaurant[]>([]);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name ?? "",
    avatar: user?.avatar ?? "",
  });
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    };
  }, [avatarPreviewUrl]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [clubs, wishlistData] = await Promise.all([
          getUserClubs(),
          getWishlist(),
        ]);
        setUserClubs(clubs);
        setWishlist(wishlistData);
      } catch (error) {
        // Silently fail
      }
    };
    loadData();
  }, []);

  const handleRemoveFromWishlist = async (id: string) => {
    try {
      await removeFromWishlist(id);
      setWishlist(prev => prev.filter(item => item.id !== id));
      toast.success("Removed from wishlist");
    } catch (error: any) {
      toast.error(error.message || "Failed to remove from wishlist");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      toast.success("Logged out successfully");
      setLocation("/login");
    } catch (error: any) {
      toast.error(error.message || "Failed to logout");
    }
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      let avatar: string | null = profileForm.avatar || null;

      if (selectedAvatarFile) {
        try {
          const uploadedUrl = await uploadUserAvatar(selectedAvatarFile);
          avatar = uploadedUrl;
        } catch (err: any) {
          // If Cloudinary disabled (501), fall back to URL-only behavior
          if (err?.message?.toLowerCase().includes("cloudinary not configured")) {
            toast.error("Image uploads are not available right now; you can still paste an Avatar URL.");
          } else {
            toast.error("Failed to upload image. You can still paste an Avatar URL.");
          }
        }
      }

      const updated = await updateUserProfile({
        name: profileForm.name,
        avatar,
      });
      setUser(updated);
      toast.success("Profile updated!");
      setIsEditProfileOpen(false);
      setSelectedAvatarFile(null);
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
      setAvatarPreviewUrl(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const openEditProfile = () => {
    setProfileForm({
      name: user?.name ?? "",
      avatar: user?.avatar ?? "",
    });
    setSelectedAvatarFile(null);
    if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    setAvatarPreviewUrl(null);
    setIsEditProfileOpen(true);
  };

  if (!user) {
    return null;
  }
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <button
          type="button"
          onClick={openEditProfile}
          className="group inline-flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-primary/40"
          aria-label="Edit profile"
        >
          <Avatar className="w-32 h-32 mx-auto border-4 border-background shadow-xl transition-transform group-hover:scale-[1.02]">
          <AvatarImage src={user.avatar || undefined} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>
        </button>
        <div>
          <h1 className="text-3xl font-heading font-bold">{user.name}</h1>
          <p className="text-muted-foreground">
            {user.email}
          </p>
          <p className="text-xs text-muted-foreground">
            Member since {new Date(user.memberSince).getFullYear()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
         <Card className="text-center border-none shadow-sm bg-primary/5">
            <CardContent className="pt-6">
              <span className="block text-3xl font-bold text-primary">
                {user.stats?.attendance || 0}%
              </span>
              <span className="text-xs text-muted-foreground font-medium uppercase">Attendance</span>
            </CardContent>
         </Card>
         <Card className="text-center border-none shadow-sm bg-secondary/20">
            <CardContent className="pt-6">
              <span className="block text-3xl font-bold text-secondary-foreground">
                {user.stats?.avgRating || 0}
              </span>
              <span className="text-xs text-muted-foreground font-medium uppercase">Avg Rating</span>
            </CardContent>
         </Card>
      </div>

      {/* My Clubs - Mobile Only Shortcut */}
      <div className="md:hidden">
         <Button asChild variant="outline" className="w-full h-14 justify-between px-4 rounded-2xl bg-white border-border/50 shadow-sm">
            <Link href="/club">
               <span className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                     <Users className="w-4 h-4" />
                  </div>
                  <span className="font-bold">My Club</span>
               </span>
               <span className="text-xs text-muted-foreground">View Details &rarr;</span>
            </Link>
         </Button>
      </div>

      <Card className="border-none shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
             <Heart className="w-5 h-5 text-primary" />
             My Wishlist
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {wishlist.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No saved restaurants yet. Add some from events!
            </p>
          ) : (
            wishlist.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl group hover:bg-muted transition-colors">
                <div className="flex-1">
                  <p className="font-bold text-sm">{item.name}</p>
                  {item.cuisine && (
                    <p className="text-xs text-muted-foreground">{item.cuisine}</p>
                  )}
                </div>
                <button 
                  onClick={() => handleRemoveFromWishlist(item.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-100 rounded-full"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-none shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
             <Award className="w-5 h-5 text-primary" />
             My Awards
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-xl">
             <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-2xl">🏆</div>
             <div>
               <p className="font-bold">Golden Fork 2024</p>
               <p className="text-xs text-muted-foreground">Tried the most new dishes</p>
             </div>
           </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <Button 
          variant="outline" 
          className="w-full justify-start h-12"
          onClick={() => setIsSettingsOpen(true)}
        >
          <Settings className="w-4 h-4 mr-2" /> Settings
        </Button>
        <Button 
          onClick={handleLogout}
          variant="ghost" 
          className="w-full justify-start h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4 mr-2" /> Sign Out
        </Button>
      </div>

      {/* Settings Modal */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-[450px] max-h-[90vh] rounded-[1.5rem] p-0 overflow-hidden flex flex-col">
          <div className="bg-gradient-to-br from-muted/50 to-secondary/20 p-6 pb-4 shrink-0">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading font-bold flex items-center gap-2">
                <Settings className="w-6 h-6 text-primary" />
                Settings
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Manage your account and preferences
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 pt-4 space-y-4 overflow-y-auto flex-1">
            {/* Edit Profile */}
            <div
              className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={openEditProfile}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Edit Profile</p>
                  <p className="text-xs text-muted-foreground">Update your name and photo</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">Edit</Badge>
            </div>

            {/* Notification Preferences */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors cursor-not-allowed">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Notification Preferences</p>
                  <p className="text-xs text-muted-foreground">Manage email and push notifications</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">Coming soon</Badge>
            </div>

            {/* Manage Clubs */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">My Clubs</p>
                  <p className="text-xs text-muted-foreground">
                    {userClubs.length === 0 
                      ? "You're not in any clubs yet" 
                      : `${userClubs.length} club${userClubs.length !== 1 ? 's' : ''}`}
                  </p>
                </div>
              </div>
              
              {userClubs.length > 0 && (
                <div className="pl-4 space-y-2">
                  {userClubs.map((club) => (
                    <Link key={club.id} href="/club" onClick={() => setIsSettingsOpen(false)}>
                      <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-colors cursor-pointer">
                        <div>
                          <p className="font-medium text-sm">{club.name}</p>
                          <p className="text-xs text-muted-foreground">{club.members} member{club.members !== 1 ? 's' : ''}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Modal */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[1.25rem]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update your name and avatar image.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={(avatarPreviewUrl || profileForm.avatar) || undefined} />
                <AvatarFallback>{profileForm.name?.[0] ?? "?"}</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Preview of your avatar</div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => avatarFileInputRef.current?.click()}
                  >
                    Upload photo
                  </Button>
                  {selectedAvatarFile && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="rounded-full"
                      onClick={() => {
                        setSelectedAvatarFile(null);
                        if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
                        setAvatarPreviewUrl(null);
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <input
                  ref={avatarFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
                    setSelectedAvatarFile(file);
                    setAvatarPreviewUrl(URL.createObjectURL(file));
                    e.target.value = "";
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Avatar URL</label>
              <input
                type="url"
                value={profileForm.avatar}
                onChange={(e) => setProfileForm(prev => ({ ...prev, avatar: e.target.value }))}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://example.com/photo.jpg"
              />
              <p className="text-xs text-muted-foreground">
                Paste a photo URL (Twitter, Instagram, or any image host). Or upload above.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setIsEditProfileOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
              {isSavingProfile ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

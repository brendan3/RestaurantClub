import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, Award, Star, LogOut, Users } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { logout } from "@/lib/api";
import { toast } from "sonner";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [, setLocation] = useLocation();

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

  if (!user) {
    return null;
  }
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <Avatar className="w-32 h-32 mx-auto border-4 border-background shadow-xl">
          <AvatarImage src={user.avatar || undefined} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>
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
        <Button variant="outline" className="w-full justify-start h-12">
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
    </div>
  );
}

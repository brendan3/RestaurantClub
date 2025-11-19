import { CURRENT_USER } from "@/lib/mockData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, Award, Star, LogOut } from "lucide-react";

export default function Profile() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <Avatar className="w-32 h-32 mx-auto border-4 border-background shadow-xl">
          <AvatarImage src={CURRENT_USER.avatar} />
          <AvatarFallback>{CURRENT_USER.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-heading font-bold">{CURRENT_USER.name}</h1>
          <p className="text-muted-foreground">Member since 2024</p>
        </div>
        <div className="flex justify-center gap-2">
          <Badge variant="secondary" className="px-3 py-1">Sauce Connoisseur</Badge>
          <Badge variant="secondary" className="px-3 py-1">Spicy Food Lover</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
         <Card className="text-center border-none shadow-sm bg-primary/5">
            <CardContent className="pt-6">
              <span className="block text-3xl font-bold text-primary">100%</span>
              <span className="text-xs text-muted-foreground font-medium uppercase">Attendance</span>
            </CardContent>
         </Card>
         <Card className="text-center border-none shadow-sm bg-secondary/20">
            <CardContent className="pt-6">
              <span className="block text-3xl font-bold text-secondary-foreground">4.8</span>
              <span className="text-xs text-muted-foreground font-medium uppercase">Avg Rating</span>
            </CardContent>
         </Card>
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
        <Button variant="ghost" className="w-full justify-start h-12 text-destructive hover:text-destructive hover:bg-destructive/10">
          <LogOut className="w-4 h-4 mr-2" /> Sign Out
        </Button>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { joinClub } from "@/lib/api";
import { toast } from "sonner";
import { Users, ArrowLeft, Loader2 } from "lucide-react";

export default function Join() {
  const [, setLocation] = useLocation();
  const [joinCode, setJoinCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!joinCode.trim()) {
      setError("Please enter an invite code");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await joinClub(joinCode.trim());
      toast.success(`You've joined ${result.club.name}!`);
      setLocation("/");
    } catch (err: any) {
      const message = err.message || "Failed to join club";
      setError(message);
      // Don't toast on validation errors, just show inline
      if (!message.includes("Invalid invite code")) {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Join a Club</CardTitle>
          <CardDescription>
            Enter the invite code shared by your friend to join their dinner club
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="join-code">Invite Code</Label>
              <Input
                id="join-code"
                type="text"
                placeholder="e.g. ABC123"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="text-center text-2xl font-mono tracking-widest uppercase"
                maxLength={8}
                autoComplete="off"
                autoFocus
              />
              <p className="text-xs text-muted-foreground text-center">
                6-character code, case insensitive
              </p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full rounded-full font-bold h-12" 
              disabled={isLoading || !joinCode.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Joining...
                </>
              ) : (
                "Join Club"
              )}
            </Button>
          </form>
          
          <div className="mt-6 pt-4 border-t text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Don't have a code? Create your own club instead.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <Link href="/create-club">Create a Club</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="rounded-full">
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


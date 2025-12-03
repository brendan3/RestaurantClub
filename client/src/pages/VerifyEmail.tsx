import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { verifyEmail, resendVerification } from "@/lib/api";
import { toast } from "sonner";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";

type VerificationState = "loading" | "success" | "error";

export default function VerifyEmail() {
  const [location] = useLocation();
  const [state, setState] = useState<VerificationState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [newVerifyUrl, setNewVerifyUrl] = useState("");

  // Extract token from URL query string
  const getTokenFromUrl = () => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get("token");
  };

  useEffect(() => {
    const token = getTokenFromUrl();
    
    if (!token) {
      setState("error");
      setErrorMessage("No verification token provided.");
      return;
    }

    // Verify the email
    const doVerify = async () => {
      try {
        await verifyEmail(token);
        setState("success");
      } catch (error: any) {
        setState("error");
        setErrorMessage(error.message || "Invalid or expired verification link.");
      }
    };

    doVerify();
  }, []);

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resendEmail) {
      toast.error("Please enter your email address");
      return;
    }

    setIsResending(true);
    setResendSuccess(false);
    setNewVerifyUrl("");

    try {
      const response = await resendVerification(resendEmail);
      setResendSuccess(true);
      if (response.verifyUrl) {
        setNewVerifyUrl(response.verifyUrl);
      }
      toast.success("Verification email sent!");
    } catch (error: any) {
      toast.error(error.message || "Failed to resend verification email");
    } finally {
      setIsResending(false);
    }
  };

  // Loading state
  if (state === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <CardTitle className="text-2xl font-bold">Verifying Email</CardTitle>
            <CardDescription>
              Please wait while we verify your email address...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Success state
  if (state === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Email Verified!</CardTitle>
            <CardDescription>
              Your email has been successfully verified. You can now log in to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Success!</AlertTitle>
              <AlertDescription className="text-green-700">
                Your account is now active. Welcome to RestaurantClub!
              </AlertDescription>
            </Alert>
            
            <Button asChild className="w-full">
              <Link href="/login">Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Verification Failed</CardTitle>
          <CardDescription>
            We couldn't verify your email address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {errorMessage}
            </AlertDescription>
          </Alert>

          {/* Resend verification form */}
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Need a new verification link? Enter your email below.
            </p>
            
            <form onSubmit={handleResendVerification} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="resend-email">Email Address</Label>
                <Input
                  id="resend-email"
                  type="email"
                  placeholder="you@example.com"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                variant="outline" 
                className="w-full"
                disabled={isResending}
              >
                {isResending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Resend Verification Email
                  </>
                )}
              </Button>
            </form>

            {/* Show success message and dev link */}
            {resendSuccess && (
              <div className="mt-4 space-y-2">
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    If an account exists with this email, a new verification link has been sent.
                  </AlertDescription>
                </Alert>
                
                {/* DEV: Direct verify link */}
                {newVerifyUrl && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800 font-medium mb-2">
                      🧪 Dev: Click to verify
                    </p>
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link href={newVerifyUrl}>Verify Email</Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          <Button asChild variant="ghost" className="w-full">
            <Link href="/login">Back to Login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


import { Switch, Route, Redirect, useLocation } from "wouter";
import type { ComponentType } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { EventModalProvider } from "@/lib/event-modal-context";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import History from "@/pages/History";
import Club from "@/pages/Club";
import Profile from "@/pages/Profile";
import Social from "@/pages/Social";
import CreateClub from "@/pages/CreateClub";
import EventDetail from "@/pages/EventDetail";
import Login from "@/pages/Login";
import VerifyEmail from "@/pages/VerifyEmail";
import Join from "@/pages/Join";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import AppShell from "@/components/layout/AppShell";

function ProtectedRoute({ component: Component, requireAuth = false }: { component: ComponentType; requireAuth?: boolean }) {
  const { isAuthenticated, isGuest, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If route requires authentication and user is not authenticated (including guests), redirect to login
  if (requireAuth && !isAuthenticated) {
    return <Redirect to="/login" />;
  }

  // Allow guests to access non-auth-required routes
  if (!isAuthenticated && !isGuest && !requireAuth) {
    // If not authenticated and not a guest, redirect to login
    return <Redirect to="/login" />;
  }

  return <Component />;
}

function Router() {
  const { isAuthenticated } = useAuth();

  return (
    <Switch>
      <Route path="/login">
        {isAuthenticated ? <Redirect to="/" /> : <Login />}
      </Route>
      
      <Route path="/verify-email">
        <VerifyEmail />
      </Route>
      
      <Route path="/privacypolicy">
        <PrivacyPolicy />
      </Route>
      
      {/* Auth-required routes */}
      <Route path="/join">
        <AppShell>
          <ProtectedRoute component={Join} requireAuth={true} />
        </AppShell>
      </Route>
      
      <Route path="/create-club">
        <AppShell>
          <ProtectedRoute component={CreateClub} requireAuth={true} />
        </AppShell>
      </Route>
      
      <Route path="/profile">
        <AppShell>
          <ProtectedRoute component={Profile} requireAuth={true} />
        </AppShell>
      </Route>

      <Route path="/members/:userId">
        {(params) => (
          <AppShell>
            <ProtectedRoute component={() => <Profile userId={params.userId} />} requireAuth={true} />
          </AppShell>
        )}
      </Route>
      
      {/* Guest-accessible routes */}
      <Route path="/">
        <AppShell>
          <ProtectedRoute component={Dashboard} />
        </AppShell>
      </Route>
      
      <Route path="/dashboard">
        <AppShell>
          <ProtectedRoute component={Dashboard} />
        </AppShell>
      </Route>
      
      <Route path="/social">
        <AppShell>
          <ProtectedRoute component={Social} />
        </AppShell>
      </Route>
      
      <Route path="/history">
        <AppShell>
          <ProtectedRoute component={History} />
        </AppShell>
      </Route>
      
      <Route path="/club">
        <AppShell>
          <ProtectedRoute component={Club} />
        </AppShell>
      </Route>
      
      <Route path="/event/:id">
        <AppShell>
          <ProtectedRoute component={EventDetail} />
        </AppShell>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <EventModalProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
        </EventModalProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

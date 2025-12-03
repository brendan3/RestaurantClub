import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import History from "@/pages/History";
import Club from "@/pages/Club";
import Profile from "@/pages/Profile";
import Social from "@/pages/Social";
import CreateClub from "@/pages/CreateClub";
import Login from "@/pages/Login";
import AppShell from "@/components/layout/AppShell";

function ProtectedRoute({ component: Component }: { component: () => JSX.Element }) {
  const { isAuthenticated, isLoading } = useAuth();
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

  if (!isAuthenticated) {
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
      
      <Route path="/create-club">
        <AppShell>
          <ProtectedRoute component={CreateClub} />
        </AppShell>
      </Route>
      
      <Route path="/profile">
        <AppShell>
          <ProtectedRoute component={Profile} />
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
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

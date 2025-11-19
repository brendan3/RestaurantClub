import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import History from "@/pages/History";
import Club from "@/pages/Club";
import Profile from "@/pages/Profile";
import AppShell from "@/components/layout/AppShell";

function Router() {
  return (
    <AppShell>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/history" component={History} />
        <Route path="/club" component={Club} />
        <Route path="/profile" component={Profile} />
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

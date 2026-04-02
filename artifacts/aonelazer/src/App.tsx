import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AppLayout } from "@/components/layout";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Expenses from "@/pages/expenses";
import Investments from "@/pages/investments";
import Budgets from "@/pages/budgets";
import Transactions from "@/pages/transactions";
import Analytics from "@/pages/analytics";
import Account from "@/pages/account";
import Login from "@/pages/login";
import Register from "@/pages/register";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-primary animate-pulse">
        Loading...
      </div>
    );
  }

  if (!user) return <Redirect to="/login" />;

  return (
    <AppLayout>
      <Component />
    </AppLayout>
  );
}

function PublicRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-primary animate-pulse">
        Loading...
      </div>
    );
  }

  if (user) return <Redirect to="/dashboard" />;

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={() => <PublicRoute component={Login} />} />
      <Route path="/register" component={() => <PublicRoute component={Register} />} />
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/expenses" component={() => <ProtectedRoute component={Expenses} />} />
      <Route path="/investments" component={() => <ProtectedRoute component={Investments} />} />
      <Route path="/budgets" component={() => <ProtectedRoute component={Budgets} />} />
      <Route path="/transactions" component={() => <ProtectedRoute component={Transactions} />} />
      <Route path="/analytics" component={() => <ProtectedRoute component={Analytics} />} />
      <Route path="/account" component={() => <ProtectedRoute component={Account} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

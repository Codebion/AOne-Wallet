import React from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Receipt, LineChart, Wallet, ArrowRightLeft, PieChart, User, LogOut, Sun, Moon, Monitor } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/investments", label: "Investments", icon: LineChart },
  { href: "/budgets", label: "Budgets", icon: Wallet },
  { href: "/transactions", label: "Transactions", icon: ArrowRightLeft },
  { href: "/analytics", label: "Analytics", icon: PieChart },
  { href: "/account", label: "Account", icon: User },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : user?.username?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col fixed inset-y-0 left-0 z-50">
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <div className="w-3 h-3 bg-primary rounded-full shadow-[0_0_10px_theme('colors.primary.DEFAULT')]" />
            </div>
            <span className="font-bold text-lg tracking-tight">AOneLazer</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all cursor-pointer ${
                    isActive 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-primary" : ""}`} />
                  <span className="text-sm">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto space-y-4">
          <div className="flex items-center justify-between px-3 py-2">
            <button onClick={cycleTheme} className="p-2 hover:bg-secondary rounded-full text-muted-foreground transition-colors" title="Toggle Theme">
              {theme === 'dark' ? <Moon className="w-4 h-4" /> : theme === 'light' ? <Sun className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
            </button>
            <button onClick={() => logout()} className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-full text-muted-foreground transition-colors" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center gap-3 px-3 py-2 border-t border-border pt-4">
            <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <span className="font-bold text-sm text-primary">{initial}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || user?.username}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email || 'User'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        <div className="flex-1 p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

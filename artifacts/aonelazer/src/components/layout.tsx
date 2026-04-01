import React, { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Receipt, LineChart, Wallet, ArrowRightLeft } from "lucide-react";

const navItems = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/investments", label: "Investments", icon: LineChart },
  { href: "/budgets", label: "Budgets", icon: Wallet },
  { href: "/transactions", label: "Transactions", icon: ArrowRightLeft },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card/50 backdrop-blur-xl flex flex-col fixed inset-y-0 left-0 z-50">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
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

        <div className="p-4 mt-auto">
          <div className="p-4 rounded-lg border border-border/50 bg-black/20 text-xs">
            <p className="text-muted-foreground mb-2">System Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]" />
              <span className="font-mono text-emerald-500">ALL SYSTEMS GO</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur flex items-center px-8 sticky top-0 z-40">
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">Administrator</p>
              <p className="text-xs text-muted-foreground">Admin Access</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-secondary border border-border flex items-center justify-center">
              <span className="font-mono text-xs text-primary">AD</span>
            </div>
          </div>
        </header>
        <div className="flex-1 p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

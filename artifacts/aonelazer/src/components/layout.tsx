import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Receipt, LineChart, Wallet, ArrowRightLeft,
  PieChart, User, LogOut, Sun, Moon, Monitor, Menu, IndianRupee,
  BookOpen, ChevronDown, Check, Settings,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useCurrency, CURRENCIES } from "@/contexts/CurrencyContext";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/investments", label: "Investments", icon: LineChart },
  { href: "/budgets", label: "Budgets", icon: Wallet },
  { href: "/transactions", label: "Transactions", icon: ArrowRightLeft },
  { href: "/analytics", label: "Analytics", icon: PieChart },
  { href: "/account", label: "Account", icon: User },
];

const bottomNavItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/investments", label: "Invest", icon: LineChart },
  { href: "/budgets", label: "Budget", icon: Wallet },
  { href: "/account", label: "Account", icon: User },
];

function CurrencyPicker({ compact = false }: { compact?: boolean }) {
  const { currency, setCurrencyByCode } = useCurrency();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = CURRENCIES.filter(
    (c) => search === "" || c.code.toLowerCase().includes(search.toLowerCase()) || c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 rounded-lg border border-border hover:bg-secondary transition-colors text-sm font-medium ${
          compact ? "px-2 py-1.5 text-xs" : "px-2.5 py-1.5"
        }`}
      >
        <span>{currency.flag}</span>
        <span className="font-mono">{currency.code}</span>
        <span className="text-muted-foreground">{currency.symbol}</span>
        <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 left-0 w-64 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="p-2 border-b border-border">
            <input
              type="text"
              placeholder="Search currency..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-secondary border-none outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filtered.map((c) => (
              <button
                key={c.code}
                onClick={() => { setCurrencyByCode(c.code); setOpen(false); setSearch(""); }}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs hover:bg-secondary transition-colors text-left ${
                  currency.code === c.code ? "bg-primary/10" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{c.flag}</span>
                  <span className="font-mono font-semibold">{c.code}</span>
                  <span className="text-muted-foreground truncate">{c.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground font-mono">{c.symbol}</span>
                  {currency.code === c.code && <Check className="w-3 h-3 text-primary" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === "dark") setTheme("light");
    else if (theme === "light") setTheme("system");
    else setTheme("dark");
  };

  const initial = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.username?.charAt(0).toUpperCase() || "U";

  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  const isAdmin = user?.role === "admin";

  const SidebarContent = () => (
    <>
      <div className="p-5 border-b border-border">
        <Link href="/dashboard" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <IndianRupee className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="font-bold text-sm leading-none">AOneLazer</div>
            <div className="text-xs text-muted-foreground leading-none mt-0.5">Finance</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}>
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer group ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-primary" : ""}`} />
                <span className="text-sm">{item.label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
              </div>
            </Link>
          );
        })}

        {/* Divider */}
        <div className="my-2 border-t border-border" />

        <Link href="/blog" onClick={() => setSidebarOpen(false)}>
          <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer group ${
            location === "/blog" || location.startsWith("/blog/")
              ? "bg-primary/10 text-primary font-medium"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          }`}>
            <BookOpen className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">Blog</span>
          </div>
        </Link>

        {isAdmin && (
          <Link href="/admin/blog" onClick={() => setSidebarOpen(false)}>
            <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer ${
              location === "/admin/blog"
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}>
              <Settings className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">Blog Admin</span>
            </div>
          </Link>
        )}
      </nav>

      <div className="p-3 border-t border-border space-y-2">
        {/* Currency Picker */}
        <div className="px-2 py-1">
          <p className="text-xs text-muted-foreground mb-2 font-medium">Display Currency</p>
          <CurrencyPicker />
        </div>

        <div className="flex items-center gap-2 px-3 py-1">
          <button
            onClick={cycleTheme}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ThemeIcon className="w-3.5 h-3.5" />
            <span className="capitalize">{theme} mode</span>
          </button>
          <button
            onClick={() => logout()}
            className="ml-auto p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <Link href="/account" onClick={() => setSidebarOpen(false)}>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="font-bold text-xs text-primary">{initial}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || user?.username}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email || "User"}</p>
            </div>
          </div>
        </Link>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 border-r border-border bg-card flex-col fixed inset-y-0 left-0 z-50">
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border flex flex-col transition-transform duration-300 lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Mobile Top Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-card/95 backdrop-blur border-b border-border px-4 h-14 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <IndianRupee className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="font-bold text-sm">AOneLazer Finance</span>
          </Link>
          <div className="flex items-center gap-1">
            <CurrencyPicker compact />
            <button onClick={cycleTheme} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <ThemeIcon className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-card/95 backdrop-blur border-t border-border">
          <div className="flex items-center justify-around px-2 py-1.5">
            {bottomNavItems.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <div className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors min-w-0">
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`text-[10px] font-medium truncate ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                      {item.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

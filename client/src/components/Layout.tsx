import { Link, useLocation } from "wouter";
import { Terminal, Box, Cloud, Settings, Layers, Menu, X } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Dashboard", icon: <Terminal className="w-5 h-5" /> },
    { href: "/new", label: "New Deployment", icon: <Cloud className="w-5 h-5" /> },
    { href: "/settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card border-r border-border">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
            <Layers className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-bold font-mono tracking-tight text-lg">TerraOps</h1>
            <p className="text-xs text-muted-foreground font-mono">v1.0.0-alpha</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 group
                  ${isActive 
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-sm shadow-primary/5" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }
                `}
                onClick={() => setMobileOpen(false)}
              >
                <span className={isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground transition-colors"}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-border">
        <div className="bg-secondary/50 rounded-lg p-4 border border-border">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            System Online
          </div>
          <div className="text-xs text-muted-foreground/60 font-mono">
            US-EAST-1 :: 24ms
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans selection:bg-primary/30">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-72 sticky top-0 h-screen z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden fixed top-4 right-4 z-50">
            <Menu className="w-6 h-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 border-r border-border bg-card w-72">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      <main className="flex-1 min-w-0">
        <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12 animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}

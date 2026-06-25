"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTasks } from "@/context/TaskContext";
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  BarChart3, 
  User, 
  LogOut, 
  Sun, 
  Moon, 
  Menu, 
  X,
  Sparkles
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTasks();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Tasks", path: "/tasks", icon: CheckSquare },
    { name: "Calendar", path: "/calendar", icon: CalendarIcon },
    { name: "Analytics", path: "/analytics", icon: BarChart3 }
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-card border-b border-border text-foreground w-full sticky top-0 z-40">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
          <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          <span>Planora AI</span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md hover:bg-secondary focus:outline-none"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col justify-between w-64 bg-card border-r border-sidebar-border text-foreground transition-transform duration-300 lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo Brand Header */}
          <div className="flex items-center justify-between px-6 py-6 border-b border-sidebar-border">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-2xl tracking-tight">
              <Sparkles className="h-7 w-7 text-primary animate-pulse" />
              <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Planora AI</span>
            </Link>
            <button onClick={() => setIsOpen(false)} className="lg:hidden p-1 rounded-full hover:bg-secondary">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                      : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile / Utility Block */}
        <div className="p-4 border-t border-sidebar-border bg-secondary/50">
          {user && (
            <div className="flex items-center gap-3 mb-4 px-2">
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="h-10 w-10 rounded-full ring-2 ring-primary/40 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.uid}`;
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-foreground">{user.displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border border-border bg-card hover:bg-secondary text-foreground transition-all active:scale-95"
              title="Toggle Light/Dark Theme"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="h-4 w-4 text-amber-500 animate-spin-slow" />
                  <span className="text-xs font-medium">Light</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-blue-500" />
                  <span className="text-xs font-medium">Dark</span>
                </>
              )}
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center justify-center p-2 rounded-xl border border-destructive/20 hover:bg-destructive/10 text-destructive transition-all active:scale-95"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}
    </>
  );
}

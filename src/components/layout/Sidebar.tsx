import { Link, useLocation } from "react-router-dom";
import { Home, Users, MessageSquare, LayoutGrid, Settings, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const menuItems = [
    { icon: Home, label: "Home", to: "/home" },
    { icon: Users, label: "Friends", to: "/friends" },
    { icon: MessageSquare, label: "Messages", to: "/chats" },
    { icon: Settings, label: "Settings", to: "/settings" },
    { icon: HelpCircle, label: "About", to: "/about" },
  ];

  return (
    <div className={cn("w-64 bg-white dark:bg-brand-dark h-full py-6 flex flex-col", className)}>
      <div className="px-6 mb-8">
        <Link to="/home" className="flex items-center">
          {/* Light mode logo (hidden in dark mode) */}
          <img 
            src="/knex_monogram.png" 
            alt="Knex Logo" 
            className="h-12 dark:hidden" 
          />
          {/* Dark mode logo (hidden in light mode) */}
          <img 
            src="/knex_white.png" 
            alt="Knex Logo" 
            className="h-12 hidden dark:block" 
          />
        </Link>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.to;
            
            return (
              <li key={item.label}>
                <Link
                  to={item.to}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-lg gap-3 text-gray-700 dark:text-gray-200",
                    isActive && "bg-brand-purple text-white"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
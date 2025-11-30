import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { UserAvatar } from "@/components/layout/UserAvatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  BellIcon,
  ChevronDown,
  LayoutGrid,
  LogOut,
  Settings,
  Mail,
  User,
} from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { logout, getUser as getAuthUser } from "@/services/auth/authService";
import { getUser as getUserService } from "@/services/user/userService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
}

interface UserData {
  name: string;
  email: string;
  profilePictureUrl?: string;
}

export function MainLayout({ children, title = "Welcome!" }: MainLayoutProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [mobileView, setMobileView] = useState<"sidebar" | "content">(
    isMobile ? "content" : "content"
  );
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const authUser = getAuthUser();
      if (!authUser) {
        throw new Error("No authenticated user found");
      }
      const userData = await getUserService(authUser._id);
      setUser({
        name: userData.name,
        email: userData.email,
        profilePictureUrl: userData.profilePictureUrl || undefined,
      });
    } catch (error) {
      console.error("Failed to fetch user data", error);
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();

    // Set up an interval to refresh user data periodically (every 5 minutes)
    const intervalId = setInterval(fetchUserData, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSettings = () => {
    navigate("/settings");
  };

  // Function to refresh user data when dropdown is opened
  const handleDropdownOpen = async (open: boolean) => {
    if (open) {
      await fetchUserData();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {(!isMobile || (isMobile && mobileView === "sidebar")) && (
        <Sidebar className="border-r" />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setMobileView(
                    mobileView === "sidebar" ? "content" : "sidebar"
                  )
                }
              >
                <LayoutGrid className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-xl font-bold">{title}</h1>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="rounded-full">
                <BellIcon className="h-5 w-5" />
              </Button>
              <DropdownMenu onOpenChange={handleDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center cursor-pointer">
                    {loading ? (
                      <Skeleton className="h-8 w-8 rounded-full" />
                    ) : (
                      <UserAvatar
                        src={user?.profilePictureUrl}
                        name={user?.name || "User"}
                        size="sm"
                      />
                    )}
                    <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel className="flex flex-col p-4">
                    {loading ? (
                      <>
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-full" />
                      </>
                    ) : (
                      <>
                        <div className="flex items-center">
                          <UserAvatar
                            src={user?.profilePictureUrl}
                            name={user?.name || "User"}
                            size="md"
                            className="mr-3"
                          />
                          <div>
                            <p className="font-medium">{user?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {user?.email}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSettings}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="text-destructive mr-2 h-4 w-4" />
                    <span className="text-destructive">Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
}

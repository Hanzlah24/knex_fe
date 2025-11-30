
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center max-w-md p-6">
        <h1 className="text-6xl font-bold mb-6 text-brand-purple">404</h1>
        <p className="text-2xl font-medium mb-4">Oops! Page not found</p>
        <p className="text-muted-foreground mb-6">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Button asChild className="bg-brand-purple hover:bg-brand-purple/90">
          <Link to="/home">Return to Home</Link>
        </Button>
      </div>
    </div>
  );
}

export default NotFound;

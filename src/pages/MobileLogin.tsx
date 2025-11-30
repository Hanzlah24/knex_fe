
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function MobileLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/home");
    // In a real app, you would handle authentication here
  };

  return (
    <div className="min-h-screen flex flex-col p-6 bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="my-8 flex justify-center">
        <img src="/lovable-uploads/24b01dba-2b76-4a13-8227-75d9ced861cb.png" alt="Knex Logo" className="h-10" />
      </div>
      
      <div className="space-y-6 flex-1 flex flex-col justify-center">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Welcome 👋</h1>
          <p className="text-muted-foreground">
            Pick up where you left off and explore your connections!
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <Input 
              id="email"
              type="email"
              placeholder="Example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-brand-purple hover:underline">
                Forgot Password?
              </Link>
            </div>
          </div>
          
          <Button type="submit" className="w-full bg-brand-dark hover:bg-brand-dark/90">
            Sign in
          </Button>
        </form>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or sign in with</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" onClick={() => navigate("/home")} className="flex justify-center gap-2">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5" />
            <span>Google</span>
          </Button>
          
          <Button variant="outline" onClick={() => navigate("/home")} className="flex justify-center gap-2">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/facebook.svg" alt="Facebook" className="h-5 w-5" />
            <span>Facebook</span>
          </Button>
        </div>
        
        <div className="text-center">
          <p className="text-sm">
            Don't you have an account?{" "}
            <Link to="/signup" className="text-brand-purple font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
      
      <div className="text-center text-xs text-muted-foreground py-4">
        © 2023 ALL RIGHTS RESERVED
      </div>
    </div>
  );
}

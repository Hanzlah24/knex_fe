import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { login, verifyOtp, isLoggedIn } from "@/services/auth/authService";
import { useToast } from "@/hooks/use-toast";
import Spinner from "@/components/ui/spinner";
import OTPVerification from "@/components/OTPVerification";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("login"); // "login" or "verify"
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (isLoggedIn()) navigate("/home");
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast({ title: "Welcome back!", description: "You've signed in." });
      navigate("/home");
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg.toLowerCase().includes("please verify your email first")) {
        setStep("verify");
        toast({
          title: "Verify Email",
          description: `Enter the OTP sent to ${email}`,
        });
      } else {
        toast({ title: "Login Error", description: msg || "Login failed." });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      await verifyOtp(email, otp);
      toast({ title: "Verified", description: "Email verified!" });
      navigate("/home");
    } catch (err) {
      toast({
        title: "OTP Error",
        description: err.response?.data?.message || "Invalid code.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (step === "verify") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <OTPVerification
          email={email}
          otp={otp}
          setOtp={setOtp}
          onVerify={handleVerify}
          onResend={() => login(email, password)} // reuse login to resend OTP
          loading={loading}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen relative">
      <div className="flex-1 flex flex-col p-8 md:p-12 justify-center max-w-md mx-auto">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="mb-8 flex justify-center">
          <img
            src="/knex_monogram.png"
            alt="Knex Logo"
            className="h-18 dark:hidden"
          />
          <img
            src="/knex_white.png"
            alt="Knex Logo"
            className="h-18 hidden dark:block"
          />
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Welcome back</h1>
            <p className="text-muted-foreground">Pick up where you left off.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-brand-purple hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-dark hover:bg-brand-dark/90"
            >
              {loading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>

          <div className="text-center text-sm">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-brand-purple font-medium hover:underline"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

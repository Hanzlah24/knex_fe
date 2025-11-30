import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { register, verifyOtp, isLoggedIn } from "@/services/auth/authService";
import { useToast } from "@/hooks/use-toast";
import Spinner from "@/components/ui/spinner";
import OTPVerification from "@/components/OTPVerification";

export default function Signup() {
  const [step, setStep] = useState("register"); // "register" or "verify"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (isLoggedIn()) navigate("/home");
  }, [navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(name, email, password);
      toast({ title: "OTP Sent", description: `A code was sent to ${email}` });
      setStep("verify");
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed.";
      toast({ title: "Signup Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      await verifyOtp(email, otp);
      toast({ title: "Verified", description: "Account created!" });
      navigate("/home");
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid code.";
      toast({ title: "OTP Error", description: msg, variant: "destructive" });
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
          onResend={() => register(name, email, password)}
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
          <img src="/knex_monogram.png" alt="Knex Logo" className="h-18" />
        </div>

        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Create an account</h1>
          <p className="text-muted-foreground">
            Join us and start exploring your connections!
          </p>

          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              id="name"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
            <Input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />

            <Button type="submit" disabled={loading} className="w-full bg-brand-dark hover:bg-brand-dark/90">
              {loading ? (
                <><Spinner className="mr-2 h-4 w-4 animate-spin" />Sending OTP...</>
              ) : (
                "Sign up"
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <p className="text-center text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-purple font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
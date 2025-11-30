import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Spinner from "@/components/ui/spinner";
import OTPVerification from "../components/OTPVerification";
import { forgotPassword, resetPassword } from "@/services/auth/authService";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

/**
 * Steps:
 * - request: send OTP to email
 * - verify: validate OTP and proceed
 * - reset: set new password
 */
type Step = "request" | "verify" | "reset";

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      toast({ title: "OTP Sent", description: "Check your email for the code." });
      setStep("verify");
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      setStep("reset");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      await resetPassword(email, otp, newPassword);
      toast({ title: "Success", description: "Password has been reset." });
      navigate("/login")
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || err.message });
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
          onResend={() => forgotPassword(email)}
          loading={loading}
          title="Verify OTP"
          description={`Enter the verification code sent to ${email}`}
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
            <h1 className="text-3xl font-bold">
              {step === "reset" ? "Reset Password" : "Forgot Password"}
            </h1>
            <p className="text-muted-foreground">
              {step === "reset" 
                ? "Enter your new password" 
                : "Enter your email to receive a reset code"}
            </p>
          </div>

          {step === "request" ? (
            <form onSubmit={handleRequest} className="space-y-4">
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

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-dark hover:bg-brand-dark/90"
              >
                {loading ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  "Send OTP"
                )}
              </Button>
            </form>
          ) : step === "reset" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  New Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <Button
                onClick={handleReset}
                disabled={loading || newPassword.length < 8}
                className="w-full bg-brand-dark hover:bg-brand-dark/90"
              >
                {loading ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </div>
          ) : null}

          <div className="text-center text-sm">
            Remember your password?{" "}
            <Link
              to="/login"
              className="text-brand-purple font-medium hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
// src/components/OTPVerification.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import Spinner from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";

interface OTPVerificationProps {
  email: string;
  otp: string;
  setOtp: (val: string) => void;
  onVerify: () => Promise<void>;
  onResend: () => Promise<void>;
  loading: boolean;
  title?: string;
  description?: string;
}

const RESEND_DELAY = 60; // seconds
const STORAGE_KEY = "otp_resend_data";

const OTPVerification: React.FC<OTPVerificationProps> = ({
  email,
  otp,
  setOtp,
  onVerify,
  onResend,
  loading,
  title = "Verify OTP",
  description = `Enter the verification code sent to ${email}`,
}) => {
  const { toast } = useToast();

  // Calculate initial timer and persist timestamp if not present
  const initialTimer = useMemo(() => {
    if (typeof window === "undefined") return 0;
    let savedData = sessionStorage.getItem(STORAGE_KEY);
    let timestamp: number;
    if (!savedData) {
      timestamp = Date.now();
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ timestamp })
      );
      return RESEND_DELAY;
    }
    try {
      const parsed = JSON.parse(savedData);
      timestamp = parsed.timestamp;
    } catch {
      timestamp = Date.now();
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ timestamp })
      );
      return RESEND_DELAY;
    }
    const elapsed = Math.floor((Date.now() - timestamp) / 1000);
    return Math.max(0, RESEND_DELAY - elapsed);
  }, []);

  const [timer, setTimer] = useState<number>(initialTimer);

  useEffect(() => {
    // Update stored timestamp if starting with initialTimer > 0
    if (initialTimer > 0) {
      const storedTimestamp = Date.now() - (RESEND_DELAY - initialTimer) * 1000;
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ timestamp: storedTimestamp })
      );
    }

    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          sessionStorage.removeItem(STORAGE_KEY);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdown);
  }, [initialTimer]);

  const handleResend = async () => {
    if (timer > 0) return;
    try {
      await onResend();
      setTimer(RESEND_DELAY);
      const newTimestamp = Date.now();
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ timestamp: newTimestamp })
      );
      toast({ title: "OTP Resent", description: "Check your email for the new code." });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || err.message,
      });
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
        <p className="text-sm text-yellow-600 dark:text-yellow-400">
          Can't find the code? Check your spam folder!
        </p>
      </div>

      <div className="flex justify-center">
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={setOtp}
          disabled={loading}
        >
          <InputOTPGroup>
            {[...Array(6)].map((_, idx) => (
              <InputOTPSlot
                key={idx}
                index={idx}
                className="h-14 w-14 text-lg border-border gap-2"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>

      <Button
        onClick={onVerify}
        disabled={loading || otp.length < 6}
        className="w-full bg-brand-dark hover:bg-brand-dark/90"
      >
        {loading ? (
          <>
            <Spinner className="mr-2 h-4 w-4 animate-spin" />
            Verifying...
          </>
        ) : (
          "Verify Code"
        )}
      </Button>

      <div className="text-center text-sm">
        {timer > 0 ? (
          <p className="text-muted-foreground">
            Resend code in {timer} second{timer !== 1 ? "s" : ""}
          </p>
        ) : (
          <div className="flex items-center justify-center gap-1">
            <p className="text-muted-foreground">
              Didn't receive code?
            </p>
            <Button
              variant="link"
              onClick={handleResend}
              disabled={loading}
              className="text-brand-purple p-0 h-auto"
            >
              Resend OTP
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OTPVerification;

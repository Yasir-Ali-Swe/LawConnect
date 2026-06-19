"use client";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const VerifyEmailPage = () => {
  const { token } = useParams();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);

  const verifyMutation = useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: (data) => {
      toast.success(data?.message || "Email verified successfully");
      router.push("/login");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Verification failed");
      setIsVerifying(false); // Stop loading to show error state (or could redirect)
    },
  });

  useEffect(() => {
    if (token) {
      verifyMutation.mutate(token);
    }
  }, [token]);

  return (
    <Card className="w-full max-w-sm p-4">
      <CardHeader>
        <CardTitle>Email Verification</CardTitle>
        <CardDescription>Verifying your email address...</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-4">
        {isVerifying ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">Please wait...</p>
          </div>
        ) : (
          <div className="flex flex-col w-full gap-2">
            <p className="text-center text-sm text-red-500">
              Verification failed. The token may be invalid or expired.
            </p>
            <Button onClick={() => router.push("/login")}>Back to Login</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VerifyEmailPage;

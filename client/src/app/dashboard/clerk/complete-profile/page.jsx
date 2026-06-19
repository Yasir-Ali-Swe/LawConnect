"use client";

import { useMutation } from "@tanstack/react-query";
import { clerkApi } from "@/lib/api/clerk";
import { ClerkProfileForm } from "@/components/dashboard/clerk/ClerkProfileForm";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CompleteClerkProfilePage() {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: clerkApi.updateProfile, // Reusing update as "upsert" logic is in backend
    onSuccess: () => {
      toast.success("Profile completed! Welcome.");
      // Force refresh or redirect
      window.location.href = "/dashboard/clerk";
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to complete profile");
    },
  });

  return (
    <div className="max-w-2xl w-full h-full mx-auto py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Complete Your Profile</h1>
        <p className="text-muted-foreground">
          Please provide your updated information to access the dashboard.
        </p>
      </div>
      <div className="border rounded-lg p-6 bg-card">
        <ClerkProfileForm
          onSubmit={(values) => mutation.mutate(values)}
          isSubmitting={mutation.isPending}
        />
      </div>
    </div>
  );
}

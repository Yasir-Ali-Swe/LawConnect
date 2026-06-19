"use client";

import { useMutation } from "@tanstack/react-query";
import { clerkApi } from "@/lib/api/clerk";
import { ClerkProfileForm } from "@/components/dashboard/clerk/ClerkProfileForm";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/store/slices/auth-slice";
import { getDashboardPathForRole } from "@/lib/auth-redirects";

export default function CompleteClerkProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const mutation = useMutation({
    mutationFn: clerkApi.updateProfile,
    onSuccess: () => {
      toast.success("Profile completed! Welcome.");
      if (user) {
        dispatch(setUser({ ...user, isProfileComplete: true }));
      }
      router.replace(getDashboardPathForRole("clerk"));
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

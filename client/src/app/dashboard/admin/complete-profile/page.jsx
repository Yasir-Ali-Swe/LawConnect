"use client";

import { AdminProfileForm } from "@/components/dashboard/admin/AdminProfileForm";
import { useMutation } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/store/slices/auth-slice";
import { getDashboardPathForRole } from "@/lib/auth-redirects";

export default function CompleteAdminProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const mutation = useMutation({
    mutationFn: adminApi.createProfile,
    onSuccess: async () => {
      toast.success("Profile completed successfully!");
      if (user) {
        dispatch(setUser({ ...user, isProfileComplete: true }));
      }
      router.replace(getDashboardPathForRole("admin"));
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to save profile");
    },
  });

  return (
    <div className="w-full h-full max-w-2xl mx-auto py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Complete Your Admin Profile</h1>
        <p className="text-muted-foreground">
          Please provide your details to access the admin dashboard.
        </p>
      </div>
      <div className="border rounded-lg p-6 bg-card">
        <AdminProfileForm
          onSubmit={(values) => mutation.mutate(values)}
          isSubmitting={mutation.isPending}
        />
      </div>
    </div>
  );
}

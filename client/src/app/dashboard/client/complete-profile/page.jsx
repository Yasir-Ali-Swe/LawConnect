"use client";
import { ClientProfileForm } from "@/components/dashboard/client/ClientProfileForm";
import { useMutation } from "@tanstack/react-query";
import { clientApi } from "@/lib/api/client";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/store/slices/auth-slice";
import { useRouter } from "next/navigation";
import { getDashboardPathForRole } from "@/lib/auth-redirects";

export default function CompleteClientProfilePage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state) => state.auth.user);

  const mutation = useMutation({
    mutationFn: clientApi.createProfile,
    onSuccess: async () => {
      toast.success("Profile completed successfully!");
      if (user) {
        dispatch(setUser({ ...user, isProfileComplete: true }));
      }
      router.replace(getDashboardPathForRole("client"));
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to save profile");
    },
  });

  return (
    <div className="max-w-2xl w-full mx-auto h-full p-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Complete Your Profile</h1>
        <p className="text-muted-foreground">
          Please provide your details to continue to the dashboard.
        </p>
      </div>
      <ClientProfileForm
        onSubmit={(values) => mutation.mutate(values)}
        isSubmitting={mutation.isPending}
      />
    </div>
  );
}

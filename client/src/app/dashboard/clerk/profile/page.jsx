"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { clerkApi } from "@/lib/api/clerk";
import { authApi } from "@/lib/api";
import { setUser } from "@/store/slices/auth-slice";
import { ClerkProfileForm } from "@/components/dashboard/clerk/ClerkProfileForm";
import { ClerkAccountForm } from "@/components/dashboard/clerk/ClerkAccountForm";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ClerkProfilePage() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const { data: authData, isLoading: isAuthLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: authApi.getMe,
  });

  const { data: result, isLoading: isProfileLoading } = useQuery({
    queryKey: ["clerkProfile"],
    queryFn: clerkApi.getProfile,
    retry: false,
  });

  const user = authData?.user || result?.data || {};
  const profile = result?.data?.info
    ? {
        ...result.data.info,
        dob: result.data.info.dob
          ? new Date(result.data.info.dob).toISOString().split("T")[0]
          : "",
      }
    : undefined;
  const clerkDetails = result?.data?.clerkDetails || {};

  const accountMutation = useMutation({
    mutationFn: clerkApi.updateProfile,
    onSuccess: (_response, values) => {
      toast.success("Account details updated successfully");
      queryClient.invalidateQueries(["clerkProfile"]);
      queryClient.invalidateQueries(["authUser"]);

      if (user) {
        dispatch(setUser({ ...user, ...values }));
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update account");
    },
  });

  const mutation = useMutation({
    mutationFn: clerkApi.updateProfile,
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries(["clerkProfile"]);
      queryClient.invalidateQueries(["authUser"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update");
    },
  });

  if (isAuthLoading || isProfileLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and personal information.
        </p>
      </div>
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="account">Account Details</TabsTrigger>
          <TabsTrigger value="personal">Personal Information</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>
                Update your login credentials and display name.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ClerkAccountForm
                defaultValues={{
                  fullName: user?.fullName || "",
                  email: user?.email || "",
                }}
                onSubmit={(values) => accountMutation.mutate(values)}
                isSubmitting={accountMutation.isPending}
                clerkDetails={clerkDetails}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <ClerkProfileForm
                defaultValues={profile}
                onSubmit={(values) => mutation.mutate(values)}
                isSubmitting={mutation.isPending}
                isEdit={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "@/lib/api/client";
import { authApi } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, User, UserCog } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClientAccountForm } from "@/components/dashboard/client/ClientAccountForm";
import { ClientProfileForm } from "@/components/dashboard/client/ClientProfileForm";

import { useDispatch } from "react-redux";
import { setUser } from "@/store/slices/auth-slice";

export default function ClientProfilePage() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  // Query for Account Details (Base User Info)
  const { data: authData, isLoading: isAuthLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: authApi.getMe,
  });

  // Query for Personal Info (Client Profile)
  const {
    data: profileData,
    isLoading: isProfileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ["clientProfile"],
    queryFn: clientApi.getProfile,
    retry: false,
  });

  const isProfileNotFound = profileError?.response?.status === 404;
  const isEditingProfile = !isProfileNotFound && !!profileData;

  // Mutation for Account Details
  const accountMutation = useMutation({
    mutationFn: clientApi.updateAccount,
    onSuccess: (response) => {
      toast.success("Account details updated successfully");
      queryClient.invalidateQueries(["authUser"]);

      // Update Redux if user exists
      if (user) {
        dispatch(
          setUser({
            ...user,
            ...(response.data?.data || {}),
          }),
        );
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update account");
    },
  });

  // Mutation for Personal Info
  const profileMutation = useMutation({
    mutationFn: (values) => {
      return isEditingProfile
        ? clientApi.updateProfile(values)
        : clientApi.createProfile(values);
    },
    onSuccess: (data) => {
      toast.success(
        isEditingProfile
          ? "Personal information updated!"
          : "Profile created successfully!",
      );
      queryClient.invalidateQueries(["clientProfile"]);

      // If we just created the profile, we should arguably refresh auth user too
      // because isProfileComplete might have changed on the backend
      queryClient.invalidateQueries(["authUser"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to save profile");
    },
  });

  if (isAuthLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const user = authData?.user;
  const clientProfile = profileData?.clientProfile;

  return (
    <div className="space-y-6 pt-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Profile Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and personal information.
        </p>
      </div>

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            Account Details
          </TabsTrigger>
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Personal Information
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>
                Update your login coordinates and display name.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <ClientAccountForm
                defaultValues={{
                  fullName: user?.fullName || "",
                  email: user?.email || "",
                }}
                onSubmit={(values) => accountMutation.mutate(values)}
                isSubmitting={accountMutation.isPending}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Provide your details to complete your profile and access full
                features.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {isProfileLoading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <ClientProfileForm
                  defaultValues={
                    isEditingProfile
                      ? {
                          dob: clientProfile?.dob
                            ? new Date(clientProfile.dob)
                                .toISOString()
                                .split("T")[0]
                            : "",
                          city: clientProfile?.city || "",
                          province: clientProfile?.province || "",
                          profileImageUrl: clientProfile?.profileImageUrl || "",
                        }
                      : undefined
                  }
                  onSubmit={(values) => profileMutation.mutate(values)}
                  isSubmitting={profileMutation.isPending}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

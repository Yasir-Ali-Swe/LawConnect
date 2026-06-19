"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { lawyerApi } from "@/lib/api/lawyer";
import { authApi } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, User, UserCog, GraduationCap, Briefcase } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LawyerAccountForm } from "@/components/dashboard/lawyer/LawyerAccountForm";
import { LawyerProfileForm } from "@/components/dashboard/lawyer/LawyerProfileForm";
import { LawyerEducationForm } from "@/components/dashboard/lawyer/LawyerEducationForm";
import { LawyerProfessionalForm } from "@/components/dashboard/lawyer/LawyerProfessionalForm";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/slices/auth-slice";

export default function LawyerProfilePage() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  // --- QUERY 1: AUTH USER (Account Details) ---
  const { data: authData, isLoading: isAuthLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: authApi.getMe,
  });

  // --- QUERY 2: PERSONAL INFO (User Info) ---
  const {
    data: infoResult,
    isLoading: isInfoLoading,
    error: infoError,
  } = useQuery({
    queryKey: ["lawyerInfo"],
    queryFn: lawyerApi.getInfo,
    retry: false,
  });

  // --- QUERY 3: PROFESSIONAL PROFILE (Education + Professional) ---
  const { data: profileResult, isLoading: isProfileLoading } = useQuery({
    queryKey: ["lawyerProfile"],
    queryFn: lawyerApi.getProfile,
    retry: false,
  });

  const isInfoNotFound = infoError?.response?.status === 404;
  const isEditingInfo = !isInfoNotFound && !!infoResult;

  const user = authData?.user;
  const lawyerInfo = infoResult?.data;
  const lawyerProfile = profileResult?.data; // Includes bio, education, experience etc.

  // --- MUTATION: ACCOUNT ---
  const accountMutation = useMutation({
    mutationFn: lawyerApi.updateAccount,
    onSuccess: (response) => {
      toast.success("Account details updated successfully");
      queryClient.invalidateQueries(["authUser"]);
      // Update Redux state
      if (user) {
        dispatch(setUser({ ...user, ...(response.data?.data || {}) }));
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update account");
    },
  });

  // --- MUTATION: PERSONAL INFO ---
  const infoMutation = useMutation({
    mutationFn: (values) => {
      // If not found, use completeProfile to create initial UserInfo
      return isEditingInfo
        ? lawyerApi.updateInfo(values)
        : lawyerApi.completeProfile(values);
    },
    onSuccess: (data) => {
      toast.success("Personal information updated!");
      queryClient.invalidateQueries(["lawyerInfo"]);
      queryClient.invalidateQueries(["authUser"]);
      queryClient.invalidateQueries(["lawyerProfile"]); // Re-fetch profile in case creation triggered side-effects
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to save profile");
    },
  });

  // --- MUTATION: PROFESSIONAL/EDUCATION ---
  // We use the same updateProfile endpoint for both, just passing different fields
  const profileMutation = useMutation({
    mutationFn: lawyerApi.updateProfile,
    onSuccess: (response) => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries(["lawyerProfile"]);

      // If backend reports profile is now complete, update Redux!
      if (response.isProfileComplete && user) {
        dispatch(setUser({ ...user, isProfileComplete: true }));
        toast.success("Congratulations! Your profile is now complete.");
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update profile");
    },
  });

  if (isAuthLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-6 pb-12 max-w-3xl mx-auto w-full">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Profile Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and personal information.
        </p>
      </div>

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="education" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Education
          </TabsTrigger>
          <TabsTrigger value="professional" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Professional
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: ACCOUNT */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>Manage your login credentials.</CardDescription>
            </CardHeader>
            <CardContent>
              <LawyerAccountForm
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

        {/* TAB 2: PERSONAL */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Basic details required for identity verification.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isInfoLoading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <LawyerProfileForm
                  defaultValues={
                    isEditingInfo
                      ? {
                          dob: lawyerInfo?.dob
                            ? new Date(lawyerInfo.dob)
                                .toISOString()
                                .split("T")[0]
                            : "",
                          city: lawyerInfo?.city || "",
                          province: lawyerInfo?.province || "",
                          profileImageUrl: lawyerInfo?.profileImageUrl || "",
                        }
                      : undefined
                  }
                  onSubmit={(values) => infoMutation.mutate(values)}
                  isSubmitting={infoMutation.isPending}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: EDUCATION */}
        <TabsContent value="education">
          <Card>
            <CardHeader>
              <CardTitle>Educational Details</CardTitle>
              <CardDescription>
                Add your degrees (LLB, LLM, PhD). At least one is required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isProfileLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <LawyerEducationForm
                  defaultValues={
                    lawyerProfile?.education?.length > 0
                      ? {
                          education: lawyerProfile.education.map((edu) => ({
                            degree: edu.degree,
                            institute: edu.institute,
                            startDate: edu.startDate
                              ? new Date(edu.startDate)
                                  .toISOString()
                                  .split("T")[0]
                              : "",
                            endDate: edu.endDate
                              ? new Date(edu.endDate)
                                  .toISOString()
                                  .split("T")[0]
                              : "",
                            isContinuing: edu.isContinuing || false,
                          })),
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

        {/* TAB 4: PROFESSIONAL */}
        <TabsContent value="professional">
          <Card>
            <CardHeader>
              <CardTitle>Professional Details</CardTitle>
              <CardDescription>
                Showcase your experience and expertise.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isProfileLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <LawyerProfessionalForm
                  defaultValues={
                    lawyerProfile
                      ? {
                          bio: lawyerProfile.bio || "",
                          experience: lawyerProfile.experience || 0,
                          barCouncil: lawyerProfile.barCouncil || "",
                          specialization: lawyerProfile.specialization || [],
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

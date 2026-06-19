"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { lawyerApi } from "@/lib/api/lawyer";
import { authApi } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, User, GraduationCap, Briefcase } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LawyerProfileForm } from "@/components/dashboard/lawyer/LawyerProfileForm";
import { LawyerEducationForm } from "@/components/dashboard/lawyer/LawyerEducationForm";
import { LawyerProfessionalForm } from "@/components/dashboard/lawyer/LawyerProfessionalForm";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/slices/auth-slice";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CompleteProfilePage() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("personal");

  // --- QUERY 1: AUTH USER ---
  const { data: authData, isLoading: isAuthLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: authApi.getMe,
  });

  // --- QUERY 2: PERSONAL INFO ---
  const {
    data: infoResult,
    isLoading: isInfoLoading,
    error: infoError,
  } = useQuery({
    queryKey: ["lawyerInfo"],
    queryFn: lawyerApi.getInfo,
    retry: false,
  });

  // --- QUERY 3: PROFESSIONAL PROFILE ---
  const { data: profileResult, isLoading: isProfileLoading } = useQuery({
    queryKey: ["lawyerProfile"],
    queryFn: lawyerApi.getProfile,
    retry: false,
  });

  const isInfoNotFound = infoError?.response?.status === 404;
  const isEditingInfo = !isInfoNotFound && !!infoResult;

  const user = authData?.data?.user;
  const lawyerInfo = infoResult?.data;
  const lawyerProfile = profileResult?.data;

  // --- MUTATION: PERSONAL INFO ---
  const infoMutation = useMutation({
    mutationFn: (values) => {
      // Use completeProfile for initial creation or updateInfo for edits
      return isEditingInfo
        ? lawyerApi.updateInfo(values)
        : lawyerApi.completeProfile(values);
    },
    onSuccess: (data) => {
      toast.success("Personal information saved!");
      queryClient.invalidateQueries(["lawyerInfo"]);
      queryClient.invalidateQueries(["authUser"]);
      // Move to next tab
      setActiveTab("education");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to save profile");
    },
  });

  // --- MUTATION: PROFESSIONAL/EDUCATION ---
  const profileMutation = useMutation({
    mutationFn: lawyerApi.updateProfile,
    onSuccess: (response) => {
      queryClient.invalidateQueries(["lawyerProfile"]);

      // If backend reports profile is now complete, update Redux and Redirect!
      if (response.isProfileComplete && user) {
        dispatch(setUser({ ...user, isProfileComplete: true }));
        toast.success("Profile completed! Redirecting to dashboard...");
        setTimeout(() => {
          router.push("/dashboard/lawyer");
        }, 1500);
      } else {
        toast.success("Details saved successfully");
        // Logic to move tabs if needed
        if (activeTab === "education") setActiveTab("professional");
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

  // If user is already complete, redirect (safeguard)
  if (user?.isProfileComplete) {
    router.push("/dashboard/lawyer");
    return null;
  }

  return (
    <div className="container max-w-2xl mx-auto py-10">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">
          Complete Your Profile
        </h2>
        <p className="text-muted-foreground">
          You must complete all sections below to verify your identity and
          access the platform.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Personal Info
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

        {/* TAB 1: PERSONAL */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Personal Information</CardTitle>
              <CardDescription>Basic identity details.</CardDescription>
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

        {/* TAB 2: EDUCATION */}
        <TabsContent value="education">
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Educational Details</CardTitle>
              <CardDescription>
                Add your degrees. At least one is required.
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

        {/* TAB 3: PROFESSIONAL */}
        <TabsContent value="professional">
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Professional Details</CardTitle>
              <CardDescription>
                Experience, specialization, and bio. This will complete your
                profile.
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

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { courtOfficerApi } from "@/lib/api/court-officer";
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
import { OfficerProfileForm } from "@/components/dashboard/court-officer/OfficerProfileForm";
import { OfficerEducationForm } from "@/components/dashboard/court-officer/OfficerEducationForm";
import { OfficerProfessionalForm } from "@/components/dashboard/court-officer/OfficerProfessionalForm";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/slices/auth-slice";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CompleteOfficerProfilePage() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("personal");

  // --- QUERY 1: AUTH USER ---
  const { data: authData, isLoading: isAuthLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: authApi.getMe,
  });

  // --- QUERY 2: FULL PROFILE (Info + Details) ---
  const { data: profileResult, isLoading: isProfileLoading } = useQuery({
    queryKey: ["officerProfile"],
    queryFn: courtOfficerApi.getProfile,
  });

  const user = authData?.data?.user;
  const profileData = profileResult?.data;
  const userInfo = profileData?.info;
  const officerDetails = profileData?.officerDetails;

  // --- MUTATION: UPDATE PROFILE ---
  const updateMutation = useMutation({
    mutationFn: courtOfficerApi.updateProfile,
    onSuccess: (response) => {
      queryClient.invalidateQueries(["officerProfile"]);

      if (activeTab === "personal") {
        toast.success("Personal details saved. Next: Education.");
        setActiveTab("education");
      } else if (activeTab === "education") {
        toast.success("Education saved. Next: Professional.");
        setActiveTab("professional");
      } else if (activeTab === "professional") {
        // Final step
        toast.success("Profile completed! Redirecting...");
        // Force update redux state
        if (user) {
          dispatch(setUser({ ...user, isProfileComplete: true }));
        }
        setTimeout(() => {
          window.location.href = "/dashboard/court-officer";
        }, 1500);
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update profile");
    },
  });

  if (isAuthLoading || isProfileLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user is already complete, redirect
  if (user?.isProfileComplete) {
    router.push("/dashboard/court-officer");
    return null;
  }

  return (
    <div className="container max-w-2xl mx-auto w-full py-10">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">
          Complete Your Profile
        </h2>
        <p className="text-muted-foreground">
          You must complete all sections below to access the dashboard.
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
              <OfficerProfileForm
                defaultValues={
                  userInfo
                    ? {
                        dob: userInfo?.dob
                          ? new Date(userInfo.dob).toISOString().split("T")[0]
                          : "",
                        city: userInfo?.city || "",
                        province: userInfo?.province || "",
                        profileImageUrl: userInfo?.profileImageUrl || "",
                      }
                    : undefined
                }
                onSubmit={(values) => updateMutation.mutate(values)}
                isSubmitting={updateMutation.isPending}
                isEdit={!!userInfo}
              />
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
              <OfficerEducationForm
                defaultValues={
                  officerDetails?.education?.length > 0
                    ? {
                        education: officerDetails.education.map((edu) => ({
                          degree: edu.degree,
                          institute: edu.institute,
                          startDate: edu.startDate
                            ? new Date(edu.startDate)
                                .toISOString()
                                .split("T")[0]
                            : "",
                          endDate: edu.endDate
                            ? new Date(edu.endDate).toISOString().split("T")[0]
                            : "",
                          isContinuing: !edu.endDate,
                        })),
                      }
                    : undefined
                }
                onSubmit={(values) =>
                  updateMutation.mutate({ education: values.education })
                }
                isSubmitting={updateMutation.isPending}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: PROFESSIONAL */}
        <TabsContent value="professional">
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Professional Details</CardTitle>
              <CardDescription>Experience and Specialization.</CardDescription>
            </CardHeader>
            <CardContent>
              <OfficerProfessionalForm
                defaultValues={
                  officerDetails?.professionalInfo
                    ? {
                        bio: officerDetails.professionalInfo.bio || "",
                        experience:
                          officerDetails.professionalInfo.experience || 0,
                        specialization:
                          officerDetails.professionalInfo.specialization || [],
                        notes: officerDetails.professionalInfo.notes || "",
                      }
                    : undefined
                }
                onSubmit={(values) =>
                  updateMutation.mutate({ professionalInfo: values })
                }
                isSubmitting={updateMutation.isPending}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

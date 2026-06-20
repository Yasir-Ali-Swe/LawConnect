"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { courtOfficerApi } from "@/lib/api/court-officer";
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
import { OfficerAccountForm } from "@/components/dashboard/court-officer/OfficerAccountForm";
import { OfficerProfileForm } from "@/components/dashboard/court-officer/OfficerProfileForm";
import { OfficerEducationForm } from "@/components/dashboard/court-officer/OfficerEducationForm";
import { OfficerProfessionalForm } from "@/components/dashboard/court-officer/OfficerProfessionalForm";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/slices/auth-slice";

export default function CourtOfficerProfilePage() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  // --- QUERY 1: AUTH USER (Account Details) ---
  const { data: authData, isLoading: isAuthLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: authApi.getMe,
  });

  // --- QUERY 2: FULL PROFILE (Info + Details) ---
  const { data: profileResult, isLoading: isProfileLoading } = useQuery({
    queryKey: ["officerProfile"],
    queryFn: courtOfficerApi.getProfile,
  });

  const user = authData?.user;
  // profileResult.data contains { ...userFields, info: {}, officerDetails: {} }
  const profileData = profileResult?.data;
  const userInfo = profileData?.info;
  const officerDetails = profileData?.officerDetails;

  // --- MUTATION: UPDATE PROFILE ---
  const updateMutation = useMutation({
    mutationFn: courtOfficerApi.updateProfile,
    onSuccess: (response) => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries(["officerProfile"]);
      queryClient.invalidateQueries(["authUser"]);

      // If backend reports profile is now complete, update Redux!
      // Check if response.data or response is returned?
      // controller returns { success, message, data: {...} }. isProfileComplete logic is in backend.
      // We should check 'user' again or rely on response.
      // Since we just fetched, let's rely on authUser refetch or check manually?
      // Better: we will see the updated status on next authUser fetch.
      // But for immediate feedback, we can dispatch if we know it's done.
      // Actually, let's just invalidate query.

      // Check if user became verified?
      // We can also fetch authMe again manually to force redux update?
      // Actually invalidating ["authUser"] should trigger refetch if using useQuery hook for auth elsewhere?
      // But redux user is usually set on Login or CheckAuth.
      // We should manually update redux if possible.
      // Let's rely on authApi.getMe refetching.
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

  return (
    <div className="space-y-6 pt-6 pb-12 max-w-3xl mx-auto px-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Profile Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and personal information.
        </p>
      </div>

      <Tabs defaultValue="account" className="space-y-4 w-full">
        <TabsList className="flex w-full justify-start overflow-x-auto md:overflow-x-visible scrollbar-hide lg:w-125">
          <TabsTrigger value="account" className="flex items-center gap-2 shrink-0">
            <UserCog className="h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="personal" className="flex items-center gap-2 shrink-0">
            <User className="h-4 w-4" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="education" className="flex items-center gap-2 shrink-0">
            <GraduationCap className="h-4 w-4" />
            Education
          </TabsTrigger>
          <TabsTrigger value="professional" className="flex items-center gap-2 shrink-0">
            <Briefcase className="h-4 w-4" />
            Professional
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: ACCOUNT */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>
                View and edit your login credentials.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OfficerAccountForm
                defaultValues={{
                  fullName: user?.fullName || "",
                  email: user?.email || "",
                  role: user?.role || "Court Officer",
                }}
                onSubmit={(values) => updateMutation.mutate(values)}
                isSubmitting={updateMutation.isPending}
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
                Basic details required for identity.
              </CardDescription>
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

        {/* TAB 3: EDUCATION */}
        <TabsContent value="education">
          <Card>
            <CardHeader>
              <CardTitle>Educational Details</CardTitle>
              <CardDescription>
                Add your degrees. At least one is required for profile
                completion.
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
                          isContinuing: !edu.endDate, // If no endDate, assume continuing
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

        {/* TAB 4: PROFESSIONAL */}
        <TabsContent value="professional">
          <Card>
            <CardHeader>
              <CardTitle>Professional Details</CardTitle>
              <CardDescription>
                Share your experience and specialization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OfficerProfessionalForm
                defaultValues={
                  officerDetails?.professionalInfo
                    ? {
                        bio: officerDetails.professionalInfo.bio || "",
                        experience:
                          officerDetails.professionalInfo.experience || 0,
                        // If backend returns array, pass it directly.
                        // If backend returns string (legacy), convert.
                        // But we updated backend model to [String].
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

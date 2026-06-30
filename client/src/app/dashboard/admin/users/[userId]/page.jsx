"use client";

import { use, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, User, Mail, Shield, Calendar, MapPin, Briefcase, GraduationCap, CheckCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export default function AdminUserDetailPage({ params }) {
  const { userId } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: profileResult, isLoading } = useQuery({
    queryKey: ["userProfile", userId],
    queryFn: () => adminApi.getUserProfile(userId),
    retry: false,
  });

  const toggleStatusMutation = useMutation({
    mutationFn: adminApi.toggleUserStatus,
    onSuccess: (data) => {
      toast.success(data.message || "User status updated successfully");
      queryClient.invalidateQueries(["userProfile", userId]);
      queryClient.invalidateQueries(["internalUsers"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to toggle status");
    },
  });

  const approveLawyerMutation = useMutation({
    mutationFn: adminApi.approveLawyerAccount,
    onSuccess: (data) => {
      toast.success("Lawyer account approved and activated successfully");
      queryClient.invalidateQueries(["userProfile", userId]);
      queryClient.invalidateQueries(["internalUsers"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to approve account");
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const profileData = profileResult?.data;
  if (!profileData || !profileData.user) {
    return (
      <div className="container mx-auto p-6 max-w-4xl text-center space-y-4">
        <p className="text-muted-foreground">User profile not found.</p>
        <Button onClick={() => router.push("/dashboard/admin/users")} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  const { user, baseProfile, roleProfile } = profileData;
  const userStatus = user.status || (user.role === "lawyer" ? "inactive" : "active");

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6 py-6 max-w-4xl mx-auto w-full pb-12">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/dashboard/admin/users")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>

        <div className="flex items-center gap-2">
          {user.role === "lawyer" && userStatus === "inactive" && (
            <Button
              onClick={() => approveLawyerMutation.mutate(userId)}
              disabled={approveLawyerMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {approveLawyerMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Approve Account
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => toggleStatusMutation.mutate(userId)}
            disabled={toggleStatusMutation.isPending}
          >
            {toggleStatusMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Toggle Status
          </Button>
        </div>
      </div>

      {/* Header Info Banner */}
      <div className="bg-white dark:bg-zinc-900 border rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-xs">
        <Avatar className="h-24 w-24 border-2 border-primary/10">
          {baseProfile?.profileImageUrl && (
            <AvatarImage
              src={baseProfile.profileImageUrl}
              alt={user.fullName}
              className="object-cover"
            />
          )}
          <AvatarFallback className="bg-primary/5 text-primary text-2xl font-bold">
            {getInitials(user.fullName)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{user.fullName}</h1>
            <div className="flex items-center justify-center gap-2">
              <Badge variant="secondary" className="capitalize">
                {user.role === "court_officer" ? "Court Officer" : user.role}
              </Badge>
              {userStatus === "active" ? (
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50">
                  Active
                </Badge>
              ) : (
                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-900/50">
                  Inactive
                </Badge>
              )}
            </div>
          </div>
          <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-1">
            <Mail className="h-4 w-4 inline" /> {user.email}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Account Information
            </CardTitle>
            <CardDescription>System access & status verification details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 py-2 border-b">
              <span className="text-sm font-medium text-muted-foreground">Full Name</span>
              <span className="text-sm font-semibold">{user.fullName}</span>
            </div>
            <div className="grid grid-cols-2 py-2 border-b">
              <span className="text-sm font-medium text-muted-foreground">Email Address</span>
              <span className="text-sm font-semibold truncate" title={user.email}>{user.email}</span>
            </div>
            <div className="grid grid-cols-2 py-2 border-b">
              <span className="text-sm font-medium text-muted-foreground">User Role</span>
              <span className="text-sm font-semibold capitalize">{user.role === "court_officer" ? "Court Officer" : user.role}</span>
            </div>
            <div className="grid grid-cols-2 py-2 border-b">
              <span className="text-sm font-medium text-muted-foreground">Email Verified</span>
              <span className="text-sm font-semibold">{user.isVerified ? "Yes" : "No"}</span>
            </div>
            <div className="grid grid-cols-2 py-2">
              <span className="text-sm font-medium text-muted-foreground">Profile Completed</span>
              <span className="text-sm font-semibold">{user.isProfileComplete ? "Yes" : "No"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Personal Information
            </CardTitle>
            <CardDescription>Private identity & contact profiles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 py-2 border-b">
              <span className="text-sm font-medium text-muted-foreground">Date of Birth</span>
              <span className="text-sm font-semibold">{baseProfile?.dob ? formatDate(baseProfile.dob) : "N/A"}</span>
            </div>
            <div className="grid grid-cols-2 py-2 border-b">
              <span className="text-sm font-medium text-muted-foreground">Gender</span>
              <span className="text-sm font-semibold">{baseProfile?.gender || "N/A"}</span>
            </div>
            <div className="grid grid-cols-2 py-2 border-b">
              <span className="text-sm font-medium text-muted-foreground">Phone Number</span>
              <span className="text-sm font-semibold">{baseProfile?.phoneNumber || "N/A"}</span>
            </div>
            <div className="grid grid-cols-2 py-2 border-b">
              <span className="text-sm font-medium text-muted-foreground">City</span>
              <span className="text-sm font-semibold">{baseProfile?.city || "N/A"}</span>
            </div>
            <div className="grid grid-cols-2 py-2 border-b">
              <span className="text-sm font-medium text-muted-foreground">Province</span>
              <span className="text-sm font-semibold">{baseProfile?.province || "N/A"}</span>
            </div>
            <div className="grid grid-cols-2 py-2">
              <span className="text-sm font-medium text-muted-foreground">Street Address</span>
              <span className="text-sm font-semibold truncate" title={baseProfile?.address}>{baseProfile?.address || "N/A"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card 3: Role Specific Profiles */}
      {user.role === "lawyer" && roleProfile && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Lawyer Credentials & Background
            </CardTitle>
            <CardDescription>Professional statistics, bar council registry and specialized courts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 py-2 border-b">
                  <span className="text-sm font-medium text-muted-foreground">Experience</span>
                  <span className="text-sm font-semibold">{roleProfile.experience} Years</span>
                </div>
                <div className="grid grid-cols-2 py-2 border-b">
                  <span className="text-sm font-medium text-muted-foreground">Bar Council</span>
                  <span className="text-sm font-semibold">{roleProfile.barCouncil}</span>
                </div>
                <div className="grid grid-cols-2 py-2">
                  <span className="text-sm font-medium text-muted-foreground">Rating</span>
                  <span className="text-sm font-semibold">{roleProfile.rating} / 5</span>
                </div>
              </div>

              <div>
                <span className="text-sm font-medium text-muted-foreground block mb-2">Practice Areas (Specializations)</span>
                <div className="flex flex-wrap gap-2">
                  {roleProfile.specialization?.length > 0 ? (
                    roleProfile.specialization.map((spec, index) => (
                      <Badge key={index} variant="secondary" className="bg-primary/5 text-primary font-medium hover:bg-primary/5">
                        {spec}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">None specified</span>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <span className="text-sm font-medium text-muted-foreground block mb-2">Short Biography</span>
              <p className="text-sm leading-relaxed whitespace-pre-line text-foreground p-3 rounded-lg border bg-slate-50/50 dark:bg-zinc-950/20">
                {roleProfile.bio || "No biography provided yet."}
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <span className="text-lg font-bold flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Education Details
              </span>
              {roleProfile.education?.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {roleProfile.education.map((edu, idx) => (
                    <div key={edu._id || idx} className="p-4 border rounded-lg bg-slate-50/30 dark:bg-zinc-950/10 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">{edu.degree}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(edu.startDate)} - {edu.isContinuing ? "Present" : formatDate(edu.endDate)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{edu.institute}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No education details recorded.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {user.role === "clerk" && roleProfile && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Clerk Information
            </CardTitle>
            <CardDescription>Court assignments and office designation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid grid-cols-2 py-2 border-b">
                <span className="text-sm font-medium text-muted-foreground">Designation</span>
                <span className="text-sm font-semibold">{roleProfile.designation || "Clerk"}</span>
              </div>
              <div className="grid grid-cols-2 py-2 border-b">
                <span className="text-sm font-medium text-muted-foreground">Assigned Court</span>
                <span className="text-sm font-semibold">{roleProfile.courtId?.name || "Unassigned"}</span>
              </div>
              {roleProfile.courtId && (
                <>
                  <div className="grid grid-cols-2 py-2 border-b">
                    <span className="text-sm font-medium text-muted-foreground">Court Type</span>
                    <span className="text-sm font-semibold">{roleProfile.courtId.type}</span>
                  </div>
                  <div className="grid grid-cols-2 py-2 border-b">
                    <span className="text-sm font-medium text-muted-foreground">Court Location</span>
                    <span className="text-sm font-semibold">
                      {roleProfile.courtId.city}, {roleProfile.courtId.province}
                    </span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {user.role === "court_officer" && roleProfile && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Court Officer Information
            </CardTitle>
            <CardDescription>Professional expertise, courts, notes and bio details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 py-2 border-b">
                  <span className="text-sm font-medium text-muted-foreground">Designation</span>
                  <span className="text-sm font-semibold">{roleProfile.designation || "Court Officer"}</span>
                </div>
                <div className="grid grid-cols-2 py-2 border-b">
                  <span className="text-sm font-medium text-muted-foreground">Assigned Court</span>
                  <span className="text-sm font-semibold">{roleProfile.courtId?.name || "Unassigned"}</span>
                </div>
                <div className="grid grid-cols-2 py-2 border-b">
                  <span className="text-sm font-medium text-muted-foreground">Experience</span>
                  <span className="text-sm font-semibold">
                    {roleProfile.professionalInfo?.experience ? `${roleProfile.professionalInfo.experience} Years` : "N/A"}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-sm font-medium text-muted-foreground block mb-2">Specializations</span>
                <div className="flex flex-wrap gap-2">
                  {roleProfile.professionalInfo?.specialization?.length > 0 ? (
                    roleProfile.professionalInfo.specialization.map((spec, index) => (
                      <Badge key={index} variant="secondary" className="bg-primary/5 text-primary font-medium hover:bg-primary/5">
                        {spec}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">None specified</span>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <span className="text-sm font-medium text-muted-foreground block mb-2">Biography & Officer Profile Notes</span>
              <p className="text-sm leading-relaxed whitespace-pre-line text-foreground p-3 rounded-lg border bg-slate-50/50 dark:bg-zinc-950/20">
                {roleProfile.professionalInfo?.bio || "No biography details available."}
              </p>
              {roleProfile.professionalInfo?.notes && (
                <div className="mt-4 p-3 rounded-lg border border-amber-200 bg-amber-50/20 dark:bg-amber-950/5 text-amber-900 dark:text-amber-300 text-xs">
                  <strong>Notes:</strong> {roleProfile.professionalInfo.notes}
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <span className="text-lg font-bold flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Education Details
              </span>
              {roleProfile.education?.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {roleProfile.education.map((edu, idx) => (
                    <div key={edu._id || idx} className="p-4 border rounded-lg bg-slate-50/30 dark:bg-zinc-950/10 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">{edu.degree || "Degree"}</span>
                        <span className="text-xs text-muted-foreground">
                          {edu.startDate ? formatDate(edu.startDate) : ""} - {edu.endDate ? formatDate(edu.endDate) : "Present"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{edu.institute || "Institution"}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No education details recorded.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserPlus, Shield, Gavel } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export default function AdminCourtDetailPage({ params }) {
  const { courtId } = use(params);
  const queryClient = useQueryClient();

  // State must be unconditional
  const [clerkId, setClerkId] = useState(undefined);
  const [officerId, setOfficerId] = useState(undefined);

  // 1. Fetch Court Data
  const { data: courtData, isLoading: courtLoading } = useQuery({
    queryKey: ["court", courtId],
    queryFn: () => adminApi.getCourtById(courtId),
  });

  // 2. Fetch Unassigned Clerks (Only if needed)
  const { data: clerksData } = useQuery({
    queryKey: ["unassignedClerks"],
    queryFn: adminApi.getUnassignedClerks,
    enabled: !!courtData?.court && !courtData.court.clerkId, // Only fetch if no clerk assigned
  });

  // 3. Fetch Unassigned Officers
  const { data: officersData } = useQuery({
    queryKey: ["unassignedOfficers"],
    queryFn: adminApi.getUnassignedCourtOfficers,
  });

  // Mutations
  const assignClerkMutation = useMutation({
    mutationFn: adminApi.assignClerk,
    onSuccess: () => {
      toast.success("Clerk assigned successfully");
      queryClient.invalidateQueries(["court", courtId]);
      queryClient.invalidateQueries(["unassignedClerks"]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Assignment failed"),
  });

  const assignOfficerMutation = useMutation({
    mutationFn: adminApi.assignCourtOfficer,
    onSuccess: () => {
      toast.success("Officer assigned successfully");
      queryClient.invalidateQueries(["court", courtId]);
      queryClient.invalidateQueries(["unassignedOfficers"]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Assignment failed"),
  });

  const court = courtData?.court;
  const assignedOfficers = courtData?.assignedOfficers || [];
  const unassignedClerks = clerksData?.data || [];
  const unassignedOfficers = officersData?.data || [];

  const selectedClerkId = clerkId ?? (court?.clerkId?._id || "none");
  const selectedOfficerId =
    officerId ??
    (assignedOfficers.length > 0 ? assignedOfficers[0].userId._id : "none");

  if (courtLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }
  const allClerkOptions = [...unassignedClerks];
  if (court?.clerkId) {
    if (!allClerkOptions.some((c) => c._id === court.clerkId._id)) {
      allClerkOptions.push({
        _id: court.clerkId._id,
        fullName: court.clerkId.fullName,
        email: court.clerkId.email,
      });
    }
  }

  const allOfficerOptions = [...unassignedOfficers];
  const currentOfficer =
    assignedOfficers.length > 0 ? assignedOfficers[0].userId : null;
  if (currentOfficer) {
    if (!allOfficerOptions.some((o) => o._id === currentOfficer._id)) {
      allOfficerOptions.push({
        _id: currentOfficer._id,
        fullName: currentOfficer.fullName,
        email: currentOfficer.email,
      });
    }
  }
  const isDirty =
    selectedClerkId !== (court?.clerkId?._id || "none") ||
    selectedOfficerId !== (assignedOfficers[0]?.userId?._id || "none");

  const handleSave = async () => {
    const promises = [];

    // Clerk Change
    const originalClerkId = court?.clerkId?._id || "none";
    if (
      selectedClerkId &&
      selectedClerkId !== "none" &&
      selectedClerkId !== originalClerkId
    ) {
      promises.push(
        assignClerkMutation.mutateAsync({
          clerkId: selectedClerkId,
          courtId: court._id,
        }),
      );
    }

    // Officer Change
    const originalOfficerId = assignedOfficers[0]?.userId?._id || "none";
    if (
      selectedOfficerId &&
      selectedOfficerId !== "none" &&
      selectedOfficerId !== originalOfficerId
    ) {
      promises.push(
        assignOfficerMutation.mutateAsync({
          userId: selectedOfficerId,
          courtId: court._id,
        }),
      );
    }

    try {
      await Promise.all(promises);
      // Toast handled by mutation onSuccess?
      // Actually mutations have built-in toasts.
      // We might want to disable built-in toasts if doing batch?
      // But for now, letting them pop is fine or we can show one "Saved" here.
    } catch (e) {
      // handled
    }
  };

  if (!court) return <div className="p-8">Court not found</div>;

  return (
    <div className="lg:w-[60%] space-y-6 py-6 max-w-6xl mx-auto w-full pb-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{court.name}</h2>
        <div className="flex items-center gap-2 text-muted-foreground mt-1">
          <Badge variant="outline">{court.type}</Badge>
          <span>
            • {court.city}, {court.province}
          </span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Court Assignment
          </CardTitle>
          <CardDescription>
            Assign a Clerk and Court Officer to manage this court.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* CLERK SELECT */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Select Clerk
              </label>
              <Select
                value={selectedClerkId}
                onValueChange={setClerkId}
                disabled={unassignedClerks.length === 0 && !court.clerkId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a clerk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Clerk Assigned</SelectItem>
                  {allClerkOptions.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.fullName} ({c.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* OFFICER SELECT */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Select Court Officer
              </label>
              <Select
                value={selectedOfficerId}
                onValueChange={setOfficerId}
                disabled={
                  unassignedOfficers.length === 0 &&
                  assignedOfficers.length === 0
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an officer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Officer Assigned</SelectItem>
                  {allOfficerOptions.map((o) => (
                    <SelectItem key={o._id} value={o._id}>
                      {o.fullName} ({o.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              disabled={
                !isDirty ||
                assignClerkMutation.isPending ||
                assignOfficerMutation.isPending
              }
              className="min-w-37.5"
            >
              {(assignClerkMutation.isPending ||
                assignOfficerMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Assignments
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

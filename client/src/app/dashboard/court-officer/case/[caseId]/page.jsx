"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { courtOfficerApi } from "@/lib/api/court-officer";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Gavel, CalendarPlus, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { CaseOverviewTab } from "@/components/dashboard/cases/CaseOverviewTab";
import { CaseStatusTab } from "@/components/dashboard/cases/CaseStatusTab";
import { CaseHearingsTab } from "@/components/dashboard/cases/CaseHearingsTab";
import { CaseDocumentsTab } from "@/components/dashboard/cases/CaseDocumentsTab";
import { casesApi } from "@/lib/api/cases";

export default function OfficerCaseDetailPage() {
  const { caseId } = useParams();
  const queryClient = useQueryClient();

  // -- Data Fetching --
  const {
    data: caseResult,
    isLoading: caseLoading,
    isError: isCaseError,
    error: caseError,
  } = useQuery({
    queryKey: ["activeCase", caseId],
    queryFn: () => courtOfficerApi.getCaseById(caseId),
  });

  const { data: hearingsResult } = useQuery({
    queryKey: ["hearings", caseId],
    queryFn: () => courtOfficerApi.getHearings(caseId),
    enabled: !!caseId,
  });

  const { data: documentsResult, isLoading: documentsLoading } = useQuery({
    queryKey: ["caseDocuments", caseId],
    queryFn: () => casesApi.getOfficerDocuments(caseId),
    enabled: !!caseId,
  });

  const caseData = caseResult?.data;
  const hearings = hearingsResult?.data || [];
  const documents = documentsResult?.data || [];

  // -- Mutations --

  const judgmentMutation = useMutation({
    mutationFn: (data) => courtOfficerApi.makeJudgment(caseId, data),
    onSuccess: () => {
      toast.success("Judgment delivered. Case Decided.");
      queryClient.invalidateQueries(["activeCase", caseId]);
      queryClient.invalidateQueries(["officerCases"]);
      queryClient.invalidateQueries(["officerStats"]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to deliver judgment"),
  });

  const activateMutation = useMutation({
    mutationFn: () =>
      courtOfficerApi.updateCaseStatus(caseId, { status: "active" }),
    onSuccess: () => {
      toast.success("Case activated.");
      queryClient.invalidateQueries(["activeCase", caseId]);
      queryClient.invalidateQueries(["officerCases"]);
      queryClient.invalidateQueries(["officerStats"]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Update failed"),
  });

  // -- Render --
  if (caseLoading) return <div className="p-8">Loading case details...</div>;
  if (isCaseError && caseError?.response?.status === 401) {
    return (
      <div className="p-8 space-y-2">
        <h3 className="text-lg font-semibold">Access denied</h3>
        <p className="text-muted-foreground">
          You are not authorized to view this case.
        </p>
      </div>
    );
  }
  if (!caseData) return <div className="p-8">Case not found.</div>;

  const isReadOnly =
    caseData.status === "decided" || caseData.status === "closed";

  return (
    <div className="space-y-6 py-6 max-w-6xl mx-auto w-full">
      <div className="flex items-center gap-2 mb-2">
        <Button variant="ghost" asChild className="pl-0">
          <Link href="/dashboard/court-officer/case">
            {" "}
            <ArrowLeft className="mr-2 h-4 w-4" /> Back{" "}
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1 mr-4">
          <h2
            className="text-3xl font-bold tracking-tight truncate"
            title={caseData.title}
          >
            {caseData.title}
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{caseData.caseNumber}</Badge>
            <Badge>{caseData.status}</Badge>
            <Badge variant="secondary">{caseData.type}</Badge>
          </div>
        </div>
        {caseData.status === "pending" && (
          <Button onClick={() => activateMutation.mutate()}>
            Mark as Active
          </Button>
        )}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 lg:w-125 h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="hearings">Hearings</TabsTrigger>
          <TabsTrigger value="judgment">Judgment</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <CaseOverviewTab caseData={caseData} role="court_officer" />
        </TabsContent>

        {/* STATUS TAB */}
        <TabsContent value="status" className="mt-6">
          <CaseStatusTab caseData={caseData} />
        </TabsContent>

        {/* HEARINGS TAB */}
        <TabsContent value="hearings" className="mt-4">
          <CaseHearingsTab
            hearings={hearings}
            role="court_officer"
            caseId={caseId}
            isReadOnly={isReadOnly}
          />
        </TabsContent>

        {/* JUDGMENT TAB */}
        <TabsContent value="judgment" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Final Judgment</CardTitle>
            </CardHeader>
            <CardContent>
              {isReadOnly ? (
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-md">
                    <h4 className="font-semibold mb-2">Verdict</h4>
                    <p>
                      {caseData.status === "decided"
                        ? "Case Decided"
                        : caseData.status}
                    </p>
                    <p className="text-sm text-green-600 font-bold flex items-center gap-2 mt-2">
                      <CheckCircle className="h-4 w-4" /> Judgment Delivered
                    </p>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.target);
                    if (confirm("Are you sure? This will close the case.")) {
                      judgmentMutation.mutate({
                        verdict: fd.get("verdict"),
                        judgmentDetails: fd.get("details"),
                      });
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <Label>Verdict Summary</Label>
                    <Input
                      name="verdict"
                      placeholder="e.g. In favor of Plaintiff"
                      required
                    />
                  </div>
                  <div>
                    <Label>Detailed Judgment</Label>
                    <Textarea
                      name="details"
                      className="min-h-37.5"
                      placeholder="Full judgment text..."
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={judgmentMutation.isPending}
                  >
                    <Gavel className="mr-2 h-4 w-4" /> Deliver Judgment & Close
                    Case
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* DOCUMENTS TAB */}
        <TabsContent value="documents" className="mt-6">
          <CaseDocumentsTab
            documents={documents}
            isLoading={documentsLoading}
            role="court_officer"
            caseId={caseId}
            queryKey={["caseDocuments", caseId]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

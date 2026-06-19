"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { casesApi } from "@/lib/api/cases";
import { useParams } from "next/navigation";
import { CaseForm } from "@/components/dashboard/lawyer/cases/CaseForm";
import { SubmitCaseDialog } from "@/components/dashboard/lawyer/cases/SubmitCaseDialog";
import { CaseOverviewTab } from "@/components/dashboard/cases/CaseOverviewTab";
import { CaseStatusTab } from "@/components/dashboard/cases/CaseStatusTab";
import { CaseHearingsTab } from "@/components/dashboard/cases/CaseHearingsTab";
import { CaseDocumentsTab } from "@/components/dashboard/cases/CaseDocumentsTab";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  Calendar,
  FileText,
  Gavel,
  FileCheck,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useState } from "react";
import { format } from "date-fns";

export default function LawyerCaseDetailsPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);

  // --- Queries ---
  const {
    data: caseResult,
    isLoading: caseLoading,
    isError: isCaseError,
    error: caseError,
  } = useQuery({
    queryKey: ["case", id],
    queryFn: () => casesApi.getById(id),
  });

  const { data: hearingsResult, isLoading: hearingsLoading } = useQuery({
    queryKey: ["caseHearings", id],
    queryFn: () => casesApi.getHearings(id),
    enabled: !!caseResult?.data, // Only fetch if case exists
  });

  const { data: judgmentResult, isLoading: judgmentLoading } = useQuery({
    queryKey: ["caseJudgment", id],
    queryFn: () => casesApi.getJudgments(id),
    enabled: !!caseResult?.data,
  });

  const { data: documentsResult, isLoading: documentsLoading } = useQuery({
    queryKey: ["caseDocuments", id],
    queryFn: () => casesApi.getDocuments(id),
    enabled: !!caseResult?.data,
  });

  // --- Mutations ---
  const updateMutation = useMutation({
    mutationFn: (values) => casesApi.updateDraft(id, values),
    onSuccess: () => {
      toast.success("Draft updated successfully");
      queryClient.invalidateQueries(["case", id]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update draft");
    },
  });

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

  const caseData = caseResult?.data;
  if (!caseData) return <div className="p-8">Case not found</div>;

  const isDraft = caseData?.submissionStatus === "draft";
  const hearings = hearingsResult?.data || [];
  const judgment = judgmentResult?.data; // Might be array or object depending on API, assuming array or single object. Controller returns array usually? let's check. typically `getJudgments` might return a list.
  const documents = documentsResult?.data || [];
  // Actually judgment is usually singular per case in many systems, but model suggests `Case` has one judgment? Or `Judgment` model links to `Case`. I assume list for now.
  const activeJudgment = Array.isArray(judgment) ? judgment[0] : judgment;

  // --- Render Helpers ---

  // Status Badge Helper
  const getSubStatusBadge = (status) => {
    switch (status) {
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "submitted":
        return <Badge className="bg-blue-600">Submitted</Badge>;
      case "registered":
        return (
          <Badge
            variant="outline"
            className="text-green-700 border-green-600 bg-green-50"
          >
            Registered
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 py-6 max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/lawyer/cases">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2
                className="text-3xl font-bold tracking-tight truncate min-w-0"
                title={caseData.caseNumber || "Draft Case"}
              >
                {caseData.caseNumber ? caseData.caseNumber : "Draft Case"}
              </h2>
              <div className="shrink-0">
                {getSubStatusBadge(caseData.submissionStatus)}
              </div>
            </div>
            <p
              className="text-muted-foreground text-sm mt-1 truncate"
              title={caseData._id}
            >
              ID: {caseData._id}
            </p>
          </div>
        </div>

        {isDraft && (
          <Button onClick={() => setSubmitDialogOpen(true)}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Submit Case
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 lg:w-125 h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="hearings">Hearings</TabsTrigger>
          <TabsTrigger value="judgment">Judgment</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* TAB 1: OVERVIEW */}
        <TabsContent value="overview" className="mt-6 space-y-4">
          {isDraft ? (
            /* EDIT MODE */
            <div className="relative">
              <div className="absolute top-0 right-0 -mt-10 mr-0 text-xs text-muted-foreground hidden lg:block">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  Editable Draft
                </span>
              </div>
              <CaseForm
                defaultValues={{
                  clientId: caseData.clientId?._id || caseData.clientId,
                  title: caseData.title,
                  type: caseData.type,
                  description: caseData.description,
                  parties: caseData.parties.map((p) => ({
                    role: p.role,
                    name: p.name,
                  })),
                }}
                onSubmit={(values) => updateMutation.mutate(values)}
                isSubmitting={updateMutation.isPending}
                mode="update"
              />
            </div>
          ) : (
            /* READ ONLY MODE */
            <CaseOverviewTab caseData={caseData} role="lawyer" />
          )}
        </TabsContent>

        {/* TAB 2: STATUS */}
        <TabsContent value="status" className="mt-6">
          <CaseStatusTab caseData={caseData} />
        </TabsContent>

        {/* TAB 3: HEARINGS */}
        <TabsContent value="hearings" className="mt-6">
          <CaseHearingsTab hearings={hearings} role="lawyer" caseId={id} />
        </TabsContent>

        {/* TAB 4: JUDGMENT */}
        <TabsContent value="judgment" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Judgment</CardTitle>
              <CardDescription>
                Final decision and judgment details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {judgmentLoading ? (
                <p className="text-sm text-muted-foreground">
                  Loading judgment...
                </p>
              ) : !activeJudgment ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <Gavel className="h-10 w-10 mb-3 opacity-50" />
                  <h3 className="text-lg font-medium">Judgment Pending</h3>
                  <p className="text-sm max-w-sm mt-1">
                    The court has not yet issued a judgment for this case.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <FileCheck className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Judgment Issues</h3>
                      <p className="text-sm text-muted-foreground">
                        Date:{" "}
                        {format(new Date(activeJudgment.createdAt), "PPP")}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-medium">Summary / Decision</h4>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed wrap-break-word">
                      {activeJudgment.summary ||
                        activeJudgment.description ||
                        "No summary provided."}
                    </p>
                  </div>

                  {activeJudgment.attachment && (
                    <div className="pt-4">
                      <Button variant="outline" size="sm">
                        <FileText className="mr-2 h-4 w-4" />
                        View Attached Judgment Document
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 5: DOCUMENTS */}
        <TabsContent value="documents" className="mt-6">
          <CaseDocumentsTab
            documents={documents}
            isLoading={documentsLoading}
            role="lawyer"
            caseId={id}
            queryKey={["caseDocuments", id]}
          />
        </TabsContent>
      </Tabs>

      <SubmitCaseDialog
        open={submitDialogOpen}
        onOpenChange={setSubmitDialogOpen}
        caseId={id}
        onSubmitted={() => {
          queryClient.invalidateQueries(["case", id]);
        }}
      />
    </div>
  );
}

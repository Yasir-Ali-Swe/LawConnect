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
import { ArrowLeft, Gavel, CalendarPlus, CheckCircle, FileText, Download, Eye, Loader2 } from "lucide-react";
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

  const [verdict, setVerdict] = useState("");
  const [details, setDetails] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

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

  const { data: judgmentResult, isLoading: judgmentLoading } = useQuery({
    queryKey: ["caseJudgment", caseId],
    queryFn: () => casesApi.getJudgments(caseId),
    enabled: !!caseId,
  });

  const caseData = caseResult?.data;
  const hearings = hearingsResult?.data || [];
  const documents = documentsResult?.data || [];
  const judgment = judgmentResult?.data;
  const activeJudgment = Array.isArray(judgment) ? judgment[0] : judgment;

  // Sync state once judgment data is loaded
  React.useEffect(() => {
    if (activeJudgment && !isInitialized) {
      setVerdict(activeJudgment.verdict || "");
      setDetails(activeJudgment.judgmentDetails || "");
      setIsInitialized(true);
    }
  }, [activeJudgment, isInitialized]);

  // -- Mutations --

  const judgmentMutation = useMutation({
    mutationFn: (formData) => courtOfficerApi.makeJudgment(caseId, formData, setUploadProgress),
    onSuccess: () => {
      toast.success(activeJudgment ? "Judgment updated successfully." : "Judgment delivered. Case Decided.");
      setSelectedFile(null);
      setUploadProgress(0);
      setIsInitialized(false);
      queryClient.invalidateQueries(["caseJudgment", caseId]);
      queryClient.invalidateQueries(["activeCase", caseId]);
      queryClient.invalidateQueries(["officerCases"]);
      queryClient.invalidateQueries(["officerStats"]);
    },
    onError: (err) => {
      setUploadProgress(0);
      toast.error(err.response?.data?.message || "Failed to save judgment");
    },
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
            className="text-lg lg:text-3xl font-bold tracking-tight truncate"
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
        <TabsList className="flex w-full justify-start overflow-x-auto md:overflow-x-visible scrollbar-hide lg:w-125">
          <TabsTrigger value="overview" className="shrink-0">
            Overview
          </TabsTrigger>
          <TabsTrigger value="status" className="shrink-0">
            Status
          </TabsTrigger>
          <TabsTrigger value="hearings" className="shrink-0">
            Hearings
          </TabsTrigger>
          <TabsTrigger value="judgment" className="shrink-0">
            Judgment
          </TabsTrigger>
          <TabsTrigger value="documents" className="shrink-0">
            Documents
          </TabsTrigger>
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
              <CardTitle>{activeJudgment ? "Update Judgment" : "Final Judgment"}</CardTitle>
            </CardHeader>
            <CardContent>
              {judgmentLoading ? (
                <div className="py-4 text-sm text-muted-foreground">Loading judgment details...</div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!verdict.trim()) {
                      toast.warning("Verdict summary is required.");
                      return;
                    }
                    if (!details.trim()) {
                      toast.warning("Judgment details are required.");
                      return;
                    }

                    const isConfirm = confirm(
                      activeJudgment 
                        ? "Are you sure you want to update the judgment?" 
                        : "Are you sure? This will deliver the judgment and close the case."
                    );
                    
                    if (isConfirm) {
                      const fd = new FormData();
                      fd.append("verdict", verdict.trim());
                      fd.append("judgmentDetails", details.trim());
                      if (selectedFile) {
                        fd.append("file", selectedFile);
                      }
                      judgmentMutation.mutate(fd);
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <Label>Verdict Summary</Label>
                    <Input
                      name="verdict"
                      value={verdict}
                      onChange={(e) => setVerdict(e.target.value)}
                      placeholder="e.g. In favor of Plaintiff"
                      required
                    />
                  </div>
                  <div>
                    <Label>Detailed Judgment</Label>
                    <Textarea
                      name="details"
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      className="min-h-37.5"
                      placeholder="Full judgment text..."
                      required
                    />
                  </div>

                  {/* Decision Document display (if uploaded previously) */}
                  {activeJudgment?.documentOriginalName && (
                    <div className="mt-4">
                      <Label>Uploaded Decision Document</Label>
                      <Card className="mt-1 bg-muted/40">
                        <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 shrink-0 text-primary" />
                              <span className="font-medium text-sm truncate" title={activeJudgment.documentOriginalName}>
                                {activeJudgment.documentOriginalName}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground pl-6">
                              Uploaded {format(new Date(activeJudgment.updatedAt), "PPP")}
                              {activeJudgment.documentSize && ` · Size: ${(activeJudgment.documentSize / 1024 / 1024).toFixed(2)} MB`}
                            </p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button variant="outline" size="sm" asChild>
                              <a href={activeJudgment.documentUrl} target="_blank" rel="noopener noreferrer">
                                <Eye className="mr-1 h-4 w-4" /> View
                              </a>
                            </Button>
                            <Button variant="ghost" size="sm" type="button" onClick={() => {
                              const a = document.createElement("a");
                              a.href = activeJudgment.documentUrl;
                              a.download = activeJudgment.documentOriginalName || "decision";
                              a.target = "_blank";
                              a.rel = "noopener noreferrer";
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                            }}>
                              <Download className="mr-1 h-4 w-4" /> Download
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Document Upload Control */}
                  <div className="space-y-2">
                    <Label htmlFor="decision-file">
                      {activeJudgment?.documentOriginalName ? "Replace Decision Document (PDF, DOC, DOCX)" : "Upload Decision Document (PDF, DOC, DOCX)"}
                    </Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="decision-file"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const allowedTypes = [
                              "application/pdf",
                              "application/msword",
                              "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            ];
                            if (!allowedTypes.includes(file.type)) {
                              toast.error("Invalid file type. Only PDF, DOC, and DOCX are allowed.");
                              e.target.value = "";
                              setSelectedFile(null);
                              return;
                            }
                            if (file.size > 10 * 1024 * 1024) { // 10 MB
                              toast.error("File size exceeds 10MB limit.");
                              e.target.value = "";
                              setSelectedFile(null);
                              return;
                            }
                            setSelectedFile(file);
                          }
                        }}
                      />
                      {selectedFile && (
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            const fileInput = document.getElementById("decision-file");
                            if (fileInput) fileInput.value = "";
                          }}
                        >
                          Clear
                        </Button>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {uploadProgress > 0 && (
                      <div className="w-full mt-2">
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-muted-foreground mt-1 block">
                          Uploading: {uploadProgress}%
                        </span>
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant={activeJudgment ? "default" : "destructive"}
                    disabled={judgmentMutation.isPending}
                    className="w-full sm:w-auto"
                  >
                    {judgmentMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {uploadProgress > 0 ? "Uploading Document..." : "Saving..."}
                      </>
                    ) : (
                      <>
                        <Gavel className="mr-2 h-4 w-4" />
                        {activeJudgment ? "Update Judgment" : "Deliver Judgment & Close Case"}
                      </>
                    )}
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

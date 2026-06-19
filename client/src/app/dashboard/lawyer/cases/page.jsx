"use client";

import { useQuery } from "@tanstack/react-query";
import { casesApi } from "@/lib/api/cases";
import { CASE_STATUS, SUBMISSION_STATUS } from "@/lib/constants/case-enums";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

// import { dummyCases } from "@/lib/dummy-data/cases";

const toLabel = (value) => value.charAt(0).toUpperCase() + value.slice(1);

export default function CasesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [caseStatus, setCaseStatus] = useState("all");
  const [submissionStatus, setSubmissionStatus] = useState("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filters = useMemo(
    () => ({
      search: debouncedSearchTerm,
      status: caseStatus,
      submissionStatus,
    }),
    [debouncedSearchTerm, caseStatus, submissionStatus],
  );

  const { data: result, isLoading } = useQuery({
    queryKey: ["lawyerCases", filters],
    queryFn: () => casesApi.getAll(filters),
    retry: false,
  });

  const cases = result?.data || [];

  const hasActiveFilters =
    searchTerm || caseStatus !== "all" || submissionStatus !== "all";

  const resetFilters = () => {
    setSearchTerm("");
    setCaseStatus("all");
    setSubmissionStatus("all");
  };

  return (
    <div className="space-y-6 py-6 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Cases</h2>
          <p className="text-muted-foreground">
            Manage your assigned cases here.
          </p>
        </div>
        {/* Lawyer can't register cases directly? Usually they draft them. 
            The requirements mentioned "Lawyer Draft Case" exists in routes.
            Maybe add a "Draft New Case" button? 
            Prompt didn't explicitly ask for "Draft Case" UI, but it makes sense.
            I will leave it out for this specific step unless simple. 
            "Lawyer Draft Case" -> POST /draft-case.
            I'll add a provisional button.
        */}
        {/* Lawyer Draft Case Button */}
        <Button asChild>
          <Link href="/dashboard/lawyer/cases/new">
            <Plus className="mr-2 h-4 w-4" /> Draft New Case
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by case number or case ID..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={caseStatus} onValueChange={setCaseStatus}>
          <SelectTrigger className="w-full md:w-47.5">
            <SelectValue placeholder="Case Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Case Statuses</SelectItem>
            {CASE_STATUS.map((status) => (
              <SelectItem key={status} value={status}>
                {toLabel(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={submissionStatus} onValueChange={setSubmissionStatus}>
          <SelectTrigger className="w-full md:w-55">
            <SelectValue placeholder="Submission Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Submission Statuses</SelectItem>
            {SUBMISSION_STATUS.map((status) => (
              <SelectItem key={status} value={status}>
                {toLabel(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={resetFilters}
          disabled={!hasActiveFilters}
        >
          Reset
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Cases</CardTitle>
          <CardDescription>
            List of all cases where you are the lead counsel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading cases...
            </div>
          ) : cases.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {hasActiveFilters
                ? "No cases found matching your filters."
                : "No cases found."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case Number</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Submission Status</TableHead>
                  <TableHead>Case Status</TableHead>
                  <TableHead>Date Filed</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases.map((c) => (
                  <TableRow key={c._id}>
                    <TableCell className="font-medium">
                      {c.caseNumber || (
                        <span className="text-muted-foreground italic">
                          Draft
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-50">
                      <div className="truncate" title={c.title}>
                        {c.title}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col max-w-37.5">
                        <span
                          className="font-medium truncate"
                          title={c.clientId?.fullName}
                        >
                          {c.clientId?.fullName || "N/A"}
                        </span>
                        <span
                          className="text-xs text-muted-foreground truncate"
                          title={c.clientId?.email}
                        >
                          {c.clientId?.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{c.type}</TableCell>
                    <TableCell>
                      {c.submissionStatus === "draft" && (
                        <Badge variant="secondary">Draft</Badge>
                      )}
                      {c.submissionStatus === "submitted" && (
                        <Badge className="bg-blue-600 hover:bg-blue-700">
                          Submitted
                        </Badge>
                      )}
                      {c.submissionStatus === "registered" && (
                        <Badge
                          variant="outline"
                          className="text-green-700 border-green-600 bg-green-50"
                        >
                          Registered
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {c.status ? (
                        <Badge
                          variant={
                            c.status === "active"
                              ? "default"
                              : c.status === "closed"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {toLabel(c.status)}
                        </Badge>
                      ) : (
                        <Badge variant="outline">N/A</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {c.filedByLawyerAt
                        ? format(new Date(c.filedByLawyerAt), "MMM d, yyyy")
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/dashboard/lawyer/cases/${c._id}`}>
                          View Details
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

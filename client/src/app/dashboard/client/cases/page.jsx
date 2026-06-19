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
import { Input } from "@/components/ui/input";
import Link from "next/link";
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
import { Eye, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const toLabel = (value) => value.charAt(0).toUpperCase() + value.slice(1);

export default function ClientCasesPage() {
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
    queryKey: ["clientCases", filters],
    queryFn: () => casesApi.getClientCases(filters),
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
          <h2 className="text-3xl font-bold tracking-tight">My Cases</h2>
          <p className="text-muted-foreground">
            View the status and details of your legal cases.
          </p>
        </div>
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
          <CardTitle>Case List</CardTitle>
          <CardDescription>
            All cases associated with your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading your cases...
            </div>
          ) : cases.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {hasActiveFilters
                ? "No cases found matching your filters."
                : "You have no cases yet."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case Number</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Lead Lawyer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Submission Status</TableHead>
                  <TableHead>Case Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases.map((c) => (
                  <TableRow key={c._id}>
                    <TableCell className="font-medium max-w-30">
                      <div className="truncate" title={c.caseNumber}>
                        {c.caseNumber || (
                          <span className="text-muted-foreground italic">
                            Draft (Unfiled)
                          </span>
                        )}
                      </div>
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
                          title={c.lawyerId?.fullName}
                        >
                          {c.lawyerId?.fullName || "Unassigned"}
                        </span>
                        <span
                          className="text-xs text-muted-foreground truncate"
                          title={c.lawyerId?.email}
                        >
                          {c.lawyerId?.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{c.type}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {/* Submission Status */}
                        {c.submissionStatus === "draft" && (
                          <Badge variant="secondary" className="w-fit">
                            Draft
                          </Badge>
                        )}
                        {c.submissionStatus === "submitted" && (
                          <Badge className="bg-blue-600 w-fit">Submitted</Badge>
                        )}
                        {c.submissionStatus === "registered" && (
                          <Badge
                            variant="outline"
                            className="text-green-700 border-green-600 bg-green-50 w-fit"
                          >
                            Registered
                          </Badge>
                        )}
                        {!c.submissionStatus && (
                          <Badge variant="outline" className="w-fit">
                            N/A
                          </Badge>
                        )}
                      </div>
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
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/client/cases/${c._id}`}>
                          <Eye className="mr-2 h-4 w-4" /> View
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

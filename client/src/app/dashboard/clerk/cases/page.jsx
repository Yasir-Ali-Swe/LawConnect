"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { clerkApi } from "@/lib/api/clerk";
import { CASE_STATUS, SUBMISSION_STATUS } from "@/lib/constants/case-enums";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Gavel, Eye, Search } from "lucide-react";

const toLabel = (value) => value.charAt(0).toUpperCase() + value.slice(1);

export default function SubmittedCasesPage() {
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
    queryKey: ["submittedCases", filters],
    queryFn: () => clerkApi.getSubmittedCases(filters),
  });

  const cases = result?.data || [];
  const clerkSubmissionOptions = SUBMISSION_STATUS.filter(
    (value) => value !== "draft",
  );

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
          <h2 className="text-2xl font-bold tracking-tight">Court Cases</h2>
          <p className="text-muted-foreground">
            Manage submitted and registered cases for your court.
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
            {clerkSubmissionOptions.map((status) => (
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

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm text-left">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors bg-muted/50">
                <th className="h-12 px-4 align-middle font-medium">Title</th>
                <th className="h-12 px-4 align-middle font-medium">Type</th>
                <th className="h-12 px-4 align-middle font-medium">
                  Submission Status
                </th>
                <th className="h-12 px-4 align-middle font-medium">
                  Case Status
                </th>
                <th className="h-12 px-4 align-middle font-medium">Lawyer</th>
                <th className="h-12 px-4 align-middle font-medium">Officer</th>
                <th className="h-12 px-4 align-middle font-medium">
                  Submitted Date
                </th>
                <th className="h-12 px-4 align-middle font-medium text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-4 text-center">
                    Loading cases...
                  </td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="p-8 text-center text-muted-foreground"
                  >
                    {hasActiveFilters
                      ? "No cases found matching your filters."
                      : "No cases found."}
                  </td>
                </tr>
              ) : (
                cases.map((item) => (
                  <tr
                    key={item._id}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <td
                      className="p-4 align-middle font-medium truncate max-w-50"
                      title={item.title}
                    >
                      {item.title}
                      <div className="text-xs text-muted-foreground font-normal truncate">
                        {item.caseNumber || "No Case No."}
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <Badge variant="outline">{item.type}</Badge>
                    </td>
                    <td className="p-4 align-middle">
                      {item.submissionStatus === "registered" ? (
                        <Badge
                          variant="outline"
                          className="text-green-700 border-green-600 bg-green-50"
                        >
                          Registered
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-600 hover:bg-blue-700">
                          Submitted
                        </Badge>
                      )}
                    </td>
                    <td className="p-4 align-middle">
                      {item.status ? (
                        <Badge
                          variant={
                            item.status === "active"
                              ? "default"
                              : item.status === "closed"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {toLabel(item.status)}
                        </Badge>
                      ) : (
                        <Badge variant="outline">N/A</Badge>
                      )}
                    </td>
                    <td className="p-4 align-middle max-w-37.5">
                      <div className="truncate" title={item.lawyerId?.fullName}>
                        {item.lawyerId?.fullName || "Unknown"}
                      </div>
                    </td>
                    <td className="p-4 align-middle max-w-37.5">
                      <div
                        className="truncate"
                        title={item.courtOfficerId?.fullName}
                      >
                        {item.courtOfficerId?.fullName || "-"}
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      {item.filedByLawyerAt
                        ? format(new Date(item.filedByLawyerAt), "MMM dd, yyyy")
                        : "-"}
                    </td>
                    <td className="p-4 align-middle text-right">
                      <Button
                        asChild
                        size="sm"
                        variant={
                          item.submissionStatus === "registered"
                            ? "ghost"
                            : "default"
                        }
                      >
                        <Link href={`/dashboard/clerk/cases/${item._id}`}>
                          {item.submissionStatus === "registered" ? (
                            <>
                              <Eye className="w-4 h-4 mr-1" /> View
                            </>
                          ) : (
                            <>
                              <Gavel className="w-4 h-4 mr-1" /> Register
                            </>
                          )}
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

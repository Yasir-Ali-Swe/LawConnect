"use client";

import { useQuery } from "@tanstack/react-query";
import { courtOfficerApi } from "@/lib/api/court-officer";
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
import { CASE_STATUS, SUBMISSION_STATUS } from "@/lib/constants/case-enums";
import { useState } from "react";
import { Eye, Search } from "lucide-react";

export default function OfficerCasesPage() {
  const { data: result, isLoading } = useQuery({
    queryKey: ["officerCases"],
    queryFn: courtOfficerApi.getAllCases,
  });

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSubmissionStatus, setFilterSubmissionStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const cases = result?.data || [];

  const filteredCases = cases.filter((c) => {
    const matchesStatus = filterStatus === "all" || c.status === filterStatus;
    const matchesSubmissionStatus =
      filterSubmissionStatus === "all" ||
      c.submissionStatus === filterSubmissionStatus;
    const normalizedSearch = searchTerm.toLowerCase();
    const matchesSearch =
      c.title?.toLowerCase().includes(normalizedSearch) ||
      c.caseNumber?.toLowerCase().includes(normalizedSearch) ||
      c._id?.toLowerCase().includes(normalizedSearch);
    return matchesStatus && matchesSubmissionStatus && matchesSearch;
  });

  const toLabel = (value) => value.charAt(0).toUpperCase() + value.slice(1);

  return (
    <div className="space-y-6 py-6 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">My Cases</h2>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, case number, or ID..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {CASE_STATUS.map((status) => (
              <SelectItem key={status} value={status}>
                {toLabel(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filterSubmissionStatus}
          onValueChange={setFilterSubmissionStatus}
        >
          <SelectTrigger className="w-50">
            <SelectValue placeholder="Submission Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Submission</SelectItem>
            {SUBMISSION_STATUS.map((status) => (
              <SelectItem key={status} value={status}>
                {toLabel(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm text-left">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors bg-muted/50">
                <th className="h-12 px-4 align-middle font-medium">
                  Case Number
                </th>
                <th className="h-12 px-4 align-middle font-medium">Title</th>
                <th className="h-12 px-4 align-middle font-medium">Type</th>
                <th className="h-12 px-4 align-middle font-medium">Lawyer</th>
                <th className="h-12 px-4 align-middle font-medium">
                  Case Status
                </th>
                <th className="h-12 px-4 align-middle font-medium text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center">
                    Loading cases...
                  </td>
                </tr>
              ) : filteredCases.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center text-muted-foreground"
                  >
                    No cases found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredCases.map((item) => (
                  <tr
                    key={item._id}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="p-4 align-middle font-medium text-muted-foreground">
                      {item.caseNumber || "PENDING"}
                    </td>
                    <td className="p-4 align-middle font-medium truncate max-w-50">
                      {item.title}
                    </td>
                    <td className="p-4 align-middle">
                      <Badge variant="outline">{item.type}</Badge>
                    </td>
                    <td className="p-4 align-middle">
                      {item.lawyerId?.fullName || "Unknown"}
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
                    <td className="p-4 align-middle text-right">
                      <Button asChild size="sm" variant="ghost">
                        <Link
                          href={`/dashboard/court-officer/case/${item._id}`}
                        >
                          <Eye className="w-4 h-4 mr-1" /> View Details
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

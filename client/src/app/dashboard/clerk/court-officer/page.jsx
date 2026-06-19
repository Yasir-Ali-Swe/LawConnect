"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { clerkApi } from "@/lib/api/clerk";
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
import { Search, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ClerkCourtOfficersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filters = useMemo(
    () => ({
      search: debouncedSearchTerm,
      status,
    }),
    [debouncedSearchTerm, status],
  );

  const { data: result, isLoading } = useQuery({
    queryKey: ["clerkCourtOfficers", filters],
    queryFn: () => clerkApi.getMyCourtOfficers(filters),
  });

  const officers = result?.data || [];
  const hasActiveFilters = searchTerm || status !== "all";

  const resetFilters = () => {
    setSearchTerm("");
    setStatus("all");
  };

  return (
    <div className="space-y-6 py-6 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Court Officers</h2>
          <p className="text-muted-foreground">
            Manage court officers assigned to your court.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full md:w-47.5">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
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

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No.</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : officers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  {hasActiveFilters
                    ? "No court officers found matching your filters."
                    : "No court officers found."}
                </TableCell>
              </TableRow>
            ) : (
              officers.map((officer, i) => (
                <TableRow key={officer._id} className="hover:bg-muted/50">
                  <TableCell>{i + 1}</TableCell>
                  <TableCell className="font-medium max-w-50">
                    <div className="truncate" title={officer.userId?.fullName}>
                      {officer.userId?.fullName || "N/A"}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-50">
                    <div className="truncate" title={officer.userId?.email}>
                      {officer.userId?.email || "N/A"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {officer.designation || "Court Officer"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {officer.userId?.isVerified ? (
                      <Badge className="bg-green-600 hover:bg-green-700">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

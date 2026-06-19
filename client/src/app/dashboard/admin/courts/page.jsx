"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { useRouter } from "next/navigation";

const createCourtSchema = z.object({
  name: z.string().min(2, "Court Name required"),
  type: z.enum([
    "Supreme Court",
    "High Court",
    "District Court",
    "Session Court",
  ]),
  city: z.string().min(2, "City required"),
  province: z.enum(["Punjab", "Sindh", "KPK", "Balochistan"]),
});

function CreateCourtDialog({ open, onOpenChange }) {
  const queryClient = useQueryClient();
  const form = useForm({
    resolver: zodResolver(createCourtSchema),
    defaultValues: {
      name: "",
      type: "District Court",
      city: "",
      province: "Punjab",
    },
  });

  const mutation = useMutation({
    mutationFn: adminApi.createCourt,
    onSuccess: () => {
      toast.success("Court created successfully");
      queryClient.invalidateQueries(["courts"]);
      onOpenChange(false);
      form.reset();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create court");
    },
  });

  const onSubmit = (values) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Add New Court</DialogTitle>
          <DialogDescription className="wrap-break-words whitespace-pre-wrap">
            Register a new court entity in the system.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Court Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Lahore High Court" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Supreme Court">
                          Supreme Court
                        </SelectItem>
                        <SelectItem value="High Court">High Court</SelectItem>
                        <SelectItem value="District Court">
                          District Court
                        </SelectItem>
                        <SelectItem value="Session Court">
                          Session Court
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Province</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Province" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Punjab">Punjab</SelectItem>
                        <SelectItem value="Sindh">Sindh</SelectItem>
                        <SelectItem value="KPK">KPK</SelectItem>
                        <SelectItem value="Balochistan">Balochistan</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Lahore" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isPending}
            >
              {mutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Court
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminCourtsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [province, setProvince] = useState("all");
  const [type, setType] = useState("all");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filters = useMemo(
    () => ({
      search: debouncedSearchTerm,
      province,
      type,
    }),
    [debouncedSearchTerm, province, type],
  );

  const { data: result, isLoading } = useQuery({
    queryKey: ["courts", filters],
    queryFn: () => adminApi.getAllCourts(filters),
  });

  const courts = result?.courts || [];
  const hasActiveFilters = searchTerm || province !== "all" || type !== "all";

  const resetFilters = () => {
    setSearchTerm("");
    setProvince("all");
    setType("all");
  };

  return (
    <div className="space-y-6 py-6 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Courts</h2>
          <p className="text-muted-foreground">
            Manage courts and staff assignments.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Building2 className="mr-2 h-4 w-4" />
          Add Court
        </Button>
      </div>

      <CreateCourtDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1 md:max-w-sm">
          <Input
            placeholder="Search courts by name..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <Select value={province} onValueChange={setProvince}>
          <SelectTrigger className="w-full md:w-47.5">
            <SelectValue placeholder="Province" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Provinces</SelectItem>
            <SelectItem value="Punjab">Punjab</SelectItem>
            <SelectItem value="Sindh">Sindh</SelectItem>
            <SelectItem value="KPK">KPK</SelectItem>
            <SelectItem value="Balochistan">Balochistan</SelectItem>
          </SelectContent>
        </Select>

        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-full md:w-47.5">
            <SelectValue placeholder="Court Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Supreme Court">Supreme Court</SelectItem>
            <SelectItem value="High Court">High Court</SelectItem>
            <SelectItem value="District Court">District Court</SelectItem>
            <SelectItem value="Session Court">Session Court</SelectItem>
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

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No.</TableHead>
              <TableHead>Court Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Assigned Clerk</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : courts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  {hasActiveFilters
                    ? "No courts found matching your filters."
                    : "No courts found."}
                </TableCell>
              </TableRow>
            ) : (
              courts.map((court, i) => (
                <TableRow
                  key={court._id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() =>
                    router.push(`/dashboard/admin/courts/${court._id}`)
                  }
                >
                  <TableCell>{i + 1}</TableCell>
                  <TableCell className="font-medium max-w-50">
                    <div className="truncate" title={court.name}>
                      {court.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{court.type}</Badge>
                  </TableCell>
                  <TableCell className="max-w-37.5">
                    <div
                      className="truncate"
                      title={`${court.city}, ${court.province}`}
                    >
                      {court.city}, {court.province}
                    </div>
                  </TableCell>
                  <TableCell>
                    {court.clerkId ? (
                      <Badge variant="secondary">Assigned</Badge>
                    ) : (
                      <Badge
                        variant="destructive"
                        className="bg-red-100 text-red-800 hover:bg-red-100"
                      >
                        Unassigned
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
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

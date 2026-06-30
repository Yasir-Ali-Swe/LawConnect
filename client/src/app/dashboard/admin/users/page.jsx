"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, UserPlus, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

// Schema for Creating Internal User
const createUserSchema = z.object({
  fullName: z.string().min(2, "Name required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password min 6 chars"),
  dob: z.string().min(1, "DOB required"),
  city: z.string().min(2, "City required"),
  province: z.string().min(2, "Province required"),
  role: z.enum(["clerk", "court_officer"]),
});

function CreateUserDialog({ open, onOpenChange }) {
  const [showPassword, setShowPassword] = useState(false);
  const queryClient = useQueryClient();
  const form = useForm({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      dob: "",
      city: "",
      province: "",
      role: "clerk",
    },
  });

  const mutation = useMutation({
    mutationFn: adminApi.createInternalUser,
    onSuccess: () => {
      toast.success("User created successfully. Credentials sent via email.");
      queryClient.invalidateQueries(["internalUsers"]);
      onOpenChange(false);
      form.reset();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create user");
    },
  });

  const onSubmit = (values) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Internal User</DialogTitle>
          <DialogDescription className="wrap-break-word whitespace-pre-wrap">
            Add a new Clerk or Court Officer to the system.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="******"
                        {...field}
                      />
                      <button
                        type="button"
                        aria-label="Toggle password visibility"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
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
                          <SelectValue placeholder="Select Province" />
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
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="clerk">Clerk</SelectItem>
                      <SelectItem value="court_officer">
                        Court Officer
                      </SelectItem>
                    </SelectContent>
                  </Select>
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
              Create User
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminUsersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [emailTerm, setEmailTerm] = useState("");
  const [debouncedEmailTerm, setDebouncedEmailTerm] = useState("");
  const [locationTerm, setLocationTerm] = useState("");
  const [debouncedLocationTerm, setDebouncedLocationTerm] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");

  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (e.target.closest(".actions-dropdown-container")) {
        return;
      }
      setActiveDropdown(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
      setDebouncedEmailTerm(emailTerm.trim());
      setDebouncedLocationTerm(locationTerm.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm, emailTerm, locationTerm]);

  const filters = useMemo(
    () => ({
      search: debouncedSearchTerm,
      email: debouncedEmailTerm,
      location: debouncedLocationTerm,
      role,
      status,
    }),
    [debouncedSearchTerm, debouncedEmailTerm, debouncedLocationTerm, role, status],
  );

  const { data: result, isLoading } = useQuery({
    queryKey: ["internalUsers", filters],
    queryFn: () => adminApi.getAllInternalUsers(filters),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: adminApi.toggleUserStatus,
    onSuccess: (data) => {
      toast.success(data.message || "User status updated successfully");
      queryClient.invalidateQueries(["internalUsers"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to toggle user status");
    },
  });

  const users = result?.data || [];
  const hasActiveFilters = searchTerm || emailTerm || locationTerm || role !== "all" || status !== "all";

  const resetFilters = () => {
    setSearchTerm("");
    setEmailTerm("");
    setLocationTerm("");
    setRole("all");
    setStatus("all");
  };

  return (
    <div className="space-y-6 py-6 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Users</h2>
          <p className="text-muted-foreground">
            Manage system users across all roles.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Create User
        </Button>
      </div>

      <CreateUserDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5 items-end">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email..."
            className="pl-8"
            value={emailTerm}
            onChange={(e) => setEmailTerm(e.target.value)}
          />
        </div>

        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by location..."
            className="pl-8"
            value={locationTerm}
            onChange={(e) => setLocationTerm(e.target.value)}
          />
        </div>

        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="client">Client</SelectItem>
            <SelectItem value="lawyer">Lawyer</SelectItem>
            <SelectItem value="clerk">Clerk</SelectItem>
            <SelectItem value="court_officer">Court Officer</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2 w-full">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full">
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
            className="shrink-0"
          >
            Reset
          </Button>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">No.</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right pr-6 w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  {hasActiveFilters
                    ? "No users found matching your filters."
                    : "No users found."}
                </TableCell>
              </TableRow>
            ) : (
              users.map((user, i) => {
                const userStatus = user.status || (user.role === "lawyer" ? "inactive" : "active");
                return (
                  <TableRow key={user._id}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell className="font-medium max-w-50">
                      <div className="truncate" title={user.fullName}>
                        {user.fullName}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-50">
                      <div className="truncate" title={user.email}>
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {user.role === "court_officer"
                          ? "Officer"
                          : user.role.charAt(0).toUpperCase() +
                          user.role.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-37.5">
                      <div className="truncate" title={user.profile?.city}>
                        {user.profile?.city || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {userStatus === "active" ? (
                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 font-medium">
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-900/50 hover:bg-amber-100 dark:hover:bg-amber-950/40 font-medium">
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="relative inline-block text-left actions-dropdown-container">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setActiveDropdown(activeDropdown === user._id ? null : user._id);
                          }}
                        >
                          <span className="sr-only">Open actions</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        {activeDropdown === user._id && (
                          <div className="absolute right-0 mt-1 w-32 origin-top-right rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md z-50 animate-in fade-in duration-100 slide-in-from-top-1">
                            <button
                              onClick={() => {
                                setActiveDropdown(null);
                                router.push(`/dashboard/admin/users/${user._id}`);
                              }}
                              className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors text-left"
                            >
                              View Profile
                            </button>
                            <button
                              onClick={() => {
                                setActiveDropdown(null);
                                toggleStatusMutation.mutate(user._id);
                              }}
                              className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors text-left"
                            >
                              Toggle Status
                            </button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

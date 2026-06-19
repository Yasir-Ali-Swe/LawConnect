"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
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
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [locationTerm, setLocationTerm] = useState("");
  const [debouncedLocationTerm, setDebouncedLocationTerm] = useState("");
  const [role, setRole] = useState("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
      setDebouncedLocationTerm(locationTerm.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm, locationTerm]);

  const filters = useMemo(
    () => ({
      search: debouncedSearchTerm,
      location: debouncedLocationTerm,
      role,
    }),
    [debouncedSearchTerm, debouncedLocationTerm, role],
  );

  const { data: result, isLoading } = useQuery({
    queryKey: ["internalUsers", filters],
    queryFn: () => adminApi.getAllInternalUsers(filters),
  });

  const users = result?.data || [];
  const hasActiveFilters = searchTerm || locationTerm || role !== "all";

  const resetFilters = () => {
    setSearchTerm("");
    setLocationTerm("");
    setRole("all");
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

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1 md:max-w-62.5">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative flex-1 md:max-w-62.5">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by location..."
            className="pl-8"
            value={locationTerm}
            onChange={(e) => setLocationTerm(e.target.value)}
          />
        </div>

        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-full md:w-50">
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
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Location</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  {hasActiveFilters
                    ? "No users found matching your filters."
                    : "No users found."}
                </TableCell>
              </TableRow>
            ) : (
              users.map((user, i) => (
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
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

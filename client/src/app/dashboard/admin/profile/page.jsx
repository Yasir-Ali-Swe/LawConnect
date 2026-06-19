"use client";
import { AdminProfileForm } from "@/components/dashboard/admin/AdminProfileForm";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const accountSchema = z.object({
  fullName: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
});

export default function AdminProfilePage() {
  const queryClient = useQueryClient();

  // Fetch Logic
  const {
    data: result,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["adminProfile"],
    queryFn: adminApi.getProfile,
    retry: false,
  });

  const isProfileNotFound = error?.response?.status === 404;
  const isEditing = !isProfileNotFound && !!result;
  const profile = result?.profile;
  const userBase = profile?.userId; // Populated from backend

  // Account Form Logic
  const accountForm = useForm({
    resolver: zodResolver(accountSchema),
    values: {
      fullName: userBase ? userBase.fullName : "",
      email: userBase ? userBase.email : "",
    },
  });

  const accountMutation = useMutation({
    mutationFn: adminApi.updateAccount,
    onSuccess: () => {
      toast.success("Account details updated successfully!");
      queryClient.invalidateQueries(["adminProfile"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update account");
    },
  });

  // Profile Form Logic (Personal Info)
  const profileMutation = useMutation({
    mutationFn: (values) => {
      if (isEditing) {
        return adminApi.updateProfile(values);
      } else {
        return adminApi.createProfile(values);
      }
    },
    onSuccess: () => {
      toast.success(
        isEditing
          ? "Profile updated successfully!"
          : "Profile created successfully!",
      );
      queryClient.invalidateQueries(["adminProfile"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to save profile");
    },
  });

  if (isLoading)
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );

  return (
    <div className="w-full max-w-2xl mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and personal information.
        </p>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="account">Account Details</TabsTrigger>
          <TabsTrigger value="personal">Personal Information</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>
                Update your login credentials and display name.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...accountForm}>
                <form
                  onSubmit={accountForm.handleSubmit((values) =>
                    accountMutation.mutate(values),
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={accountForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={accountForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="admin@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={accountMutation.isPending}>
                    {accountMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                {isEditing
                  ? "Manage your personal details."
                  : "Complete your profile information."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminProfileForm
                defaultValues={
                  isEditing
                    ? {
                        dob: profile?.dob
                          ? new Date(profile.dob).toISOString().split("T")[0]
                          : "",
                        city: profile?.city || "",
                        province: profile?.province || "",
                        profileImageUrl: profile?.profileImageUrl || "",
                      }
                    : undefined
                }
                onSubmit={(values) => profileMutation.mutate(values)}
                isSubmitting={profileMutation.isPending}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

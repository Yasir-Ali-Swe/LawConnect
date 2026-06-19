"use client";
import { useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Scale,
  Activity,
  FileText,
  MessageCircle,
  Users,
  UserSearch,
  Send,
  CircleQuestionMark,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";

const formSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  role: z.enum(["client", "lawyer", "clerk", "court_officer"], {
    message: "Please select a role",
  }),
});
const RegisterationPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      role: "client",
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      toast.success(
        data?.message || "Registration successful. Please verify your email.",
      );
      form.reset();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Registration failed");
    },
  });

  function onSubmit(values) {
    registerMutation.mutate(values);
  }
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 min-h-screen w-screen ">
      <Link
        href="/"
        className="text-background hover:underline absolute top-5 left-10 xl:top-25 xl:left-10"
      >
        Go Back
      </Link>
      <div className="bg-foreground px-10 py-10 xl:pt-0 xl:flex xl:flex-col xl:justify-center">
        <div>
          <h1 className="text-3xl font-bold text-background flex items-center gap-3">
            <Scale size={40} /> LawConnect
          </h1>
          <p className="text-lg text-muted-foreground font-light my-3">
            Connecting lawyers, clients, and the judiciary seamlessly.
          </p>
        </div>
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-background my-2 flex items-center gap-1">
            Why LawConnect
            <CircleQuestionMark size={25} />
          </h2>
          <p className="text-muted-foreground text-lg font-light my-3 text-justify">
            LawConnect is designed to simplify legal services for
            everyone—clients, lawyers, and the judiciary. Whether you’re seeking
            legal advice, managing cases, or tracking progress, LawConnect keeps
            everything in one secure platform.
          </p>

          <ul className="mt-8 space-y-3 text-background text-md">
            <li className="group">
              <p className="flex items-center gap-3 text-background transition-colors duration-500 ease-in-out group-hover:text-border">
                <UserSearch
                  size={25}
                  className="text-blue-500 transition-colors duration-500 ease-in-out group-hover:text-border"
                />
                Allows clients to find lawyer
              </p>
            </li>

            <li className="group">
              <p className="flex items-center gap-3 text-background transition-colors duration-500 ease-in-out group-hover:text-border">
                <Send
                  size={25}
                  className="text-blue-500 transition-colors duration-500 ease-in-out group-hover:text-border"
                />
                Send proposals
              </p>
            </li>

            <li className="group">
              <p className="flex items-center gap-3 text-background transition-colors duration-500 ease-in-out group-hover:text-border">
                <MessageCircle
                  size={25}
                  className="text-blue-500 transition-colors duration-500 ease-in-out group-hover:text-border"
                />
                Send messages
              </p>
            </li>

            <li className="group">
              <p className="flex items-center gap-3 text-background transition-colors duration-500 ease-in-out group-hover:text-border ">
                <Users
                  size={25}
                  className="text-blue-500 transition-colors duration-500 ease-in-out group-hover:text-border"
                />
                Client and lawyer communication
              </p>
            </li>

            <li className="group">
              <p className="flex items-center gap-3 text-background transition-colors duration-500 ease-in-out group-hover:text-border ">
                <FileText
                  size={25}
                  className="text-blue-500 transition-colors duration-500 ease-in-out group-hover:text-border"
                />
                File and case management
              </p>
            </li>

            <li className="group">
              <p className="flex items-center gap-3 text-background transition-colors duration-500 ease-in-out group-hover:text-border ">
                <Activity
                  size={25}
                  className="text-blue-500 transition-colors duration-500 ease-in-out group-hover:text-border"
                />
                Track case progress
              </p>
            </li>
          </ul>
        </div>
      </div>
      <div className="flex justify-center items-center my-10 xl:my-0">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Register</CardTitle>
            <CardDescription>Create a new account.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
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
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="email@example.com" {...field} />
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
                            className="pr-10"
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
                          <SelectItem value="client">Client</SelectItem>
                          <SelectItem value="lawyer">Lawyer</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? "Registering..." : "Register"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter>
            <Button variant="link" className="w-full ">
              <Link href={"/login"}>Already have an account? Login</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default RegisterationPage;

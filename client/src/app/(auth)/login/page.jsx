"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { authApi } from "@/lib/api";
import { setUser } from "@/store/slices/auth-slice";
import { getPostLoginPath } from "@/lib/auth-redirects";
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
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});
const LoginPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      toast.success("Login successful");
      authApi.getMe().then((meData) => {
        if (meData.success) {
          dispatch(setUser(meData.user));
          router.replace(getPostLoginPath(meData.user));
        }
      });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Login failed");
    },
  });

  function onSubmit(values) {
    loginMutation.mutate(values);
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 min-h-screen w-screen">
      <Link
        href="/home"
        className="text-background hover:underline hidden xl:absolute top-5 left-10 xl:top-15 xl:left-10"
      >
        Go Back
      </Link>
      <div className="hidden bg-foreground xl:flex xl:flex-col xl:justify-center">
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
      <div className="flex flex-col justify-center items-center px-5 lg:px-0">
        <div className="flex flex-col items-center justify-center space-y-3 mb-9 xl:hidden">
          <Link href={"/"} className="flex items-center gap-1 cursor-pointer">
            <Scale className="size-9" />
            <p className="text-3xl font-bold">LawConnect</p>
          </Link>
          <p className="text-center text-lg text-primary font-medium">
            Connecting lawyers, clients, and the judiciary seamlessly.
          </p>
        </div>
        <Card className={"w-full max-w-sm"}>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Please enter your credentials to login.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-2"
              >
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

                <div className="flex justify-start">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Logging in..." : "Login"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter>
            <Button variant="link" className="w-full ">
              <Link href={"/registeration"}>
                Don&apos;t have an account? Register
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;

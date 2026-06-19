"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { getPostLoginPath } from "@/lib/auth-redirects";

function AuthLoadingScreen() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

export default function AuthLayout({ children }) {
  const { user, isAuthLoading, isAuthenticated } = useSelector(
    (state) => state.auth,
  );
  const router = useRouter();

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated || !user) {
      return;
    }

    router.replace(getPostLoginPath(user));
  }, [user, isAuthLoading, isAuthenticated, router]);

  if (isAuthLoading) {
    return <AuthLoadingScreen />;
  }

  return (
    <main className="flex h-full w-full items-center justify-center">
      {children}
    </main>
  );
}

"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { getCompleteProfilePath } from "@/lib/auth-redirects";

function AuthLoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

export default function AuthGuard({ children }) {
  const { isAuthenticated, isProfileComplete, role, isAuthLoading } =
    useSelector((state) => state.auth);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (!isProfileComplete && role) {
      const profilePath = getCompleteProfilePath(role);
      if (pathname !== profilePath) {
        router.replace(profilePath);
      }
    }
  }, [isAuthenticated, isProfileComplete, role, router, pathname, isAuthLoading]);

  if (isAuthLoading) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

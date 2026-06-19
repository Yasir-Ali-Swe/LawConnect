"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }) {
  const { isAuthenticated, isProfileComplete, user, role, isAuthLoading } = useSelector(
    (state) => state.auth,
  );
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait for auth loading to complete before making decisions
    if (isAuthLoading) {
      return;
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // If authenticated but profile incomplete, redirect to profile completion
    if (!isProfileComplete) {
      const normalizedRole = role.replace("_", "-");
      const profilePath = `/dashboard/${normalizedRole}/complete-profile`;
      // Avoid infinite loop if already on profile page
      if (pathname !== profilePath) {
        router.push(profilePath);
      }
    }
  }, [isAuthenticated, isProfileComplete, role, router, pathname, isAuthLoading]);

  // Don't render anything while loading or if not authenticated
  if (isAuthLoading || !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

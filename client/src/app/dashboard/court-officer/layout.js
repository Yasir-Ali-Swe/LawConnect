"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { getDashboardPathForRole } from "@/lib/auth-redirects";

export default function CourtOfficerLayout({ children }) {
  const { user, isAuthLoading } = useSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (isAuthLoading || !user) {
      return;
    }

    if (user.role !== "court_officer") {
      router.replace(getDashboardPathForRole(user.role));
    }
  }, [user, isAuthLoading, router]);

  return children;
}

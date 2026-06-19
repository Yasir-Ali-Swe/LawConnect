"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

const roleRoutes = {
  client: "client",
  lawyer: "lawyer",
  admin: "admin",
  clerk: "clerk",
  court_officer: "court-officer",
};

export default function AdminLayout({ children }) {
  const { user } = useSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    if (user.role !== "admin") {
      router.replace(`/dashboard/${roleRoutes[user.role]}`);
    }
  }, [user, router]);

  return children;
}

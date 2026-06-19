"use client";
import React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { usePathname } from "next/navigation";

const roleRoutes = {
  client: "client",
  lawyer: "lawyer",
  admin: "admin",
  clerk: "clerk",
  court_officer: "court-officer",
};

const layout = ({ children }) => {
  const pathname = usePathname();
  const { user } = useSelector((state) => state.auth);
  const router = useRouter();
  useEffect(() => {
    if (user) {
      router.replace(`/dashboard/${roleRoutes[user.role]}`);
    } else {
      router.replace("/login");
    }
  }, [user, router]);
  return (
    <main className="min-h-screen w-full flex justify-center items-center">
      {children}
    </main>
  );
};

export default layout;

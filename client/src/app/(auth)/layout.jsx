"use client";
import React from "react";
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

const layout = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  console.log("user in the auth layout:", user);
  const router = useRouter();
  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  return (
    <main className="min-h-screen w-full flex justify-center items-center ">
      {children}
    </main>
  );
};

export default layout;

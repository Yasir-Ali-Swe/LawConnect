"use client";
import React from "react";
import { useParams } from "next/navigation";

const AdminClerkDetailPage = () => {
  const { clerkId } = useParams();
  return (
    <div className="h-full flex items-center justify-center">
      <h1 className="text-foreground text-2xl font-semibold">
        Admin clerk Detail Page for clerk id : {clerkId}
      </h1>
    </div>
  );
};

export default AdminClerkDetailPage;

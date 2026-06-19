"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CourtOfficerCasesAliasPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/court-officer/case");
  }, [router]);

  return <div className="p-8">Redirecting to cases...</div>;
}

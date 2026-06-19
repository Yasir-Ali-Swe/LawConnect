"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

const CourtOfficerCaseAliasDetailPage = () => {
  const { caseId } = useParams();
  const router = useRouter();

  useEffect(() => {
    if (caseId) {
      router.replace(`/dashboard/court-officer/case/${caseId}`);
    }
  }, [caseId, router]);

  return <div className="p-8">Redirecting to case details...</div>;
};

export default CourtOfficerCaseAliasDetailPage;

"use client";

import { clientApi } from "@/lib/api/client";
import { ProposalDashboardPage } from "@/components/dashboard/proposals/ProposalDashboardPage";

export default function ClientProposalsPage() {
  return (
    <ProposalDashboardPage
      queryKeyBase="clientProposals"
      fetchProposals={(status) => clientApi.getProposals(status)}
      heading="Proposals"
      description="Track proposals you have sent to lawyers."
      counterpartLabel="Lawyer Name"
      counterpartAccessor={(proposal) => proposal.lawyerId?.fullName}
    />
  );
}

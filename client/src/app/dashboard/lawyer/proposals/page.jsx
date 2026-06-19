"use client";

import { lawyerApi } from "@/lib/api/lawyer";
import { ProposalDashboardPage } from "@/components/dashboard/proposals/ProposalDashboardPage";

export default function ProposalsPage() {
  return (
    <ProposalDashboardPage
      queryKeyBase="lawyerProposals"
      fetchProposals={(status) => lawyerApi.getProposals(status)}
      updateStatus={({ id, status }) => lawyerApi.updateProposalStatus(id, status)}
      heading="Client Proposals"
      description="Review and manage proposals from clients."
      counterpartLabel="Client Name"
      counterpartAccessor={(proposal) => proposal.clientId?.fullName}
      showStatusActions
    />
  );
}

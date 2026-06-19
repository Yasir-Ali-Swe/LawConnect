"use client";

import { CaseForm } from "@/components/dashboard/lawyer/cases/CaseForm";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { casesApi } from "@/lib/api/cases";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NewCasePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: clientsResult, isLoading: clientsLoading } = useQuery({
    queryKey: ["acceptedClients"],
    queryFn: casesApi.getAcceptedClients,
  });

  const createMutation = useMutation({
    mutationFn: casesApi.createDraft,
    onSuccess: (data) => {
      toast.success("Case draft created successfully!");
      // Invalidate list query
      queryClient.invalidateQueries(["lawyerCases"]);
      // Redirect to list
      router.push("/dashboard/lawyer/cases");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create draft");
    },
  });

  if (clientsLoading) {
    return <div className="p-8">Loading client data...</div>;
  }

  const clients = clientsResult?.data || [];

  return (
    <div className="space-y-6 py-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/lawyer/cases">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Draft New Case</h2>
          <p className="text-muted-foreground">
            Fill in the initial details to start a new case file. You must
            select a client with an accepted proposal.
          </p>
        </div>
      </div>

      <CaseForm
        onSubmit={(values) => createMutation.mutate(values)}
        isSubmitting={createMutation.isPending}
        mode="create"
        clients={clients}
      />
    </div>
  );
}

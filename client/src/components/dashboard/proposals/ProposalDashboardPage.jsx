"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Eye, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatDisplayDate } from "@/lib/format-date";

const proposalStatuses = ["", "pending", "accepted", "rejected"];

export function ProposalDashboardPage({
  queryKeyBase,
  fetchProposals,
  updateStatus,
  heading,
  description,
  counterpartLabel,
  counterpartAccessor,
  showStatusActions = false,
  modalDetails = [],
}) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);

  const { data: result, isLoading } = useQuery({
    queryKey: [queryKeyBase, filter],
    queryFn: () => fetchProposals(filter),
    retry: false,
  });

  const updateStatusMutation = useMutation({
    mutationFn: updateStatus || (() => Promise.resolve()),
    onSuccess: (_data, variables) => {
      toast.success(`Proposal ${variables.status} successfully`);
      queryClient.invalidateQueries({ queryKey: [queryKeyBase] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update status");
    },
  });

  const proposals = result?.data || [];

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const handleAction = (id, status) => {
    if (!updateStatus) return;
    updateStatusMutation.mutate({ id, status });
  };

  return (
    <div className="space-y-6 py-6 max-w-6xl mx-auto w-full">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{heading}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {proposalStatuses.map((status) => (
          <Button
            key={status || "all"}
            variant={filter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(status)}
            className="capitalize"
          >
            {status || "All"}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <TooltipProvider>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{counterpartLabel}</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proposals.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        <div className="text-center py-8 text-muted-foreground">
                          No proposal found.
                        </div>
                      </TableCell>
                    </TableRow>
                  )}

                  {proposals.map((proposal) => {
                    const counterpartName = counterpartAccessor(proposal);

                    return (
                      <TableRow key={proposal._id}>
                        <TableCell className="font-medium max-w-37.5">
                          <div className="truncate" title={counterpartName}>
                            {counterpartName || "Unknown"}
                          </div>
                        </TableCell>

                        <TableCell className="max-w-62.5">
                          <div className="truncate" title={proposal.title}>
                            {proposal.title}
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={
                              proposal.status === "accepted"
                                ? "outline"
                                : proposal.status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className={
                              proposal.status === "accepted"
                                ? "text-green-700 border-green-600 bg-green-50"
                                : undefined
                            }
                          >
                            {proposal.status}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {showStatusActions && (
                              <>
                                {(proposal.status === "pending" ||
                                  proposal.status === "accepted") && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className={`h-8 w-8 p-0 ${
                                          proposal.status === "accepted"
                                            ? "bg-green-100 text-green-700 border-green-500 opacity-100 cursor-not-allowed"
                                            : "border-green-500 text-green-600 hover:bg-green-50"
                                        }`}
                                        onClick={() =>
                                          proposal.status === "pending" &&
                                          handleAction(proposal._id, "accepted")
                                        }
                                        disabled={
                                          proposal.status !== "pending" ||
                                          updateStatusMutation.isPending
                                        }
                                      >
                                        <Check className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>
                                        {proposal.status === "accepted"
                                          ? "Proposal Accepted"
                                          : "Accept Proposal"}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}

                                {(proposal.status === "pending" ||
                                  proposal.status === "rejected") && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className={`h-8 w-8 p-0 ${
                                          proposal.status === "rejected"
                                            ? "bg-red-100 text-red-700 border-red-500 opacity-100 cursor-not-allowed"
                                            : "border-red-500 text-red-600 hover:bg-red-50"
                                        }`}
                                        onClick={() =>
                                          proposal.status === "pending" &&
                                          handleAction(proposal._id, "rejected")
                                        }
                                        disabled={
                                          proposal.status !== "pending" ||
                                          updateStatusMutation.isPending
                                        }
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>
                                        {proposal.status === "rejected"
                                          ? "Proposal Rejected"
                                          : "Reject Proposal"}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </>
                            )}

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0"
                                  onClick={() => {
                                    setIsDialogOpen(true);
                                    setSelectedProposal(proposal);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View Proposal Details</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="truncate block max-w-100" title={selectedProposal?.title}>
              {selectedProposal?.title}
            </DialogTitle>
            <DialogDescription className="text-left wrap-break-word">
              {selectedProposal &&
                `${counterpartLabel.replace(" Name", "")} ${counterpartAccessor(selectedProposal) ? `: ${counterpartAccessor(selectedProposal)}` : ""}`}
            </DialogDescription>
          </DialogHeader>

          {selectedProposal && (
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto px-1">
              <div className="space-y-2">
                <h4 className="text-sm font-medium leading-none">Title</h4>
                <p className="text-sm text-slate-500 wrap-break-word">
                  {selectedProposal.title}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium leading-none">Description</h4>
                <p className="text-sm text-slate-500 whitespace-pre-wrap wrap-break-word">
                  {selectedProposal.description}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium leading-none">Status</h4>
                <Badge
                  variant={
                    selectedProposal.status === "accepted"
                      ? "default"
                      : selectedProposal.status === "rejected"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {selectedProposal.status.toUpperCase()}
                </Badge>
              </div>

              {modalDetails.map((field) => (
                <div key={field.label} className="space-y-2">
                  <h4 className="text-sm font-medium leading-none">{field.label}</h4>
                  <p className="text-sm text-slate-500 wrap-break-word">
                    {field.value(selectedProposal) || "N/A"}
                  </p>
                </div>
              ))}

              <div className="space-y-2">
                <h4 className="text-sm font-medium leading-none">Created Date</h4>
                <p className="text-sm text-slate-500 wrap-break-word">
                  {formatDisplayDate(selectedProposal.createdAt, "N/A")}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { casesApi } from "@/lib/api/cases";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function SubmitCaseDialog({ open, onOpenChange, caseId, onSubmitted }) {
  const [selectedCourtId, setSelectedCourtId] = useState("");
  const queryClient = useQueryClient();

  const { data: courtsResult, isLoading: courtsLoading } = useQuery({
    queryKey: ["courts"],
    queryFn: casesApi.getCourts,
    enabled: open, // Only fetch when dialog opens
  });

  const submitMutation = useMutation({
    mutationFn: (courtId) => casesApi.submitCase(caseId, courtId),
    onSuccess: () => {
      toast.success("Case submitted successfully!");
      queryClient.invalidateQueries(["lawyerCases"]);
      queryClient.invalidateQueries(["case", caseId]);
      onOpenChange(false);
      onSubmitted?.();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to submit case");
    },
  });

  const handleSubmit = () => {
    if (!selectedCourtId) return;
    submitMutation.mutate(selectedCourtId);
  };

  const courts = courtsResult?.data || [];
  const selectedCourt = courts.find((c) => c._id === selectedCourtId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Submit Case to Court</DialogTitle>
          <DialogDescription>
            Are you sure you want to submit this case? Once submitted, you
            cannot edit the details until a registrar reviews it.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Court</label>
            <Select
              value={selectedCourtId}
              onValueChange={setSelectedCourtId}
              disabled={courtsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a court..." />
              </SelectTrigger>
              <SelectContent>
                {courts.map((court) => (
                  <SelectItem key={court._id} value={court._id}>
                    <span
                      className="truncate block max-w-[280px] md:max-w-full"
                      title={`${court.name} ({court.type}) - {court.city}`}
                    >
                      {court.name} ({court.type}) - {court.city}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {courtsLoading && (
              <p className="text-xs text-muted-foreground">Loading courts...</p>
            )}
          </div>

          {selectedCourt && (
            <div className="rounded-md border p-3 bg-muted/50 text-sm space-y-1 break-words">
              <p>
                <strong>Province:</strong> {selectedCourt.province}
              </p>
              <p>
                <strong>City:</strong> {selectedCourt.city}
              </p>
              <p>
                <strong>Court Type:</strong> {selectedCourt.type}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedCourtId || submitMutation.isPending}
          >
            {submitMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Submit Case
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

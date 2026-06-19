import { useState } from "react";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { courtOfficerApi } from "@/lib/api/court-officer";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, CalendarPlus, CheckCircle2, History } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function CaseHearingsTab({
  hearings = [],
  role,
  caseId,
  isReadOnly = false,
}) {
  const queryClient = useQueryClient();
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedHearing, setSelectedHearing] = useState(null);
  const [targetStatus, setTargetStatus] = useState("");

  const isOfficer = role === "court_officer";

  // -- Splitting Hearings --
  const sortHearings = (list) =>
    list.sort((a, b) => new Date(a.date) - new Date(b.date));

  const upcomingHearings = sortHearings(
    hearings.filter(
      (h) => h.status === "scheduled" && new Date(h.date) >= new Date(),
    ),
  );

  const pastHearings = sortHearings(
    hearings.filter(
      (h) => h.status !== "scheduled" || new Date(h.date) < new Date(),
    ),
  ).reverse(); // Most recent past hearing first

  // -- Mutations (Court Officer Only) --
  const scheduleMutation = useMutation({
    mutationFn: (data) => courtOfficerApi.scheduleHearing(caseId, data),
    onSuccess: () => {
      toast.success("Hearing scheduled.");
      setIsScheduleOpen(false);
      queryClient.invalidateQueries(["hearings", caseId]);
      queryClient.invalidateQueries(["officerStats"]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to schedule"),
  });

  const updateHearingMutation = useMutation({
    mutationFn: ({ id, status, updatedReason }) =>
      courtOfficerApi.updateHearingStatus(id, { status, updatedReason }),
    onSuccess: () => {
      toast.success("Hearing status updated");
      queryClient.invalidateQueries(["hearings", caseId]);
      queryClient.invalidateQueries(["officerStats"]);
      setIsUpdateModalOpen(false);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to update"),
  });

  const initiateUpdate = (hearing, status) => {
    setSelectedHearing(hearing);
    setTargetStatus(status);
    setIsUpdateModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header / Action */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <History className="h-5 w-5" /> Proceedings History
        </h3>
        {isOfficer && !isReadOnly && (
          <Button onClick={() => setIsScheduleOpen(true)} size="sm">
            <CalendarPlus className="mr-2 h-4 w-4" /> Schedule Hearing
          </Button>
        )}
      </div>

      {/* Upcoming Hearings */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4" /> Upcoming
        </h4>
        {upcomingHearings.length === 0 ? (
          <p className="text-sm text-muted-foreground pl-1 italic">
            No upcoming hearings scheduled.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingHearings.map((hearing) => (
              <HearingCard
                key={hearing._id}
                hearing={hearing}
                isOfficer={isOfficer}
                isReadOnly={isReadOnly}
                onUpdate={(status) => initiateUpdate(hearing, status)}
              />
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Past Hearings */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> Past & Completed
        </h4>
        {pastHearings.length === 0 ? (
          <p className="text-sm text-muted-foreground pl-1 italic">
            No past hearings.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pastHearings.map((hearing) => (
              <HearingCard
                key={hearing._id}
                hearing={hearing}
                isOfficer={isOfficer}
                isReadOnly={isReadOnly}
                onUpdate={(status) => initiateUpdate(hearing, status)}
              />
            ))}
          </div>
        )}
      </div>

      {/* -- Modals (Court Officer Only) -- */}
      {isOfficer && (
        <>
          <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule New Hearing</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.target);
                  scheduleMutation.mutate({
                    date: fd.get("date"),
                    remarks: fd.get("remarks"),
                    status: "scheduled",
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <Label>Date & Time</Label>
                  <Input name="date" type="datetime-local" required />
                </div>
                <div>
                  <Label>Remarks / Agenda</Label>
                  <Textarea
                    name="remarks"
                    required
                    placeholder="e.g. First hearing for evidence"
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={scheduleMutation.isPending}>
                    Schedule
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Hearing Status</DialogTitle>
                <DialogDescription>
                  Marking hearing as{" "}
                  <span className="font-bold">
                    {targetStatus.toUpperCase()}
                  </span>
                  .
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.target);
                  if (selectedHearing) {
                    updateHearingMutation.mutate({
                      id: selectedHearing._id,
                      status: targetStatus,
                      updatedReason: fd.get("updatedReason"),
                    });
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <Label>Reason for Update</Label>
                  <Textarea
                    name="updatedReason"
                    required
                    placeholder="Reason for adjournment or completion..."
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsUpdateModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateHearingMutation.isPending}
                  >
                    Update Status
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}

function HearingCard({ hearing, isOfficer, isReadOnly, onUpdate }) {
  const isScheduled = hearing.status === "scheduled";
  const isUpcoming = new Date(hearing.date) >= new Date();
  const statusColor =
    hearing.status === "scheduled"
      ? "default"
      : hearing.status === "completed"
        ? "secondary"
        : "destructive"; // Adjourned red? Or outline.

  return (
    <Card className="h-full">
      <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base">
              {format(new Date(hearing.date), "PPP p")}
            </span>
            <Badge
              variant={hearing.status === "completed" ? "secondary" : "outline"}
            >
              {hearing.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground wrap-break-word whitespace-pre-wrap">
            {hearing.remarks}
          </p>

          {hearing.updatedReason && (
            <div className="mt-2 text-xs bg-muted p-2 rounded max-w-md wrap-break-word">
              <span className="font-medium block mb-1">Update Reason:</span>
              {hearing.updatedReason}
            </div>
          )}
        </div>

        {isOfficer && !isReadOnly && isScheduled && isUpcoming && (
          <div className="shrink-0">
            <Select onValueChange={onUpdate}>
              <SelectTrigger className="w-32.5 h-8">
                <SelectValue placeholder="Update" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="adjourned">Adjourn</SelectItem>
                <SelectItem value="completed">Complete</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

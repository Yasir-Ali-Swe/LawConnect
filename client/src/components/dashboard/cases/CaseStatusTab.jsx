import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export function CaseStatusTab({ caseData }) {
  const getSubStatusBadge = (status) => {
    switch (status) {
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "submitted":
        return <Badge className="bg-blue-600">Submitted</Badge>;
      case "registered":
        return (
          <Badge
            variant="outline"
            className="text-green-700 border-green-600 bg-green-50"
          >
            Registered
          </Badge>
        );
      default:
        return <Badge variant="outline">{status || "N/A"}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Case Status Tracker</CardTitle>
        <CardDescription>
          Current status and tracking information.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-muted-foreground leading-none">
              Submission Status
            </h4>
            <div className="pt-1">
              {getSubStatusBadge(caseData.submissionStatus)}
            </div>
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-muted-foreground leading-none">
              Case Status
            </h4>
            <div className="pt-1">
              <Badge
                variant={caseData.status === "active" ? "default" : "outline"}
              >
                {(caseData.status || "n/a").toUpperCase()}
              </Badge>
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-medium text-muted-foreground leading-none">
              Assigned Court
            </h4>
            <p className="font-medium pt-1">
              {caseData.courtId?.name || "Not Assigned"}
            </p>
            {caseData.courtId?.city && (
              <p className="text-xs text-muted-foreground">
                {caseData.courtId.city}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-medium text-muted-foreground leading-none">
              Court Officer
            </h4>
            <p className="font-medium pt-1">
              {caseData.courtOfficerId?.fullName || "Pending Assignment"}
            </p>
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-medium text-muted-foreground leading-none">
              Date Filed
            </h4>
            <p className="text-sm pt-1">
              {caseData.filedByLawyerAt
                ? format(new Date(caseData.filedByLawyerAt), "PPP")
                : "-"}
            </p>
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-medium text-muted-foreground leading-none">
              Date Registered
            </h4>
            <p className="text-sm pt-1">
              {caseData.registeredByClerkAt
                ? format(new Date(caseData.registeredByClerkAt), "PPP")
                : "-"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

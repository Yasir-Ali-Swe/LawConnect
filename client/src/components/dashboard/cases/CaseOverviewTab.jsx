import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function CaseOverviewTab({ caseData, role }) {
  // role: "lawyer", "client", "court_officer"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Case Overview</CardTitle>
        <CardDescription>Details of the case.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Title</h4>
          <p className="text-lg font-medium wrap-break-word">{caseData?.title || "N/A"}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Type</h4>
          <Badge variant="outline">{caseData?.type || "N/A"}</Badge>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">
            Description
          </h4>
          <p className="text-sm whitespace-pre-wrap wrap-break-word">
            {caseData?.description || "N/A"}
          </p>
        </div>

        <Separator />

        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-4">
            Parties involved
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            {caseData.parties?.map((p, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 border rounded-md"
              >
                <span className="font-medium wrap-break-word min-w-0">
                  {p?.name || "N/A"}
                </span>
                <Badge
                  variant="secondary"
                  className="uppercase text-[10px] shrink-0 ml-2"
                >
                  {p?.role || "N/A"}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Show Lawyer Details for Client and Court Officer */}
        {role !== "lawyer" && caseData.lawyerId && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                Lawyer
              </h4>
              <div className="flex flex-col">
                <span className="font-medium wrap-break-word">
                  {caseData.lawyerId.fullName || "Not assigned"}
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

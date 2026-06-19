"use client";

import { useRef, useState } from "react";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { casesApi } from "@/lib/api/cases";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileText, Upload, Download, Eye, FolderOpen, Loader2 } from "lucide-react";

/**
 * CaseDocumentsTab
 * Props:
 *   documents   - array of document objects from API
 *   isLoading   - boolean
 *   role        - "client" | "lawyer" | "court_officer"
 *   caseId      - string
 *   queryKey    - array (react-query key to invalidate on upload)
 */
export function CaseDocumentsTab({ documents = [], isLoading, role, caseId, queryKey }) {
    const queryClient = useQueryClient();
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const isClient = role === "client";

    // -- Upload Mutation (client only) --
    const uploadMutation = useMutation({
        mutationFn: (formData) => casesApi.uploadDocument(caseId, formData),
        onSuccess: () => {
            toast.success("Document uploaded successfully.");
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            queryClient.invalidateQueries(queryKey || ["caseDocuments", caseId]);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Upload failed. Please try again.");
        },
    });

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) setSelectedFile(file);
    };

    const handleUpload = () => {
        if (!selectedFile) {
            toast.warning("Please select a file first.");
            return;
        }
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("title", selectedFile.name);
        uploadMutation.mutate(formData);
    };

    return (
        <div className="space-y-6">
            {/* Header / Upload Action */}
            <div className="flex flex-wrap justify-between items-center gap-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5" /> Case Documents
                </h3>

                {isClient && (
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            id="doc-upload-input"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                            onChange={handleFileChange}
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadMutation.isPending}
                        >
                            <FolderOpen className="mr-2 h-4 w-4" />
                            {selectedFile
                                ? <span
                                                                        className="max-w-35 truncate"
                                    title={selectedFile.name}
                                  >
                                    {selectedFile.name}
                                  </span>
                                : "Choose File"}
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleUpload}
                            disabled={!selectedFile || uploadMutation.isPending}
                        >
                            {uploadMutation.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Upload className="mr-2 h-4 w-4" />
                            )}
                            {uploadMutation.isPending ? "Uploading..." : "Upload"}
                        </Button>
                    </div>
                )}
            </div>

            <Separator />

            {/* Document List */}
            {isLoading ? (
                <p className="text-sm text-muted-foreground italic pl-1">Loading documents...</p>
            ) : documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <FileText className="h-10 w-10 mb-3 opacity-40" />
                    <h3 className="text-lg font-medium">No Documents Yet</h3>
                    <p className="text-sm max-w-sm mt-1">
                        {isClient
                            ? "Upload your first document using the button above."
                            : "No documents have been uploaded for this case."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documents.map((doc) => (
                        <DocumentCard key={doc._id} doc={doc} />
                    ))}
                </div>
            )}
        </div>
    );
}

function DocumentCard({ doc }) {
    const uploadedAt = doc.createdAt ? format(new Date(doc.createdAt), "PPP") : "—";
    const uploadedBy = doc.uploadedBy?.fullName || null;
    const documentName = getDocumentName(doc);

    const handleDownload = () => {
        const a = document.createElement("a");
        a.href = doc.url;
        a.download = doc.title || "document";
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <Card className="h-full">
            <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                {/* Left: info */}
                <div className="min-w-0 space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 shrink-0 text-primary" />
                        <span
                            className="font-medium text-sm truncate max-w-55 sm:max-w-70 md:max-w-80"
                            title={documentName}
                        >
                            {documentName}
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground pl-6">
                        Uploaded {uploadedAt}
                        {uploadedBy && <> · by {uploadedBy}</>}
                    </p>
                </div>

                {/* Right: actions */}
                <div className="flex gap-2 shrink-0">
                    <Button
                        variant="outline"
                        size="sm"
                        asChild
                    >
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                            <Eye className="mr-1 h-4 w-4" />
                            View
                        </a>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDownload}
                    >
                        <Download className="mr-1 h-4 w-4" />
                        Download
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function getDocumentName(doc) {
    if (doc?.title) return doc.title;

    if (doc?.publicId) {
        const publicIdParts = doc.publicId.split("/");
        const rawName = publicIdParts[publicIdParts.length - 1] || "Document";
        return safeDecode(rawName);
    }

    if (doc?.url) {
        const urlParts = doc.url.split("/");
        const rawName = urlParts[urlParts.length - 1]?.split("?")[0] || "Document";
        return safeDecode(rawName);
    }

    return "Document";
}

function safeDecode(value) {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

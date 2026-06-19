import {
    lawyerDraftCase,
    lawyerUpateTheDraftCase,
    lawyerDeleteTheDraftCase,
    lawyerGetTheCaseById,
    lawyerGetAllTheCase,
    lawyerGetCourts,
    clientGetCases,
    clientGetCaseById,
    clientDraftCase,
    lawyerSubmitCase,
    clerkGetSubmitedCases,
    clerkGetCourtCases,
    clerkRegisterCase,
    clerkGetCaseById,
    lawyerGetAcceptedClients,
    getCaseHearings,
    getCaseDocuments,
    getCaseJudgments,
    uploadCaseDocument,
} from "../controllers/case-controller.js";
import { clientMiddleware } from "../middlewares/client-middleware.js";
import { lawyerMiddleware } from "../middlewares/lawyer-middleware.js";
import { clerkMiddleware } from "../middlewares/clerk-middleware.js";
import { courtOfficerMiddleware } from "../middlewares/court-officer-middleware.js";
import { upload } from "../middlewares/upload-middleware.js";
import { verifyToken } from "../middlewares/auth-middleware.js";
import express from "express";

const router = express.Router();

// --- Lawyer Routes ---
router.post("/draft-case", lawyerMiddleware, lawyerDraftCase);
router.put("/update-draft-case/:caseId", lawyerMiddleware, lawyerUpateTheDraftCase);
router.delete("/delete-draft-case/:caseId", lawyerMiddleware, lawyerDeleteTheDraftCase);
router.get("/get-case/:caseId", lawyerMiddleware, lawyerGetTheCaseById);
router.get("/get-all-case", lawyerMiddleware, lawyerGetAllTheCase);
router.get("/get-courts", lawyerMiddleware, lawyerGetCourts);
router.get("/accepted-clients", lawyerMiddleware, lawyerGetAcceptedClients);
router.post("/submit-case/:caseId", lawyerMiddleware, lawyerSubmitCase);

// --- Clerk Routes ---
router.get("/get-submited-cases", clerkMiddleware, clerkGetSubmitedCases);
router.get("/clerk/court-cases", clerkMiddleware, clerkGetCourtCases);
router.post("/register-case/:caseId", clerkMiddleware, clerkRegisterCase);
router.get("/clerk/case/:caseId", clerkMiddleware, clerkGetCaseById);

// --- Client Routes ---
router.get("/client/cases", clientMiddleware, clientGetCases);
router.get("/client/cases/:caseId", clientMiddleware, clientGetCaseById);
router.get("/client/cases/:caseId/hearings", clientMiddleware, getCaseHearings);
router.get("/client/cases/:caseId/documents", clientMiddleware, getCaseDocuments);
router.get("/client/cases/:caseId/judgments", clientMiddleware, getCaseJudgments);
router.post("/client/draft", clientMiddleware, clientDraftCase);
// Client upload document (CLIENT ONLY)
router.post("/client/cases/:caseId/upload-document", clientMiddleware, upload.single("file"), uploadCaseDocument);
router.post("/:caseId/upload-document", clientMiddleware, upload.single("file"), uploadCaseDocument);

// --- Shared Sub-resource Routes (Lawyer) ---
router.get("/:caseId/hearings", lawyerMiddleware, getCaseHearings);
router.get("/:caseId/documents", verifyToken, getCaseDocuments);
router.get("/:caseId/judgments", lawyerMiddleware, getCaseJudgments);
router.get("/cases/:caseId/documents", verifyToken, getCaseDocuments);

// --- Court Officer Sub-resource Routes ---
router.get("/officer/:caseId/documents", courtOfficerMiddleware, getCaseDocuments);

export default router;

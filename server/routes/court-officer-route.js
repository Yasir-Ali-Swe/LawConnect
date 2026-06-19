import {
    courtOfficerGetAllTheCase,
    getActiveCaseById,
    updateCaseStatus,
    scheduleHearing,
    updateHearingStatus,
    getAllHearingsForCase,
    makeJudgment,
    getDashboardStats,
    getProfile,
    updateProfile
} from "../controllers/court-officer-controller.js";
import { courtOfficerMiddleware } from "../middlewares/court-officer-middleware.js";
import { uploadProfileImage } from "../middlewares/upload-middleware.js";
import express from "express";

const router = express.Router();
router.get("/get-all-case", courtOfficerMiddleware, courtOfficerGetAllTheCase);
router.get("/get-active-case/:caseId", courtOfficerMiddleware, getActiveCaseById);
router.put("/update-case-status/:caseId", courtOfficerMiddleware, updateCaseStatus);
router.post("/schedule-hearing/:caseId", courtOfficerMiddleware, scheduleHearing);
router.put("/update-hearing-status/:hearingId", courtOfficerMiddleware, updateHearingStatus);
router.get("/get-hearings/:caseId", courtOfficerMiddleware, getAllHearingsForCase);
router.post("/make-judgment/:caseId", courtOfficerMiddleware, makeJudgment);

router.get("/stats", courtOfficerMiddleware, getDashboardStats);
router.get("/profile", courtOfficerMiddleware, getProfile);
router.put(
    "/profile",
    courtOfficerMiddleware,
    uploadProfileImage.single("profileImage"),
    updateProfile,
);

export default router;
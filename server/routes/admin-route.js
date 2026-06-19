import { createProfile, adminUpdateHisProfile, adminUpdateAccount, adminGetHisProfile, adminCreateInternalUser, adminCreateCourt, getAllCourts, getCourtById, adminGetAllInternalUsers, adminGetInternalUserById, adminAssigneClerkToCourt, getClerkProfile, adminAssigneCourtOfficerToCourt, getCourtOfficerProfile, adminGetAllCourtOfficers, getUnassignedClerks, getUnassignedCourtOfficers, getDashboardStats } from "../controllers/admin-controller.js";
import { adminMiddleware } from "../middlewares/admin-middleware.js";
import { uploadProfileImage } from "../middlewares/upload-middleware.js";
import express from "express";

const router = express.Router();

//admin Routes
router.post(
	"/create-profile",
	adminMiddleware,
	uploadProfileImage.single("profileImage"),
	createProfile,
);
router.put(
	"/update-profile",
	adminMiddleware,
	uploadProfileImage.single("profileImage"),
	adminUpdateHisProfile,
);
router.put("/update-account", adminMiddleware, adminUpdateAccount);
router.get("/get-profile", adminMiddleware, adminGetHisProfile);

//Court Routes
router.post("/create-court", adminMiddleware, adminCreateCourt);
router.get("/get-all-courts", adminMiddleware, getAllCourts);
router.get("/get-court/:courtId", adminMiddleware, getCourtById);


//admin internal user routes
router.post("/create-internal-user", adminMiddleware, adminCreateInternalUser);
router.get("/get-internal-users", adminMiddleware, adminGetAllInternalUsers)
router.get("/get-internal-user/:internalUserId", adminMiddleware, adminGetInternalUserById)
router.post("/assign-clerk-to-court", adminMiddleware, adminAssigneClerkToCourt)
router.get("/get-clerk-profile/:userId", adminMiddleware, getClerkProfile)
router.post("/assigne-court-officer", adminMiddleware, adminAssigneCourtOfficerToCourt)
router.get("/get-court-officer-profile/:userId", adminMiddleware, getCourtOfficerProfile)
router.get("/get-all-court-officers", adminMiddleware, adminGetAllCourtOfficers)

// Assignment Helpers
router.get("/get-unassigned-clerks", adminMiddleware, getUnassignedClerks);
router.get("/get-unassigned-court-officers", adminMiddleware, getUnassignedCourtOfficers);

router.get("/get-dashboard-stats", adminMiddleware, getDashboardStats);

export default router;

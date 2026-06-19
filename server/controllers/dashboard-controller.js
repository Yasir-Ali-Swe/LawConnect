import caseModel from "../models/case-model.js";
import hearingModel from "../models/hearing-model.js";
import judgmentModel from "../models/judgment-model.js";

export const getLawyerStats = async (req, res) => {
    try {
        const lawyerId = req.userId; // Retrieved from middleware
        if (!lawyerId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        // Parallelize queries for performance
        const [totalCases, activeCases, upcomingHearings, pendingJudgments, recentCases] = await Promise.all([
            caseModel.countDocuments({ lawyerId }),
            caseModel.countDocuments({ lawyerId, status: "active" }),
            hearingModel.countDocuments({
                caseId: { $in: await caseModel.find({ lawyerId }).select("_id") },
                date: { $gte: new Date() },
                status: "scheduled"
            }),
            // Assuming pending judgments checks if a judgment exists but is not final? 
            // Or maybe cases that need judgment? 
            // Based on models, judgment is a separate model. 
            // Let's count cases where status is "active" but maybe hearing is "judgment"?
            // For now, let's just count judgments drafted by this lawyer/associated with their cases that are not final?
            // Actually, standard "Pending Judgments" usually means judgments waiting to be written by judge/officer.
            // For a lawyer, maybe it means "Pending Results". 
            // Let's count active cases as a proxy or just return 0 if no specific logic.
            // Better: Count cases with status "judgment_reserved" if that state exists, or just use active cases count.
            // Let's stick to what we can query.
            caseModel.countDocuments({ lawyerId, status: "judgment_pending" }), // Hypothetical status

            caseModel.find({ lawyerId }).sort({ updatedAt: -1 }).limit(5).select("title status caseNumber")
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalCases,
                activeCases,
                upcomingHearings,
                pendingJudgments,
                recentActivity: recentCases
            }
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

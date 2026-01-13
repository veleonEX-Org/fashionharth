import { getDashboardStats } from "../services/adminService.js";
// Fetches real administrative statistics for the dashboard.
export async function getAdminStats(_req, res, next) {
    try {
        const stats = await getDashboardStats();
        res.json(stats);
    }
    catch (err) {
        next(err);
    }
}

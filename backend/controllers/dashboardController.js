import * as electricityDao from "../dao/electricityDao.js";
import * as transportDao from "../dao/transportDao.js";
import { calculateDashboardStats } from "../utils/predictionUtils.js";
import { successResponse, errorResponse } from "../utils/responseUtils.js";

// Debug function to check raw data
export const debugRecords = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get raw records directly from MongoDB
    const electricityRecords = await electricityDao.getUserElectricityRecords(userId);
    const transportRecords = await transportDao.getUserTransportRecords(userId);

    // Log raw data
    // console.log("\n🔍 DEBUG: Raw Electricity Records:");
    // electricityRecords.forEach((r, i) => {
    //   console.log(`  [${i}] ID: ${r._id}`);
    //   console.log(`      carbonEmitted: ${r.carbonEmitted} (type: ${typeof r.carbonEmitted})`);
    //   console.log(`      electricityUsed: ${r.electricityUsed}`);
    //   console.log(`      dateFrom: ${r.dateFrom}`);
    // });

    // console.log("\n🔍 DEBUG: Raw Transport Records:");
    // transportRecords.forEach((r, i) => {
    //   console.log(`  [${i}] ID: ${r._id}`);
    //   console.log(`      carbonEmitted: ${r.carbonEmitted} (type: ${typeof r.carbonEmitted})`);
    //   console.log(`      kmDriven: ${r.kmDriven}`);
    //   console.log(`      fuelUsedLiters: ${r.fuelUsedLiters}`);
    //   console.log(`      dateFrom: ${r.dateFrom}`);
    // });

    return successResponse(res, 200, "Debug data", {
      electricity: {
        count: electricityRecords.length,
        sample: electricityRecords[0] || null,
        allCarbonValues: electricityRecords.map((r) => ({
          id: r._id,
          carbonEmitted: r.carbonEmitted,
          type: typeof r.carbonEmitted,
        })),
      },
      transport: {
        count: transportRecords.length,
        sample: transportRecords[0] || null,
        allCarbonValues: transportRecords.map((r) => ({
          id: r._id,
          carbonEmitted: r.carbonEmitted,
          type: typeof r.carbonEmitted,
        })),
      },
    });
  } catch (error) {
    console.error("Debug error:", error);
    return errorResponse(res, 500, error.message);
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch all records with error handling
    let electricityRecords = [];
    let transportRecords = [];

    try {
      electricityRecords = await electricityDao.getUserElectricityRecords(userId);
    } catch (e) {
      console.error("Error fetching electricity records:", e.message);
      electricityRecords = [];
    }

    try {
      transportRecords = await transportDao.getUserTransportRecords(userId);
    } catch (e) {
      console.error("Error fetching transport records:", e.message);
      transportRecords = [];
    }

    // Ensure arrays
    electricityRecords = Array.isArray(electricityRecords) ? electricityRecords : [];
    transportRecords = Array.isArray(transportRecords) ? transportRecords : [];

    // Calculate comprehensive stats
    const stats = calculateDashboardStats(electricityRecords, transportRecords);
    // console.log(stats)

    // Add environmental impact metrics (with safe division)
    const totalCarbon = stats.combined.totalCarbon || 0;
    const treesEquivalent = totalCarbon > 0 ? (totalCarbon / 21.77).toFixed(1) : "0";
    const drivingEquivalent = totalCarbon > 0 ? (totalCarbon / 0.21).toFixed(0) : "0";
    const flightsEquivalent = totalCarbon > 0 ? (totalCarbon / 255).toFixed(2) : "0";

    return successResponse(res, 200, "Dashboard stats fetched", {
      ...stats,
      environmentalImpact: {
        treesNeeded: parseFloat(treesEquivalent),
        equivalentDrivingKm: parseFloat(drivingEquivalent),
        equivalentFlights: parseFloat(flightsEquivalent),
      },
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return errorResponse(res, 500, error.message || "Failed to fetch dashboard stats");
  }
};

export const getQuickStats = async (req, res) => {
  try {
    const userId = req.user._id;

    let electricityCount = 0;
    let transportCount = 0;
    let totalElectricityCarbon = 0;
    let totalTransportCarbon = 0;

    try {
      electricityCount = await electricityDao.getUserElectricityRecordCount(userId);
      const electricityRecords = await electricityDao.getUserElectricityRecords(userId);
      totalElectricityCarbon = (electricityRecords || []).reduce(
        (sum, r) => sum + (r.carbonEmitted || 0),
        0
      );
    } catch (e) {
      console.error("Error fetching electricity stats:", e.message);
    }

    try {
      transportCount = await transportDao.getUserTransportRecordCount(userId);
      const transportRecords = await transportDao.getUserTransportRecords(userId);
      totalTransportCarbon = (transportRecords || []).reduce(
        (sum, r) => sum + (r.carbonEmitted || 0),
        0
      );
    } catch (e) {
      console.error("Error fetching transport stats:", e.message);
    }

    return successResponse(res, 200, "Quick stats fetched", {
      electricity: {
        recordCount: electricityCount,
        totalCarbon: parseFloat(totalElectricityCarbon.toFixed(2)),
        canPredict: electricityCount >= 2,
      },
      transport: {
        recordCount: transportCount,
        totalCarbon: parseFloat(totalTransportCarbon.toFixed(2)),
        canPredict: transportCount >= 2,
      },
      totalCarbon: parseFloat((totalElectricityCarbon + totalTransportCarbon).toFixed(2)),
      totalRecords: electricityCount + transportCount,
    });
  } catch (error) {
    console.error("Quick stats error:", error);
    return errorResponse(res, 500, error.message || "Failed to fetch quick stats");
  }
};
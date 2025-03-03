const mongoose = require("mongoose")

const productionMetricsSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  productionStatus: {
    activeOrders: Number,
    completedOrders: Number,
    delayedOrders: Number,
    efficiency: Number,
  },
  workforceStatus: {
    totalPresent: Number,
    onLeave: Number,
    utilizationRate: Number,
    departments: [
      {
        name: String,
        present: Number,
        total: Number,
        utilization: Number,
      },
    ],
  },
  equipmentStatus: {
    operational: Number,
    maintenance: Number,
    breakdown: Number,
    equipment: [
      {
        name: String,
        status: { type: String, enum: ["operational", "maintenance", "breakdown"] },
        utilization: Number,
        lastMaintenance: Date,
        nextMaintenance: Date,
      },
    ],
  },
  qualityMetrics: {
    passRate: Number,
    inspectionsPending: Number,
    issues: [
      {
        severity: { type: String, enum: ["low", "medium", "high"] },
        description: String,
        timestamp: Date,
        resolved: Boolean,
      },
    ],
  },
})

const ProductionMetrics = mongoose.model("ProductionMetrics", productionMetricsSchema)

module.exports = { ProductionMetrics }


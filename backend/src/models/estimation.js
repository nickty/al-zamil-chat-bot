const mongoose = require("mongoose")

const estimationItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  unit: {
    type: String,
    required: true,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  type: {
    type: String,
    enum: ["material", "labor", "service"],
    required: true,
  },
})

const estimationHistorySchema = new mongoose.Schema({
  action: {
    type: String,
    enum: ["created", "updated", "status_changed", "approved", "archived", "deleted"],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
})

const estimationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  estimationNumber: {
    type: String,
    required: true,
    unique: true,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true,
  },
  items: [estimationItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  status: {
    type: String,
    enum: ["draft", "pending_approval", "approved", "archived", "deleted"],
    default: "draft",
  },
  history: [estimationHistorySchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Pre-save middleware to generate estimation number
estimationSchema.pre("validate", async function (next) {
    try {
      // Only generate number for new documents
      if (this.isNew) {
        const currentDate = new Date();
        const year = currentDate.getFullYear().toString().slice(-2);
        const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  
        // Find the highest number for the current year and month
        const latestEstimation = await this.constructor
          .findOne({ estimationNumber: { $regex: `EST-${year}${month}-` } })
          .sort({ estimationNumber: -1 });
  
        let sequenceNumber = 1;
        if (latestEstimation) {
          const parts = latestEstimation.estimationNumber.split("-");
          sequenceNumber = Number.parseInt(parts[2]) + 1;
        }
  
        this.estimationNumber = `EST-${year}${month}-${sequenceNumber.toString().padStart(4, "0")}`;
      }
  
      // Update totalAmount
      if (this.items && this.items.length > 0) {
        this.totalAmount = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
      }
  
      next();
    } catch (error) {
      console.error("Error in estimation pre-validate middleware:", error);
      // Set a default estimation number if generation fails
      if (this.isNew && !this.estimationNumber) {
        const timestamp = Date.now();
        this.estimationNumber = `EST-FALLBACK-${timestamp}`;
      }
      next(error);
    }
  });
  
  estimationSchema.pre("save", function (next) {
    // Update updatedAt
    this.updatedAt = Date.now();
    next();
  });

const Estimation = mongoose.model("Estimation", estimationSchema)

module.exports = { Estimation }


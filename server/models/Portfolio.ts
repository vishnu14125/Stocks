import mongoose, { Schema, Document } from "mongoose";

export interface IPortfolioHolding {
  symbol: string;
  name: string;
  quantity: number;
  buyPrice: number;
  buyDate: Date;
  notes?: string;
  // Calculated fields (not stored in DB, computed on retrieval)
  currentPrice?: number;
  currentValue?: number;
  totalReturn?: number;
  totalReturnPercent?: number;
  dayChange?: number;
  dayChangePercent?: number;
}

export interface IPortfolio extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  holdings: IPortfolioHolding[];
  // Portfolio summary (computed fields)
  totalValue?: number;
  totalInvested?: number;
  totalReturn?: number;
  totalReturnPercent?: number;
  dayChange?: number;
  dayChangePercent?: number;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const HoldingSchema = new Schema<IPortfolioHolding>(
  {
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      maxlength: 10,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0.001,
      max: 1000000,
    },
    buyPrice: {
      type: Number,
      required: true,
      min: 0.01,
      max: 1000000,
    },
    buyDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    notes: {
      type: String,
      maxlength: 500,
      trim: true,
    },
  },
  {
    _id: true, // Each holding gets its own _id
  },
);

const PortfolioSchema = new Schema<IPortfolio>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    holdings: [HoldingSchema],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Indexes for better performance (only non-duplicate ones)
PortfolioSchema.index({ "holdings.symbol": 1 });
PortfolioSchema.index({ lastUpdated: -1 });
PortfolioSchema.index({ userId: 1 }); // Single userId index

// Virtual for total invested amount
PortfolioSchema.virtual("totalInvestedAmount").get(function () {
  return this.holdings.reduce((total, holding) => {
    return total + holding.quantity * holding.buyPrice;
  }, 0);
});

// Instance method to add holding
PortfolioSchema.methods.addHolding = function (
  holding: Omit<IPortfolioHolding, "_id">,
) {
  this.holdings.push(holding);
  this.lastUpdated = new Date();
  return this.save();
};

// Instance method to update holding
PortfolioSchema.methods.updateHolding = function (
  holdingId: string,
  updates: Partial<IPortfolioHolding>,
) {
  const holding = this.holdings.id(holdingId);
  if (!holding) {
    throw new Error("Holding not found");
  }

  Object.assign(holding, updates);
  this.lastUpdated = new Date();
  return this.save();
};

// Instance method to remove holding
PortfolioSchema.methods.removeHolding = function (holdingId: string) {
  const holding = this.holdings.id(holdingId);
  if (!holding) {
    throw new Error("Holding not found");
  }

  holding.deleteOne();
  this.lastUpdated = new Date();
  return this.save();
};

// Static method to find portfolio by user
PortfolioSchema.statics.findByUserId = function (userId: string) {
  return this.findOne({ userId }).populate(
    "userId",
    "username email preferences",
  );
};

// export const Portfolio = mongoose.model<IPortfolio>(
//   "Portfolio",
//   PortfolioSchema,
// );

export const Portfolio =
  mongoose.models.Portfolio ||
  mongoose.model<IPortfolio>("Portfolio", PortfolioSchema);

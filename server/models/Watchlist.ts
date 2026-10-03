import mongoose, { Schema, Document } from "mongoose";

export interface IWatchlistItem {
  symbol: string;
  name: string;
  addedAt: Date;
  // Computed fields (not stored)
  currentPrice?: number;
  change?: number;
  changePercent?: number;
  volume?: number;
}

export interface IWatchlist extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  stocks: IWatchlistItem[];
  createdAt: Date;
  updatedAt: Date;
}

const WatchlistItemSchema = new Schema<IWatchlistItem>(
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
    addedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    _id: true,
  },
);

const WatchlistSchema = new Schema<IWatchlist>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One watchlist per user
    },
    stocks: [WatchlistItemSchema],
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

// Indexes (avoid duplicate userId index since unique: true is set)
WatchlistSchema.index({ "stocks.symbol": 1 });
WatchlistSchema.index({ "stocks.addedAt": -1 });

// Prevent duplicate symbols for same user
WatchlistSchema.index(
  { userId: 1, "stocks.symbol": 1 },
  { unique: true, sparse: true },
);

// Instance method to add stock to watchlist
WatchlistSchema.methods.addStock = function (symbol: string, name: string) {
  // Check if stock already exists
  const existingStock = this.stocks.find(
    (stock: IWatchlistItem) => stock.symbol === symbol.toUpperCase(),
  );
  if (existingStock) {
    throw new Error("Stock already in watchlist");
  }

  this.stocks.push({
    symbol: symbol.toUpperCase(),
    name: name.trim(),
    addedAt: new Date(),
  });

  return this.save();
};

// Instance method to remove stock from watchlist
WatchlistSchema.methods.removeStock = function (stockId: string) {
  const stock = this.stocks.id(stockId);
  if (!stock) {
    throw new Error("Stock not found in watchlist");
  }

  stock.deleteOne();
  return this.save();
};

// Instance method to remove stock by symbol
WatchlistSchema.methods.removeStockBySymbol = function (symbol: string) {
  const stockIndex = this.stocks.findIndex(
    (stock: IWatchlistItem) => stock.symbol === symbol.toUpperCase(),
  );
  if (stockIndex === -1) {
    throw new Error("Stock not found in watchlist");
  }

  this.stocks.splice(stockIndex, 1);
  return this.save();
};

// Static method to find watchlist by user
WatchlistSchema.statics.findByUserId = function (userId: string) {
  return this.findOne({ userId }).populate("userId", "username email");
};

// Static method to find or create watchlist for user
WatchlistSchema.statics.findOrCreateByUserId = function (userId: string) {
  return this.findOneAndUpdate(
    { userId },
    { userId },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
};

export const Watchlist = mongoose.model<IWatchlist>(
  "Watchlist",
  WatchlistSchema,
);

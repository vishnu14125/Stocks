import { Router, Response } from "express";
import { Portfolio } from "../models/Portfolio";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { body, param, validationResult } from "express-validator";
import { getStockQuote } from "../services/stockService";

const router = Router();

// All portfolio routes require authentication
router.use(authenticateToken);

// Validation rules
const addHoldingValidation = [
  body("symbol")
    .isString()
    .isLength({ min: 1, max: 10 })
    .withMessage("Symbol must be between 1 and 10 characters")
    .toUpperCase(),
  body("name")
    .isString()
    .isLength({ min: 1, max: 200 })
    .withMessage("Name must be between 1 and 200 characters"),
  body("quantity")
    .isFloat({ min: 0.001, max: 1000000 })
    .withMessage("Quantity must be between 0.001 and 1,000,000"),
  body("buyPrice")
    .isFloat({ min: 0.01, max: 1000000 })
    .withMessage("Buy price must be between 0.01 and 1,000,000"),
  body("buyDate").isISO8601().withMessage("Buy date must be a valid date"),
  body("notes")
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage("Notes must be less than 500 characters"),
];

const updateHoldingValidation = [
  param("holdingId").isMongoId().withMessage("Invalid holding ID"),
  body("quantity")
    .optional()
    .isFloat({ min: 0.001, max: 1000000 })
    .withMessage("Quantity must be between 0.001 and 1,000,000"),
  body("buyPrice")
    .optional()
    .isFloat({ min: 0.01, max: 1000000 })
    .withMessage("Buy price must be between 0.01 and 1,000,000"),
  body("buyDate")
    .optional()
    .isISO8601()
    .withMessage("Buy date must be a valid date"),
  body("notes")
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage("Notes must be less than 500 characters"),
];

// Calculate portfolio summary with live data
const calculatePortfolioSummary = async (portfolio: any) => {
  if (!portfolio || portfolio.holdings.length === 0) {
    return {
      totalValue: 0,
      totalInvested: 0,
      totalReturn: 0,
      totalReturnPercent: 0,
      dayChange: 0,
      dayChangePercent: 0,
    };
  }

  // Fetch live quotes for all holdings
  const holdingsWithQuotes = await Promise.all(
    portfolio.holdings.map(async (holding: any) => {
      try {
        const quote = await getStockQuote(holding.symbol);
        if (quote) {
          const currentValue = quote.price * holding.quantity;
          const investedValue = holding.buyPrice * holding.quantity;
          const totalReturn = currentValue - investedValue;
          const totalReturnPercent = (totalReturn / investedValue) * 100;
          const dayChange = quote.change * holding.quantity;

          return {
            ...holding.toObject(),
            currentPrice: quote.price,
            currentValue,
            totalReturn,
            totalReturnPercent,
            dayChange,
            dayChangePercent: quote.changePercent,
          };
        }
      } catch (error) {
        console.error(`Error fetching quote for ${holding.symbol}:`, error);
      }

      // Fallback if API call fails
      const currentValue = holding.buyPrice * holding.quantity;
      return {
        ...holding.toObject(),
        currentPrice: holding.buyPrice,
        currentValue,
        totalReturn: 0,
        totalReturnPercent: 0,
        dayChange: 0,
        dayChangePercent: 0,
      };
    }),
  );

  // Calculate totals
  const totalValue = holdingsWithQuotes.reduce(
    (sum, h) => sum + h.currentValue,
    0,
  );
  const totalInvested = holdingsWithQuotes.reduce(
    (sum, h) => sum + h.buyPrice * h.quantity,
    0,
  );
  const totalReturn = totalValue - totalInvested;
  const totalReturnPercent =
    totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;
  const dayChange = holdingsWithQuotes.reduce((sum, h) => sum + h.dayChange, 0);
  const dayChangePercent =
    totalInvested > 0 ? (dayChange / (totalValue - dayChange)) * 100 : 0;

  return {
    holdings: holdingsWithQuotes,
    totalValue,
    totalInvested,
    totalReturn,
    totalReturnPercent,
    dayChange,
    dayChangePercent,
    lastUpdated: Date.now(),
  };
};

// Get user's portfolio
router.get("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let portfolio = await Portfolio.findOne({ userId: req.userId });

    if (!portfolio) {
      // Create empty portfolio for new user
      portfolio = new Portfolio({
        userId: req.userId,
        holdings: [],
      });
      await portfolio.save();
    }

    const portfolioSummary = await calculatePortfolioSummary(portfolio);

    res.json({
      success: true,
      data: portfolioSummary,
    });
  } catch (error) {
    console.error("Get portfolio error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get portfolio",
    });
  }
});

// Add holding to portfolio
router.post(
  "/holdings",
  addHoldingValidation,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
        return;
      }

      const { symbol, name, quantity, buyPrice, buyDate, notes } = req.body;

      let portfolio = await Portfolio.findOne({ userId: req.userId });

      if (!portfolio) {
        portfolio = new Portfolio({
          userId: req.userId,
          holdings: [],
        });
      }

      const newHolding = {
        symbol: symbol.toUpperCase(),
        name,
        quantity: parseFloat(quantity),
        buyPrice: parseFloat(buyPrice),
        buyDate: new Date(buyDate),
        notes,
      };

      portfolio.holdings.push(newHolding);
      portfolio.lastUpdated = new Date();
      await portfolio.save();

      // Get the newly added holding with its ID
      const addedHolding = portfolio.holdings[portfolio.holdings.length - 1];

      res.status(201).json({
        success: true,
        message: "Holding added successfully",
        data: {
          holding: addedHolding,
        },
      });
    } catch (error) {
      console.error("Add holding error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add holding",
      });
    }
  },
);

// Update holding
router.put(
  "/holdings/:holdingId",
  updateHoldingValidation,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
        return;
      }

      const { holdingId } = req.params;
      const updates = req.body;

      const portfolio = await Portfolio.findOne({ userId: req.userId });
      if (!portfolio) {
        res.status(404).json({
          success: false,
          message: "Portfolio not found",
        });
        return;
      }

      const holding = portfolio.holdings.id(holdingId);
      if (!holding) {
        res.status(404).json({
          success: false,
          message: "Holding not found",
        });
        return;
      }

      // Update holding fields
      Object.keys(updates).forEach((key) => {
        if (updates[key] !== undefined) {
          (holding as any)[key] = updates[key];
        }
      });

      portfolio.lastUpdated = new Date();
      await portfolio.save();

      res.json({
        success: true,
        message: "Holding updated successfully",
        data: {
          holding,
        },
      });
    } catch (error) {
      console.error("Update holding error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update holding",
      });
    }
  },
);

// Delete holding
router.delete(
  "/holdings/:holdingId",
  [param("holdingId").isMongoId().withMessage("Invalid holding ID")],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
        return;
      }

      const { holdingId } = req.params;

      const portfolio = await Portfolio.findOne({ userId: req.userId });
      if (!portfolio) {
        res.status(404).json({
          success: false,
          message: "Portfolio not found",
        });
        return;
      }

      const holding = portfolio.holdings.id(holdingId);
      if (!holding) {
        res.status(404).json({
          success: false,
          message: "Holding not found",
        });
        return;
      }

      holding.deleteOne();
      portfolio.lastUpdated = new Date();
      await portfolio.save();

      res.json({
        success: true,
        message: "Holding deleted successfully",
      });
    } catch (error) {
      console.error("Delete holding error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete holding",
      });
    }
  },
);

// Get portfolio performance/analytics
router.get(
  "/analytics",
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const portfolio = await Portfolio.findOne({ userId: req.userId });

      if (!portfolio || portfolio.holdings.length === 0) {
        res.json({
          success: true,
          data: {
            sectorAllocation: [],
            topPerformers: [],
            worstPerformers: [],
            totalValue: 0,
            totalInvested: 0,
          },
        });
        return;
      }

      const portfolioSummary = await calculatePortfolioSummary(portfolio);

      // Calculate sector allocation (simplified - you'd need a service to get stock sectors)
      const sectorAllocation = portfolioSummary.holdings.reduce(
        (sectors: any, holding: any) => {
          // This is simplified - in reality you'd fetch sector data from a financial API
          const sector = "Technology"; // Default sector
          if (!sectors[sector]) {
            sectors[sector] = { name: sector, value: 0, percentage: 0 };
          }
          sectors[sector].value += holding.currentValue;
          return sectors;
        },
        {},
      );

      // Calculate percentages
      const totalValue = portfolioSummary.totalValue;
      Object.values(sectorAllocation).forEach((sector: any) => {
        sector.percentage =
          totalValue > 0 ? (sector.value / totalValue) * 100 : 0;
      });

      // Top and worst performers
      const sortedHoldings = portfolioSummary.holdings.sort(
        (a: any, b: any) => b.totalReturnPercent - a.totalReturnPercent,
      );
      const topPerformers = sortedHoldings.slice(0, 5);
      const worstPerformers = sortedHoldings.slice(-5).reverse();

      res.json({
        success: true,
        data: {
          sectorAllocation: Object.values(sectorAllocation),
          topPerformers,
          worstPerformers,
          totalValue: portfolioSummary.totalValue,
          totalInvested: portfolioSummary.totalInvested,
          totalReturn: portfolioSummary.totalReturn,
          totalReturnPercent: portfolioSummary.totalReturnPercent,
        },
      });
    } catch (error) {
      console.error("Get analytics error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get portfolio analytics",
      });
    }
  },
);

export default router;

import { Router, Response } from "express";
import { Watchlist } from "../models/Watchlist";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { body, param, validationResult } from "express-validator";
import { getStockQuote } from "../services/stockService";

const router = Router();

// All watchlist routes require authentication
router.use(authenticateToken);

// Validation rules
const addStockValidation = [
  body("symbol")
    .isString()
    .isLength({ min: 1, max: 10 })
    .withMessage("Symbol must be between 1 and 10 characters")
    .toUpperCase(),
  body("name")
    .isString()
    .isLength({ min: 1, max: 200 })
    .withMessage("Name must be between 1 and 200 characters"),
];

// Get user's watchlist with live data
router.get("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let watchlist = await Watchlist.findOne({ userId: req.userId });

    if (!watchlist) {
      // Create empty watchlist for new user
      watchlist = new Watchlist({
        userId: req.userId,
        stocks: [],
      });
      await watchlist.save();
    }

    // Fetch live quotes for all stocks in watchlist
    const stocksWithQuotes = await Promise.all(
      watchlist.stocks.map(async (stock: any) => {
        try {
          const quote = await getStockQuote(stock.symbol);
          if (quote) {
            return {
              ...stock.toObject(),
              currentPrice: quote.price,
              change: quote.change,
              changePercent: quote.changePercent,
              volume: quote.volume,
              marketCap: quote.marketCap,
              previousClose: quote.previousClose,
              open: quote.open,
              high: quote.high,
              low: quote.low,
            };
          }
        } catch (error) {
          console.error(`Error fetching quote for ${stock.symbol}:`, error);
        }

        // Return stock without live data if API call fails
        return {
          ...stock.toObject(),
          currentPrice: null,
          change: null,
          changePercent: null,
          volume: null,
        };
      }),
    );

    res.json({
      success: true,
      data: {
        watchlist: {
          _id: watchlist._id,
          userId: watchlist.userId,
          stocks: stocksWithQuotes,
          createdAt: watchlist.createdAt,
          updatedAt: watchlist.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Get watchlist error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get watchlist",
    });
  }
});

// Add stock to watchlist
router.post(
  "/stocks",
  addStockValidation,
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

      const { symbol, name } = req.body;

      let watchlist = await Watchlist.findOne({ userId: req.userId });

      if (!watchlist) {
        watchlist = new Watchlist({
          userId: req.userId,
          stocks: [],
        });
      }

      // Check if stock already exists in watchlist
      const existingStock = watchlist.stocks.find(
        (stock: any) => stock.symbol === symbol.toUpperCase(),
      );
      if (existingStock) {
        res.status(409).json({
          success: false,
          message: "Stock already in watchlist",
        });
        return;
      }

      // Add stock to watchlist
      watchlist.stocks.push({
        symbol: symbol.toUpperCase(),
        name: name.trim(),
        addedAt: new Date(),
      });

      await watchlist.save();

      // Get the newly added stock with live data
      const addedStock = watchlist.stocks[watchlist.stocks.length - 1];
      let stockWithQuote = addedStock.toObject();

      try {
        const quote = await getStockQuote(symbol);
        if (quote) {
          stockWithQuote = {
            ...stockWithQuote,
            currentPrice: quote.price,
            change: quote.change,
            changePercent: quote.changePercent,
            volume: quote.volume,
          };
        }
      } catch (error) {
        console.error(`Error fetching quote for ${symbol}:`, error);
      }

      res.status(201).json({
        success: true,
        message: "Stock added to watchlist",
        data: {
          stock: stockWithQuote,
        },
      });
    } catch (error) {
      console.error("Add to watchlist error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add stock to watchlist",
      });
    }
  },
);

// Remove stock from watchlist by ID
router.delete(
  "/stocks/:stockId",
  [param("stockId").isMongoId().withMessage("Invalid stock ID")],
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

      const { stockId } = req.params;

      const watchlist = await Watchlist.findOne({ userId: req.userId });
      if (!watchlist) {
        res.status(404).json({
          success: false,
          message: "Watchlist not found",
        });
        return;
      }

      const stock = watchlist.stocks.id(stockId);
      if (!stock) {
        res.status(404).json({
          success: false,
          message: "Stock not found in watchlist",
        });
        return;
      }

      stock.deleteOne();
      await watchlist.save();

      res.json({
        success: true,
        message: "Stock removed from watchlist",
      });
    } catch (error) {
      console.error("Remove from watchlist error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to remove stock from watchlist",
      });
    }
  },
);

// Remove stock from watchlist by symbol
router.delete(
  "/stocks/symbol/:symbol",
  [
    param("symbol")
      .isString()
      .isLength({ min: 1, max: 10 })
      .withMessage("Invalid symbol"),
  ],
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

      const { symbol } = req.params;

      const watchlist = await Watchlist.findOne({ userId: req.userId });
      if (!watchlist) {
        res.status(404).json({
          success: false,
          message: "Watchlist not found",
        });
        return;
      }

      const stockIndex = watchlist.stocks.findIndex(
        (stock: any) => stock.symbol === symbol.toUpperCase(),
      );
      if (stockIndex === -1) {
        res.status(404).json({
          success: false,
          message: "Stock not found in watchlist",
        });
        return;
      }

      watchlist.stocks.splice(stockIndex, 1);
      await watchlist.save();

      res.json({
        success: true,
        message: "Stock removed from watchlist",
      });
    } catch (error) {
      console.error("Remove from watchlist error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to remove stock from watchlist",
      });
    }
  },
);

// Clear all stocks from watchlist
router.delete(
  "/clear",
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const watchlist = await Watchlist.findOne({ userId: req.userId });
      if (!watchlist) {
        res.status(404).json({
          success: false,
          message: "Watchlist not found",
        });
        return;
      }

      watchlist.stocks = [];
      await watchlist.save();

      res.json({
        success: true,
        message: "Watchlist cleared successfully",
      });
    } catch (error) {
      console.error("Clear watchlist error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to clear watchlist",
      });
    }
  },
);

// Get watchlist summary/stats
router.get("/stats", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const watchlist = await Watchlist.findOne({ userId: req.userId });

    if (!watchlist || watchlist.stocks.length === 0) {
      res.json({
        success: true,
        data: {
          totalStocks: 0,
          gainers: 0,
          losers: 0,
          neutral: 0,
          averageChange: 0,
        },
      });
      return;
    }

    // Fetch live quotes for statistics
    const quotesPromises = watchlist.stocks.map(async (stock: any) => {
      try {
        return await getStockQuote(stock.symbol);
      } catch (error) {
        return null;
      }
    });

    const quotes = await Promise.all(quotesPromises);
    const validQuotes = quotes.filter((quote) => quote !== null);

    const gainers = validQuotes.filter(
      (quote) => quote!.changePercent > 0,
    ).length;
    const losers = validQuotes.filter(
      (quote) => quote!.changePercent < 0,
    ).length;
    const neutral = validQuotes.filter(
      (quote) => quote!.changePercent === 0,
    ).length;

    const averageChange =
      validQuotes.length > 0
        ? validQuotes.reduce((sum, quote) => sum + quote!.changePercent, 0) /
          validQuotes.length
        : 0;

    res.json({
      success: true,
      data: {
        totalStocks: watchlist.stocks.length,
        gainers,
        losers,
        neutral,
        averageChange: Number(averageChange.toFixed(2)),
      },
    });
  } catch (error) {
    console.error("Get watchlist stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get watchlist statistics",
    });
  }
});

export default router;

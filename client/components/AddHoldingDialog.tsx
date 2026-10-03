import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import StockSearchInput from '@/components/StockSearchInput';
import { addHolding, type PortfolioHolding } from '@/lib/portfolioApi';
import { type StockQuote } from '@/lib/stockApi';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddHoldingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onHoldingAdded: (holding: PortfolioHolding) => void;
}

const AddHoldingDialog: React.FC<AddHoldingDialogProps> = ({
  open,
  onOpenChange,
  onHoldingAdded
}) => {
  const [selectedStock, setSelectedStock] = useState<StockQuote | null>(null);
  const [quantity, setQuantity] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [buyDate, setBuyDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const resetForm = () => {
    setSelectedStock(null);
    setQuantity('');
    setBuyPrice('');
    setBuyDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    if (!selectedStock) {
      newErrors.stock = 'Please select a stock';
    }
    
    if (!quantity || parseFloat(quantity) <= 0) {
      newErrors.quantity = 'Please enter a valid quantity';
    }
    
    if (!buyPrice || parseFloat(buyPrice) <= 0) {
      newErrors.buyPrice = 'Please enter a valid buy price';
    }
    
    if (!buyDate) {
      newErrors.buyDate = 'Please select a buy date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const newHolding = addHolding({
        symbol: selectedStock!.symbol,
        name: selectedStock!.name,
        quantity: parseFloat(quantity),
        buyPrice: parseFloat(buyPrice),
        buyDate,
        notes: notes.trim() || undefined,
      });
      
      onHoldingAdded(newHolding);
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding holding:', error);
      setErrors({ submit: 'Failed to add holding. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStockSelect = (stock: StockQuote) => {
    setSelectedStock(stock);
    setBuyPrice(stock.price.toString());
    setErrors({ ...errors, stock: '' });
  };

  const totalValue = selectedStock && quantity && buyPrice 
    ? parseFloat(quantity) * parseFloat(buyPrice)
    : 0;

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      onOpenChange(newOpen);
      if (!newOpen) resetForm();
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Stock to Portfolio</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Stock Search */}
          <div className="space-y-2">
            <Label>Select Stock</Label>
            <StockSearchInput
              onStockSelect={handleStockSelect}
              placeholder="Search for a stock..."
            />
            {errors.stock && (
              <p className="text-sm text-destructive">{errors.stock}</p>
            )}
            
            {selectedStock && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{selectedStock.symbol}</span>
                      <Badge variant="outline" className="text-xs">
                        {selectedStock.name}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Current: ${selectedStock.price.toFixed(2)}
                    </div>
                  </div>
                  <div className={cn(
                    "text-sm flex items-center gap-1",
                    selectedStock.change >= 0 ? "text-success" : "text-destructive"
                  )}>
                    {selectedStock.change >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {selectedStock.changePercent >= 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              step="0.001"
              min="0"
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                setErrors({ ...errors, quantity: '' });
              }}
              placeholder="Number of shares"
            />
            {errors.quantity && (
              <p className="text-sm text-destructive">{errors.quantity}</p>
            )}
          </div>

          {/* Buy Price */}
          <div className="space-y-2">
            <Label htmlFor="buyPrice">Buy Price ($)</Label>
            <Input
              id="buyPrice"
              type="number"
              step="0.01"
              min="0"
              value={buyPrice}
              onChange={(e) => {
                setBuyPrice(e.target.value);
                setErrors({ ...errors, buyPrice: '' });
              }}
              placeholder="Price per share"
            />
            {errors.buyPrice && (
              <p className="text-sm text-destructive">{errors.buyPrice}</p>
            )}
          </div>

          {/* Buy Date */}
          <div className="space-y-2">
            <Label htmlFor="buyDate">Buy Date</Label>
            <Input
              id="buyDate"
              type="date"
              value={buyDate}
              onChange={(e) => {
                setBuyDate(e.target.value);
                setErrors({ ...errors, buyDate: '' });
              }}
            />
            {errors.buyDate && (
              <p className="text-sm text-destructive">{errors.buyDate}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about this purchase..."
              rows={2}
            />
          </div>

          {/* Total Value */}
          {totalValue > 0 && (
            <div className="p-3 bg-primary/10 rounded-lg">
              <div className="text-sm text-muted-foreground">Total Investment</div>
              <div className="text-lg font-bold text-primary">
                ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          )}

          {errors.submit && (
            <p className="text-sm text-destructive text-center">{errors.submit}</p>
          )}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedStock}
          >
            {isSubmitting ? 'Adding...' : 'Add to Portfolio'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddHoldingDialog;

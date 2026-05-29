import { StockStatus } from '@prisma/client';

export function computeStockStatus(
  quantity: number,
  minStock: number,
  expiryDate: Date,
): StockStatus {
  if (expiryDate < new Date()) return StockStatus.EXPIRED;
  if (quantity <= 0 || quantity <= minStock * 0.4) return StockStatus.CRITICAL;
  if (quantity <= minStock) return StockStatus.LOW;
  return StockStatus.OK;
}

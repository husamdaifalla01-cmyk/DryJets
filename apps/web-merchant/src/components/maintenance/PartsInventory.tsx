'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, DollarSign, Clock, CheckCircle2, AlertTriangle, ShoppingCart } from 'lucide-react';
import { mockParts } from '@/data/maintenanceMockData';
import { useState } from 'react';

interface Props {
  equipmentId: string;
}

export function PartsInventory({ equipmentId }: Props) {
  const [cart, setCart] = useState<Record<string, number>>({});

  // Filter parts compatible with this equipment (for demo, show all)
  const compatibleParts = mockParts;

  const addToCart = (partId: string) => {
    setCart(prev => ({
      ...prev,
      [partId]: (prev[partId] || 0) + 1,
    }));
  };

  const removeFromCart = (partId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[partId] > 1) {
        newCart[partId]--;
      } else {
        delete newCart[partId];
      }
      return newCart;
    });
  };

  const cartTotal = Object.entries(cart).reduce((total, [partId, qty]) => {
    const part = mockParts.find(p => p.id === partId);
    return total + (part?.price || 0) * qty;
  }, 0);

  const cartItemCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  return (
    <div className="space-y-6">
      {/* Header with Cart Summary */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Compatible Parts</h3>
          <p className="text-sm text-muted-foreground">
            {compatibleParts.length} parts available for this equipment
          </p>
        </div>
        {cartItemCount > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">{cartItemCount} items</p>
                    <p className="text-xs text-muted-foreground">Total: ${cartTotal.toFixed(2)}</p>
                  </div>
                </div>
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-600">
                  Request Parts
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Parts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {compatibleParts.map((part) => (
          <Card key={part.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base">{part.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">SKU: {part.sku}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {part.inStock ? (
                    <Badge className="bg-green-500 text-white">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      In Stock
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Out of Stock
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Description */}
              <p className="text-sm text-muted-foreground">{part.description}</p>

              {/* Compatibility */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Compatible Models:</p>
                <div className="flex flex-wrap gap-1">
                  {part.compatibleModels.map((model, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {model}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-muted-foreground">Price</span>
                  </div>
                  <p className="text-xl font-bold text-green-600">${part.price.toFixed(2)}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-600" />
                    <span className="text-xs text-muted-foreground">Available</span>
                  </div>
                  <p className="text-xl font-bold">
                    {part.inStock ? part.quantity : 0}
                  </p>
                </div>

                <div className="space-y-1 col-span-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="text-xs text-muted-foreground">Delivery</span>
                  </div>
                  <p className="text-sm font-medium">
                    {part.estimatedDeliveryDays} {part.estimatedDeliveryDays === 1 ? 'day' : 'days'}
                  </p>
                </div>
              </div>

              {/* Supplier */}
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Supplier: <span className="font-medium">{part.supplier}</span>
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {cart[part.id] ? (
                  <div className="flex items-center gap-2 w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFromCart(part.id)}
                      className="flex-1"
                    >
                      -
                    </Button>
                    <div className="px-4 py-2 border rounded-lg bg-blue-500/10 border-blue-500/20 font-semibold">
                      {cart[part.id]}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addToCart(part.id)}
                      className="flex-1"
                      disabled={!part.inStock || cart[part.id] >= part.quantity}
                    >
                      +
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => addToCart(part.id)}
                    disabled={!part.inStock}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {part.inStock ? 'Add to Request' : 'Out of Stock'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {compatibleParts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Compatible Parts</h3>
            <p className="text-muted-foreground">
              No parts are currently available for this equipment model
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BikeModel } from '../data/models';
import { supabase } from '../lib/supabase';

export interface CartItem {
  model: BikeModel;
  quantity: number;
  colorId: string;
  colorLabel: string;
  colorSkuCode: string;
  size: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (model: BikeModel, colorId: string, colorLabel: string, colorSkuCode: string, size: string) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalCount: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('spinz-cart');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return parsed.filter((i: CartItem) => i.colorId && i.size);
    } catch { return []; }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('spinz-cart', JSON.stringify(items));
  }, [items]);

  // Re-price the cart on load: a saved cart holds the price from the moment
  // it was added, which goes stale when presale/product prices change in the
  // admin. Always charge the current price.
  useEffect(() => {
    let alive = true;
    (async () => {
      const [{ data: settings }, { data: products }] = await Promise.all([
        supabase.from('site_settings').select('presale_active, presale_price').eq('id', 1).single(),
        supabase.from('products').select('slug, price, sale_price'),
      ]);
      if (!alive) return;

      const priceFor = (colorId: string, size: string): number | null => {
        if (settings?.presale_active) return settings.presale_price ?? null;
        const row = (products ?? []).find(p => p.slug === `spinz-${colorId}-${size}`);
        if (!row) return null;
        return row.sale_price ?? row.price ?? null;
      };

      setItems(prev => {
        let changed = false;
        const next = prev.map(i => {
          const current = priceFor(i.colorId, i.size);
          if (current == null || current === i.model.price) return i;
          changed = true;
          return { ...i, model: { ...i.model, price: current } };
        });
        return changed ? next : prev;
      });
    })();
    return () => { alive = false; };
  }, []);

  const addItem = (model: BikeModel, colorId: string, colorLabel: string, colorSkuCode: string, size: string) => {
    setItems(prev => {
      const existing = prev.find(i => i.model.id === model.id);
      if (existing) {
        return prev.map(i => i.model.id === model.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { model, quantity: 1, colorId, colorLabel, colorSkuCode, size }];
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.model.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.model.id !== id));
    } else {
      setItems(prev => prev.map(i => i.model.id === id ? { ...i, quantity } : i));
    }
  };

  const clearCart = () => setItems([]);

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalCount, isOpen, openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false) }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

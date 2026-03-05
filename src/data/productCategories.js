import { Palette, Shirt, Coffee, MoreHorizontal, Package, Gem, Gift, Star } from 'lucide-react';

export const PRODUCT_CATEGORIES = [
  { value: 'ceramica', label: 'Cerámica', icon: Palette },
  { value: 'merch', label: 'Merch', icon: Shirt },
  { value: 'cafe', label: 'Café', icon: Coffee },
  { value: 'otro', label: 'Otro', icon: MoreHorizontal },
];

export const STOCK_STATUS_OPTIONS = [
  { value: 'in_stock', label: 'En stock', color: '#27ae60' },
  { value: 'low_stock', label: 'Pocas unidades', color: '#f39c12' },
  { value: 'out_of_stock', label: 'Agotado', color: '#e74c3c' },
];

export const ICON_MAP = {
  Palette, Shirt, Coffee, MoreHorizontal, Package, Gem, Gift, Star,
};

export const getCategoryIcon = (iconName) => {
  return ICON_MAP[iconName] || Package;
};

export const getCategoryLabel = (value, dynamicCategories = []) => {
  const dynamic = dynamicCategories.find(c => c.value === value);
  if (dynamic) return dynamic.label;
  return PRODUCT_CATEGORIES.find(c => c.value === value)?.label || value;
};

export const getStockLabel = (value) => {
  return STOCK_STATUS_OPTIONS.find(s => s.value === value)?.label || value;
};

export const getStockColor = (value) => {
  return STOCK_STATUS_OPTIONS.find(s => s.value === value)?.color || '#666';
};

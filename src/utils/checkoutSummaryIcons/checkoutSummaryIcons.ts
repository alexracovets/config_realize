import { ClipboardCheck, Home, ShieldCheck, Shirt, Star, Truck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const CHECKOUT_SUMMARY_ICON_MAP: Record<string, LucideIcon> = {
  shirt: Shirt,
  shieldCheck: ShieldCheck,
  truck: Truck,
  star: Star,
  clipboardCheck: ClipboardCheck,
  home: Home,
};

export { CHECKOUT_SUMMARY_ICON_MAP };

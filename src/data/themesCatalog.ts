import { ThemeMode } from '../types/tracker';
import duskIcon from '../assets/images/theme_icon_dusk_1795603121631.jpg';
import pearlIcon from '../assets/images/theme_icon_pearl_1795603122380.jpg';
import amberIcon from '../assets/images/theme_icon_amber_1795603123017.jpg';
import jadeIcon from '../assets/images/theme_icon_jade_1795603123011.jpg';
import prismIcon from '../assets/images/theme_icon_prism_1795603123251.jpg';

export interface ThemeIdentity {
  key: ThemeMode;
  name: string;
  imageUrl: string;
  swatchClass: string;
}

export const THEME_IDENTITIES: ThemeIdentity[] = [
  {
    key: 'dark',
    name: 'Dusk',
    imageUrl: duskIcon,
    swatchClass: 'bg-slate-900 border border-cyan-400/80 shadow-[0_0_6px_rgba(56,189,248,0.45)]',
  },
  {
    key: 'light',
    name: 'Pearl',
    imageUrl: pearlIcon,
    swatchClass: 'bg-white border border-sky-500/80 shadow-[0_0_6px_rgba(56,189,248,0.35)]',
  },
  {
    key: 'gold',
    name: 'Amber',
    imageUrl: amberIcon,
    swatchClass: 'bg-amber-400 border border-amber-200/80 shadow-[0_0_6px_rgba(251,191,36,0.55)]',
  },
  {
    key: 'matrix',
    name: 'Jade',
    imageUrl: jadeIcon,
    swatchClass: 'bg-emerald-400 border border-emerald-200/80 shadow-[0_0_6px_rgba(34,197,94,0.55)]',
  },
  {
    key: 'cyberpunk',
    name: 'Prism',
    imageUrl: prismIcon,
    swatchClass: 'bg-gradient-to-tr from-fuchsia-500 to-cyan-400 border border-fuchsia-300/80 shadow-[0_0_6px_rgba(217,70,239,0.55)]',
  },
];

export function getThemeIdentity(theme: ThemeMode): ThemeIdentity {
  return THEME_IDENTITIES.find((t) => t.key === theme) || THEME_IDENTITIES[0];
}

'use client';

import { usePathname } from 'next/navigation';

import { AccountGlyph, CartGlyph, HamburgerGlyph, SearchGlyph } from '@organisms/Header/HeaderIcons';
import { LocalizationDropdown } from '@organisms/Header/LocalizationDropdown';
import { AtomImage } from '@atoms';
import { useAppNavigate, useMagnet } from '@hooks';
import { useEmbedded } from '@providers';
import { useConfigurationCart } from '@store';
import { buildConfiguratorPath, isConfiguratorPath } from '@utils';

const STORE_ORIGIN = 'https://realizesport.com';

const PRIMARY_LOCALE = 'it';
const LANGUAGES = [
  { label: 'Italiano', value: 'it' },
  { label: 'English', value: 'en' },
];

const localizedStoreUrl = (locale: string): string => {
  if (typeof window === 'undefined') return STORE_ORIGIN;
  const stripped = window.location.pathname.replace(/^\/(it|en)(?=\/|$)/, '') || '/';
  const prefix = locale === PRIMARY_LOCALE ? '' : `/${locale}`;
  return `${STORE_ORIGIN}${prefix}${stripped}`;
};

const MagnetButton = ({ label, onClick, children, className }: { label: string; onClick: () => void; children: React.ReactNode; className?: string }) => {
  const ref = useMagnet<HTMLButtonElement>(10);
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`flex size-11 cursor-pointer items-center justify-center ${className ?? ''}`}
    >
      {children}
    </button>
  );
};

const Header = () => {
  const { embedded } = useEmbedded();
  const { toAppPath } = useAppNavigate();
  const pathname = usePathname();
  const activeItem = useConfigurationCart((state) => state.items.find((item) => item.id === state.activeItemId) ?? state.items[0]);

  const language = 'Italiano';

  const isOnConfigurator = isConfiguratorPath(pathname);
  const logoHref = toAppPath(isOnConfigurator || !activeItem?.collectionHandle ? '/' : buildConfiguratorPath(activeItem.collectionHandle, activeItem.slug));

  const go = (url: string) => {
    if (typeof window !== 'undefined') window.location.assign(url);
  };

  const action = {
    home: () => go(logoHref),
    search: () => go(`${STORE_ORIGIN}/search`),
    menu: () => undefined,
    account: () => go(`${STORE_ORIGIN}/account`),
    cart: () => go(`${STORE_ORIGIN}/cart`),
    language: (locale: string) => go(localizedStoreUrl(locale)),
  };

  // Embedded in the storefront iframe the real Shopify header is shown; this header
  // is rendered for the standalone / localhost app only.
  if (embedded) return null;

  return (
    <header className="w-full bg-white py-3.5">
      <div className="mx-auto w-full max-w-[1900px] px-5 lg:px-9 xl:px-12">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center">
          <div className="-mx-2.5 flex items-center justify-start">
            <MagnetButton label="Menu" onClick={action.menu} className="lg:hidden">
              <HamburgerGlyph />
            </MagnetButton>
            <MagnetButton label="Open search" onClick={action.search} className="max-lg:hidden">
              <SearchGlyph />
            </MagnetButton>
            <div className="ml-2.5 max-lg:hidden">
              <LocalizationDropdown languages={LANGUAGES} current={language} onSelect={action.language} />
            </div>
          </div>

          <button type="button" aria-label="Home" className="flex cursor-pointer items-center justify-center" onClick={action.home}>
            <AtomImage src="/svg/logo_full.svg" alt="Realize" variant="logo_full" priority />
          </button>

          <div className="-mx-2.5 flex items-center justify-end">
            <MagnetButton label="Open search" onClick={action.search} className="lg:hidden">
              <SearchGlyph />
            </MagnetButton>
            <MagnetButton label="Account" onClick={action.account}>
              <AccountGlyph />
            </MagnetButton>
            <MagnetButton label="Cart" onClick={action.cart}>
              <CartGlyph />
            </MagnetButton>
          </div>
        </div>
      </div>
    </header>
  );
};

export { Header };

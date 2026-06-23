import type { childrenType } from '@types';
import {
  AsideConfiguration,
  AsideConfigurationUtility,
  CartConfigurationSync,
  ConfiguratorInitialLoader,
  FooterConfiguration,
  Header,
  HeaderConfiguration,
} from '@organisms';

const ConfiguratorLayout = ({ children }: childrenType) => {
  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden">
      <div className="shrink-0">
        <Header />
      </div>
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-linear-to-t from-[#E8E8E8] to-white">
        <ConfiguratorInitialLoader />
        <CartConfigurationSync />
        <div className="relative grid min-h-0 flex-1 grid-cols-1 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden">
          <HeaderConfiguration />
          <main className="grid min-h-0 grid-cols-[auto_minmax(0,1fr)_auto] overflow-hidden">
            <AsideConfiguration />
            <div className="min-h-0 min-w-0">{children}</div>
            <AsideConfigurationUtility />
          </main>
          <FooterConfiguration />
        </div>
      </div>
    </div>
  );
};

export default ConfiguratorLayout;

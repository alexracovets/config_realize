import { Header } from '@organisms';
import type { childrenType } from '@types';

const ShopLayout = ({ children }: childrenType) => {
  return (
    <div className="flex min-h-dvh flex-col">
        <div className="shrink-0">
          <Header />
        </div>
        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
    </div>
  );
};

export default ShopLayout;

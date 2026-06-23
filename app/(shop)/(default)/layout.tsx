import { Footer } from '@organisms';
import type { childrenType } from '@types';

const DefaultPagesLayout = ({ children }: childrenType) => {
  return (
    <>
      <div className="flex-1">{children}</div>
      <Footer />
    </>
  );
};

export default DefaultPagesLayout;

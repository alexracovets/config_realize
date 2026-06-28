'use client';

const AtomTabsSeparator = ({ isActive }: { isActive?: boolean }) => {
  return <span aria-hidden className={`block h-0.5 w-3 shrink-0 bg-gray-10 transition-opacity ${isActive ? 'opacity-100' : 'opacity-30'}`} />;
};

export { AtomTabsSeparator };

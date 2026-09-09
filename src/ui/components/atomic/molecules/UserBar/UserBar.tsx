'use client';

import { CartIcon } from '@molecules/UserBar/CartIcon';
import { UserIcon } from '@molecules/UserBar/UserIcon';
import { Button, Flex } from '@atoms';
import { useMagnet } from '@hooks';

// onAccount / onCart are provided when the configurator is embedded in the
// storefront, so the buttons drive the host store's account page and cart drawer.
type UserBarProps = {
  onAccount?: () => void;
  onCart?: () => void;
};

const MagnetButton = ({ label, onClick, children }: { label?: string; onClick?: () => void; children: React.ReactNode }) => {
  const ref = useMagnet<HTMLButtonElement>(10);
  return (
    <Button ref={ref} variant="outline" size="icon" aria-label={label} onClick={onClick}>
      {children}
    </Button>
  );
};

const UserBar = ({ onAccount, onCart }: UserBarProps = {}) => {
  return (
    <Flex variant="user_bar">
      <MagnetButton label="Account" onClick={onAccount}>
        <UserIcon />
      </MagnetButton>
      <MagnetButton label="Cart" onClick={onCart}>
        <CartIcon />
      </MagnetButton>
    </Flex>
  );
};

export { UserBar };

'use client';

import { CartIcon } from '@molecules/UserBar/CartIcon';
import { UserIcon } from '@molecules/UserBar/UserIcon';
import { Button, Flex } from '@atoms';
const UserBar = () => {
  return (
    <Flex variant="user_bar">
      <Button variant="outline" size="icon">
        <UserIcon />
      </Button>
      <Button variant="outline" size="icon">
        <CartIcon />
      </Button>
    </Flex>
  );
};

export { UserBar };

'use client';

import { AtomImage, Box, Button, Text } from '@atoms';

const Notification = () => {
  return (
    <Button className="relative w-fit" variant="outline">
      <AtomImage src="/svg/whatsapp.svg" alt="WhatsApp" width={60} height={61} />
      <Box variant="notification_dot">
        <Text variant="whatsapp_badge" asChild>
          <span>1</span>
        </Text>
      </Box>
    </Button>
  );
};

export { Notification };

const resolveLogoStampPackOrder = <T extends { id: string }>(instances: T[]): T[] =>
  [...instances].sort((left, right) => {
    if (left.id < right.id) return -1;
    if (left.id > right.id) return 1;
    return 0;
  });

const resolveLogoStampSlots = (instances: { id: string }[]): number[] => {
  const cellById = new Map(resolveLogoStampPackOrder(instances).map((instance, cell) => [instance.id, cell] as const));

  return instances.map((instance) => cellById.get(instance.id) ?? 0);
};

export { resolveLogoStampPackOrder, resolveLogoStampSlots };

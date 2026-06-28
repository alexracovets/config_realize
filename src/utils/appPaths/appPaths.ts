const buildCollectionPath = (collectionHandle: string): string => `/${collectionHandle}`;

const buildConfiguratorPath = (collectionHandle: string, slug: string): string =>
  `/${collectionHandle}/${slug}`;

const isConfiguratorPath = (pathname: string): boolean => {
  const segments = pathname.split('/').filter(Boolean);
  return segments.length === 2;
};

export { buildCollectionPath, buildConfiguratorPath, isConfiguratorPath };

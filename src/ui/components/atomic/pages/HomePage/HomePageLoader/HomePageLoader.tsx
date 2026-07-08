import { HomePage } from '@pages';
import { resolveHomeCollectionSummaries } from '@shopify';
const HomePageLoader = async () => {
  const collections = await resolveHomeCollectionSummaries();

  return <HomePage collections={collections} />;
};

export { HomePageLoader };

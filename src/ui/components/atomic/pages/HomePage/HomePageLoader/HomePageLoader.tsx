import { HomePage } from '@pages/HomePage/HomePage';
import { resolveHomeCollectionSummaries } from '@shopify';
const HomePageLoader = async () => {
  const collections = await resolveHomeCollectionSummaries();

  return <HomePage collections={collections} />;
};

export { HomePageLoader };

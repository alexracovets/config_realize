import { HomePage } from '@pages/HomePage/HomePage';
import { resolveHomeCollections } from '@shopify';
const HomePageLoader = async () => {
  const collections = await resolveHomeCollections();

  return <HomePage collections={collections} />;
};

export { HomePageLoader };

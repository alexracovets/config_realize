import { HomePage } from '@pages';
import { resolveHomeCollections } from '@shopify';

const Home = async () => {
  const collections = await resolveHomeCollections();

  return <HomePage collections={collections} />;
};

export default Home;

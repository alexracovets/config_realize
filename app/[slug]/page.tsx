import { ConfiguratorPage } from '@pages';
import { ConfiguratorSlugHydration } from '@organisms';

type configuratorRoutePropsType = {
  params: Promise<{ slug: string }>;
};

const ConfiguratorRoute = async ({ params }: configuratorRoutePropsType) => {
  const { slug } = await params;

  return (
    <>
      <ConfiguratorSlugHydration slug={slug} />
      <ConfiguratorPage />
    </>
  );
};

export default ConfiguratorRoute;

export { ConfiguratorCatalogProvider, useConfiguratorCatalog } from './configuratorCatalogProvider';

// `ConfiguratorCatalogShell` (an async Server Component that reaches into `@shopify`, which
// touches `node:crypto`) is intentionally NOT re-exported here. This barrel is transitively
// re-exported by the 'use client'-marked `@providers` barrel — bundling a server-only chain
// into it breaks any non-Turbopack build (`next build --webpack`) with an unhandled
// "node:crypto" scheme error. Import it directly: `@providers/configuratorCatalogProvider/ConfiguratorCatalogShell`.

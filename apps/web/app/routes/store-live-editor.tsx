import { useLoaderData } from '@remix-run/react';
import type { MetaFunction } from '@remix-run/cloudflare';
import { LiveEditor } from '~/components/store-builder/LiveEditor.client';
import { loader, action } from '~/lib/store-live-editor.server';

export const meta: MetaFunction = () => [{ title: 'Store Live Editor - Ozzyl' }];

export { loader, action };

export default function StoreLiveEditorRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <LiveEditor
      store={data.store}
      themeConfig={data.themeConfig}
      templates={data.templates}
      saasDomain={data.saasDomain}
      demoProductId={data.demoProductId ? String(data.demoProductId) : null}
    />
  );
}

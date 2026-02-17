import type { ReactElement } from 'react';

/** Props accepted by BuilderLayout for type compatibility with new-builder route.
 *  MVP stub — renders placeholder; full implementation is archived. */
export interface BuilderLayoutProps {
  [key: string]: unknown;
}

// MVP fallback for archived visual builder UI.
export function BuilderLayout(_props: BuilderLayoutProps): ReactElement {
  return (
    <div className="p-6 text-sm text-gray-600">
      Visual page builder is archived for MVP.
    </div>
  );
}

export default BuilderLayout;

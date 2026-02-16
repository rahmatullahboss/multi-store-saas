/**
 * StyleControls Stub for Web App
 *
 * This component is specific to the GrapesJS page-builder app.
 * Web app should not directly use it - it's included here only
 * to prevent import errors in shared components.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function StyleControls({ editor }: { editor?: any }) {
  // Suppress unused variable warning - editor is accepted for API compatibility
  void editor;
  return (
    <div className="p-4 text-center text-gray-500 text-sm">
      StyleControls is only available in the Page Builder app.
    </div>
  );
}

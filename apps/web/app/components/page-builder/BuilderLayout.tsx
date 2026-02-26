/**
 * BuilderLayout — World-class 3-panel page editor
 *
 * Layout:
 *   [TopToolbar]
 *   [Left 280px dark sidebar | Center iframe | Right 320px settings]
 *
 * Features:
 *   - Inline editable page title
 *   - Undo / Redo (Ctrl+Z / Ctrl+Y)
 *   - Viewport switcher (Mobile / Tablet / Desktop)
 *   - Auto-save debounced 2s → POST /api/builder/save
 *   - Publish button
 *   - dnd-kit sortable section list
 *   - Section settings panel with Bengali labels
 *   - ErrorBoundary in Bengali
 *   - postMessage uses window.location.origin
 *   - Mobile: collapses to tab bar
 */

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type ReactElement,
} from 'react';
import { useFetcher, useRouteError, isRouteErrorResponse } from '@remix-run/react';
import {
  Undo2,
  Redo2,
  Smartphone,
  Tablet,
  Monitor,
  Globe,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Layers,
  Settings,
  Eye,
} from 'lucide-react';
import type { BuilderSection, SectionType, BuilderPage } from '~/lib/page-builder/types';
import type { SectionMeta } from '~/lib/page-builder/types';
import { SectionList } from '~/components/builder/SectionList';
import { AddSectionModal } from '~/components/builder/AddSectionModal';
import { SettingsPanel } from '~/components/builder/SettingsPanel';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BuilderLayoutProps {
  page: BuilderPage | null;
  sections: BuilderSection[];
  activeSectionId: string | null;
  isNew: boolean;
  isSaving: boolean;
  onSelectSection: (id: string | null) => void;
  onReorder: (orderedIds: string[]) => void;
  onToggle: (id: string, enabled: boolean) => void;
  onAddSection: (type: SectionType) => void;
  onDeleteSection: (id: string) => void;
  onUpdateProps: (
    sectionId: string,
    type: string,
    props: Record<string, unknown>,
    version: number
  ) => void;
  onDuplicate: (id: string) => void;
  onCreatePage: (slug: string, title: string) => void;
  onPublish: () => void;
  showAddModal: boolean;
  setShowAddModal: (show: boolean) => void;
  availableSections: SectionMeta[];
  products: Array<{ id: number; name: string; price: number; imageUrl?: string | null }>;
  selectedProduct: unknown;
  selectedProducts: unknown[];
  lastSaved: Date | null;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onSaveSettings: (settings: Record<string, unknown>) => void;
  onProductIdChange: (id: number | null) => void;
  [key: string]: unknown;
}

// ── Viewport sizes ────────────────────────────────────────────────────────────

type Viewport = 'mobile' | 'tablet' | 'desktop';

const VIEWPORT_CONFIG: Record<Viewport, { width: string; icon: ReactElement; label: string }> = {
  mobile: { width: '390px', icon: <Smartphone size={16} />, label: 'মোবাইল' },
  tablet: { width: '768px', icon: <Tablet size={16} />, label: 'ট্যাবলেট' },
  desktop: { width: '100%', icon: <Monitor size={16} />, label: 'ডেস্কটপ' },
};

// ── Save status indicator ─────────────────────────────────────────────────────

type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

interface SaveIndicatorProps {
  status: SaveStatus;
  lastSaved: Date | null;
}

function SaveIndicator({ status, lastSaved }: SaveIndicatorProps) {
  const fmt = lastSaved
    ? lastSaved.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
    : null;

  if (status === 'saving') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-yellow-400">
        <Loader2 size={12} className="animate-spin" />
        সংরক্ষণ হচ্ছে...
      </span>
    );
  }
  if (status === 'saved') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-emerald-400">
        <CheckCircle2 size={12} />
        সংরক্ষিত {fmt ? `• ${fmt}` : ''}
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-red-400">
        <AlertCircle size={12} />
        সংরক্ষণ ব্যর্থ
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-xs text-gray-400">
      <AlertCircle size={12} />
      অসংরক্ষিত পরিবর্তন
    </span>
  );
}

// ── Inline page title editor ──────────────────────────────────────────────────

interface InlineTitleProps {
  value: string;
  onChange: (v: string) => void;
}

function InlineTitle({ value, onChange }: InlineTitleProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const commit = useCallback(() => {
    setEditing(false);
    if (draft.trim() && draft !== value) onChange(draft.trim());
    else setDraft(value);
  }, [draft, value, onChange]);

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') { setEditing(false); setDraft(value); }
        }}
        className="bg-white/10 text-white text-sm font-medium px-2 py-1 rounded border border-white/20 focus:outline-none focus:border-indigo-400 w-48"
        maxLength={80}
      />
    );
  }

  return (
    <button
      onClick={() => { setDraft(value); setEditing(true); }}
      className="text-sm font-medium text-gray-200 hover:text-white hover:bg-white/10 px-2 py-1 rounded transition-colors max-w-[200px] truncate text-left"
      title="পেজ নাম পরিবর্তন করতে ক্লিক করুন"
    >
      {value || 'Untitled Page'}
    </button>
  );
}

// ── Mobile tab bar ────────────────────────────────────────────────────────────

type MobileTab = 'sections' | 'preview' | 'settings';

interface MobileTabBarProps {
  active: MobileTab;
  onChange: (tab: MobileTab) => void;
}

function MobileTabBar({ active, onChange }: MobileTabBarProps) {
  return (
    <div className="flex border-t border-white/10 bg-[#0f0f1a] md:hidden">
      {(
        [
          { id: 'sections' as MobileTab, icon: <Layers size={18} />, label: 'সেকশন' },
          { id: 'preview' as MobileTab, icon: <Eye size={18} />, label: 'প্রিভিউ' },
          { id: 'settings' as MobileTab, icon: <Settings size={18} />, label: 'সেটিংস' },
        ] as const
      ).map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] transition-colors ${
            active === tab.id ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ── Main BuilderLayout ────────────────────────────────────────────────────────

export function BuilderLayout({
  page,
  sections,
  activeSectionId,
  isNew,
  isSaving,
  onSelectSection,
  onReorder,
  onToggle,
  onAddSection,
  onDeleteSection,
  onUpdateProps,
  onDuplicate,
  onPublish,
  showAddModal,
  setShowAddModal,
  availableSections,
  lastSaved,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: BuilderLayoutProps): ReactElement {
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const [pageTitle, setPageTitle] = useState(page?.title ?? 'Untitled Page');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(lastSaved ? 'saved' : 'unsaved');
  const [mobileTab, setMobileTab] = useState<MobileTab>('sections');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track active section for the settings panel
  const activeSection = useMemo(
    () => sections.find((s) => s.id === activeSectionId) ?? null,
    [sections, activeSectionId]
  );

  // Sync save status with isSaving prop (from main route fetcher)
  useEffect(() => {
    if (isSaving) {
      setSaveStatus('saving');
    } else if (lastSaved) {
      setSaveStatus('saved');
    }
  }, [isSaving, lastSaved]);

  // Auto-save via debounce → POST /api/builder/save
  const scheduleAutoSave = useCallback(() => {
    if (!page?.id) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setSaveStatus('unsaved');

    autoSaveTimer.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        const res = await fetch('/api/builder/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pageId: page.id,
            sections: sections.map((s) => ({
              id: s.id,
              type: s.type,
              props: s.props,
              sortOrder: s.sortOrder,
              enabled: s.enabled,
            })),
          }),
        });
        const data = (await res.json()) as { success: boolean; savedAt?: string };
        setSaveStatus(data.success ? 'saved' : 'error');
      } catch {
        setSaveStatus('error');
      }
    }, 2000);
  }, [page?.id, sections]);

  // Trigger auto-save when sections change
  const sectionsKey = useMemo(() => JSON.stringify(sections.map((s) => ({ id: s.id, props: s.props, sortOrder: s.sortOrder, enabled: s.enabled }))), [sections]);
  useEffect(() => {
    scheduleAutoSave();
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionsKey]);

  // postMessage selected section to iframe — always use window.location.origin
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;
    try {
      iframe.contentWindow.postMessage(
        { type: 'SECTION_SELECTED', sectionId: activeSectionId },
        window.location.origin
      );
    } catch {
      // iframe may not be ready yet
    }
  }, [activeSectionId]);

  // postMessage section updates to iframe
  // Sends both SECTIONS_UPDATE (legacy) and PREVIEW_UPDATE (new builder preview route)
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;
    try {
      iframe.contentWindow.postMessage(
        { type: 'SECTIONS_UPDATE', sections },
        window.location.origin
      );
      iframe.contentWindow.postMessage(
        { type: 'PREVIEW_UPDATE', sections },
        window.location.origin
      );
    } catch {
      // ignore
    }
  }, [sections]);

  // Handle props update — also triggers auto-save
  const handleUpdateProps = useCallback(
    (sectionId: string, type: string, props: Record<string, unknown>, version: number) => {
      onUpdateProps(sectionId, type, props, version);
    },
    [onUpdateProps]
  );

  // Page title change — submit to update-settings
  const titleFetcher = useFetcher();
  const handleTitleChange = useCallback(
    (newTitle: string) => {
      setPageTitle(newTitle);
      titleFetcher.submit(
        { intent: 'update-settings', title: newTitle },
        { method: 'post' }
      );
    },
    [titleFetcher]
  );

  // Iframe preview URL — matches route app.new-builder.$pageId.preview.tsx → /app/new-builder/:pageId/preview
  const previewUrl = page
    ? `/app/new-builder/${page.id}/preview`
    : undefined;

  return (
    <div className="flex flex-col h-screen bg-[#0a0a14] text-white overflow-hidden">
      {/* ── Top Toolbar ─────────────────────────────────────────────────── */}
      <header className="flex items-center gap-3 px-3 h-12 border-b border-white/10 bg-[#0f0f1a] shrink-0 z-20">
        {/* Back + breadcrumb */}
        <a
          href="/app/new-builder"
          className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-xs shrink-0"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">Builder</span>
        </a>

        <span className="text-gray-600 text-xs hidden sm:inline">/</span>

        {/* Store name */}
        <span className="text-xs text-gray-400 hidden sm:inline shrink-0">স্টোর</span>
        <span className="text-gray-600 text-xs hidden sm:inline">/</span>

        {/* Editable page title */}
        <InlineTitle value={pageTitle} onChange={handleTitleChange} />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Undo / Redo */}
        <div className="flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="পূর্বাবস্থা (Ctrl+Z)"
            className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Undo2 size={15} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="পুনরায় (Ctrl+Y)"
            className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Redo2 size={15} />
          </button>
        </div>

        {/* Separator */}
        <div className="w-px h-5 bg-white/10" />

        {/* Viewport switcher */}
        <div className="hidden sm:flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
          {(Object.entries(VIEWPORT_CONFIG) as [Viewport, typeof VIEWPORT_CONFIG[Viewport]][]).map(
            ([vp, cfg]) => (
              <button
                key={vp}
                onClick={() => setViewport(vp)}
                title={cfg.label}
                className={`p-1.5 rounded-md transition-colors ${
                  viewport === vp
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {cfg.icon}
              </button>
            )
          )}
        </div>

        {/* Separator */}
        <div className="w-px h-5 bg-white/10" />

        {/* Save status */}
        <div className="hidden sm:block">
          <SaveIndicator status={saveStatus} lastSaved={lastSaved} />
        </div>

        {/* Preview link */}
        {previewUrl && (
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-300 hover:text-white border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all"
          >
            <Globe size={13} />
            প্রিভিউ
          </a>
        )}

        {/* Publish */}
        <button
          onClick={onPublish}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-lg shadow-emerald-900/30"
        >
          {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Globe size={13} />}
          প্রকাশ করুন
        </button>
      </header>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Panel (280px) — hidden on mobile unless tab active ───── */}
        <aside
          className={`w-70 shrink-0 border-r border-white/10 bg-[#0f0f1a] flex flex-col overflow-hidden
            ${mobileTab === 'sections' ? 'flex' : 'hidden'} md:flex`}
          style={{ width: '280px' }}
        >
          <SectionList
            sections={sections}
            activeSectionId={activeSectionId}
            onSelect={onSelectSection}
            onReorder={onReorder}
            onDelete={onDeleteSection}
            onDuplicate={onDuplicate}
            onToggle={onToggle}
            onOpenAddModal={() => setShowAddModal(true)}
          />
        </aside>

        {/* ── Center — iframe preview ───────────────────────────────────── */}
        <main
          className={`flex-1 overflow-hidden bg-[#060610] flex flex-col items-center
            ${mobileTab === 'preview' ? 'flex' : 'hidden'} md:flex`}
        >
          {/* Viewport frame wrapper */}
          <div className="flex-1 w-full overflow-auto flex flex-col items-center py-4 px-2">
            <div
              className="relative flex-1 flex flex-col rounded-xl overflow-hidden shadow-2xl border border-white/10 transition-all duration-300 bg-white"
              style={{
                width: VIEWPORT_CONFIG[viewport].width,
                maxWidth: '100%',
                minHeight: '600px',
              }}
            >
              {/* Browser chrome */}
              <div className="flex items-center gap-1.5 px-3 py-2 bg-[#1a1a2e] border-b border-white/10 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                <div className="flex-1 mx-2 px-2 py-0.5 rounded bg-white/5 text-[10px] text-gray-500 truncate">
                  {previewUrl ?? '/preview'}
                </div>
              </div>

              {/* iframe */}
              {previewUrl ? (
                <iframe
                  ref={iframeRef}
                  src={previewUrl}
                  className="flex-1 w-full border-0"
                  title="Page Preview"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center text-gray-400">
                    <Monitor size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">প্রিভিউ লোড হচ্ছে...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Viewport label */}
          <div className="py-2 text-[10px] text-gray-600">
            {VIEWPORT_CONFIG[viewport].label} •{' '}
            {viewport === 'desktop' ? '100%' : VIEWPORT_CONFIG[viewport].width}
          </div>
        </main>

        {/* ── Right Panel (320px) — settings ───────────────────────────── */}
        <aside
          className={`shrink-0 border-l border-white/10 bg-[#0f0f1a] flex flex-col overflow-hidden
            ${mobileTab === 'settings' ? 'flex' : 'hidden'} md:flex`}
          style={{ width: '320px' }}
        >
          <SettingsPanel
            section={activeSection}
            onUpdateProps={handleUpdateProps}
            onVariantChange={(sectionId, variantId) => {
              // Persist the variant change as a prop update so auto-save picks it up
              if (!activeSection) return;
              onUpdateProps(
                sectionId,
                activeSection.type,
                { ...activeSection.props, _variant: variantId },
                activeSection.version
              );
            }}
          />
        </aside>
      </div>

      {/* ── Mobile bottom tab bar ─────────────────────────────────────── */}
      <MobileTabBar active={mobileTab} onChange={setMobileTab} />

      {/* ── Add Section Modal ─────────────────────────────────────────── */}
      {showAddModal && (
        <AddSectionModal
          availableSections={availableSections}
          onAdd={onAddSection}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

export default BuilderLayout;

// ── ErrorBoundary ─────────────────────────────────────────────────────────────

export function ErrorBoundary() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} — ${error.data}`
    : error instanceof Error
      ? error.message
      : 'অজানা ত্রুটি';

  return (
    <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={28} className="text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">
          সম্পাদক লোড হয়নি। পেজ রিলোড করুন।
        </h1>
        <p className="text-sm text-gray-400 mb-6">{message}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          পেজ রিলোড করুন
        </button>
      </div>
    </div>
  );
}

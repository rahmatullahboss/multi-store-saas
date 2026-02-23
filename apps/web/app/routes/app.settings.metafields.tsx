/**
 * Metafields Settings Page
 * 
 * Manage metafield definitions for the store
 * Route: /app/settings/metafields
 */

import { json, type LoaderFunction, type ActionFunction } from '@remix-run/cloudflare';
import { useLoaderData, useFetcher, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { and, eq } from 'drizzle-orm';
import { useState, useEffect } from 'react';
import { requireAuth } from '~/lib/auth.server';
import { metafieldDefinitions, type MetafieldDefinition, type MetafieldType, type MetafieldOwnerType } from '@db/schema_metafields';
import { 
  Plus, Trash2, Edit2, Database, Package, FolderOpen, Store, FileText,
  Hash, Type, ToggleLeft, Calendar, Link as LinkIcon, Palette, Code, Image, X, Save, List, ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';

// Metafield types with icons and labels
const METAFIELD_TYPES: { value: MetafieldType; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'single_line_text_field', label: 'Single Line Text', icon: <Type className="w-4 h-4" />, description: 'Short text, up to 255 characters' },
  { value: 'multi_line_text_field', label: 'Multi Line Text', icon: <FileText className="w-4 h-4" />, description: 'Long text, multiple lines' },
  { value: 'number_integer', label: 'Integer', icon: <Hash className="w-4 h-4" />, description: 'Whole number' },
  { value: 'number_decimal', label: 'Decimal', icon: <Hash className="w-4 h-4" />, description: 'Number with decimals' },
  { value: 'boolean', label: 'True/False', icon: <ToggleLeft className="w-4 h-4" />, description: 'Yes/No toggle' },
  { value: 'date', label: 'Date', icon: <Calendar className="w-4 h-4" />, description: 'Date picker' },
  { value: 'url', label: 'URL', icon: <LinkIcon className="w-4 h-4" />, description: 'Web link' },
  { value: 'color', label: 'Color', icon: <Palette className="w-4 h-4" />, description: 'Color picker' },
  { value: 'file_reference', label: 'File/Image', icon: <Image className="w-4 h-4" />, description: 'File or image URL' },
  { value: 'json', label: 'JSON', icon: <Code className="w-4 h-4" />, description: 'Structured JSON data' },
  { value: 'list.single_line_text_field', label: 'List of Text', icon: <List className="w-4 h-4" />, description: 'Multiple text values' },
];

const OWNER_TYPES: { value: MetafieldOwnerType; label: string; icon: React.ReactNode }[] = [
  { value: 'product', label: 'Products', icon: <Package className="w-4 h-4" /> },
  { value: 'collection', label: 'Collections', icon: <FolderOpen className="w-4 h-4" /> },
  { value: 'store', label: 'Store', icon: <Store className="w-4 h-4" /> },
  { value: 'page', label: 'Pages', icon: <FileText className="w-4 h-4" /> },
];

// Loader
export const loader: LoaderFunction = async ({ request, context }) => {
  const { store } = await requireAuth(request, context);

  const db = drizzle(context.cloudflare.env.DB);
  
  const definitions = await db.select().from(metafieldDefinitions)
    .where(eq(metafieldDefinitions.storeId, store.id));

  return json({
    definitions: definitions.map(d => ({
      ...d,
      validations: d.validations ? JSON.parse(d.validations) : null,
    })),
    storeId: store.id,
  });
};

// Action
export const action: ActionFunction = async ({ request, context }) => {
  const { store } = await requireAuth(request, context);

  const db = drizzle(context.cloudflare.env.DB);
  const formData = await request.formData();
  const actionType = formData.get('_action') as string;

  if (actionType === 'delete') {
    const id = formData.get('id') as string;

    // Verify the metafield definition belongs to the current store before deleting
    const existing = await db.select().from(metafieldDefinitions).where(
      and(eq(metafieldDefinitions.id, id), eq(metafieldDefinitions.storeId, store.id))
    ).get();
    if (!existing) throw new Response('Not found', { status: 404 });

    await db.delete(metafieldDefinitions)
      .where(and(eq(metafieldDefinitions.id, id), eq(metafieldDefinitions.storeId, store.id)));
    return json({ success: true });
  }

  if (actionType === 'create' || actionType === 'update') {
    const data = {
      namespace: formData.get('namespace') as string,
      key: formData.get('key') as string,
      name: formData.get('name') as string,
      description: formData.get('description') as string || null,
      type: formData.get('type') as MetafieldType,
      ownerType: formData.get('ownerType') as MetafieldOwnerType,
      pinned: formData.get('pinned') === 'true' ? 1 : 0,
    };

    if (actionType === 'update') {
      const id = formData.get('id') as string;

      // Verify the metafield definition belongs to the current store before updating
      const existing = await db.select().from(metafieldDefinitions).where(
        and(eq(metafieldDefinitions.id, id), eq(metafieldDefinitions.storeId, store.id))
      ).get();
      if (!existing) throw new Response('Not found', { status: 404 });

      await db.update(metafieldDefinitions)
        .set({ ...data, updatedAt: new Date().toISOString() })
        .where(and(eq(metafieldDefinitions.id, id), eq(metafieldDefinitions.storeId, store.id)));
    } else {
      const id = `mfd_${store.id}_${Date.now()}`;
      await db.insert(metafieldDefinitions).values({
        id,
        storeId: store.id,
        ...data,
      });
    }
    return json({ success: true });
  }

  return json({ error: 'Invalid action' }, { status: 400 });
};

interface LoaderData {
  definitions: MetafieldDefinition[];
  storeId: number;
}

// Component
export default function MetafieldsSettings() {
  const { definitions } = useLoaderData<LoaderData>();
  const fetcher = useFetcher();
  
  const [showModal, setShowModal] = useState(false);
  const [editingDef, setEditingDef] = useState<MetafieldDefinition | null>(null);
  const [selectedOwnerType, setSelectedOwnerType] = useState<MetafieldOwnerType | 'all'>('all');

  // Filter definitions
  const filteredDefs = selectedOwnerType === 'all' 
    ? definitions 
    : definitions.filter((d: MetafieldDefinition) => d.ownerType === selectedOwnerType);

  // Group by owner type
  const groupedDefs = OWNER_TYPES.reduce((acc, ot) => {
    acc[ot.value] = filteredDefs.filter((d: MetafieldDefinition) => d.ownerType === ot.value);
    return acc;
  }, {} as Record<MetafieldOwnerType, MetafieldDefinition[]>);

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete metafield "${name}"? This will also remove all values.`)) {
      fetcher.submit(
        { _action: 'delete', id },
        { method: 'POST' }
      );
      toast.success('Metafield deleted');
    }
  };

  const openCreateModal = () => {
    setEditingDef(null);
    setShowModal(true);
  };

  const openEditModal = (def: MetafieldDefinition) => {
    setEditingDef(def);
    setShowModal(true);
  };

  return (
    <>
      {/* Mobile Layout */}
      <div className="md:hidden -mx-4 -mt-4">
        {/* Sticky Header */}
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center justify-between px-4 py-3">
            <Link to="/app/settings" className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">Metafields</h1>
            <div className="w-10" />
          </div>
        </div>

        {/* Mobile Content */}
        <div className="px-4 pb-32 pt-4 space-y-4">
          {/* Filter Tabs - Horizontal Scroll */}
          <div className="overflow-x-auto -mx-4 px-4 pb-2">
            <div className="flex gap-2 min-w-max">
              <button
                onClick={() => setSelectedOwnerType('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  selectedOwnerType === 'all' 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                All ({definitions.length})
              </button>
              {OWNER_TYPES.map(ot => (
                <button
                  key={ot.value}
                  onClick={() => setSelectedOwnerType(ot.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                    selectedOwnerType === ot.value 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {ot.icon}
                  {ot.label} ({definitions.filter((d: MetafieldDefinition) => d.ownerType === ot.value).length})
                </button>
              ))}
            </div>
          </div>

          {/* Definitions List */}
          {filteredDefs.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <Database className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No metafield definitions yet</h3>
              <p className="text-gray-500 mb-4 px-4">Create custom fields to store additional data for your products and collections.</p>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                <Plus className="w-4 h-4" />
                Create First Metafield
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedOwnerType === 'all' ? (
                // Grouped view
                OWNER_TYPES.map(ot => {
                  const defs = groupedDefs[ot.value];
                  if (defs.length === 0) return null;
                  
                  return (
                    <div key={ot.value}>
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase mb-3">
                        {ot.icon} {ot.label}
                      </h3>
                      <div className="space-y-3">
                        {defs.map((def: MetafieldDefinition) => (
                          <MobileDefinitionCard 
                            key={def.id} 
                            definition={def} 
                            onEdit={() => openEditModal(def)}
                            onDelete={() => handleDelete(def.id, def.name)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                // Flat view
                <div className="space-y-3">
                  {filteredDefs.map((def: MetafieldDefinition) => (
                    <MobileDefinitionCard 
                      key={def.id} 
                      definition={def} 
                      onEdit={() => openEditModal(def)}
                      onDelete={() => handleDelete(def.id, def.name)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Floating Add Button - Mobile */}
        <button
          onClick={openCreateModal}
          className="fixed bottom-20 right-4 z-[70] md:hidden w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition flex items-center justify-center"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block space-y-6">
        <div className="p-6 max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Database className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Metafields</h1>
                <p className="text-gray-500 text-sm">Define custom fields for products, collections, and more</p>
              </div>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <Plus className="w-4 h-4" />
              Add Definition
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200 pb-4">
            <button
              onClick={() => setSelectedOwnerType('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedOwnerType === 'all' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All ({definitions.length})
            </button>
            {OWNER_TYPES.map(ot => (
              <button
                key={ot.value}
                onClick={() => setSelectedOwnerType(ot.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedOwnerType === ot.value 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {ot.icon}
                {ot.label} ({definitions.filter((d: MetafieldDefinition) => d.ownerType === ot.value).length})
              </button>
            ))}
          </div>

          {/* Definitions List */}
          {filteredDefs.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <Database className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No metafield definitions yet</h3>
              <p className="text-gray-500 mb-4">Create custom fields to store additional data for your products and collections.</p>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                <Plus className="w-4 h-4" />
                Create First Metafield
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {selectedOwnerType === 'all' ? (
                // Grouped view
                OWNER_TYPES.map(ot => {
                  const defs = groupedDefs[ot.value];
                  if (defs.length === 0) return null;
                  
                  return (
                    <div key={ot.value}>
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase mb-3">
                        {ot.icon} {ot.label}
                      </h3>
                      <div className="grid gap-3">
                        {defs.map((def: MetafieldDefinition) => (
                          <DefinitionCard 
                            key={def.id} 
                            definition={def} 
                            onEdit={() => openEditModal(def)}
                            onDelete={() => handleDelete(def.id, def.name)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                // Flat view
                <div className="grid gap-3">
                  {filteredDefs.map((def: MetafieldDefinition) => (
                    <DefinitionCard 
                      key={def.id} 
                      definition={def} 
                      onEdit={() => openEditModal(def)}
                      onDelete={() => handleDelete(def.id, def.name)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal - Shared between mobile and desktop */}
      {showModal && (
        <MetafieldModal
          definition={editingDef}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

// Mobile Definition Card Component
function MobileDefinitionCard({ 
  definition, 
  onEdit, 
  onDelete 
}: { 
  definition: MetafieldDefinition; 
  onEdit: () => void; 
  onDelete: () => void;
}) {
  const typeInfo = METAFIELD_TYPES.find(t => t.value === definition.type);
  
  return (
    <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 flex-shrink-0">
          {typeInfo?.icon || <Database className="w-5 h-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-medium text-gray-900">{definition.name}</h4>
            {definition.pinned === 1 && (
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">Pinned</span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">
              {definition.namespace}.{definition.key}
            </code>
          </p>
          <p className="text-xs text-gray-400 mt-1">{typeInfo?.label || definition.type}</p>
          {definition.description && (
            <p className="text-xs text-gray-400 mt-1 line-clamp-1">{definition.description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition"
        >
          <Edit2 className="w-4 h-4" />
          Edit
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    </div>
  );
}

// Desktop Definition Card Component
function DefinitionCard({ 
  definition, 
  onEdit, 
  onDelete 
}: { 
  definition: MetafieldDefinition; 
  onEdit: () => void; 
  onDelete: () => void;
}) {
  const typeInfo = METAFIELD_TYPES.find(t => t.value === definition.type);
  
  return (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-purple-200 transition">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
          {typeInfo?.icon || <Database className="w-5 h-5" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900">{definition.name}</h4>
            {definition.pinned === 1 && (
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">Pinned</span>
            )}
          </div>
          <p className="text-sm text-gray-500">
            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">
              {definition.namespace}.{definition.key}
            </code>
            <span className="mx-2">•</span>
            {typeInfo?.label || definition.type}
          </p>
          {definition.description && (
            <p className="text-xs text-gray-400 mt-1">{definition.description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onEdit}
          className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Create/Edit Modal
function MetafieldModal({ 
  definition, 
  onClose 
}: { 
  definition: MetafieldDefinition | null; 
  onClose: () => void;
}) {
  const fetcher = useFetcher<{ success?: boolean; error?: string }>();
  const isEdit = !!definition;
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    namespace: definition?.namespace || 'custom',
    key: definition?.key || '',
    name: definition?.name || '',
    description: definition?.description || '',
    type: definition?.type || 'single_line_text_field' as MetafieldType,
    ownerType: definition?.ownerType || 'product' as MetafieldOwnerType,
    pinned: definition?.pinned === 1,
  });

  // Reset submitted flag and show toast only once when the fetcher returns to idle
  // after a submission, preventing stale success state on successive saves.
  useEffect(() => {
    if (submitted && fetcher.state === 'idle') {
      setSubmitted(false);
      if (fetcher.data?.success) {
        toast.success(isEdit ? 'Metafield updated' : 'Metafield created');
        onClose();
      } else if (fetcher.data?.error) {
        toast.error(fetcher.data.error);
      }
    }
  }, [fetcher.state, fetcher.data, submitted, isEdit, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    setSubmitted(true);
    fetcher.submit(
      {
        _action: isEdit ? 'update' : 'create',
        id: definition?.id || '',
        ...formData,
        pinned: formData.pinned.toString(),
      },
      { method: 'POST' }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">
            {isEdit ? 'Edit Metafield' : 'Create Metafield Definition'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Owner Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Apply to</label>
            <select
              value={formData.ownerType}
              onChange={(e) => setFormData({ ...formData, ownerType: e.target.value as MetafieldOwnerType })}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500"
              disabled={isEdit}
            >
              {OWNER_TYPES.map(ot => (
                <option key={ot.value} value={ot.value}>{ot.label}</option>
              ))}
            </select>
          </div>

          {/* Namespace & Key */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Namespace</label>
              <input
                type="text"
                value={formData.namespace}
                onChange={(e) => setFormData({ ...formData, namespace: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500"
                placeholder="custom"
                required
                disabled={isEdit}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Key</label>
              <input
                type="text"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500"
                placeholder="warranty_years"
                required
                disabled={isEdit}
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500"
              placeholder="Warranty Period"
              required
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as MetafieldType })}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500"
              disabled={isEdit}
            >
              {METAFIELD_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label} - {t.description}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500"
              placeholder="Help text for merchants"
              rows={2}
            />
          </div>

          {/* Pinned */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.pinned}
              onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Pin to show prominently</span>
          </label>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <Save className="w-4 h-4" />
              {isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

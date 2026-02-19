/**
 * Schema-Based Section Editor
 *
 * Shopify OS 2.0 Compatible Editor Component
 * Renders settings inputs dynamically based on section schema.
 */

import { useState } from 'react';
import { ArrowLeft, Trash2, ChevronDown, ChevronRight, Plus, GripVertical, X } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type {
  SectionSchema,
  SettingDefinition,
  BlockDefinition,
  BlockInstance,
} from '~/lib/theme-engine/types';

// ============================================================================
// TYPES
// ============================================================================

interface SectionEditorProps {
  sectionId: string;
  sectionType: string;
  schema: SectionSchema;
  settings: Record<string, unknown>;
  blocks?: BlockInstance[];
  onUpdateSettings: (settings: Partial<Record<string, unknown>>) => void;
  onUpdateBlocks?: (blocks: BlockInstance[]) => void;
  onBack: () => void;
  onDelete: () => void;
}

// ============================================================================
// SETTING INPUT COMPONENTS
// ============================================================================

function TextInput({
  setting,
  value,
  onChange,
}: {
  setting: SettingDefinition;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-700 block mb-1">{setting.label}</label>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={setting.placeholder}
        className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      />
      {setting.info && <p className="text-xs text-gray-500 mt-1">{setting.info}</p>}
    </div>
  );
}

function TextareaInput({
  setting,
  value,
  onChange,
}: {
  setting: SettingDefinition;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-700 block mb-1">{setting.label}</label>
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={setting.placeholder}
        rows={3}
        className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      />
      {setting.info && <p className="text-xs text-gray-500 mt-1">{setting.info}</p>}
    </div>
  );
}

function NumberInput({
  setting,
  value,
  onChange,
}: {
  setting: SettingDefinition;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-700 block mb-1">{setting.label}</label>
      <input
        type="number"
        value={value ?? setting.default ?? 0}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        min={setting.min}
        max={setting.max}
        step={setting.step || 1}
        className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      />
      {setting.unit && <span className="text-xs text-gray-500 ml-1">{setting.unit}</span>}
    </div>
  );
}

function RangeInput({
  setting,
  value,
  onChange,
}: {
  setting: SettingDefinition;
  value: number;
  onChange: (value: number) => void;
}) {
  const currentValue = value ?? setting.default ?? setting.min ?? 0;

  return (
    <div>
      <label className="text-xs font-medium text-gray-700 block mb-1">
        {setting.label}
        <span className="ml-2 text-purple-600">
          {currentValue}
          {setting.unit || ''}
        </span>
      </label>
      <input
        type="range"
        value={currentValue}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        min={setting.min || 0}
        max={setting.max || 100}
        step={setting.step || 1}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>
          {setting.min || 0}
          {setting.unit || ''}
        </span>
        <span>
          {setting.max || 100}
          {setting.unit || ''}
        </span>
      </div>
    </div>
  );
}

function CheckboxInput({
  setting,
  value,
  onChange,
}: {
  setting: SettingDefinition;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={value ?? (setting.default as boolean) ?? false}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
      />
      <span className="text-sm text-gray-700">{setting.label}</span>
      {setting.info && <span className="text-xs text-gray-500">({setting.info})</span>}
    </label>
  );
}

function SelectInput({
  setting,
  value,
  onChange,
}: {
  setting: SettingDefinition;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-700 block mb-1">{setting.label}</label>
      <select
        value={value || (setting.default as string) || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
      >
        {setting.options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ColorInput({
  setting,
  value,
  onChange,
}: {
  setting: SettingDefinition;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-700 block mb-1">{setting.label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || (setting.default as string) || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
        />
        <input
          type="text"
          value={value || (setting.default as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 text-sm border border-gray-300 rounded-lg p-2"
        />
      </div>
    </div>
  );
}

function ImagePickerInput({
  setting,
  value,
  onChange,
}: {
  setting: SettingDefinition;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-700 block mb-1">{setting.label}</label>
      <div className="space-y-2">
        {value && (
          <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
            <button
              onClick={() => onChange('')}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        <input
          type="url"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter image URL or upload"
          className="w-full text-sm border border-gray-300 rounded-lg p-2"
        />
      </div>
      {setting.info && <p className="text-xs text-gray-500 mt-1">{setting.info}</p>}
    </div>
  );
}

function UrlInput({
  setting,
  value,
  onChange,
}: {
  setting: SettingDefinition;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-700 block mb-1">{setting.label}</label>
      <input
        type="url"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={setting.placeholder || 'https://...'}
        className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      />
    </div>
  );
}

function HeaderSetting({ setting }: { setting: SettingDefinition }) {
  return (
    <div className="pt-4 pb-2 border-t border-gray-200 first:border-t-0 first:pt-0">
      <h4 className="text-sm font-semibold text-gray-900">{setting.label}</h4>
    </div>
  );
}

function ParagraphSetting({ setting }: { setting: SettingDefinition }) {
  return <p className="text-xs text-gray-500 italic">{setting.info}</p>;
}

// ============================================================================
// SETTING RENDERER
// ============================================================================

function SettingInput({
  setting,
  value,
  onChange,
}: {
  setting: SettingDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  switch (setting.type) {
    case 'text':
      return <TextInput setting={setting} value={value as string} onChange={onChange} />;
    case 'textarea':
    case 'richtext':
    case 'inline_richtext':
      return <TextareaInput setting={setting} value={value as string} onChange={onChange} />;
    case 'number':
      return <NumberInput setting={setting} value={value as number} onChange={onChange} />;
    case 'range':
      return <RangeInput setting={setting} value={value as number} onChange={onChange} />;
    case 'checkbox':
      return <CheckboxInput setting={setting} value={value as boolean} onChange={onChange} />;
    case 'select':
    case 'radio':
      return <SelectInput setting={setting} value={value as string} onChange={onChange} />;
    case 'color':
    case 'color_background':
      return <ColorInput setting={setting} value={value as string} onChange={onChange} />;
    case 'image_picker':
      return <ImagePickerInput setting={setting} value={value as string} onChange={onChange} />;
    case 'url':
      return <UrlInput setting={setting} value={value as string} onChange={onChange} />;
    case 'header':
      return <HeaderSetting setting={setting} />;
    case 'paragraph':
      return <ParagraphSetting setting={setting} />;
    default:
      // Fallback to text input for unsupported types
      return <TextInput setting={setting} value={value as string} onChange={onChange} />;
  }
}

// ============================================================================
// SORTABLE BLOCK ITEM
// ============================================================================

function SortableBlockItem({
  block,
  blockDef,
  onSelect,
  onDelete,
  isActive,
}: {
  block: BlockInstance;
  blockDef?: BlockDefinition;
  onSelect: () => void;
  onDelete: () => void;
  isActive: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: block.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Get block title from settings
  const blockTitle =
    (block.settings.heading as string) ||
    (block.settings.title as string) ||
    (block.settings.text as string) ||
    blockDef?.name ||
    block.type;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-2 bg-white rounded border mb-2 group ${
        isActive ? 'border-purple-500 ring-1 ring-purple-500' : 'border-gray-200'
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <button
        onClick={onSelect}
        className="flex-1 text-left flex items-center gap-2 overflow-hidden"
      >
        <span className="text-sm truncate">{blockTitle}</span>
      </button>
      <button
        onClick={onDelete}
        className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

// ============================================================================
// BLOCK EDITOR
// ============================================================================

function BlockEditor({
  block,
  blockDef,
  onUpdate,
  onBack,
  onDelete,
}: {
  block: BlockInstance;
  blockDef: BlockDefinition;
  onUpdate: (settings: Partial<Record<string, unknown>>) => void;
  onBack: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex items-center gap-2 p-4 border-b bg-white">
        <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="font-semibold text-sm">{blockDef.name}</span>
        <button onClick={onDelete} className="ml-auto text-red-500 hover:text-red-600">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {blockDef.settings.map((setting) => (
          <SettingInput
            key={setting.id}
            setting={setting}
            value={block.settings[setting.id]}
            onChange={(value) => onUpdate({ [setting.id]: value })}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// BLOCKS MANAGER
// ============================================================================

function BlocksManager({
  blocks,
  blockDefinitions,
  onUpdateBlocks,
  maxBlocks,
}: {
  blocks: BlockInstance[];
  blockDefinitions: BlockDefinition[];
  onUpdateBlocks: (blocks: BlockInstance[]) => void;
  maxBlocks?: number;
}) {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isAddBlockOpen, setIsAddBlockOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over?.id);
      onUpdateBlocks(arrayMove(blocks, oldIndex, newIndex));
    }
  };

  const addBlock = (type: string) => {
    const blockDef = blockDefinitions.find((b) => b.type === type);
    if (!blockDef) return;

    // Check limit
    if (blockDef.limit) {
      const count = blocks.filter((b) => b.type === type).length;
      if (count >= blockDef.limit) return;
    }

    const newBlock: BlockInstance = {
      id: `${type}-${Date.now()}`,
      type,
      settings: blockDef.settings.reduce((acc, s) => ({ ...acc, [s.id]: s.default }), {}),
    };

    onUpdateBlocks([...blocks, newBlock]);
    setSelectedBlockId(newBlock.id);
    setIsAddBlockOpen(false);
  };

  const updateBlockSettings = (id: string, newSettings: Partial<Record<string, unknown>>) => {
    onUpdateBlocks(
      blocks.map((b) => (b.id === id ? { ...b, settings: { ...b.settings, ...newSettings } } : b))
    );
  };

  const deleteBlock = (id: string) => {
    onUpdateBlocks(blocks.filter((b) => b.id !== id));
    if (selectedBlockId === id) setSelectedBlockId(null);
  };

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);
  const selectedBlockDef = selectedBlock
    ? blockDefinitions.find((d) => d.type === selectedBlock.type)
    : null;

  // Show block editor if a block is selected
  if (selectedBlock && selectedBlockDef) {
    return (
      <BlockEditor
        block={selectedBlock}
        blockDef={selectedBlockDef}
        onUpdate={(settings) => updateBlockSettings(selectedBlock.id, settings)}
        onBack={() => setSelectedBlockId(null)}
        onDelete={() => deleteBlock(selectedBlock.id)}
      />
    );
  }

  const canAddMore = !maxBlocks || blocks.length < maxBlocks;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900">Blocks</h4>
        <span className="text-xs text-gray-500">{blocks.length} items</span>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          {blocks.map((block) => {
            const blockDef = blockDefinitions.find((d) => d.type === block.type);
            return (
              <SortableBlockItem
                key={block.id}
                block={block}
                blockDef={blockDef}
                isActive={selectedBlockId === block.id}
                onSelect={() => setSelectedBlockId(block.id)}
                onDelete={() => deleteBlock(block.id)}
              />
            );
          })}
        </SortableContext>
      </DndContext>

      {canAddMore && (
        <div className="relative">
          <button
            onClick={() => setIsAddBlockOpen(!isAddBlockOpen)}
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-purple-500 hover:text-purple-600 transition flex items-center justify-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Add Block
          </button>

          {isAddBlockOpen && (
            <div className="absolute z-10 mt-2 w-full bg-white rounded-lg shadow-lg border p-2 space-y-1">
              {blockDefinitions.map((def) => {
                const count = blocks.filter((b) => b.type === def.type).length;
                const isDisabled = def.limit !== undefined && count >= def.limit;

                return (
                  <button
                    key={def.type}
                    onClick={() => addBlock(def.type)}
                    disabled={isDisabled}
                    className={`w-full text-left p-2 rounded text-sm ${
                      isDisabled
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'hover:bg-purple-50 text-gray-700'
                    }`}
                  >
                    {def.name}
                    {def.limit && (
                      <span className="text-xs text-gray-400 ml-1">
                        ({count}/{def.limit})
                      </span>
                    )}
                  </button>
                );
              })}
              <button
                onClick={() => setIsAddBlockOpen(false)}
                className="w-full text-center p-1 text-xs text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN SECTION EDITOR
// ============================================================================

export function SchemaSectionEditor({
  sectionId: _sectionId,
  sectionType: _sectionType,
  schema,
  settings,
  blocks = [],
  onUpdateSettings,
  onUpdateBlocks,
  onBack,
  onDelete,
}: SectionEditorProps) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  // Group settings by header
  const groupedSettings: Array<{
    header: string | null;
    settings: SettingDefinition[];
  }> = [];

  let currentGroup: { header: string | null; settings: SettingDefinition[] } = {
    header: null,
    settings: [],
  };

  for (const setting of schema.settings) {
    if (setting.type === 'header') {
      if (currentGroup.settings.length > 0 || currentGroup.header !== null) {
        groupedSettings.push(currentGroup);
      }
      currentGroup = { header: setting.label, settings: [] };
    } else {
      currentGroup.settings.push(setting);
    }
  }
  if (currentGroup.settings.length > 0 || currentGroup.header !== null) {
    groupedSettings.push(currentGroup);
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b bg-white">
        <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="font-semibold text-sm">{schema.name}</span>
        <button onClick={onDelete} className="ml-auto text-red-500 hover:text-red-600">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Settings */}
      <div className="flex-1 overflow-y-auto">
        {groupedSettings.map((group, groupIndex) => (
          <div key={groupIndex} className="border-b border-gray-200 last:border-b-0">
            {group.header ? (
              <>
                <button
                  onClick={() => setOpenGroup(openGroup === group.header ? null : group.header)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition"
                >
                  <span className="font-medium text-gray-900 text-sm">{group.header}</span>
                  {openGroup === group.header ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                {openGroup === group.header && (
                  <div className="px-4 pb-4 space-y-4">
                    {group.settings.map((setting) => (
                      <SettingInput
                        key={setting.id}
                        setting={setting}
                        value={settings[setting.id]}
                        onChange={(value) => onUpdateSettings({ [setting.id]: value })}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="px-4 py-4 space-y-4">
                {group.settings.map((setting) => (
                  <SettingInput
                    key={setting.id}
                    setting={setting}
                    value={settings[setting.id]}
                    onChange={(value) => onUpdateSettings({ [setting.id]: value })}
                  />
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Blocks Section */}
        {schema.blocks && schema.blocks.length > 0 && onUpdateBlocks && (
          <div className="border-t border-gray-200">
            <button
              onClick={() => setOpenGroup(openGroup === 'blocks' ? null : 'blocks')}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition"
            >
              <span className="font-medium text-gray-900 text-sm">Blocks</span>
              {openGroup === 'blocks' ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {openGroup === 'blocks' && (
              <div className="px-4 pb-4">
                <BlocksManager
                  blocks={blocks}
                  blockDefinitions={schema.blocks}
                  onUpdateBlocks={onUpdateBlocks}
                  maxBlocks={schema.max_blocks}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SchemaSectionEditor;

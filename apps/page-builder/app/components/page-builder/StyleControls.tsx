import { useState, useEffect, useCallback } from 'react';
import type { Editor } from 'grapesjs';
import { 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Type, Move, Maximize2, Palette, Image as ImageIcon,
  Layout, MousePointer2, ChevronDown, ChevronRight,
  Sparkles, Monitor, Tablet, Smartphone, Eye, EyeOff
} from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';

// Device breakpoints for responsive styling
interface DeviceConfig {
  id: 'desktop' | 'tablet' | 'mobile';
  label: string;
  icon: typeof Monitor;
  width: string;
  mediaQuery?: string;
}

const DEVICES: DeviceConfig[] = [
  { id: 'desktop', label: 'Desktop', icon: Monitor, width: '' },
  { id: 'tablet', label: 'Tablet', icon: Tablet, width: '768px', mediaQuery: 'max-width: 768px' },
  { id: 'mobile', label: 'Mobile', icon: Smartphone, width: '480px', mediaQuery: 'max-width: 480px' },
];

type DeviceId = 'desktop' | 'tablet' | 'mobile';

interface StyleControlsProps {
  editor: Editor;
}

export default function StyleControls({ editor }: StyleControlsProps) {
  const { t } = useTranslation();
  const [selectedComp, setSelectedComp] = useState<any>(null);
  const [styles, setStyles] = useState<Record<string, string>>({});
  const [attrs, setAttrs] = useState<Record<string, string>>({});
  const [activeSector, setActiveSector] = useState<string | null>('layout');
  const [activeDevice, setActiveDevice] = useState<DeviceId>('desktop');
  const [deviceStyles, setDeviceStyles] = useState<Record<DeviceId, Record<string, string>>>({
    desktop: {},
    tablet: {},
    mobile: {},
  });

  // Helper to convert GrapesJS style object to plain Record<string, string>
  const toStyleRecord = (style: any): Record<string, string> => {
    if (!style) return {};
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(style)) {
      if (typeof value === 'string') {
        result[key] = value;
      }
    }
    return result;
  };

  // Get styles for a specific device from CssComposer
  const getStylesForDevice = useCallback((component: any, device: DeviceId): Record<string, string> => {
    if (!component || !editor) return {};
    
    if (device === 'desktop') {
      return toStyleRecord(component.getStyle());
    }
    
    // For tablet/mobile, get from CssComposer media query rules
    const deviceConfig = DEVICES.find(d => d.id === device);
    if (!deviceConfig?.mediaQuery) return {};
    
    const selector = component.getSelectorsString() || `#${component.getId()}`;
    const css = editor.CssComposer;
    const rule = css.getRule(selector, { 
      atRuleType: 'media', 
      atRuleParams: deviceConfig.mediaQuery
    });
    
    if (!rule) return {};
    return toStyleRecord(rule.getStyle());
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    const updateStyles = () => {
      const selected = editor.getSelected();
      setSelectedComp(selected);
      if (selected) {
        // Get desktop styles (default)
        const desktopStyles = toStyleRecord(selected.getStyle());
        setStyles(desktopStyles);
        setAttrs(selected.getAttributes() || {});
        
        // Get styles for all devices
        setDeviceStyles({
          desktop: desktopStyles,
          tablet: getStylesForDevice(selected, 'tablet'),
          mobile: getStylesForDevice(selected, 'mobile'),
        });
      }
    };

    editor.on('component:selected', updateStyles);
    editor.on('component:styleUpdate', updateStyles);
    editor.on('style:property:update', updateStyles);
    editor.on('component:update', updateStyles);

    updateStyles();

    return () => {
      editor.off('component:selected', updateStyles);
      editor.off('component:styleUpdate', updateStyles);
      editor.off('style:property:update', updateStyles);
    };
  }, [editor, getStylesForDevice]);

  // Update styles when device changes
  useEffect(() => {
    if (selectedComp) {
      setStyles(deviceStyles[activeDevice] || {});
    }
  }, [activeDevice, selectedComp, deviceStyles]);

  // Update style for current device
  const updateStyle = (prop: string, value: string) => {
    if (!selectedComp || !editor) return;
    
    if (activeDevice === 'desktop') {
      // Desktop: update component style directly
      selectedComp.addStyle({ [prop]: value });
    } else {
      // Tablet/Mobile: use CssComposer with media query
      const deviceConfig = DEVICES.find(d => d.id === activeDevice);
      if (!deviceConfig?.mediaQuery) return;
      
      const selector = selectedComp.getSelectorsString() || `#${selectedComp.getId()}`;
      const css = editor.CssComposer;
      const mediaParams = deviceConfig.mediaQuery.replace(/[()]/g, '').replace('@media ', '');
      
      // Get existing rule or create new one
      let rule = css.getRule(selector, { atRuleType: 'media', atRuleParams: mediaParams });
      const existingStyles = rule ? (rule.getStyle() as Record<string, string>) : {};
      
      // Set rule with merged styles
      css.setRule(selector, { ...existingStyles, [prop]: value }, {
        atRuleType: 'media',
        atRuleParams: mediaParams,
      });
    }
    
    // Update local state
    setStyles((prev) => ({ ...prev, [prop]: value }));
    setDeviceStyles((prev) => ({
      ...prev,
      [activeDevice]: { ...prev[activeDevice], [prop]: value },
    }));
  };

  const handleSpacingChange = (type: 'margin' | 'padding', side: string, value: string) => {
    updateStyle(`${type}-${side}`, value);
  };

  // Toggle visibility for current device
  const toggleVisibility = () => {
    if (!selectedComp) return;
    const attr = `data-hide-${activeDevice}`;
    const isHidden = attrs[attr] === 'true';
    selectedComp.addAttributes({ [attr]: isHidden ? 'false' : 'true' });
    setAttrs(prev => ({ ...prev, [attr]: isHidden ? 'false' : 'true' }));
    
    // Also apply display:none via media query for tablet/mobile
    if (activeDevice !== 'desktop') {
      updateStyle('display', isHidden ? '' : 'none');
    } else {
      updateStyle('display', isHidden ? '' : 'none');
    }
  };

  const isHiddenOnDevice = attrs[`data-hide-${activeDevice}`] === 'true';

  if (!selectedComp) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-center px-6">
        <MousePointer2 size={32} className="mb-4 opacity-50" />
        <p className="text-xs font-medium">{t('selectElementHint')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-1 pb-20">
      
      {/* Device Tabs */}
      <div className="flex gap-1 p-2 bg-gray-50 border-b border-gray-200">
        {DEVICES.map((device) => {
          const Icon = device.icon;
          const isActive = activeDevice === device.id;
          const hasDeviceStyles = Object.keys(deviceStyles[device.id] || {}).length > 0;
          
          return (
            <button
              key={device.id}
              onClick={() => setActiveDevice(device.id)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
                ${isActive 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
              title={device.label}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{device.label}</span>
              {hasDeviceStyles && !isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Device-specific info banner */}
      {activeDevice !== 'desktop' && (
        <div className="mx-2 mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-[10px] text-blue-700 flex items-center gap-1">
            <span>💡</span>
            <span>
              {activeDevice === 'tablet' ? 'Tablet (≤768px)' : 'Mobile (≤480px)'} এ আলাদা style সেট করুন
            </span>
          </p>
        </div>
      )}

      {/* Visibility Toggle */}
      <div className="mx-2 mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-700">
            {activeDevice === 'desktop' ? 'Desktop' : activeDevice === 'tablet' ? 'Tablet' : 'Mobile'} এ দেখান
          </span>
          <button
            onClick={toggleVisibility}
            className={`
              flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all
              ${isHiddenOnDevice 
                ? 'bg-red-100 text-red-700' 
                : 'bg-green-100 text-green-700'
              }
            `}
          >
            {isHiddenOnDevice ? (
              <>
                <EyeOff size={12} />
                <span>Hidden</span>
              </>
            ) : (
              <>
                <Eye size={12} />
                <span>Visible</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Layout Sector */}
      <Sector title={t('sectorLayout')} icon={<Layout size={14} />} isOpen={activeSector === 'layout'} onToggle={() => setActiveSector(activeSector === 'layout' ? null : 'layout')}>
        <ControlRow label="Display">
           <SelectControl 
              value={styles['display'] || 'block'} 
              options={[
                { label: 'Block', value: 'block' },
                { label: 'Flex', value: 'flex' },
                { label: 'Inline', value: 'inline-block' },
                { label: 'None', value: 'none' },
              ]}
              onChange={(val: string) => updateStyle('display', val)}
           />
        </ControlRow>
        
        {styles['display'] === 'flex' && (
          <>
            <ControlRow label="Direction">
               <IconGroup 
                  value={styles['flex-direction'] || 'row'} 
                  onChange={(val: string) => updateStyle('flex-direction', val)}
                  options={[
                    { icon: <Move className="rotate-0" size={14} />, value: 'row', tooltip: 'Row' },
                    { icon: <Move className="rotate-90" size={14} />, value: 'column', tooltip: 'Column' },
                  ]}
               />
            </ControlRow>
            <ControlRow label="Justify Content">
               <SelectControl 
                  value={styles['justify-content'] || 'flex-start'} 
                  options={[
                    { label: 'Start', value: 'flex-start' },
                    { label: 'Center', value: 'center' },
                    { label: 'End', value: 'flex-end' },
                    { label: 'Space Between', value: 'space-between' },
                    { label: 'Space Around', value: 'space-around' },
                  ]}
                  onChange={(val: string) => updateStyle('justify-content', val)} 
               />
            </ControlRow>
            <ControlRow label="Align Items">
               <SelectControl 
                  value={styles['align-items'] || 'stretch'} 
                  options={[
                    { label: 'Stretch', value: 'stretch' },
                    { label: 'Start', value: 'flex-start' },
                    { label: 'Center', value: 'center' },
                    { label: 'End', value: 'flex-end' },
                  ]}
                  onChange={(val: string) => updateStyle('align-items', val)} 
               />
            </ControlRow>
          </>
        )}
        
        <ControlRow label="Alignment">
           <IconGroup 
              value={styles['text-align'] || 'left'} 
              onChange={(val: string) => updateStyle('text-align', val)}
              options={[
                { icon: <AlignLeft size={14} />, value: 'left', tooltip: 'Left' },
                { icon: <AlignCenter size={14} />, value: 'center', tooltip: 'Center' },
                { icon: <AlignRight size={14} />, value: 'right', tooltip: 'Right' },
                { icon: <AlignJustify size={14} />, value: 'justify', tooltip: 'Justify' }
              ]}
           />
        </ControlRow>

        <ControlRow label="Width / Height">
            <div className="flex gap-2">
                <UnitInput 
                    placeholder="W" 
                    value={styles['width']} 
                    onChange={(val: string) => updateStyle('width', val)} 
                />
                <UnitInput 
                    placeholder="H" 
                    value={styles['height']} 
                    onChange={(val: string) => updateStyle('height', val)} 
                />
            </div>
        </ControlRow>
      </Sector>

      {/* Spacing (Box Model) Sector */}
      <Sector title={t('sectorSpacing')} icon={<Maximize2 size={14} />} isOpen={activeSector === 'spacing'} onToggle={() => setActiveSector(activeSector === 'spacing' ? null : 'spacing')}>
         <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col items-center gap-4 relative">
             <span className="absolute top-1 left-2 text-[9px] text-gray-400 font-bold uppercase">Margin</span>
             {/* Margin Box */}
             <div className="grid grid-cols-3 gap-1 w-full max-w-[180px]">
                 <div className="col-start-2">
                     <TransparentInput value={styles['margin-top']} placeholder="0" onChange={(v: string) => handleSpacingChange('margin', 'top', v)} />
                 </div>
                 <div className="col-start-1 row-start-2">
                     <TransparentInput value={styles['margin-left']} placeholder="0" onChange={(v: string) => handleSpacingChange('margin', 'left', v)} />
                 </div>
                 
                 {/* Padding Box (Inner) */}
                 <div className="col-start-2 row-start-2 border border-dashed border-gray-300 rounded bg-white p-1 relative flex items-center justify-center min-h-[60px] min-w-[60px]">
                     <span className="absolute top-0.5 left-1 text-[8px] text-gray-300 font-bold uppercase">Padding</span>
                     <div className="grid grid-cols-3 gap-0.5 w-full h-full">
                        <div className="col-start-2 text-center">
                            <TinyInput value={styles['padding-top']} onChange={(v: string) => handleSpacingChange('padding', 'top', v)} />
                        </div>
                        <div className="col-start-1 row-start-2 flex items-center">
                            <TinyInput value={styles['padding-left']} onChange={(v: string) => handleSpacingChange('padding', 'left', v)} />
                        </div>
                        <div className="col-start-3 row-start-2 flex items-center">
                            <TinyInput value={styles['padding-right']} onChange={(v: string) => handleSpacingChange('padding', 'right', v)} />
                        </div>
                        <div className="col-start-2 row-start-3 text-center">
                            <TinyInput value={styles['padding-bottom']} onChange={(v: string) => handleSpacingChange('padding', 'bottom', v)} />
                        </div>
                     </div>
                 </div>

                 <div className="col-start-3 row-start-2">
                     <TransparentInput value={styles['margin-right']} placeholder="0" onChange={(v: string) => handleSpacingChange('margin', 'right', v)} />
                 </div>
                 <div className="col-start-2 row-start-3">
                     <TransparentInput value={styles['margin-bottom']} placeholder="0" onChange={(v: string) => handleSpacingChange('margin', 'bottom', v)} />
                 </div>
             </div>
         </div>
      </Sector>

      {/* Typography Sector */}
      <Sector title={t('sectorTypography')} icon={<Type size={14} />} isOpen={activeSector === 'typography'} onToggle={() => setActiveSector(activeSector === 'typography' ? null : 'typography')}>
          <ControlRow label="Font Family">
             <SelectControl 
                value={styles['font-family'] || ''} 
                options={[
                    { label: 'Default', value: '' },
                    { label: 'Hind Siliguri', value: "'Hind Siliguri', sans-serif" },
                    { label: 'Inter', value: "'Inter', sans-serif" },
                    { label: 'Arial', value: 'Arial, sans-serif' },
                    { label: 'Times New Roman', value: "'Times New Roman', serif" },
                ]}
                onChange={(val: string) => updateStyle('font-family', val)}
             />
          </ControlRow>
          <ControlRow label="Size & Weight">
             <div className="flex gap-2">
                <UnitInput 
                    placeholder="16px" 
                    value={styles['font-size']} 
                    onChange={(val: string) => updateStyle('font-size', val)} 
                />
                <SelectControl 
                    className="w-1/2"
                    value={styles['font-weight'] || '400'} 
                    options={[
                        { label: 'Light', value: '300' },
                        { label: 'Regular', value: '400' },
                        { label: 'Medium', value: '500' },
                        { label: 'Bold', value: '700' },
                        { label: 'Extra Bold', value: '900' },
                    ]}
                    onChange={(val: string) => updateStyle('font-weight', val)}
                />
             </div>
          </ControlRow>
          <ControlRow label="Color">
             <ColorInput 
                value={styles['color']} 
                onChange={(val: string) => updateStyle('color', val)} 
             />
          </ControlRow>
      </Sector>

      {/* Background Sector */}
      <Sector title={t('sectorBackground')} icon={<Palette size={14} />} isOpen={activeSector === 'background'} onToggle={() => setActiveSector(activeSector === 'background' ? null : 'background')}>
          <ControlRow label="Color">
             <ColorInput 
                value={styles['background-color']} 
                onChange={(val: string) => updateStyle('background-color', val)} 
             />
          </ControlRow>
          <ControlRow label="Image">
             <div className="flex bg-gray-50 border border-gray-100 rounded-lg p-2 items-center gap-2 cursor-pointer hover:bg-gray-100" onClick={() => editor.runCommand('open-assets', { target: selectedComp })}>
                 <div className="w-8 h-8 rounded border border-gray-200 bg-white flex items-center justify-center overflow-hidden">
                     {styles['background-image'] ? (
                         <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: styles['background-image'] }} />
                     ) : (
                         <ImageIcon size={14} className="text-gray-400" />
                     )}
                 </div>
                 <span className="text-[10px] text-gray-500 font-medium flex-1 truncate">
                    {styles['background-image'] ? 'Image Selected' : 'Select Image...'}
                 </span>
             </div>
          </ControlRow>
      </Sector>

      {/* Borders */}
      <Sector title={t('sectorBorder')} icon={<Maximize2 size={14} />} isOpen={activeSector === 'border'} onToggle={() => setActiveSector(activeSector === 'border' ? null : 'border')}>
          <ControlRow label="Radius">
             <UnitInput 
                placeholder="0px" 
                value={styles['border-radius']} 
                onChange={(val: string) => updateStyle('border-radius', val)} 
             />
          </ControlRow>
          <ControlRow label="Border">
             <div className="flex gap-2">
                <SelectControl 
                    value={(styles['border-style'] as string) || 'none'}
                    options={[
                        { label: 'None', value: 'none' },
                        { label: 'Solid', value: 'solid' },
                        { label: 'Dashed', value: 'dashed' },
                        { label: 'Dotted', value: 'dotted' },
                    ]}
                    onChange={(val: string) => updateStyle('border-style', val)}
                />
                {styles['border-style'] !== 'none' && (
                    <>
                        <UnitInput placeholder="1px" value={styles['border-width']} onChange={(val: string) => updateStyle('border-width', val)} />
                        <ColorInput value={styles['border-color']} onChange={(val: string) => updateStyle('border-color', val)} />
                    </>
                )}
             </div>
          </ControlRow>
      </Sector>

      {/* Animation Sector */}
      <Sector title={t('sectorAnimation')} icon={<Sparkles size={14} />} isOpen={activeSector === 'animation'} onToggle={() => setActiveSector(activeSector === 'animation' ? null : 'animation')}>
          <ControlRow label="Entrance Animation">
             <SelectControl 
                value={attrs['data-gjs-animate'] || ''} 
                options={[
                    { label: 'None', value: '' },
                    // Fades
                    { label: 'Fade In', value: 'animate__fadeIn' },
                    { label: 'Fade In Down', value: 'animate__fadeInDown' },
                    { label: 'Fade In Up', value: 'animate__fadeInUp' },
                    { label: 'Fade In Left', value: 'animate__fadeInLeft' },
                    { label: 'Fade In Right', value: 'animate__fadeInRight' },
                    // Zooms
                    { label: 'Zoom In', value: 'animate__zoomIn' },
                    { label: 'Zoom In Down', value: 'animate__zoomInDown' },
                    { label: 'Zoom In Up', value: 'animate__zoomInUp' },
                    // Bounces
                    { label: 'Bounce In', value: 'animate__bounceIn' },
                    // Flips
                    { label: 'Flip In X', value: 'animate__flipInX' },
                    { label: 'Flip In Y', value: 'animate__flipInY' },
                    // Slides
                    { label: 'Slide In Down', value: 'animate__slideInDown' },
                    { label: 'Slide In Up', value: 'animate__slideInUp' },
                ]}
                onChange={(val: string) => {
                    selectedComp.addAttributes({ 'data-gjs-animate': val });
                    setAttrs(prev => ({ ...prev, 'data-gjs-animate': val }));
                }}
             />
          </ControlRow>
          
          {attrs['data-gjs-animate'] && (
            <>
              <ControlRow label="Duration">
                 <SelectControl 
                    value={attrs['data-gjs-duration'] || ''} 
                    options={[
                        { label: 'Normal', value: '' },
                        { label: 'Slow', value: 'animate__slow' },
                        { label: 'Slower', value: 'animate__slower' },
                        { label: 'Fast', value: 'animate__fast' },
                        { label: 'Faster', value: 'animate__faster' },
                    ]}
                    onChange={(val: string) => {
                        selectedComp.addAttributes({ 'data-gjs-duration': val });
                        setAttrs(prev => ({ ...prev, 'data-gjs-duration': val }));
                    }}
                 />
              </ControlRow>
              
              <ControlRow label="Delay (ms)">
                 <UnitInput 
                    value={attrs['data-gjs-delay'] || ''} 
                    placeholder="0"
                    onChange={(val: string) => {
                        selectedComp.addAttributes({ 'data-gjs-delay': val });
                        setAttrs(prev => ({ ...prev, 'data-gjs-delay': val }));
                    }}
                 />
              </ControlRow>

              {/* Preview Button */}
              <button 
                onClick={() => {
                    const el = selectedComp.getEl();
                    if (el) {
                        el.classList.remove('animate__animated');
                        void el.offsetWidth; // Force reflow
                        el.classList.add('animate__animated');
                    }
                }}
                className="w-full mt-2 py-2 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg hover:bg-indigo-200 transition flex items-center justify-center gap-2"
              >
                <Sparkles size={12} /> Preview Effect
              </button>
            </>
          )}
      </Sector>

      {/* Advanced / Custom CSS */}
      <Sector title={t('sectorAdvanced')} icon={<Maximize2 size={14} />} isOpen={activeSector === 'advanced'} onToggle={() => setActiveSector(activeSector === 'advanced' ? null : 'advanced')}>
          <ControlRow label="Element ID">
             <UnitInput 
                placeholder="my-element-id" 
                value={selectedComp?.getAttributes()?.id || ''} 
                onChange={(val: string) => {
                    selectedComp.addAttributes({ id: val });
                    // Force re-render if needed
                }} 
             />
          </ControlRow>
          <ControlRow label="CSS Classes">
             <div className="bg-gray-50 border border-gray-100 rounded-lg p-2 min-h-[40px] flex flex-wrap gap-1">
                {selectedComp?.getClasses().map((cls: string) => (
                    <span key={cls} className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                        {cls}
                        <button onClick={() => selectedComp.removeClass(cls)} className="hover:text-red-500">&times;</button>
                    </span>
                ))}
                <input 
                    type="text" 
                    className="bg-transparent border-none text-[10px] p-0 focus:ring-0 min-w-[60px] flex-1"
                    placeholder="Add class..."
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            const val = (e.target as HTMLInputElement).value.trim();
                            if (val) {
                                selectedComp.addClass(val);
                                (e.target as HTMLInputElement).value = '';
                            }
                        }
                    }}
                />
             </div>
          </ControlRow>
          <ControlRow label="Custom CSS (Inline)">
             <textarea 
                className="w-full bg-gray-900 text-green-400 font-mono text-[10px] rounded-lg p-3 h-32 focus:outline-none"
                placeholder="color: red; border: 1px solid black;"
                onBlur={(e) => {
                    const cssText = e.target.value;
                    if (!cssText) return;
                    
                    const styleObj: Record<string, string> = {};
                    cssText.split(';').forEach(rule => {
                        const [prop, val] = rule.split(':');
                        if (prop && val) {
                            styleObj[prop.trim()] = val.trim();
                        }
                    });
                    
                    if (Object.keys(styleObj).length > 0) {
                        selectedComp.addStyle(styleObj);
                    }
                }}
             />
             <p className="text-[9px] text-gray-400 mt-1">Write CSS properties separated by semicolons.</p>
          </ControlRow>
      </Sector>

    </div>
  );
}

// --- Sub-components & Types ---

interface SectorProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
}

function Sector({ title, icon, children, isOpen, onToggle }: SectorProps) {
    return (
        <div className="bg-white">
            <button 
                onClick={onToggle}
                className={`w-full flex items-center justify-between p-3 text-xs font-bold uppercase tracking-wider ${isOpen ? 'text-gray-800 bg-gray-50' : 'text-gray-500 hover:text-gray-700'}`}
            >
                <div className="flex items-center gap-2">
                    {icon}
                    {title}
                </div>
                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {isOpen && (
                <div className="p-3 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                    {children}
                </div>
            )}
            <div className="h-px bg-gray-100 mx-3" />
        </div>
    );
}

interface ControlRowProps {
    label: string;
    children: React.ReactNode;
}
function ControlRow({ label, children }: ControlRowProps) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide px-0.5">{label}</label>
            <div>{children}</div>
        </div>
    );
}

interface IconOption {
    icon: React.ReactNode;
    value: string;
    tooltip: string;
}

interface IconGroupProps {
    options: { icon: React.ReactNode; value: string; tooltip: string }[];
    value: string;
    onChange: (value: string) => void;
}
function IconGroup({ options, value, onChange }: IconGroupProps) {
    return (
        <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-100">
            {options.map((opt) => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`flex-1 flex items-center justify-center py-1.5 rounded-md transition-all ${value === opt.value ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    title={opt.tooltip}
                >
                    {opt.icon}
                </button>
            ))}
        </div>
    );
}

interface SelectOption {
    label: string;
    value: string;
}

interface SelectControlProps {
    options: { label: string; value: string }[];
    value: string;
    onChange: (value: string) => void;
    className?: string;
}
function SelectControl({ options, value, onChange, className = '' }: SelectControlProps) {
    return (
        <div className={`relative ${className}`}>
           <select 
             value={value} 
             onChange={(e) => onChange(e.target.value)}
             className="w-full appearance-none bg-gray-50 border border-gray-100 text-gray-700 text-xs rounded-lg py-2 px-3 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
           >
              {options.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
              ))}
           </select>
           <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
    );
}

interface InputProps {
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
}
function UnitInput({ value, onChange, placeholder }: InputProps) {
    return (
        <input 
            type="text"
            className="w-full bg-gray-50 border border-gray-100 text-gray-700 text-xs rounded-lg py-2 px-3 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
            placeholder={placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
        />
    );
}

function TransparentInput({ value, onChange, placeholder }: InputProps) {
    return (
        <input 
            type="text"
            className="w-full bg-transparent border-none text-center text-[10px] p-0 focus:ring-0 text-gray-600 placeholder:text-gray-300 font-mono"
            placeholder={placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
        />
    );
}

function TinyInput({ value, onChange }: { value?: string, onChange: (val: string) => void }) {
    return (
        <input 
            type="text"
            className="w-full bg-transparent border-none text-center text-[9px] p-0 focus:ring-0 text-gray-500 placeholder:text-gray-200"
            placeholder="-"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
        />
    );
}

function ColorInput({ value, onChange }: { value?: string, onChange: (val: string) => void }) {
    return (
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg p-1.5 px-2">
            <div className="w-5 h-5 rounded-full border border-gray-200 overflow-hidden relative shadow-sm">
                <input 
                    type="color" 
                    value={value?.startsWith('#') ? value : '#000000'} 
                    onChange={(e) => onChange(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-[150%] h-[150%] -top-1 -left-1"
                />
                <div className="w-full h-full" style={{ backgroundColor: value || 'transparent' }} />
            </div>
            <input 
                type="text"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                className="flex-1 bg-transparent border-none text-[10px] font-mono p-0 focus:ring-0 text-gray-600 uppercase"
                placeholder="TRANSPARENT"
            />
        </div>
    );
}

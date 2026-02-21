/**
 * ThemeSwitcher - Dropdown component for switching between OS 2.0 themes
 *
 * Features:
 * - Theme preview cards with colors and name
 * - Confirmation dialog before switching (since it resets sections)
 * - Visual indicator of current theme
 * - Supports Bangla names
 */

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Palette, Check, AlertTriangle, X, Paintbrush } from 'lucide-react';

interface AvailableTheme {
  id: string;
  name: string;
  nameBn?: string;
  description: string;
  previewImage?: string;
}

interface ThemeSwitcherProps {
  currentThemeId: string;
  availableThemes: AvailableTheme[];
  onThemeChange: (themeId: string) => void;
  disabled?: boolean;
}

// Theme color mappings for visual preview
const THEME_COLORS: Record<string, { primary: string; accent: string; bg: string }> = {
  daraz: { primary: '#F85606', accent: '#FFB400', bg: '#FAFAFA' },
  bdshop: { primary: '#1E3A8A', accent: '#F97316', bg: '#F8FAFC' },
  'ghorer-bazar': { primary: '#FC8934', accent: '#059669', bg: '#FFFBF5' },
  'luxe-boutique': { primary: '#1a1a1a', accent: '#c9a87c', bg: '#ffffff' },
  'tech-modern': { primary: '#3b82f6', accent: '#22c55e', bg: '#0f172a' },
};

export function ThemeSwitcher({
  currentThemeId,
  availableThemes,
  onThemeChange,
  disabled = false,
}: ThemeSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentTheme = availableThemes.find((t) => t.id === currentThemeId);
  const currentColors = THEME_COLORS[currentThemeId] || THEME_COLORS['luxe-boutique'];

  const handleThemeSelect = (themeId: string) => {
    if (themeId === currentThemeId) {
      setIsOpen(false);
      return;
    }
    // Show confirmation dialog
    setShowConfirm(themeId);
    setIsOpen(false);
  };

  const handleConfirmChange = () => {
    if (showConfirm) {
      onThemeChange(showConfirm);
      setShowConfirm(null);
    }
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg border transition-all
            ${
              isOpen
                ? 'border-purple-500 ring-2 ring-purple-200 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {/* Theme color preview */}
          <div className="flex h-5 w-8 rounded overflow-hidden border border-gray-200">
            <div style={{ background: currentColors.primary }} className="w-1/2" />
            <div style={{ background: currentColors.accent }} className="w-1/2" />
          </div>

          <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
            {currentTheme?.name || 'Select Theme'}
          </span>

          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Paintbrush className="w-4 h-4 text-purple-500" />
                Switch Theme
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Choose a different theme for your store
              </p>
            </div>

            <div className="p-2 max-h-80 overflow-y-auto">
              {availableThemes.map((theme) => {
                const colors = THEME_COLORS[theme.id] || THEME_COLORS['luxe-boutique'];
                const isActive = theme.id === currentThemeId;

                return (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeSelect(theme.id)}
                    className={`
                      w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left
                      ${
                        isActive
                          ? 'bg-purple-50 border border-purple-200'
                          : 'hover:bg-gray-50 border border-transparent'
                      }
                    `}
                  >
                    {/* Theme color preview */}
                    <div
                      className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0"
                      style={{ background: colors.bg }}
                    >
                      <div className="flex h-full">
                        <div style={{ background: colors.primary }} className="w-1/2 opacity-90" />
                        <div style={{ background: colors.accent }} className="w-1/2 opacity-80" />
                      </div>
                    </div>

                    {/* Theme info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 text-sm">{theme.name}</span>
                        {isActive && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                            Active
                          </span>
                        )}
                      </div>
                      {theme.nameBn && <p className="text-xs text-gray-500">{theme.nameBn}</p>}
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{theme.description}</p>
                    </div>

                    {/* Check icon */}
                    {isActive && <Check className="w-5 h-5 text-purple-500 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Switch Theme?</h3>
                  <p className="text-sm text-gray-500">This will reset your sections</p>
                </div>
              </div>
              <button
                onClick={() => setShowConfirm(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex h-10 w-16 rounded overflow-hidden border border-gray-200">
                  <div
                    style={{
                      background:
                        THEME_COLORS[showConfirm]?.primary || THEME_COLORS['luxe-boutique'].primary,
                    }}
                    className="w-1/2"
                  />
                  <div
                    style={{
                      background:
                        THEME_COLORS[showConfirm]?.accent || THEME_COLORS['luxe-boutique'].accent,
                    }}
                    className="w-1/2"
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {availableThemes.find((t) => t.id === showConfirm)?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {availableThemes.find((t) => t.id === showConfirm)?.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Warning:</strong> Switching themes will load the new theme's default
                  sections. Your current section customizations will be replaced. Make sure to save
                  any important changes first.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmChange}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium flex items-center gap-2"
              >
                <Palette className="w-4 h-4" />
                Switch Theme
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ThemeSwitcher;

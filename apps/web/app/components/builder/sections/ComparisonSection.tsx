/**
 * ComparisonSection — Before/After image comparison
 * Uses ComparisonPropsSchema: title, beforeImage, afterImage, beforeLabel, afterLabel, description
 * Client component for drag slider interaction
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import { ComparisonPropsSchema, type ComparisonProps } from '~/lib/page-builder/schemas';

interface ComparisonSectionProps {
  props: Record<string, unknown>;
  isPreview?: boolean;
}

const DEFAULT_BEFORE = 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800&q=80';
const DEFAULT_AFTER = 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=800&q=80';

function DragHandleIcon() {
  return (
    <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5l-5 7 5 7M16 5l5 7-5 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function ComparisonSection({ props, isPreview = false }: ComparisonSectionProps) {
  const p: ComparisonProps = ComparisonPropsSchema.parse(props);
  const [sliderPos, setSliderPos] = useState(50); // percentage
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const beforeSrc = p.beforeImage || DEFAULT_BEFORE;
  const afterSrc = p.afterImage || DEFAULT_AFTER;

  const updateSlider = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  }, []);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) updateSlider(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) updateSlider(e.touches[0].clientX);
  };

  return (
    <section data-section-type="comparison" className="w-full bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-10 text-center">
          <span className="mb-3 inline-block rounded-full bg-indigo-100 px-4 py-1 text-sm font-semibold text-indigo-700">
            ✨ পার্থক্য দেখুন
          </span>
          {p.title && (
            <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">{p.title}</h2>
          )}
          {p.description && (
            <p className="mt-3 text-gray-500">{p.description}</p>
          )}
        </div>

        {/* Comparison slider */}
        <div
          ref={containerRef}
          className="relative aspect-[4/3] w-full cursor-ew-resize select-none overflow-hidden rounded-2xl shadow-xl sm:aspect-video"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchMove={handleTouchMove}
          onTouchEnd={() => setIsDragging(false)}
          role="slider"
          aria-label="Before/After comparison slider"
          aria-valuenow={Math.round(sliderPos)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {/* After image (full width, background) */}
          <img
            src={afterSrc}
            alt={p.afterLabel}
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />

          {/* After label */}
          <div className="absolute bottom-4 right-4 rounded-full bg-indigo-600 px-3 py-1 text-sm font-bold text-white shadow">
            {p.afterLabel}
          </div>

          {/* Before image (clipped to left side) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${sliderPos}%` }}
          >
            <img
              src={beforeSrc}
              alt={p.beforeLabel}
              className="absolute inset-0 h-full object-cover"
              style={{ width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100%' }}
              draggable={false}
            />
          </div>

          {/* Before label */}
          <div className="absolute bottom-4 left-4 rounded-full bg-gray-800 px-3 py-1 text-sm font-bold text-white shadow">
            {p.beforeLabel}
          </div>

          {/* Divider line */}
          <div
            className="absolute inset-y-0 w-0.5 bg-white shadow-lg"
            style={{ left: `${sliderPos}%` }}
          />

          {/* Drag handle */}
          <div
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-12 w-12 cursor-grab items-center justify-center rounded-full border-4 border-white bg-indigo-600 shadow-xl active:cursor-grabbing"
            style={{ left: `${sliderPos}%` }}
            onMouseDown={handleMouseDown}
            onTouchStart={() => setIsDragging(true)}
          >
            <DragHandleIcon />
          </div>

          {/* Instruction overlay (shown initially) */}
          {sliderPos === 50 && (
            <div className="pointer-events-none absolute inset-x-0 bottom-14 flex justify-center">
              <span className="rounded-full bg-black/60 px-4 py-1.5 text-xs text-white backdrop-blur-sm">
                ← টেনে তুলনা করুন →
              </span>
            </div>
          )}
        </div>

        {/* Bottom feature comparison table */}
        <div className="mt-10 overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="bg-gray-50 px-4 py-3 text-left font-semibold text-gray-600">বৈশিষ্ট্য</th>
                <th className="bg-gray-800 px-4 py-3 text-center font-bold text-white">{p.beforeLabel}</th>
                <th className="bg-indigo-600 px-4 py-3 text-center font-bold text-white">{p.afterLabel}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { feature: 'মান', before: '❌ সাধারণ', after: '✅ প্রিমিয়াম' },
                { feature: 'দীর্ঘস্থায়িত্ব', before: '❌ কম', after: '✅ বেশি' },
                { feature: 'ব্যবহারযোগ্যতা', before: '❌ কঠিন', after: '✅ সহজ' },
                { feature: 'গ্যারান্টি', before: '❌ নেই', after: '✅ আছে' },
              ].map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 font-medium text-gray-700">{row.feature}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{row.before}</td>
                  <td className="px-4 py-3 text-center font-semibold text-indigo-700">{row.after}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <a
            href="#order"
            className="inline-block rounded-2xl bg-indigo-600 px-8 py-3.5 text-base font-extrabold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 hover:shadow-xl"
          >
            🛒 এখনই অর্ডার করুন
          </a>
        </div>
      </div>
    </section>
  );
}

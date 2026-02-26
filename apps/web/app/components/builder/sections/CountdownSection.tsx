/**
 * CountdownSection — Flash sale urgency countdown timer
 * Client component — uses React state to tick every second
 * Variants: banner | card | minimal | urgent
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { CountdownPropsSchema, type CountdownProps } from '~/lib/page-builder/schemas';

interface CountdownSectionProps {
  props: Record<string, unknown>;
  isPreview?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function calculateTimeLeft(endDate: string, endTime: string): TimeLeft {
  const target = endDate
    ? new Date(`${endDate}T${endTime || '23:59'}:00`)
    : new Date(Date.now() + 3 * 60 * 60 * 1000); // 3h from now as demo

  const diff = target.getTime() - Date.now();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  };
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function TimeBlock({
  value,
  label,
  numberBg,
  numberColor,
}: {
  value: number;
  label: string;
  numberBg: string;
  numberColor: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-xl text-2xl font-extrabold shadow-md sm:h-20 sm:w-20 sm:text-3xl"
        style={{ backgroundColor: numberBg, color: numberColor }}
      >
        {pad(value)}
      </div>
      <span className="text-xs font-semibold opacity-80">{label}</span>
    </div>
  );
}

export function CountdownSection({ props, isPreview = false }: CountdownSectionProps) {
  const p: CountdownProps = CountdownPropsSchema.parse(props);

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    calculateTimeLeft(p.endDate, p.endTime)
  );

  const tick = useCallback(() => {
    setTimeLeft(calculateTimeLeft(p.endDate, p.endTime));
  }, [p.endDate, p.endTime]);

  useEffect(() => {
    if (timeLeft.expired) return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick, timeLeft.expired]);

  const bgColor = p.bgColor || '#DC2626';
  const textColor = p.textColor || '#FFFFFF';
  const numberBg = p.numberBgColor || 'rgba(255,255,255,0.2)';
  const numberColor = p.numberTextColor || '#FFFFFF';

  if (timeLeft.expired) {
    return (
      <section
        data-section-type="countdown"
        className="w-full py-8 text-center"
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        <p className="text-xl font-bold">{p.expiredMessage}</p>
      </section>
    );
  }

  const variant = p.variant ?? 'banner';

  // ── Banner ─────────────────────────────────────────────────────────────
  if (variant === 'banner') {
    return (
      <section
        data-section-type="countdown"
        className={`w-full py-8 sm:py-10 ${p.pulseAnimation ? 'animate-pulse-slow' : ''}`}
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="mb-1 text-xl font-extrabold sm:text-2xl">{p.title}</h2>
          {p.subtitle && <p className="mb-4 text-sm opacity-80">{p.subtitle}</p>}
          <div className="flex items-center justify-center gap-3 sm:gap-5">
            {p.showDays && (
              <TimeBlock value={timeLeft.days} label={p.daysLabel} numberBg={numberBg} numberColor={numberColor} />
            )}
            {p.showDays && p.showHours && <span className="mb-6 text-3xl font-black opacity-60">:</span>}
            {p.showHours && (
              <TimeBlock value={timeLeft.hours} label={p.hoursLabel} numberBg={numberBg} numberColor={numberColor} />
            )}
            {p.showHours && p.showMinutes && <span className="mb-6 text-3xl font-black opacity-60">:</span>}
            {p.showMinutes && (
              <TimeBlock value={timeLeft.minutes} label={p.minutesLabel} numberBg={numberBg} numberColor={numberColor} />
            )}
            {p.showMinutes && p.showSeconds && <span className="mb-6 text-3xl font-black opacity-60">:</span>}
            {p.showSeconds && (
              <TimeBlock value={timeLeft.seconds} label={p.secondsLabel} numberBg={numberBg} numberColor={numberColor} />
            )}
          </div>
        </div>
      </section>
    );
  }

  // ── Urgent ─────────────────────────────────────────────────────────────
  if (variant === 'urgent') {
    return (
      <section
        data-section-type="countdown"
        className="w-full"
        style={{ backgroundColor: bgColor }}
      >
        <div className="mx-auto max-w-4xl px-4 py-10">
          <div className="rounded-3xl border-2 border-white/30 p-8 text-center" style={{ color: textColor }}>
            <div className="mb-2 text-4xl">⏰</div>
            <h2 className="text-2xl font-extrabold sm:text-3xl">{p.title}</h2>
            {p.subtitle && <p className="mt-1 text-sm opacity-75">{p.subtitle}</p>}
            <div className="mt-6 flex items-center justify-center gap-2 sm:gap-4">
              {p.showDays && (
                <TimeBlock value={timeLeft.days} label={p.daysLabel} numberBg={numberBg} numberColor={numberColor} />
              )}
              {p.showDays && <span className="mb-6 text-2xl font-black opacity-50">:</span>}
              {p.showHours && (
                <TimeBlock value={timeLeft.hours} label={p.hoursLabel} numberBg={numberBg} numberColor={numberColor} />
              )}
              {p.showHours && <span className="mb-6 text-2xl font-black opacity-50">:</span>}
              {p.showMinutes && (
                <TimeBlock value={timeLeft.minutes} label={p.minutesLabel} numberBg={numberBg} numberColor={numberColor} />
              )}
              {p.showMinutes && <span className="mb-6 text-2xl font-black opacity-50">:</span>}
              {p.showSeconds && (
                <TimeBlock value={timeLeft.seconds} label={p.secondsLabel} numberBg={numberBg} numberColor={numberColor} />
              )}
            </div>
            <a
              href="#order"
              className="mt-6 inline-block rounded-full bg-white px-8 py-3 font-extrabold shadow-lg transition hover:scale-105"
              style={{ color: bgColor }}
            >
              🛒 এখনই অর্ডার করুন
            </a>
          </div>
        </div>
      </section>
    );
  }

  // ── Minimal ────────────────────────────────────────────────────────────
  if (variant === 'minimal') {
    return (
      <section
        data-section-type="countdown"
        className="w-full border-y border-gray-200 bg-white py-5"
      >
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-4 px-4">
          <span className="font-bold text-gray-800">{p.title}</span>
          <div className="flex items-center gap-2 font-mono text-2xl font-extrabold text-red-600">
            {p.showDays && <span>{pad(timeLeft.days)}d</span>}
            {p.showHours && <span>{pad(timeLeft.hours)}h</span>}
            {p.showMinutes && <span>{pad(timeLeft.minutes)}m</span>}
            {p.showSeconds && <span>{pad(timeLeft.seconds)}s</span>}
          </div>
        </div>
      </section>
    );
  }

  // ── Card ───────────────────────────────────────────────────────────────
  return (
    <section data-section-type="countdown" className="w-full bg-gray-50 py-12">
      <div className="mx-auto max-w-lg px-4">
        <div
          className="overflow-hidden rounded-3xl shadow-2xl"
          style={{ backgroundColor: bgColor, color: textColor }}
        >
          <div className="p-8 text-center">
            <h2 className="text-xl font-extrabold sm:text-2xl">{p.title}</h2>
            {p.subtitle && <p className="mt-1 text-sm opacity-75">{p.subtitle}</p>}
            <div className="mt-6 flex items-center justify-center gap-3">
              {p.showDays && (
                <TimeBlock value={timeLeft.days} label={p.daysLabel} numberBg={numberBg} numberColor={numberColor} />
              )}
              {p.showDays && <span className="mb-6 text-2xl font-black opacity-50">:</span>}
              {p.showHours && (
                <TimeBlock value={timeLeft.hours} label={p.hoursLabel} numberBg={numberBg} numberColor={numberColor} />
              )}
              {p.showHours && <span className="mb-6 text-2xl font-black opacity-50">:</span>}
              {p.showMinutes && (
                <TimeBlock value={timeLeft.minutes} label={p.minutesLabel} numberBg={numberBg} numberColor={numberColor} />
              )}
              {p.showMinutes && <span className="mb-6 text-2xl font-black opacity-50">:</span>}
              {p.showSeconds && (
                <TimeBlock value={timeLeft.seconds} label={p.secondsLabel} numberBg={numberBg} numberColor={numberColor} />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

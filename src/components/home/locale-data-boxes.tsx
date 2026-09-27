'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface HeroCountrySample {
    code: string;
    alpha3: string;
    name: string;
    rows: { label: string; value: string }[];
}

/** Noise glyphs used while a box decodes: Latin letters, digits and symbols only. */
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*+-=/<>[]{}()?!:;';

const SCRAMBLE_TICK = 45;
const DECODE_MS = 900;
const HOLD_MS = 3600;
const ENCODE_MS = 450;
const SPAWN_EVERY_MS = 2400;
const MAX_VISIBLE = 2;
/** Below this width the headline spans the hero and the boxes are hidden (see `xl:block` in Hero). */
const MIN_VIEWPORT = '(min-width: 1280px)';

/** Corner slots sit in the hero's vertical padding so they never cover the headline. */
const SLOTS = [
    'left-[4%] top-[7%]',
    'right-[4%] top-[9%]',
    'left-[6%] bottom-[9%]',
    'right-[5%] bottom-[7%]',
];

const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

/**
 * Returns `text` partially resolved: characters before their reveal point show
 * random glyphs, later ones the real character. `progress` runs 0 → 1.
 */
function scramble(text: string, progress: number, offsets: number[]) {
    let out = '';
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        out += char === ' ' || progress >= offsets[i] ? char : randomGlyph();
    }
    return out;
}

/** Hides characters whose exit point has passed, glitching the rest just before. */
function unscramble(text: string, progress: number, offsets: number[]) {
    let out = '';
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (progress >= offsets[i]) out += ' ';
        else if (progress >= offsets[i] - 0.25 && char !== ' ') out += randomGlyph();
        else out += char;
    }
    return out;
}

function revealOffsets(length: number) {
    return Array.from({ length }, (_, i) => (i / Math.max(length, 1)) * 0.7 + Math.random() * 0.3);
}

type Phase = 'decode' | 'hold' | 'encode';

function DataBox({ sample, slot, onDone }: { sample: HeroCountrySample; slot: string; onDone: () => void }) {
    const lines = [`${sample.code} ${sample.name}`, ...sample.rows.map((row) => row.value)];
    const [phase, setPhase] = useState<Phase>('decode');
    const [scrambled, setScrambled] = useState(() => lines.map((line) => line.replace(/\S/g, ' ')));
    const offsets = useRef<number[][]>([]);
    const onDoneRef = useRef(onDone);

    useEffect(() => {
        onDoneRef.current = onDone;
    }, [onDone]);

    useEffect(() => {
        if (phase === 'hold') {
            const timer = setTimeout(() => setPhase('encode'), HOLD_MS);
            return () => clearTimeout(timer);
        }

        offsets.current = lines.map((line) => revealOffsets(line.length));
        const duration = phase === 'decode' ? DECODE_MS : ENCODE_MS;
        const start = performance.now();
        const interval = setInterval(() => {
            const progress = Math.min((performance.now() - start) / duration, 1);
            setScrambled(
                lines.map((line, i) =>
                    phase === 'decode'
                        ? scramble(line, progress, offsets.current[i])
                        : unscramble(line, progress, offsets.current[i])
                )
            );
            if (progress < 1) return;
            clearInterval(interval);
            if (phase === 'decode') setPhase('hold');
            else onDoneRef.current();
        }, SCRAMBLE_TICK);
        return () => clearInterval(interval);
        // `lines` is derived from `sample`, which never changes for a mounted box.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase]);

    const [title, ...values] = phase === 'hold' ? lines : scrambled;

    return (
        <div
            className={cn(
                'absolute w-56 font-mono text-[11px] leading-5 tracking-wider',
                phase === 'encode'
                    ? 'motion-safe:animate-[dither-box-out_0.45s_steps(6,end)_both]'
                    : 'motion-safe:animate-[dither-box-in_0.4s_steps(6,end)_both]',
                slot
            )}
        >
            {/* Hard, checkerboard-dithered drop shadow on the same pixel grid as the background */}
            <div className="dither-shadow absolute inset-0 translate-x-[6px] translate-y-[6px]" />
            <div className="relative border border-foreground/70 bg-background">
                <div className="flex items-center justify-between gap-3 bg-foreground px-2 text-background">
                    <span className="truncate whitespace-pre uppercase">{title}</span>
                    <span className="shrink-0 opacity-70">{sample.alpha3}</span>
                </div>
                <dl className="px-2 py-1.5">
                    {sample.rows.map((row, i) => (
                        <div key={row.label} className="flex justify-between gap-3">
                            <dt className="shrink-0 uppercase text-muted-foreground">{row.label}</dt>
                            <dd className="truncate whitespace-pre text-foreground">{values[i]}</dd>
                        </div>
                    ))}
                </dl>
            </div>
        </div>
    );
}

interface ActiveBox {
    id: number;
    sample: HeroCountrySample;
    slot: number;
}

export function LocaleDataBoxes({ samples, className }: { samples: HeroCountrySample[]; className?: string }) {
    const [boxes, setBoxes] = useState<ActiveBox[]>([]);

    useEffect(() => {
        if (samples.length === 0) return;

        const queue = [...samples].sort(() => Math.random() - 0.5);
        let cursor = 0;
        let nextId = 0;
        const wideEnough = window.matchMedia(MIN_VIEWPORT);

        const spawn = () => {
            if (document.hidden || !wideEnough.matches) return;
            setBoxes((current) => {
                if (current.length >= MAX_VISIBLE) return current;
                const freeSlots = SLOTS.map((_, i) => i).filter((i) => !current.some((box) => box.slot === i));
                const slot = freeSlots[Math.floor(Math.random() * freeSlots.length)];
                const sample = queue[cursor++ % queue.length];
                return [...current, { id: nextId++, sample, slot }];
            });
        };

        const first = setTimeout(spawn, 800);
        const interval = setInterval(spawn, SPAWN_EVERY_MS);
        return () => {
            clearTimeout(first);
            clearInterval(interval);
        };
    }, [samples]);

    const remove = (id: number) => setBoxes((current) => current.filter((box) => box.id !== id));

    return (
        <div aria-hidden="true" className={cn('pointer-events-none select-none', className)}>
            {boxes.map((box) => (
                <DataBox key={box.id} sample={box.sample} slot={SLOTS[box.slot]} onDone={() => remove(box.id)} />
            ))}
        </div>
    );
}

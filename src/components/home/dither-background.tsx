'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Dithered wave background.
 *
 * A dependency-free WebGL port of the React Bits "Dither" background:
 * fbm-warped Perlin waves, quantised through an 8x8 Bayer matrix.
 * The canvas renders one texel per dither cell and is upscaled with
 * `image-rendering: pixelated`, which keeps the retro look crisp and
 * costs a fraction of a full-resolution pass.
 */

const VERTEX_SHADER = `
attribute vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uMouse;
uniform float uMouseStrength;
uniform vec3 uBackground;
uniform vec3 uForeground;

const float WAVE_SPEED = 0.04;
const float WAVE_FREQUENCY = 3.0;
const float WAVE_AMPLITUDE = 0.3;
const float INTENSITY = 0.55;
const float LEVELS = 4.0;
const float MOUSE_RADIUS = 0.35;

vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec2 fade(vec2 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }

float cnoise(vec2 P) {
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod289(Pi);
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0;
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x, gy.x);
  vec2 g10 = vec2(gx.y, gy.y);
  vec2 g01 = vec2(gx.z, gy.z);
  vec2 g11 = vec2(gx.w, gy.w);
  vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
  g00 *= norm.x; g01 *= norm.y; g10 *= norm.z; g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fadeXY = fade(Pf.xy);
  vec2 nX = mix(vec2(n00, n01), vec2(n10, n11), fadeXY.x);
  return 2.3 * mix(nX.x, nX.y, fadeXY.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amp = 1.0;
  for (int i = 0; i < 4; i++) {
    value += amp * abs(cnoise(p));
    p *= WAVE_FREQUENCY;
    amp *= WAVE_AMPLITUDE;
  }
  return value;
}

float pattern(vec2 p) {
  return fbm(p + fbm(p - uTime * WAVE_SPEED));
}

// Recursive Bayer matrix: 2x2 -> 4x4 -> 8x8, values in [0, 1).
float bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x / 2.0 + a.y * a.y * 0.75);
}
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

void main() {
  vec2 st = gl_FragCoord.xy / uResolution;
  float aspect = uResolution.x / uResolution.y;
  vec2 uv = (st - 0.5) * vec2(aspect, 1.0);

  float f = pattern(uv);

  vec2 mouse = (uMouse / uResolution - 0.5) * vec2(aspect, 1.0);
  f -= 0.5 * uMouseStrength * (1.0 - smoothstep(0.0, MOUSE_RADIUS, length(uv - mouse)));

  // Clear a calm ellipse behind the headline and fade out at the bottom edge.
  // Done before quantisation so the falloff itself is dithered.
  float focus = smoothstep(0.22, 0.62, length((st - vec2(0.5, 0.52)) * vec2(1.1, 1.5)));
  float edge = smoothstep(0.0, 0.3, st.y);
  float t = clamp(f, 0.0, 1.0) * INTENSITY * focus * edge;

  float stepSize = 1.0 / (LEVELS - 1.0);
  t += (bayer8(gl_FragCoord.xy) - 0.25) * stepSize;
  t = clamp(t - mix(0.2, 0.0, smoothstep(0.45, 0.8, t)), 0.0, 1.0);
  t = floor(t * (LEVELS - 1.0) + 0.5) / (LEVELS - 1.0);

  gl_FragColor = vec4(mix(uBackground, uForeground, t), 1.0);
}
`;

/** Size of one dither cell in CSS pixels. */
const PIXEL_SIZE = 3;

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(gl: WebGLRenderingContext) {
    const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vertex || !fragment) return null;

    const program = gl.createProgram();
    if (!program) return null;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        return null;
    }
    return program;
}

/** Resolves any CSS colour (including oklch tokens) to normalised RGB. */
function resolveCssColor(value: string): [number, number, number] {
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) return [0, 0, 0];
    ctx.fillStyle = value;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return [r / 255, g / 255, b / 255];
}

function readThemeColors() {
    const styles = getComputedStyle(document.documentElement);
    return {
        background: resolveCssColor(styles.getPropertyValue('--background').trim()),
        foreground: resolveCssColor(styles.getPropertyValue('--muted-foreground').trim()),
    };
}

export function DitherBackground({ className }: { className?: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const gl = canvas?.getContext('webgl', { antialias: false, alpha: false });
        if (!canvas || !gl) return;

        const program = createProgram(gl);
        if (!program) return;
        gl.useProgram(program);

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const position = gl.getAttribLocation(program, 'aPosition');
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

        const uniform = (name: string) => gl.getUniformLocation(program, name);
        const uResolution = uniform('uResolution');
        const uTime = uniform('uTime');
        const uMouse = uniform('uMouse');
        const uMouseStrength = uniform('uMouseStrength');
        const uBackground = uniform('uBackground');
        const uForeground = uniform('uForeground');

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const mouse = { x: 0, y: 0, target: 0, strength: 0 };
        let frame = 0;
        let visible = true;
        const start = performance.now();

        const draw = () => {
            const time = reducedMotion.matches ? 0 : (performance.now() - start) / 1000;
            mouse.strength += (mouse.target - mouse.strength) * 0.08;
            gl.uniform1f(uTime, time);
            gl.uniform2f(uMouse, mouse.x, mouse.y);
            gl.uniform1f(uMouseStrength, mouse.strength);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
        };

        const loop = () => {
            draw();
            frame = requestAnimationFrame(loop);
        };

        const play = () => {
            cancelAnimationFrame(frame);
            if (!visible) return;
            if (reducedMotion.matches) draw();
            else frame = requestAnimationFrame(loop);
        };

        const applyTheme = () => {
            const { background, foreground } = readThemeColors();
            gl.uniform3f(uBackground, ...background);
            gl.uniform3f(uForeground, ...foreground);
            if (reducedMotion.matches) draw();
        };

        const resize = () => {
            const width = Math.max(1, Math.ceil(canvas.clientWidth / PIXEL_SIZE));
            const height = Math.max(1, Math.ceil(canvas.clientHeight / PIXEL_SIZE));
            if (canvas.width === width && canvas.height === height) return;
            canvas.width = width;
            canvas.height = height;
            gl.viewport(0, 0, width, height);
            gl.uniform2f(uResolution, width, height);
            if (reducedMotion.matches) draw();
        };

        const onPointerMove = (event: PointerEvent) => {
            const rect = canvas.getBoundingClientRect();
            const inside =
                event.clientX >= rect.left &&
                event.clientX <= rect.right &&
                event.clientY >= rect.top &&
                event.clientY <= rect.bottom;
            mouse.target = inside && event.pointerType === 'mouse' ? 1 : 0;
            mouse.x = (event.clientX - rect.left) / PIXEL_SIZE;
            mouse.y = (rect.bottom - event.clientY) / PIXEL_SIZE;
        };
        const onPointerLeave = () => {
            mouse.target = 0;
        };

        resize();
        applyTheme();
        play();

        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(canvas);

        const themeObserver = new MutationObserver(applyTheme);
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style'] });

        const intersectionObserver = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            play();
        });
        intersectionObserver.observe(canvas);

        reducedMotion.addEventListener('change', play);
        window.addEventListener('pointermove', onPointerMove, { passive: true });
        document.documentElement.addEventListener('pointerleave', onPointerLeave);

        return () => {
            cancelAnimationFrame(frame);
            resizeObserver.disconnect();
            themeObserver.disconnect();
            intersectionObserver.disconnect();
            reducedMotion.removeEventListener('change', play);
            window.removeEventListener('pointermove', onPointerMove);
            document.documentElement.removeEventListener('pointerleave', onPointerLeave);
            gl.deleteBuffer(buffer);
            gl.deleteProgram(program);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            className={cn('block h-full w-full [image-rendering:pixelated]', className)}
        />
    );
}

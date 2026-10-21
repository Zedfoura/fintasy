// WCAG 2.x contrast gate for HERO-1 palettes. Exit 1 if any pair fails its minimum.
const L = h => { const c = h.match(/\w\w/g).map(x => parseInt(x, 16) / 255).map(v => v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
const ratio = (a, b) => { const [x, y] = [L(a), L(b)].sort((p, q) => q - p); return (x + .05) / (y + .05); };
const BODY = 4.5, DISPLAY = 3;
import { readFileSync } from 'node:fs';
const tok = JSON.parse(readFileSync(new URL('../../tokens.json', import.meta.url)));
const col = v => tok.color[v] || v;
const pairs = {
  LOCKED: tok.contrast.map(p => [`${p.name} (${col(p.fg)} on ${col(p.bg)})`, col(p.fg), col(p.bg), p.min]),
  HYPE: (tok.hype?.contrast || []).map(p => [`${p.name} (${col(p.fg)} on ${col(p.bg)})`, col(p.fg), col(p.bg), p.min]),
  A: [['bone #ECE9E2 on ink', '#ECE9E2', '#0D0D0C', BODY], ['side text #B9B5AC on ink', '#B9B5AC', '#0D0D0C', BODY], ['mute #8E8B84 on ink', '#8E8B84', '#0D0D0C', BODY], ['violet #8B7CFF on ink (counter)', '#8B7CFF', '#0D0D0C', BODY], ['ink on bone (CTA)', '#0D0D0C', '#ECE9E2', BODY], ['ink on violet (CTA hover)', '#0D0D0C', '#8B7CFF', BODY]],
  B: [['ink on paper', '#111110', '#F2F0EB', BODY], ['mute #5E5B55 on paper', '#5E5B55', '#F2F0EB', BODY], ['ink on signal #FF4D3D (CTA bar)', '#111110', '#FF4D3D', BODY], ['paper on ink (logo)', '#F2F0EB', '#111110', BODY]],
  C: [['chalk on void', '#F4F4F2', '#0A0A0A', BODY], ['ash #8A8A86 on void', '#8A8A86', '#0A0A0A', BODY], ['amber #FFB020 on void (CTA)', '#FFB020', '#0A0A0A', BODY]],
  CLOSE: [['mute #8E8B84 on frame #10100F (report card)', '#8E8B84', '#10100F', BODY], ['body #B9B5AC on frame', '#B9B5AC', '#10100F', BODY], ['violet on frame (Q labels, last row)', '#8B7CFF', '#10100F', BODY], ['bone on tile #161615 (C2 tile hover)', '#ECE9E2', '#161615', BODY], ['mute on tile #161615 (C2 URL on hover)', '#8E8B84', '#161615', BODY], ['violet on tile #161615 (C2 kicker on hover)', '#8B7CFF', '#161615', BODY]],
  CONTROL: [['known-bad #777777 on #888888', '#777777', '#888888', BODY]],
};
let fails = 0;
for (const [dir, list] of Object.entries(pairs)) for (const [name, fg, bg, min] of list) {
  const r = ratio(fg, bg), ok = r >= min; if (!ok && dir !== 'CONTROL') fails++;
  console.log(`${dir.padEnd(7)} ${ok ? 'PASS' : 'FAIL'} ${r.toFixed(2).padStart(5)}:1 (min ${min}) ${name}`);
}
const ctl = ratio('#777777', '#888888') >= BODY;
console.log(`control flagged as failing: ${!ctl}`);
console.log(`${fails} failing pair(s) across ${Object.values(pairs).flat().length - 1} direction pairs`);
process.exit(fails || ctl ? 1 : 0);

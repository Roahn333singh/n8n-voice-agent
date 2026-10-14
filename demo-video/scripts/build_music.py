#!/usr/bin/env python3
"""Compose the background music options for the explainer. Everything is synthesised here,
so there are no samples, no licences and no copyright claims.

Each track is exactly as long as the video and follows its sections:
  opening page (light) -> explanation (groove) -> recorded call (quiet bed; the video ducks it further)
  -> results + booking page (full groove, final chord).

Setup (once):  python3 -m venv .venv && .venv/bin/pip install numpy
Run:           .venv/bin/python scripts/build_music.py
Outputs:       public/audio/music/<id>.mp3     used by the video (choose with the "music" prop)
               out/music-samples/<n>-<id>.mp3  short listening samples (start + ending)
"""
from pathlib import Path
import json
import math
import re
import subprocess
import tempfile
import wave

try:
    import numpy as np
except ImportError:
    raise SystemExit('Needs NumPy: python3 -m venv .venv && .venv/bin/pip install numpy, then run with .venv/bin/python.')

ROOT = Path(__file__).resolve().parents[1]
SR = 48000

# Mirrors the TIMELINE in src/config.ts.
_call = float(re.search(r'CALL_SECONDS\s*=\s*([\d.]+)', (ROOT / 'src/captions.ts').read_text()).group(1))
OPENING_END = 7
CALL_START = OPENING_END + 28
RESULTS_START = CALL_START + max(40, math.ceil(_call + 1 + 2))
OFFER_START = RESULTS_START + 11
SECONDS = OFFER_START + 10


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def smooth(u):
    u = np.clip(u, 0, 1)
    return u * u * (3 - 2 * u)


def tt(seconds):
    return np.arange(int(round(seconds * SR))) / SR


def band(sig, lo=None, hi=None):
    n = len(sig)
    spec = np.fft.rfft(sig)
    f = np.fft.rfftfreq(n, 1 / SR)
    mask = np.ones_like(f)
    if lo:
        mask *= smooth((f - lo * .6) / (lo * .8))
    if hi:
        mask *= smooth((hi * 1.4 - f) / (hi * .8))
    return np.fft.irfft(spec * mask, n)


def peak1(sig):
    return sig / max(np.abs(sig).max(), 1e-9)


# ---------- instruments (mono, peak around 1) ----------

def piano(m, dur, rng):
    t, f = tt(dur), hz(m)
    s = np.zeros_like(t)
    for h, lvl, dec in [(1, 1, 2.7), (2, .30, 1.3), (3, .12, .85), (4, .05, .45), (5, .025, .28)]:
        s += lvl * np.sin(2 * np.pi * f * h * (1 + .00008 * h * h) * t) * np.exp(-t / dec)
    s += .022 * rng.standard_normal(len(t)) * np.exp(-t / .012)
    return s * smooth(t / .012) * smooth((dur - t) / .5)


def epiano(m, dur):
    t, f = tt(dur), hz(m)
    index = 1.5 * np.exp(-t / .35) + .25
    s = np.sin(2 * np.pi * f * t + index * np.sin(2 * np.pi * f * t)) * np.exp(-t / 1.9)
    s += .16 * np.sin(2 * np.pi * f * 7 * t) * np.exp(-t / .08)
    s *= 1 + .12 * np.sin(2 * np.pi * 4.6 * t)
    return s * smooth(t / .006) * smooth((dur - t) / .4)


def pluck(m, dur, decay=1.5, pos=.18, tilt=1.2):
    """Guitar-like string: bright harmonics fade faster than the fundamental."""
    t, f = tt(dur), hz(m)
    s = np.zeros_like(t)
    for h in range(1, 15):
        fh = f * h * (1 + .0003 * h * h)
        if fh > 11000:
            break
        a = abs(math.sin(math.pi * h * pos)) / h ** tilt
        s += a * np.sin(2 * np.pi * fh * t) * np.exp(-t * (1 + .55 * (h - 1)) / decay)
    return s * smooth(t / .003) * smooth((dur - t) / .08)


def bell(m, dur):
    t, f = tt(dur), hz(m)
    s = (np.sin(2 * np.pi * f * t) * np.exp(-t / .9)
         + .35 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / .25)
         + .10 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t / .08))
    return s * smooth(t / .002) * smooth((dur - t) / .1)


def warm_pad(m, dur):
    t, f = tt(dur), hz(m)
    s = (.70 * np.sin(2 * np.pi * f * t) + .19 * np.sin(2 * np.pi * f * 1.0012 * t + .3)
         + .075 * np.sin(2 * np.pi * f * 2 * t + .6) + .03 * np.sin(2 * np.pi * f * 3 * t))
    return s * smooth(t / 1.1) * smooth((dur - t) / 1.4)


def saw_pad(m, dur, cutoff=2400):
    t, f = tt(dur), hz(m)
    s = np.zeros_like(t)
    for d in (-.09, 0, .09):
        r = 2 ** (d / 12)
        for h in range(1, 13):
            fh = f * r * h
            if fh > 9000:
                break
            s += np.sin(2 * np.pi * fh * t + h * d * 7) / h * math.exp(-fh / cutoff)
    return s / 3 * smooth(t / .35) * smooth((dur - t) / .6)


def bass(m, dur, decay=1.8, drive=0.0):
    t, f = tt(dur), hz(m)
    s = np.sin(2 * np.pi * f * t) + .09 * np.sin(2 * np.pi * 2 * f * t)
    if drive:
        s = np.tanh(s * (1 + drive)) / math.tanh(1 + drive)
    return s * smooth(t / .012) * np.exp(-t / decay) * smooth((dur - t) / .06)


class Drums:
    """A few pre-made variations of each hit, reused so long tracks stay fast."""

    def __init__(self, rng):
        self.rng = rng
        self.cache = {}

    def get(self, kind, **kw):
        key = (kind, tuple(sorted(kw.items())))
        if key not in self.cache:
            # Noise hits are spiky, so peak-normalising leaves them far quieter than tonal hits.
            gain = 3.0 if kind in ('hat', 'shaker', 'clap', 'snare', 'swell') else 1.0
            self.cache[key] = [gain * peak1(getattr(self, '_' + kind)(**kw)) for _ in range(4)]
        return self.cache[key][self.rng.integers(4)]

    def _kick(self, tone=48, decay=.085):
        t = tt(.32)
        ph = 2 * np.pi * (tone * t + 2.4 * (1 - np.exp(-t / .02)))
        return np.sin(ph) * smooth(t / .002) * np.exp(-t / decay) * smooth((.32 - t) / .04)

    def _snare(self, decay=.12, lo=900, hi=6000, body=185):
        t = tt(.3)
        n = band(self.rng.standard_normal(len(t)), lo, hi)
        n = n / np.abs(n).max()
        return (n * np.exp(-t / decay) + .45 * np.sin(2 * np.pi * body * t) * np.exp(-t / .045)) * smooth(t / .002)

    def _clap(self):
        t = tt(.35)
        n = band(self.rng.standard_normal(len(t)), 900, 5000)
        env = np.zeros_like(t)
        for o in (0, .011, .022):
            env += np.where(t >= o, np.exp(-(t - o) / .008), 0)
        env += np.where(t >= .022, .55 * np.exp(-(t - .022) / .11), 0)
        return n * env

    def _hat(self, decay=.035):
        t = tt(.14)
        return band(self.rng.standard_normal(len(t)), 7000, None) * np.exp(-t / decay) * smooth(t / .001)

    def _shaker(self):
        t = tt(.09)
        return band(self.rng.standard_normal(len(t)), 4500, 11000) * smooth(t / .012) * np.exp(-t / .025)

    def _swell(self, dur=2.0):
        t = tt(dur)
        return band(self.rng.standard_normal(len(t)), 1500, 9000) * smooth(t / dur) ** 2 * smooth((dur - t) / .05)


# ---------- mixing ----------

class Mix:
    def __init__(self, seed):
        self.n = int(SECONDS * SR)
        self.bus = {}
        self.rng = np.random.default_rng(seed)
        self.drums = Drums(self.rng)
        self.kicks = []

    def add(self, bus, sig, start, level, pan=0.0):
        b = self.bus.setdefault(bus, np.zeros((self.n, 2), dtype=np.float32))
        p = int(round(start * SR))
        if p < 0 or p >= self.n:
            return
        k = min(len(sig), self.n - p)
        a = (pan + 1) * math.pi / 4
        b[p:p + k, 0] += (sig[:k] * level * math.cos(a)).astype(np.float32)
        b[p:p + k, 1] += (sig[:k] * level * math.sin(a)).astype(np.float32)

    def hit(self, kind, start, level, pan=0.0, bus='drums', **kw):
        if kind == 'kick':
            self.kicks.append(start)
        self.add(bus, self.drums.get(kind, **kw), start, level, pan)

    def chord(self, inst, notes, start, level, spread=0.0, pan=.5, bus='keys'):
        for i, m in enumerate(notes):
            p = 0 if len(notes) == 1 else pan * (2 * i / (len(notes) - 1) - 1)
            self.add(bus, inst(m), start + spread * i, level, p)


def part_at(t):
    if t < OPENING_END:
        return 'open'
    if t < CALL_START:
        return 'build'
    if t < RESULTS_START:
        return 'call'
    if t < OFFER_START:
        return 'lift'
    return 'close'


def plan(bpm):
    """Bars restart on a downbeat when the results scene begins; the last bar is a held final chord."""
    bar = 240 / bpm
    out, counts = [], {}

    def push(start, part, g):
        k = counts.get(part, 0)
        counts[part] = k + 1
        out.append((start, part, k, g))

    t, g = 0.0, 0
    while t < RESULTS_START - bar * .5:
        push(t, part_at(t), g)
        t, g = t + bar, g + 1
    t, g = float(RESULTS_START), 0
    while t + bar <= SECONDS - 4:
        push(t, part_at(t), g)
        t, g = t + bar, g + 1
    push(t, 'end', g)
    return bar, bar / 4, out


GROOVE = ('build', 'lift', 'close')


# ---------- the five styles ----------

def warm_piano(mx):
    bar, beat, bars = plan(80)
    chords = [([50, 57, 61, 64, 66], 38), ([45, 52, 59, 61, 64], 33),
              ([47, 54, 62, 66, 69], 35), ([43, 50, 59, 62, 69], 31)]
    order = [0, 1, 2, 3, 0, 1, 3, 1]
    motif = [78, 76, 73, 69, 71, 73, 76, 73]
    r = mx.rng
    for start, part, k, g in bars:
        chord, root = chords[0 if part == 'end' else order[g % 8]]
        lv = {'open': .8, 'build': 1, 'call': .45, 'lift': 1, 'close': 1.05, 'end': 1}[part]
        dur = 7 if part == 'end' else bar + 1.5
        mx.chord(lambda m: warm_pad(m, dur), chord[1:], start, .05 * lv, bus='pad', pan=.55)
        mx.add('dry', bass(root, 2.8 if part != 'end' else 6), start, .32 * lv)
        mx.chord(lambda m: piano(m + 12, 3.2 if part != 'end' else 6, r), chord, start, .09 * lv, spread=.02, pan=.35)
        if part in GROOVE:
            for j, idx in enumerate([0, 2, 3, 2, 1, 3]):
                mx.add('keys', piano(chord[idx] + 24, 1.8, r), start + beat * (.5 + j * .5) + (.026 if j % 2 else 0),
                       .06 * (1 if j % 2 == 0 else .75), -.28 if j % 2 else .28)
            if not (part == 'build' and k < 1):
                mx.hit('kick', start, .45, bus='dry')
                mx.hit('kick', start + 2 * beat, .3, bus='dry')
                for q in range(8):
                    mx.hit('shaker', start + q * beat / 2, .07 if q % 2 else .045, .25 if q % 2 else -.25)
        if (part == 'build' and k >= 4) or part == 'close':
            mx.add('keys', piano(motif[g % 8], 3.4, r), start + .12, .1, -.1)
        if part == 'call':
            mx.add('keys', piano(chord[3] + 12, 2.4, r), start + 2 * beat, .05, .25)


def bright_uplift(mx):
    bar, beat, bars = plan(108)
    voic = [[60, 64, 67, 72], [59, 62, 67, 71], [57, 60, 64, 69], [57, 60, 65, 69]]
    roots = [36, 35, 33, 41]
    melody = [[76, 74, 72], [74, 71, 67], [72, 76, 79], [77, 76, 72]]
    r = mx.rng
    for start, part, k, g in bars:
        ci = 0 if part == 'end' else g % 4
        v, root = voic[ci], roots[ci]
        if part == 'end':
            mx.chord(lambda m: piano(m, 6, r), v, start, .1, spread=.015)
            mx.chord(lambda m: warm_pad(m, 6), v, start, .05, bus='pad')
            mx.add('dry', bass(root, 5), start, .32)
            mx.add('keys', bell(84, 3), start, .09)
            continue
        if part == 'call':
            mx.chord(lambda m: warm_pad(m, bar + 1.5), v, start, .045, bus='pad')
            mx.add('keys', pluck(v[-1] + 12, 1.2, decay=.5, tilt=.9), start + 2 * beat, .05, .3)
            continue
        if part == 'open':
            mx.chord(lambda m: piano(m, bar + .8, r), v, start, .09, spread=.012)
            mx.chord(lambda m: warm_pad(m, bar + 1.5), v, start, .035, bus='pad')
        else:
            mx.chord(lambda m: piano(m, .9, r), v, start, .075, spread=.01)
            mx.chord(lambda m: piano(m, .9, r), v, start + 1.5 * beat, .06, spread=.01)
            mx.chord(lambda m: warm_pad(m, bar + 1), v, start, .03, bus='pad')
        if part != 'open' or k >= 1:
            for q, idx in enumerate([0, 1, 2, 3, 2, 1, 3, 2]):
                mx.add('keys', pluck(v[idx] + 12, .6, decay=.35, tilt=.9), start + q * beat / 2,
                       .1 if q % 2 == 0 else .075, .35 if q % 2 else -.35)
        if part in GROOVE:
            for q in range(8):
                mx.add('dry', bass(root + (12 if q % 4 == 3 else 0), .26, decay=.25), start + q * beat / 2, .3)
            if not (part == 'build' and k < 1):
                for q in range(4):
                    mx.hit('kick', start + q * beat, .45, bus='dry')
                    mx.hit('hat', start + (q + .5) * beat, .07, .2)
                for q in (1, 3):
                    mx.hit('clap', start + q * beat, .2)
        if part == 'close' or (part == 'build' and k >= 6):
            for n, b in zip(melody[ci], (0, 1.5, 3)):
                mx.add('keys', bell(n, 1.2), start + b * beat, .085, -.15)


def lofi_chill(mx):
    bar, beat, bars = plan(76)
    sw = .6
    voic = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]]
    roots = [41, 40, 38, 36]
    top = [72, 71, 69, 67]
    r = mx.rng
    # Vinyl crackle bed and pops for the whole track.
    noise = band(r.standard_normal(mx.n), 1200, 6000)
    mx.add('dry', peak1(noise), 0, .006)
    for p in r.uniform(0, SECONDS, int(SECONDS * 3)):
        mx.add('dry', peak1(band(r.standard_normal(240), 2000, 9000)), p, r.uniform(.01, .035), r.uniform(-.6, .6))
    for start, part, k, g in bars:
        ci = 0 if part == 'end' else g % 4
        v, root = voic[ci], roots[ci]
        if part == 'end':
            mx.chord(lambda m: epiano(m, 6), v, start, .1, spread=.03)
            mx.add('dry', bass(root, 5, decay=2), start, .32)
            continue
        lv = .5 if part == 'call' else 1
        mx.chord(lambda m: epiano(m, 2.2), v, start, .14 * lv, spread=.018)
        if part == 'call':
            continue
        mx.chord(lambda m: epiano(m, 1.1), v, start + (1 + sw) * beat, .09, spread=.012)
        if part in GROOVE:
            mx.add('dry', bass(root, 1.4, decay=.9), start, .36)
            mx.add('dry', bass(root, .8, decay=.6), start + (2 + sw) * beat, .3)
            if not (part == 'build' and k < 1):
                mx.hit('kick', start, .5, bus='dry', decay=.11)
                mx.hit('kick', start + (2 + sw) * beat, .38, bus='dry', decay=.11)
                for q in (1, 3):
                    mx.hit('snare', start + q * beat, .24, lo=600, hi=3800, decay=.14)
                for q in range(8):
                    mx.hit('hat', start + (q // 2 + (sw if q % 2 else 0)) * beat, .06 if q % 2 == 0 else .04, .3, decay=.03)
        if part == 'close' or (part == 'build' and k >= 4):
            mx.add('keys', epiano(top[ci] + 12, 1.6), start + (2 + sw) * beat, .07, -.2)


def modern_tech(mx):
    bar, beat, bars = plan(100)
    pad = [[57, 60, 64, 69], [57, 60, 65, 69], [55, 60, 64, 67], [55, 59, 62, 67]]
    arp = [[69, 72, 76, 81], [69, 72, 77, 81], [67, 72, 76, 79], [67, 71, 74, 79]]
    sub = [33, 29, 36, 31]
    melody = [[81, 79, 76], [77, 76, 72], [79, 76, 74], [74, 71, 79]]
    pattern = [0, 1, 2, 3, 1, 2, 3, 2, 0, 2, 1, 3, 2, 1, 3, 1]
    for start, part, k, g in bars:
        ci = 0 if part == 'end' else g % 4
        if part == 'end':
            mx.chord(lambda m: saw_pad(m, 6, 2600), pad[ci], start, .06, bus='pumped')
            mx.add('dry', bass(sub[ci], 5, decay=2.5, drive=.4), start, .4)
            mx.add('keys', bell(arp[ci][-1], 3), start, .08)
            continue
        cut = 1500 if part in ('open', 'call') else 2800
        lv = .55 if part == 'call' else 1
        mx.chord(lambda m: saw_pad(m, bar + .5, cut), pad[ci], start, .09 * lv, bus='pumped')
        if part == 'call':
            continue
        if part != 'open' or k >= 1:
            for q, idx in enumerate(pattern):
                mx.add('keys', pluck(arp[ci][idx], .4, decay=.22, tilt=.8), start + q * beat / 4,
                       (.12 if q % 4 == 0 else .09) * (.7 if part == 'open' else 1), .4 if q % 2 else -.4)
        if part in GROOVE:
            for q in range(4):
                mx.add('dry', bass(sub[ci] + 12, .26, decay=.22, drive=.6), start + (q + .5) * beat, .27)
            if not (part == 'build' and k < 1):
                for q in range(4):
                    mx.hit('kick', start + q * beat, .5, bus='dry')
                for q in (1, 3):
                    mx.hit('clap', start + q * beat, .18)
                for q in range(16):
                    mx.hit('hat', start + q * beat / 4, .055 if q % 4 == 2 else .028, .25, decay=.02)
        if part == 'close' or (part == 'build' and k >= 6):
            for n, b in zip(melody[ci], (0, 1.5, 3)):
                mx.add('keys', bell(n, 1.2), start + b * beat, .08, -.15)


def acoustic_hopeful(mx):
    bar, beat, bars = plan(92)
    shapes = [[43, 47, 50, 55, 59, 67], [42, 45, 50, 57, 62, 66], [40, 47, 52, 55, 59, 64], [48, 52, 55, 60, 64]]
    roots = [43, 42, 40, 36]
    glock = [[79, 74], [78, 74], [76, 71], [76, 72]]
    guitar = lambda m, d=2.0: pluck(m, d, decay=1.4, pos=.2, tilt=1.1)

    def strum(notes, start, level, up=False, gap=.011, dur=2.0):
        seq = list(reversed(notes[-4:])) if up else notes
        for i, m in enumerate(seq):
            mx.add('keys', guitar(m, dur), start + i * gap, level * (.6 if up else 1), (i / max(len(seq) - 1, 1) - .5) * .6)

    for start, part, k, g in bars:
        ci = 0 if part == 'end' else g % 4
        s, root = shapes[ci], roots[ci]
        if part == 'end':
            strum(s, start, .085, gap=.03, dur=6)
            mx.add('dry', bass(root - 12, 5, decay=2), start, .3)
            mx.add('keys', bell(glock[0][0], 3), start + .1, .07)
            continue
        if part in ('open', 'call'):
            lv = .5 if part == 'call' else 1
            for q, idx in enumerate([0, 3, 4, 5, 2, 4, 3, 5]):
                mx.add('keys', guitar(s[min(idx, len(s) - 1)], 1.8), start + q * beat / 2, .1 * lv, (idx / 5 - .5) * .7)
            continue
        for b, up in [(0, False), (1, False), (1.5, True), (2.5, True), (3, False), (3.5, True)]:
            strum(s, start + b * beat, .07)
        mx.add('dry', bass(root - 12, 1.2, decay=1.2), start, .28)
        mx.add('dry', bass(root - 12, 1.2, decay=1.2), start + 2 * beat, .22)
        if not (part == 'build' and k < 1):
            for q in range(16):
                mx.hit('shaker', start + q * beat / 4, .06 if q % 2 == 0 else .035, .3)
            mx.hit('kick', start, .38, bus='dry', decay=.1)
            mx.hit('kick', start + 2 * beat, .3, bus='dry', decay=.1)
            for q in (1, 3):
                mx.hit('clap', start + q * beat, .13)
        if part == 'close' or (part == 'build' and k >= 6):
            for n, b in zip(glock[ci], (0, 2)):
                mx.add('keys', bell(n, 1.5), start + b * beat, .075, -.2)


STYLES = [
    ('warm-piano', 'Warm Piano', 'calm, premium, trustworthy', warm_piano),
    ('bright-uplift', 'Bright Uplift', 'positive, upbeat SaaS / startup feel', bright_uplift),
    ('lofi-chill', 'Lo-fi Chill', 'relaxed, friendly, modern', lofi_chill),
    ('modern-tech', 'Modern Tech', 'sleek, AI / tech product feel', modern_tech),
    ('acoustic-hopeful', 'Acoustic Hopeful', 'warm, human, relatable', acoustic_hopeful),
]


# ---------- master + export ----------

def master(mx, lofi=False):
    for t in (OPENING_END, RESULTS_START):
        mx.add('keys', mx.drums.get('swell'), t - 2.0, .05)
    room = np.zeros((mx.n, 2), dtype=np.float32)
    for name, b in mx.bus.items():
        if name == 'pumped' and mx.kicks:
            env = np.ones(mx.n, dtype=np.float32)
            dip = (1 - .55 * (1 - smooth(tt(.32) / .32))).astype(np.float32)
            for k in mx.kicks:
                p = int(round(k * SR))
                q = min(p + len(dip), mx.n)
                env[p:q] = np.minimum(env[p:q], dip[:q - p])
            b = b * env[:, None]
        if name != 'dry':
            room += b
    dry_room = room.copy()
    for delay, gain in [(.079, .12), (.137, .10), (.233, .075), (.377, .05), (.541, .03)]:
        o = int(delay * SR)
        room[o:] += dry_room[:-o, ::-1] * gain
    mix = room + mx.bus.get('dry', 0)
    mix = mix.astype(np.float64)
    if lofi:
        mix = np.stack([band(mix[:, c], 40, 5200) for c in range(2)], axis=1)
    mix -= mix.mean(axis=0)
    t = np.arange(mx.n) / SR
    mix *= (smooth(t / .4) * smooth((SECONDS - t) / 3.5))[:, None]
    return mix * (.8 / max(np.abs(mix).max(), 1e-9))


def loudnorm(src, dst, target, extra_af='', codec=('-c:a', 'libmp3lame', '-b:a', '256k')):
    first = f'{extra_af}loudnorm=I={target}:TP=-2:LRA=11:print_format=json'
    err = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', str(src), '-af', first, '-f', 'null', '-'],
                         capture_output=True, text=True).stderr
    s = json.loads(err[err.rindex('{'):err.rindex('}') + 1])
    second = (f"{extra_af}loudnorm=I={target}:TP=-2:LRA=11:measured_I={s['input_i']}:measured_TP={s['input_tp']}"
              f":measured_LRA={s['input_lra']}:measured_thresh={s['input_thresh']}:offset={s['target_offset']}:linear=true")
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(src), '-af', second,
                    '-ar', str(SR), '-ac', '2', *codec, str(dst)], check=True)


def write_wav(path, mix):
    pcm = np.round(np.clip(mix, -1, 1) * 32767).astype('<i2')
    with wave.open(str(path), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())


def main():
    music_dir = ROOT / 'public/audio/music'
    sample_dir = ROOT / 'out/music-samples'
    music_dir.mkdir(parents=True, exist_ok=True)
    sample_dir.mkdir(parents=True, exist_ok=True)
    print(f'Video timeline: opening 0-{OPENING_END}s, call {CALL_START}-{RESULTS_START}s, '
          f'results {RESULTS_START}s, booking page {OFFER_START}-{SECONDS}s')
    with tempfile.TemporaryDirectory(prefix='voice-agent-music-') as tmp:
        for n, (key, label, mood, build) in enumerate(STYLES, 1):
            mx = Mix(seed=20261013 + n)
            build(mx)
            levels = ', '.join(f'{b} {20 * math.log10(np.sqrt(np.mean(a[int(8 * SR):int(34 * SR)] ** 2)) + 1e-9):.0f} dB'
                               for b, a in mx.bus.items())
            raw = Path(tmp) / f'{key}.wav'
            write_wav(raw, master(mx, lofi=key == 'lofi-chill'))
            track = music_dir / f'{key}.mp3'
            # Same loudness as the original bundled music, so the video's volume settings still fit.
            loudnorm(raw, track, -24, extra_af='highpass=f=35,')
            # Listening sample: the start (opening + explanation) and the ending (results + booking page).
            joined = Path(tmp) / f'{key}-sample.wav'
            subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(track),
                            '-filter_complex',
                            f'[0]atrim=0:24,asetpts=N/SR/TB[a];[0]atrim={RESULTS_START - 1}:{SECONDS},asetpts=N/SR/TB[b];'
                            '[a][b]acrossfade=d=1.2[o]', '-map', '[o]', str(joined)], check=True)
            loudnorm(joined, sample_dir / f'{n}-{key}.mp3', -16, codec=('-c:a', 'libmp3lame', '-b:a', '192k'))
            print(f'{n}. {label:<17} {mood:<40} -> {track.relative_to(ROOT)}   [{levels}]')


if __name__ == '__main__':
    main()

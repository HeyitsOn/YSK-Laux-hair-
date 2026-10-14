"""Crop, cut out and export the YSK product photos on a smooth white studio backdrop.

- Crops each shot to a 4:5 portrait frame around the hair (hand removed where possible).
- Separates the wig/mannequin from the blue-grey wall (colour key + connected-component cleanup),
  removes blue spill from the edges, and places it on a seamless soft-white backdrop with a
  gentle contact shadow.
- Warm grade and richer colour on the hair, light sharpening.
- Exports WebP at 960px and 480px wide (+ a 2:3 hero crop).

Usage (needs Pillow, numpy, scipy):
    python scripts/process_photos.py photos/originals public/products
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage
from scipy.spatial import Delaunay

SRC = Path(sys.argv[1])
OUT = Path(sys.argv[2])
OUT.mkdir(parents=True, exist_ok=True)

# name: (source file, crop box x0, y0, x1, y1 in original 960x1280 coords)
SHOTS = {
    'chestnut-bob-side': ('2.jpg', (125, 230, 925, 1230)),
    'chestnut-bob-back': ('3.jpg', (70, 140, 950, 1240)),
    'chestnut-bob-front': ('1.jpg', (40, 160, 920, 1260)),
    'burgundy-bob-side': ('9.jpg', (120, 260, 920, 1260)),
    'burgundy-bob-back': ('7.jpg', (210, 140, 890, 990)),
    'burgundy-bob-profile': ('6.jpg', (60, 100, 860, 1100)),
    'burgundy-bob-front': ('5.jpg', (62, 230, 862, 1230)),
    'black-bob-back': ('4.jpg', (60, 200, 860, 1200)),
    'black-bob-side': ('8.jpg', (240, 180, 880, 980)),
}
HERO = ('3.jpg', (160, 80, 960, 1280))  # 2:3 for the hero arch

LUMA = np.array([0.299, 0.587, 0.114], dtype=np.float32)


def rgb_to_hsv(rgb):
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    mx = rgb.max(-1)
    mn = rgb.min(-1)
    d = mx - mn + 1e-6
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    s = np.where(mx > 0, (mx - mn) / (mx + 1e-6), 0)
    return h, s, mx


def blur(arr: np.ndarray, radius: float) -> np.ndarray:
    return ndimage.gaussian_filter(arr, radius)


def opponent(a: np.ndarray) -> np.ndarray:
    """Luma + two colour-opponent channels (chroma weighted up, as it separates hair from wall best)."""
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    return np.stack([a @ LUMA, 2.0 * (r - g), 2.0 * ((r + g) / 2 - b)], -1)


def chroma(a: np.ndarray) -> np.ndarray:
    """Two colour-opponent channels divided by brightness, so a shadow has the same tint as lit wall."""
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    return np.stack([r - g, (r + g) / 2 - b], -1) / ((a @ LUMA)[..., None] + 0.06)


def subject_alpha(a: np.ndarray) -> np.ndarray:
    """0 = wall, 1 = wig / mannequin / stand."""
    # 1. Confident wall pixels from a colour key (cool hue, low saturation, not too dark).
    h, s, v = rgb_to_hsv(a)
    hue_w = np.clip(1 - np.abs(h - 190) / 55, 0, 1)
    sat_w = np.clip((0.48 - s) / 0.2, 0, 1)
    val_w = np.clip((v - 0.30) / 0.16, 0, 1)
    sure_wall = ndimage.binary_erosion(hue_w * sat_w * val_w > 0.6, iterations=2).astype(np.float32)

    # 2. Brightness-independent tint. Shadows on the wall keep the wall's tint, only darker, so
    #    comparing tint (not brightness) removes cast shadows. Measured on these photos: wall noise
    #    stays below ~0.10, shadows ~0.03-0.06, chestnut / burgundy hair ~0.32-0.37.
    lum = a @ LUMA
    tint = chroma(a)
    sigma = max(a.shape[:2]) * 0.03
    weight = blur(sure_wall, sigma) + 1e-4
    local = np.stack([blur(tint[..., c] * sure_wall, sigma) for c in range(2)], -1) / weight[..., None]
    global_tint = np.median(tint[sure_wall > 0], axis=0) if sure_wall.any() else np.zeros(2)
    w_local = np.clip(weight / 0.08, 0, 1)[..., None]
    wall_tint = local * w_local + global_tint * (1 - w_local)

    tint_alpha = np.clip((np.linalg.norm(tint - wall_tint, axis=-1) - 0.12) / 0.10, 0, 1)
    # Black hair, the neck ring and deep shadows in the hair are close to the wall in tint but much
    # darker than any lit wall, so darkness alone also marks them as subject.
    dark = np.clip((0.30 - lum) / 0.08, 0, 1)
    tint_alpha = np.maximum(tint_alpha, dark)

    # 3. Colour-distance alpha (brightness included). Keeps glossy highlights on the crown, which
    #    reflect the pale sky and can look wall-tinted, but misses cast shadows.
    model = np.stack([blur(a[..., c] * sure_wall, sigma) for c in range(3)], -1) / weight[..., None]
    dist = np.linalg.norm(opponent(a) - opponent(model), axis=-1)
    colour_alpha = np.clip((dist - 0.055) / 0.10, 0, 1)
    fallback = np.clip((0.55 - blur(hue_w * sat_w * np.clip((v - 0.16) / 0.10, 0, 1), 2.0)) / 0.25, 0, 1)
    no_model = np.clip((0.06 - weight) / 0.04, 0, 1)
    colour_alpha = colour_alpha * (1 - no_model) + fallback * no_model

    # Shine sits on the crown; cast shadows sit lower, around the neck and stand. Use the colour
    # alpha at the top of the frame and also require the shadow-proof tint test further down.
    yy = np.linspace(0, 1, a.shape[0], dtype=np.float32)[:, None]
    lower = np.clip((yy - 0.40) / 0.15, 0, 1)
    alpha = colour_alpha * (1 - lower) + np.minimum(colour_alpha, tint_alpha) * lower
    alpha = blur(alpha, 0.6)
    wallish = 1 - alpha

    # 4. Keep the large connected subject only (drops wall marks / scribbles).
    solid = ndimage.binary_opening(alpha > 0.5, iterations=3)
    labels, n = ndimage.label(solid)
    if n:
        sizes = ndimage.sum(solid, labels, range(1, n + 1))
        solid = np.isin(labels, [i + 1 for i, sz in enumerate(sizes) if sz > solid.size * 0.012])

    # 5. Fill enclosed holes (pen marks on the face, small highlights) - but not larger holes that
    #    look like wall seen between hair, neck and stand; those are cleared instead.
    holes = ndimage.binary_fill_holes(solid) & ~solid
    hole_labels, hn = ndimage.label(holes)
    wall_holes = np.zeros_like(holes)
    for i in range(1, hn + 1):
        region = hole_labels == i
        if region.sum() > solid.size * 0.008 and wallish[region].mean() > 0.4:
            wall_holes |= region
    filled = solid | (holes & ~wall_holes)

    near = ndimage.binary_dilation(filled, iterations=4)
    core = ndimage.binary_erosion(filled, iterations=3)
    alpha = np.maximum(alpha * near, core.astype(np.float32))
    alpha = alpha * (1 - ndimage.binary_erosion(wall_holes, iterations=1))
    return blur(alpha.astype(np.float32), 0.8)


def despill(a: np.ndarray) -> np.ndarray:
    """Remove the wall's cyan/blue cast: green and blue may not exceed max(red, average)."""
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    cap = np.maximum(r, a.mean(-1))
    return np.stack([r, np.minimum(g, cap), np.minimum(b, cap)], -1)


def studio_backdrop(hh: int, ww: int) -> np.ndarray:
    yy, xx = np.mgrid[0:hh, 0:ww].astype(np.float32)
    r = np.sqrt(((xx - ww * 0.5) / (ww * 0.62)) ** 2 + ((yy - hh * 0.40) / (hh * 0.62)) ** 2)
    t = np.clip(r, 0, 1.25) ** 1.8 / 1.25 ** 1.8
    centre = np.array([1.0, 1.0, 0.995], dtype=np.float32)
    edge = np.array([0.925, 0.912, 0.894], dtype=np.float32)
    return centre * (1 - t[..., None]) + edge * t[..., None]


# ---------------------------------------------------------------------------------------------
# Retouching, per source photo, in ORIGINAL 960x1280 coordinates (so every crop - including the
# hero - gets the same edit).
#   face.region : ellipse (cx, cy, rx, ry) where marks are cleaned (limited to skin inside it)
#   face.keep   : ellipses left completely untouched (iris, brows, nostrils)
#   face.eyes   : ellipses where only blue marker is removed (keeps lashes / liner / eye white)
#   face.lips   : ellipse in which only the pink lipstick itself is protected
#   cuts        : lines [(x, y), ...] along the bob ends (see trim_ends). A plain list = rough guide,
#                 the exact line is fitted to the hair; {'guide': [...]} = cut exactly on this line.
#   protect     : polygons (neck ring, neck, stand) that the end-trimming never changes
# ---------------------------------------------------------------------------------------------
RETOUCH = {
    '1.jpg': {  # chestnut, front
        'face': {
            'region': (505, 785, 228, 270),
            'keep': [(385, 630, 15, 15), (660, 625, 15, 15), (395, 548, 78, 16), (650, 545, 78, 16),
                     (525, 792, 42, 14)],
            'eyes': [(390, 628, 64, 40), (655, 624, 68, 40)],
            'lips': (530, 858, 90, 32),
        },
        'cuts': [{'guide': [(185, 1058), (355, 1060)]}, {'guide': [(680, 1062), (865, 1060)]}],
    },
    '5.jpg': {  # burgundy, front
        'face': {
            'region': (480, 805, 195, 215),
            'keep': [(387, 702, 13, 13), (597, 692, 13, 13), (390, 628, 72, 14), (600, 620, 72, 14),
                     (490, 842, 36, 13)],
            'eyes': [(387, 700, 62, 36), (595, 690, 62, 36)],
            'lips': (487, 900, 80, 28),
        },
        'cuts': [{'guide': [(165, 1045), (335, 1047)]}, {'guide': [(622, 1050), (795, 1048)]}],
    },
    '6.jpg': {  # burgundy, profile
        'face': {'region': (692, 640, 46, 150), 'keep': [(692, 578, 24, 15)], 'eyes': []},
        'cuts': [[(190, 905), (330, 926), (450, 946), (540, 962), (600, 985), (650, 1000)]],
        'protect': [[(520, 895), (665, 895), (665, 1010), (520, 1010)], [(580, 1000), (625, 1000), (625, 1280), (580, 1280)]],
    },
    '2.jpg': {  # chestnut, side (A-line)
        'cuts': [{'guide': [(300, 975), (340, 993), (380, 1003), (420, 1016), (465, 1030), (600, 1052),
                            (700, 1063), (805, 1072)]}],
        'protect': [[(470, 1000), (700, 1000), (700, 1140), (470, 1140)], [(575, 1130), (615, 1130), (615, 1280), (575, 1280)]],
    },
    '3.jpg': {  # chestnut, back (also the hero)
        'cuts': [[(200, 985), (260, 1010), (320, 1040), (390, 1058), (530, 1068), (680, 1058),
                  (760, 1045), (830, 1025), (905, 988)]],
        'protect': [[(385, 1035), (690, 1035), (690, 1165), (385, 1165)], [(495, 1150), (565, 1150), (565, 1280), (495, 1280)]],
    },
    '7.jpg': {  # burgundy, back
        'cuts': [[(335, 820), (420, 845), (480, 858), (560, 865), (650, 858), (700, 850), (765, 834)]],
        'protect': [[(475, 840), (655, 840), (655, 900), (475, 900)], [(540, 890), (580, 890), (580, 1280), (540, 1280)]],
    },
    '9.jpg': {  # burgundy, side
        'cuts': [[(285, 1094), (380, 1124), (440, 1137), (470, 1140), (500, 1134), (600, 1099), (690, 1049),
                  (745, 988)]],
        'protect': [[(450, 1110), (500, 1110), (500, 1280), (450, 1280)]],
    },
    '4.jpg': {'face': {'region': (470, 972, 100, 32), 'keep': [], 'eyes': []}},  # black, back: neck marks
    '8.jpg': {'face': {'region': (312, 772, 52, 16), 'keep': [], 'eyes': []}},  # black, side: neck marks
}


def ellipse(shape, cx, cy, rx, ry) -> np.ndarray:
    yy, xx = np.ogrid[0:shape[0], 0:shape[1]]
    return ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2 <= 1


def normconv(a: np.ndarray, mask: np.ndarray, sigma: float):
    w = blur(mask.astype(np.float32), sigma)
    out = np.stack([blur(a[..., c] * mask, sigma) for c in range(3)], -1) / (w[..., None] + 1e-6)
    return out, w


def clean_face(a: np.ndarray, alpha: np.ndarray, spec: dict, off) -> np.ndarray:
    """Remove pen / marker marks from the mannequin skin and gently even its tone."""
    ox, oy = off
    shp = a.shape[:2]
    region = ellipse(shp, spec['region'][0] - ox, spec['region'][1] - oy, *spec['region'][2:])
    keep = np.zeros(shp, bool)
    for cx, cy, rx, ry in spec['keep']:
        keep |= ellipse(shp, cx - ox, cy - oy, rx, ry)
    eyes = np.zeros(shp, bool)
    for cx, cy, rx, ry in spec['eyes']:
        eyes |= ellipse(shp, cx - ox, cy - oy, rx, ry)

    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    lum = a @ LUMA
    h, s, _ = rgb_to_hsv(a)
    warm = (r > g) & (g >= b - 0.02) & (lum > 0.38) & (alpha > 0.9)

    if 'lips' in spec:
        cx, cy, rx, ry = spec['lips']
        pink = ((h > 300) | (h < 12)) & (s > 0.25)
        lips = ellipse(shp, cx - ox, cy - oy, rx, ry) & ndimage.binary_closing(pink, iterations=2)
        keep |= ndimage.binary_dilation(lips, iterations=1)

    # Skin area = the outline of the face: convex hull of the main skin-coloured area inside the
    # region, pulled in a little from its edge. Eyes, lips and marks fall inside it; hair stays out.
    skin_px = ndimage.binary_opening(warm & region, iterations=2)
    lab, n = ndimage.label(skin_px)
    if not n:
        return a
    sizes = ndimage.sum(skin_px, lab, range(1, n + 1))
    main = lab == (int(np.argmax(sizes)) + 1)
    pts = np.argwhere(main)[:: max(1, int(main.sum() // 4000))]
    hull = Delaunay(pts)
    grid = np.argwhere(region)
    inside = np.zeros(shp, bool)
    inside[grid[:, 0], grid[:, 1]] = hull.find_simplex(grid) >= 0
    skin_area = ndimage.binary_erosion(inside, iterations=4) & region & (alpha > 0.9)
    if not skin_area.any():
        return a

    blue = (h > 175) & (h < 260) & (s > 0.12)
    # Around the eyes the marker is darker and greener; catch it there (iris stays in `keep`).
    blue |= eyes & (h > 145) & (h < 270) & (s > 0.07) & (lum > 0.12)
    med_lum = ndimage.median_filter(lum, size=17)
    med_warm = ndimage.median_filter(r - b, size=17)
    dark = lum < med_lum - 0.035
    greyish = (r - b) < med_warm - 0.035
    defects = (blue & ~keep) | ((dark | greyish) & ~keep & ~eyes)
    defects &= skin_area
    defects = ndimage.binary_dilation(defects, iterations=2) & skin_area & ~keep

    # Fill from clean surrounding skin (two scales so large smudges fill too).
    source = skin_area & ~defects & ~keep & ~eyes & warm
    fill_s, w_s = normconv(a, source, 4)
    fill_l, _ = normconv(a, source, 14)
    fill = np.where((w_s > 0.05)[..., None], fill_s, fill_l)
    grain = np.random.default_rng(3).normal(0, 0.006, a.shape).astype(np.float32)
    soft = blur(defects.astype(np.float32), 1.2)[..., None]
    out = a * (1 - soft) + (fill + grain) * soft

    # Gentle overall evening of the plastic skin (eyes, lips, brows untouched).
    smooth_zone = skin_area & ~ndimage.binary_dilation(keep | eyes, iterations=3)
    even, _ = normconv(out, smooth_zone, 2.5)
    k = blur(ndimage.binary_erosion(smooth_zone, iterations=2).astype(np.float32), 2)[..., None] * 0.45
    return out * (1 - k) + even * k


def trim_ends(a: np.ndarray, alpha: np.ndarray, cuts, off, prot=None):
    """Even the bob's ends to a crisp blunt line.

    Each `cuts` line marks where the ends are (x-range and rough height). Per column the real end of
    the hair is found where the cut-out turns into backdrop; columns where the hair hangs over the
    neck ring / neck / stand have no such end nearby and are left alone. A smooth line is fitted
    through the ends and set at the shorter, majority length: strands below it are removed, small
    gaps and see-through tips just above it are filled from the hair above, so the edge reads full.
    Hair is never lengthened by more than a few pixels.
    """
    ox, oy = off
    hh, ww = alpha.shape
    rng = np.random.default_rng(7)
    solid_all = alpha > 0.5
    for cut_def in cuts:
        exact = isinstance(cut_def, dict)
        pts = cut_def['guide'] if exact else cut_def
        xs = np.array([p[0] - ox for p in pts], np.float32)
        ys = np.array([p[1] - oy for p in pts], np.float32)
        x0, x1 = max(0, int(xs.min())), min(ww - 1, int(xs.max()))
        if x1 - x0 < 10:
            continue
        cols = np.arange(x0, x1 + 1)
        approx = np.interp(cols, xs, ys)

        # 1. Real end of the hair in each column (first run of 6+ backdrop rows).
        ends = np.full(len(cols), np.nan, np.float32)
        for i, (x, ya) in enumerate(zip(cols, approx)):
            lo, hi = max(0, int(ya - 110)), min(hh, int(ya + 90))
            solid = solid_all[lo:hi, x]
            if solid.size < 60 or solid[:60].mean() < 0.5:
                continue  # not a hair column (no hair in the upper part of the window)
            gap = np.convolve(~solid, np.ones(6), 'valid') >= 6
            # No gap in the window: strands (or hair over the ring) run past it.
            ends[i] = lo + int(np.argmax(gap)) if gap.any() else hi
            if prot is not None and prot[min(int(ends[i]), hh - 1), x]:
                ends[i] = np.nan  # hair ends over the neck ring / stand: not a real end
        ok = ~np.isnan(ends)
        window_bottom = np.minimum(hh, (approx + 90).astype(int))
        fit_ok = ok & (ends < window_bottom)
        if exact:
            target = approx.astype(np.float32).copy()
        else:
            if fit_ok.sum() < 12:
                continue
            # 2. Smooth line through the ends, raised to the shorter / majority length.
            cx, cy = cols[fit_ok].astype(np.float32), ends[fit_ok]
            cy_med = ndimage.median_filter(cy, size=min(31, len(cy) // 2 * 2 + 1))
            deg = 2 if len(cx) > 40 else 1
            sel = np.ones(len(cx), bool)
            for _ in range(3):
                coef = np.polyfit(cx[sel], cy_med[sel], deg)
                sel = np.abs(np.polyval(coef, cx) - cy_med) < 12
                if sel.sum() < deg + 3:
                    sel[:] = True
                    break
            resid = cy - np.polyval(coef, cx)
            lift = min(0.0, float(np.percentile(resid, 30)))
            target = np.polyval(coef, cols.astype(np.float32)) + lift - 1.0
        target += ndimage.gaussian_filter1d(rng.normal(0, 1.3, len(cols)), 1.2)  # natural edge

        # 3. Apply per column.
        reach = ends >= target - 3  # columns whose hair reaches the line
        for i, x in enumerate(cols):
            t = float(target[i])
            ti = int(round(t))
            if ti <= 30 or ti >= hh - 2:
                continue
            col = alpha[:, x]
            if ok[i]:
                end = int(ends[i])
                short = t - end
                nb = reach[max(0, i - 35):i + 36]
                local_notch = nb.mean() > 0.55
                dense_above = col[max(0, end - 60):max(1, end - 8)].mean() > 0.7
                if dense_above and (short <= 14 or (short <= 40 and local_notch)):
                    # Copy only from solid hair rows just above the real end.
                    lo_src = max(0, min(ti, end) - 64)
                    src_rows = [r for r in range(lo_src, max(lo_src + 1, min(ti, end) - 4)) if col[r] > 0.92]
                    if len(src_rows) >= 6:
                        src_rows = src_rows[-16:]
                        for k, y in enumerate(range(min(ti - 24, end - 4), ti + 1)):
                            if col[y] < 0.88:
                                a[y, x] = a[src_rows[k % len(src_rows)], x]
                                col[y] = 0.97
            # Remove everything below the line - however faint - down to the next solid object
            # that starts after a gap (neck ring, neck, stand), or the end of the work window.
            stop = min(hh, int(approx[i] + 200))
            seg = col[ti:stop]
            limit = len(seg)
            seen_gap = False
            for k in range(len(seg) - 8):
                if seg[k] < 0.3:
                    seen_gap = True
                elif seen_gap and (seg[k:k + 8] > 0.8).all():
                    limit = max(0, k - 2)
                    break
            span = np.arange(max(0, ti - 1), ti + limit)
            col[span] *= np.clip((t + 1.0 - span) / 2.0, 0, 1)
            alpha[:, x] = col

        # 4. Close narrow vertical splits between strands along the bottom band, filling them
        #    from the hair on either side, so the cut edge reads as one solid line.
        band = np.zeros_like(alpha, bool)
        for i, x in enumerate(cols):
            if ok[i]:
                ti = int(round(target[i]))
                band[max(0, ti - 80):max(0, ti - 1), x] = True
        if band.any():
            closed = ndimage.grey_closing(alpha, size=(1, 9))
            holes = band & (closed - alpha > 0.25)
            if holes.any():
                w = ndimage.gaussian_filter1d(alpha, 3, axis=1)
                fillc = np.stack([ndimage.gaussian_filter1d(a[..., c] * alpha, 3, axis=1) for c in range(3)], -1)
                fillc /= w[..., None] + 1e-6
                a[holes] = fillc[holes]
                alpha[holes] = closed[holes]
    return a, alpha


def drop_specks(alpha: np.ndarray) -> np.ndarray:
    """Remove small detached bits (trimmed strand fragments) that are not part of the subject."""
    solid = alpha > 0.2
    lab, n = ndimage.label(solid)
    if n < 2:
        return alpha
    sizes = ndimage.sum(solid, lab, range(1, n + 1))
    small = np.isin(lab, [i + 1 for i, sz in enumerate(sizes) if sz < solid.size * 0.003])
    return np.where(ndimage.binary_dilation(small, iterations=2) & ~ndimage.binary_dilation(solid & ~small, iterations=1), 0, alpha)


def process(img: Image.Image, source: str = '', box=(0, 0, 0, 0)) -> Image.Image:
    a = np.asarray(img.convert('RGB')).astype(np.float32) / 255.0
    hh, ww = a.shape[:2]
    alpha = subject_alpha(a)

    spec = RETOUCH.get(source, {})
    if 'face' in spec:
        a = clean_face(a, alpha, spec['face'], box[:2])
    if 'cuts' in spec:
        prot = None
        if spec.get('protect'):
            mask_img = Image.new('L', (ww, hh), 0)
            draw = ImageDraw.Draw(mask_img)
            for poly in spec['protect']:
                draw.polygon([(x - box[0], y - box[1]) for x, y in poly], fill=255)
            prot = np.asarray(mask_img) > 0
        a0, alpha0 = a.copy(), alpha.copy()
        a, alpha = trim_ends(a.copy(), alpha.copy(), spec['cuts'], box[:2], prot)
        if prot is not None:
            a[prot], alpha[prot] = a0[prot], alpha0[prot]
        alpha = drop_specks(alpha)

    # Subject: despill + warm, richer colour + gentle contrast.
    fg = despill(a)
    grey = (fg @ LUMA)[..., None]
    fg = grey + (fg - grey) * 1.14
    fg = fg * np.array([1.03, 1.0, 0.965], dtype=np.float32)
    fg = np.clip(fg, 0, 1)
    fg = fg + 0.10 * (fg - 0.5) * (1 - np.abs(2 * fg - 1))

    # Backdrop with a soft contact shadow cast down-right of the subject.
    bg = studio_backdrop(hh, ww)
    shadow = blur(np.roll(alpha, (int(hh * 0.012), int(ww * 0.012)), axis=(0, 1)), 22)
    bg = bg * (1 - 0.16 * shadow[..., None])

    out = fg * alpha[..., None] + bg * (1 - alpha[..., None])
    res = Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8))
    return res.filter(ImageFilter.UnsharpMask(radius=1.3, percent=50, threshold=3))


def export(img: Image.Image, name: str, widths=(960, 480)):
    for w in widths:
        hgt = round(img.height * w / img.width)
        img.resize((w, hgt), Image.LANCZOS).save(OUT / f'{name}-{w}.webp', 'WEBP', quality=84, method=6)


if __name__ == '__main__':
    for name, (file, box) in SHOTS.items():
        export(process(Image.open(SRC / file).crop(box), file, box), name)
        print('done', name)

    file, box = HERO
    export(process(Image.open(SRC / file).crop(box), file, box), 'hero-bob', widths=(900, 600))
    print('done hero')

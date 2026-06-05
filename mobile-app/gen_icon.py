#!/usr/bin/env python3
"""PoliTest / 프리즘 앱 아이콘 생성기 — 프리즘 분광(스펙트럼) 디자인."""
import math
from PIL import Image, ImageDraw

SS = 4  # supersampling

NAVY_TOP = (26, 26, 46)      # #1A1A2E
NAVY_BOT = (22, 33, 62)      # #16213E

# 무지개 스펙트럼 (브랜드 퍼플/마젠타 포함)
SPECTRUM = [
    (255, 59, 107),   # 핑크레드
    (255, 140, 66),   # 오렌지
    (255, 210, 63),   # 옐로
    (63, 217, 122),   # 그린
    (47, 166, 255),   # 블루
    (123, 47, 247),   # 바이올렛
]


def lerp(a, b, t):
    return a + (b - a) * t


def lerp_color(c1, c2, t):
    return tuple(int(round(lerp(c1[i], c2[i], t))) for i in range(3))


def rainbow(t):
    t = max(0.0, min(1.0, t))
    n = len(SPECTRUM) - 1
    f = t * n
    i = min(int(f), n - 1)
    return lerp_color(SPECTRUM[i], SPECTRUM[i + 1], f - i)


def draw_art(d, ox, oy, s, on_dark):
    """content box: 좌상단(ox,oy), 한 변 s. 프리즘+스펙트럼 그리기."""
    def P(x, y):
        return (ox + x * s, oy + y * s)

    # 프리즘 삼각형 꼭짓점
    top = (0.50, 0.22)
    bl = (0.27, 0.73)
    br = (0.73, 0.73)

    # 입사 백색광 굴절점(좌측면 ~40%)
    ent = (lerp(top[0], bl[0], 0.40), lerp(top[1], bl[1], 0.40))
    # 출사점(우측면 ~55%)
    ext = (lerp(top[0], br[0], 0.55), lerp(top[1], br[1], 0.55))

    lw = max(2, int(s * 0.018))

    # 1) 입사 백색광 (왼쪽 → 굴절점)
    glow = (255, 255, 255)
    d.line([P(0.0, 0.40), P(*ent)], fill=glow, width=int(lw * 1.4))
    # 프리즘 내부 경로
    d.line([P(*ent), P(*ext)], fill=glow, width=int(lw * 1.2))

    # 2) 출사 스펙트럼 부채꼴
    y_top, y_bot = 0.405, 0.815
    end_x = 1.04
    steps = 90
    for k in range(steps):
        t = k / (steps - 1)
        ey = lerp(y_top, y_bot, t)
        col = rainbow(t)
        d.line([P(*ext), P(end_x, ey)], fill=col, width=int(lw * 1.5))

    # 3) 프리즘 본체 (반투명 위에 다시 그려 빛이 통과하는 느낌)
    tri = [P(*top), P(*bl), P(*br)]
    face = (255, 255, 255, 46) if on_dark else (26, 26, 46, 30)
    d.polygon(tri, fill=face)
    edge = (255, 255, 255) if on_dark else (40, 40, 70)
    d.line(tri + [tri[0]], fill=edge, width=int(lw * 1.3), joint="curve")

    # 입사광 굴절점 하이라이트
    r = lw * 1.1
    cx, cy = P(*ext)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 255, 255))


def make(size, kind):
    """kind: 'legacy' | 'round' | 'foreground'"""
    big = size * SS
    img = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    d = ImageDraw.Draw(img, "RGBA")

    on_dark = kind != "foreground"

    # 배경
    if kind in ("legacy", "round"):
        for y in range(big):
            t = y / big
            col = lerp_color(NAVY_TOP, NAVY_BOT, t)
            d.line([(0, y), (big, y)], fill=col + (255,))
        mask = Image.new("L", (big, big), 0)
        md = ImageDraw.Draw(mask)
        if kind == "round":
            md.ellipse([0, 0, big, big], fill=255)
        else:
            rad = int(big * 0.18)
            md.rounded_rectangle([0, 0, big, big], radius=rad, fill=255)
        img.putalpha(mask)

    # 콘텐츠 박스
    if kind == "foreground":
        # 어댑티브 안전영역: 중앙 ~66%
        margin = 0.17
    else:
        margin = 0.13
    ox = big * margin
    box = big * (1 - 2 * margin)
    draw_art(d, ox, ox, box, on_dark)

    img = img.resize((size, size), Image.LANCZOS)
    return img


DENS = {
    "mdpi": (48, 108),
    "hdpi": (72, 162),
    "xhdpi": (96, 216),
    "xxhdpi": (144, 324),
    "xxxhdpi": (192, 432),
}

import os
base = os.path.dirname(os.path.abspath(__file__))
res = os.path.join(base, "android/app/src/main/res")

for dens, (lsz, fsz) in DENS.items():
    folder = os.path.join(res, f"mipmap-{dens}")
    make(lsz, "legacy").save(os.path.join(folder, "ic_launcher.png"))
    make(lsz, "round").save(os.path.join(folder, "ic_launcher_round.png"))
    make(fsz, "foreground").save(os.path.join(folder, "ic_launcher_foreground.png"))
    print(f"mipmap-{dens}: launcher {lsz} / fg {fsz} OK")

# 미리보기용 큰 이미지
make(432, "legacy").save(os.path.join(base, "icon_preview.png"))
print("preview saved")

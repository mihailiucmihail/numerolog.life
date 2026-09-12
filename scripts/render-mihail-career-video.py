from __future__ import annotations

import math
import subprocess
from pathlib import Path

import imageio_ffmpeg
from PIL import Image, ImageDraw, ImageFilter

WIDTH = 1080
HEIGHT = 1920
FPS = 30
DURATION = 10
BACKGROUND = (0, 255, 0)
OUTPUT = Path(__file__).resolve().parents[1] / "public" / "videos" / "mihail-career-1992-v1.mp4"

# Formula din raportul Cristalul Destinului:
# seed = int(DDMM) * YYYY = 510 * 1992 = 1,015,920
# magicDigits(seed) = [1, 0, 1, 5, 9, 2, 0]
CAREER_DIGITS = [1, 0, 1, 5, 9, 2, 0]
AGE_ANCHORS = [0, 10, 20, 30, 40, 50, 60, 70]
PLOT_AGES = [0] + [age + level for age, level in zip(AGE_ANCHORS[1:], CAREER_DIGITS)]
LEVELS = [0] + CAREER_DIGITS
CURRENT_AGE = 33.94

GOLD = (236, 194, 106)
PALE_GOLD = (255, 239, 193)
WHITE_GOLD = (255, 252, 235)


def ease_in_out(value: float) -> float:
    value = max(0.0, min(1.0, value))
    return value * value * (3.0 - 2.0 * value)


def point_for(plot_age: float, level: float) -> tuple[float, float]:
    x = 130 + (plot_age / 70.0) * 820
    y = 1390 - (level / 9.0) * 860
    return x, y


def catmull_rom(points: list[tuple[float, float]], samples: int = 36) -> list[tuple[float, float]]:
    curve: list[tuple[float, float]] = []
    extended = [points[0], *points, points[-1]]
    for index in range(1, len(extended) - 2):
        p0, p1, p2, p3 = extended[index - 1:index + 3]
        for step in range(samples):
            t = step / samples
            t2 = t * t
            t3 = t2 * t
            x = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3)
            y = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
            curve.append((x, y))
    curve.append(points[-1])
    return curve


def rgba(color: tuple[int, int, int], alpha: int) -> tuple[int, int, int, int]:
    return (*color, max(0, min(255, alpha)))


def composite_glow(base: Image.Image, points: list[tuple[float, float]], opacity: float) -> None:
    for width, blur, alpha in ((34, 30, 80), (18, 16, 115), (8, 7, 150)):
        layer = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
        draw = ImageDraw.Draw(layer)
        if len(points) > 1:
            draw.line(points, fill=rgba(GOLD, int(alpha * opacity)), width=width, joint="curve")
        layer = layer.filter(ImageFilter.GaussianBlur(blur))
        base.alpha_composite(layer)


def draw_ring(draw: ImageDraw.ImageDraw, center: tuple[float, float], radius: float, alpha: int, width: int = 3) -> None:
    x, y = center
    draw.ellipse((x - radius, y - radius, x + radius, y + radius), outline=rgba(PALE_GOLD, alpha), width=width)


def render_frame(frame_index: int, curve: list[tuple[float, float]], anchors: list[tuple[float, float]]) -> Image.Image:
    time = frame_index / FPS
    entrance = ease_in_out((time - 0.45) / 6.15)
    exit_alpha = 1.0 - ease_in_out((time - 9.25) / 0.65)
    opacity = exit_alpha
    visible_count = max(1, int(entrance * (len(curve) - 1)) + 1)
    visible_curve = curve[:visible_count]

    frame = Image.new("RGBA", (WIDTH, HEIGHT), (*BACKGROUND, 255))
    composite_glow(frame, visible_curve, opacity)
    draw = ImageDraw.Draw(frame)

    if len(visible_curve) > 1:
        draw.line(visible_curve, fill=rgba(GOLD, int(235 * opacity)), width=8, joint="curve")
        draw.line(visible_curve, fill=rgba(WHITE_GOLD, int(220 * opacity)), width=3, joint="curve")

    for index, anchor in enumerate(anchors):
        threshold = index / (len(anchors) - 1)
        local = (entrance - threshold) * 10
        if local <= 0:
            continue
        point_alpha = int(255 * opacity * min(1.0, local))
        pulse = 1.0 + 0.11 * math.sin(time * 3.1 + index * 0.85)
        radius = (7 if index not in (0, len(anchors) - 1) else 9) * pulse
        x, y = anchor
        draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=rgba(WHITE_GOLD, point_alpha))
        draw_ring(draw, anchor, radius + 8, int(105 * opacity * min(1.0, local)), 2)
        if 0 < local < 1.8:
            burst = 18 + local * 28
            draw_ring(draw, anchor, burst, int(150 * opacity * (1 - local / 1.8)), 3)

    if entrance > 0.995 and opacity > 0:
        travel = ((time - 6.6) / 2.25) % 1.0
        travel_index = min(len(curve) - 1, int(travel * (len(curve) - 1)))
        tx, ty = curve[travel_index]
        travel_layer = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
        travel_draw = ImageDraw.Draw(travel_layer)
        travel_draw.ellipse((tx - 28, ty - 28, tx + 28, ty + 28), fill=rgba(PALE_GOLD, int(135 * opacity)))
        travel_layer = travel_layer.filter(ImageFilter.GaussianBlur(16))
        frame.alpha_composite(travel_layer)
        draw = ImageDraw.Draw(frame)
        draw.ellipse((tx - 5, ty - 5, tx + 5, ty + 5), fill=rgba(WHITE_GOLD, int(255 * opacity)))

        current_index = min(range(len(curve)), key=lambda idx: abs(curve[idx][0] - point_for(CURRENT_AGE, 0)[0]))
        current = curve[current_index]
        current_radius = 21 + 4 * math.sin(time * 2.6)
        draw_ring(draw, current, current_radius, int(220 * opacity), 4)
        draw_ring(draw, current, current_radius + 14, int(80 * opacity), 2)

    return frame.convert("RGB")


def main() -> None:
    expected_seed = int("0510") * 1992
    assert expected_seed == 1_015_920
    assert list(map(int, str(expected_seed))) == CAREER_DIGITS
    assert PLOT_AGES == [0, 11, 20, 31, 45, 59, 62, 70]

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    anchors = [point_for(plot_age, level) for plot_age, level in zip(PLOT_AGES, LEVELS)]
    curve = catmull_rom(anchors)
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    command = [
        ffmpeg, "-y", "-f", "rawvideo", "-vcodec", "rawvideo", "-pix_fmt", "rgb24",
        "-s", f"{WIDTH}x{HEIGHT}", "-r", str(FPS), "-i", "-", "-an",
        "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p",
        "-movflags", "+faststart", str(OUTPUT),
    ]
    process = subprocess.Popen(command, stdin=subprocess.PIPE)
    assert process.stdin is not None
    for frame_index in range(FPS * DURATION):
        process.stdin.write(render_frame(frame_index, curve, anchors).tobytes())
    process.stdin.close()
    if process.wait() != 0:
        raise RuntimeError("Randarea ffmpeg a eșuat")
    print(f"Creat: {OUTPUT}")
    print(f"Date autentice: seed={expected_seed}, digits={CAREER_DIGITS}, plot_ages={PLOT_AGES}")


if __name__ == "__main__":
    main()

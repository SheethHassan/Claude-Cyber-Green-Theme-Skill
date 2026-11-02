"""WCAG contrast check for Cyber Green: text over the brightest rain glyph, bare and under a panel.

Run:  python contrast.py
Edit the colours below to match the project, then re-run after ANY change to a text colour or to
RAIN_OPACITY. Every ratio must be >= 4.5 (text). Bare text on the rain is the tight one.
"""

STAGE = '#020805'
RAIN_HEAD = '#CFFFE0'   # the brightest thing that can pass behind text
RAIN_OPACITY = 0.28     # the canvas layer's opacity; 0.30 failed (error red 4.40)
PANEL = '#031208'       # a dense panel's colour
PANEL_ALPHA = 0.84

TEXT = {
    'body':    '#E8FFF2',
    'muted':   '#B5D1C2',
    'link':    '#7DFFB3',
    'success': '#A5F3FC',
    'warning': '#FCD083',
    'error':   '#FCA5A5',
}


def rgb(hex_colour):
    h = hex_colour.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def luminance(c):
    def lin(v):
        v /= 255
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = (lin(v) for v in c)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def ratio(a, b):
    la, lb = luminance(a), luminance(b)
    if la < lb:
        la, lb = lb, la
    return (la + 0.05) / (lb + 0.05)


def mix(top, bottom, alpha):
    return tuple(top[i] * alpha + bottom[i] * (1 - alpha) for i in range(3))


bare = mix(rgb(RAIN_HEAD), rgb(STAGE), RAIN_OPACITY)
panel = mix(rgb(PANEL), bare, PANEL_ALPHA)

print(f'rain head {RAIN_HEAD} at {RAIN_OPACITY:.0%} over {STAGE}')
failed = False
for name, colour in TEXT.items():
    on_bare = ratio(rgb(colour), bare)
    on_panel = ratio(rgb(colour), panel)
    flag = '' if on_bare >= 4.5 else '   <-- FAILS on bare rain'
    failed = failed or on_bare < 4.5 or on_panel < 4.5
    print(f'{name:8} {colour}  bare {on_bare:5.2f}  panel {on_panel:5.2f}{flag}')
print('PASS' if not failed else 'FAIL: lower RAIN_OPACITY or lighten the weakest text colour')

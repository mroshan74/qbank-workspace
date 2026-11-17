# QFoundry palette: contrast

Computed with the WCAG 2.1 relative-luminance formula by the build script. Text needs 4.5:1; graphics and large text need 3:1.

| Pair | Foreground | Background | Ratio | Needs | Result |
|---|---|---|---|---|---|
| White on Indigo 800 (--cta) | `#ffffff` | `#432dd7` | 8.09:1 | 4.5:1 | pass |
| Indigo 800 on white (links, primary text) | `#432dd7` | `#ffffff` | 8.09:1 | 4.5:1 | pass |
| Indigo 600 on white (qualifier, hover) | `#5f57ee` | `#ffffff` | 5.14:1 | 4.5:1 | pass |
| White on Indigo 600 (dark-mode --cta) | `#ffffff` | `#5f57ee` | 5.14:1 | 4.5:1 | pass |
| Ink on white (body text) | `#1B1446` | `#ffffff` | 17.00:1 | 4.5:1 | pass |
| Muted on white (secondary text) | `#5A5878` | `#ffffff` | 6.77:1 | 4.5:1 | pass |
| Indigo 400 on navy (dark-mode links) | `#9b9cff` | `#121e28` | 6.92:1 | 4.5:1 | pass |
| Lilac on Indigo 800 (qualifier, reversed) | `#CBC8FF` | `#432dd7` | 5.10:1 | 4.5:1 | pass |
| Molten on white (mark drop, graphics only) | `#F2551B` | `#ffffff` | 3.45:1 | 3:1 | pass |
| Molten 700 on white (accent text) | `#C2410C` | `#ffffff` | 5.18:1 | 4.5:1 | pass |
| Molten light on Indigo 800 (reversed drop) | `#FF8A50` | `#432dd7` | 3.47:1 | 3:1 | pass |
| Molten on navy (drop on dark) | `#F2551B` | `#121e28` | 4.90:1 | 3:1 | pass |
| Molten on ink (Writer icon drop) | `#F2551B` | `#1B1446` | 4.93:1 | 3:1 | pass |
| White on navy | `#ffffff` | `#121e28` | 16.91:1 | 4.5:1 | pass |
| Success #15803D on white | `#15803D` | `#ffffff` | 5.02:1 | 4.5:1 | pass |
| Warning #B45309 on white | `#B45309` | `#ffffff` | 5.02:1 | 4.5:1 | pass |
| Danger #DC2626 on white | `#DC2626` | `#ffffff` | 4.83:1 | 4.5:1 | pass |
| Info #2563EB on white | `#2563EB` | `#ffffff` | 5.17:1 | 4.5:1 | pass |
| Success #4ADE80 on navy | `#4ADE80` | `#121e28` | 9.70:1 | 4.5:1 | pass |
| Warning #FBBF24 on navy | `#FBBF24` | `#121e28` | 10.13:1 | 4.5:1 | pass |
| Danger #F87171 on navy | `#F87171` | `#121e28` | 6.11:1 | 4.5:1 | pass |
| Info #60A5FA on navy | `#60A5FA` | `#121e28` | 6.65:1 | 4.5:1 | pass |

Not used on purpose: Indigo 800 on navy is 2.09:1, which is why the mark turns white on every dark ground.

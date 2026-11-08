# AXIOMI

Arcade experimental en pixel art: **giras el mundo** para mover a una pequeña criatura de luz por un pozo oscuro sin fondo. Al girar no solo cambia la gravedad: cada orientación es un **axioma** con sus propias reglas, colores y música.

**Jugar:** https://ricardious.github.io/axiomi/

## Controles

| Acción | Teclado | Ratón / táctil |
|---|---|---|
| Girar el mundo | `←` `→` o `A` `D` | arrastrar a los lados |
| Saltar | `Espacio`, `↑` o `W` | toque |
| Sonido on/off | `M` | — |

## Los cuatro axiomas

El ángulo del mundo decide qué axioma está activo. **Solo los bloques del color del axioma son sólidos**; los demás se vuelven fantasmas.

| Orientación | Axioma | Regla |
|---|---|---|
| Normal (0°) | **FLUJO** (cian) | lo cian es sólido |
| Inclinado a la derecha (90°) | **PULSO** (magenta) | lo magenta es sólido; salto fuerte |
| Boca abajo (180°) | **BRASA** (ámbar) | lo ámbar es sólido; las lámparas recargan tu luz |
| Inclinado a la izquierda (270°) | **RAÍZ** (verde) | lo verde es sólido; el tiempo se frena, pero la luz se gasta más |

El truco: inclinar el mundo justo más allá de 45° hace desaparecer un suelo de color mientras la gravedad todavía apunta hacia abajo.

## Cómo se juega

- **Desciende** lo más hondo que puedas. Cada sala tiene una salida: un hueco, un tapón de color o un puente que solo existe en un axioma.
- **La Sombra** cae desde arriba y acelera con la profundidad.
- **Tu luz** se gasta sin parar, más al girar. Recógela en los cristales o en las lámparas (solo en BRASA).
- **Púas** rojas: tocarlas te apaga.

## Reglas del reto

- **≤ 32 KB:** el juego completo es un único `index.html` (~11 KB), que es exactamente lo que descarga el navegador. El build falla si se pasa del límite.
- **Código propio:** JavaScript puro con Canvas 2D y Web Audio. Sin librerías, frameworks ni motores.
- **Cero assets:** el pixel art, la iluminación, la fuente 3×5, los efectos y la música generativa se crean con código.

## Desarrollo

```bash
npm install      # solo instala terser (minificador, en build)
npm run build    # src/ → minifica → empaqueta → index.html (y comprueba el límite de 32 KB)
```

El código fuente legible está en `src/game.js`. `index.html` en la raíz es el build que se publica en GitHub Pages; `pack.mjs` es el compresor LZ77 propio con el que se empaqueta.

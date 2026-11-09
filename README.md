# AXIOMI

Arcade experimental en pixel art: **giras el mundo** para mover a una pequeña criatura de luz por cuevas oscuras sin fondo: pozos, túneles horizontales, cámaras y cuevas laterales. Girar el mundo cambia hacia dónde cae la gravedad; tocar un **cristal** tiñe tu luz de su color y te deja atravesar las barreras de ese color.

**Jugar:** https://ricardious.github.io/axiomi/

El juego se ve dentro de un monitor CRT retro sobre un escritorio de noche (todo dibujado con código).

## Controles

| Acción | Teclado | Ratón / táctil |
|---|---|---|
| Girar el mundo (gravedad) | `←` `→` o `A` `D` | arrastrar a los lados |
| Saltar | `Espacio`, `↑` o `W` | toque |
| Sonido on/off | `M` | — |
| Marco de la PC on/off | `F` | — (en pantallas verticales se juega sin marco) |

## Cristales y barreras de color

Funcionan como **llave y puerta**: toca un cristal y tu luz toma su color. **Las barreras e islas de tu color se vuelven fantasma** y las atraviesas; las de los otros colores son sólidas. Cada barrera tiene su cristal justo antes, en el camino. Cada color da además un efecto:

| Color | Efecto |
|---|---|
| **CIAN** | ninguno (con él empiezas) |
| **ROSA** | salto fuerte |
| **ÁMBAR** | gastas menos luz |
| **VERDE** | el tiempo se frena |

## Biomas

Cada ~70 m el pozo cambia de escenario:

| Bioma | Cómo es |
|---|---|
| **GRUTAS** | túneles y cámaras de roca con hierba y raíces |
| **BOSQUE HONGO** | cavernas abiertas con hongos gigantes que sirven de plataforma, esporas y lianas |
| **GEODA** | cámaras de paredes facetadas con cristales que brotan de los muros |
| **ABISMO** | un vacío enorme con islas flotantes (algunas de color) por el que caes |

## Cómo se juega

- **Sigue las chispas y la flecha**: marcan el camino.
- **Desciende** lo más hondo que puedas. El camino baja por pozos y corre por túneles hacia los lados: inclina el mundo para que la gravedad te lleve por ellos.
- **Barreras de color** cierran el paso: toca el cristal de su color para abrirlas.
- **Cuevas laterales** sin salida guardan semillas y lámparas.
- **La Sombra** cae desde arriba y acelera con la profundidad.
- **Tu luz** se gasta sin parar, más al girar. Recógela en los cristales o en las lámparas.
- **Púas** rojas: tocarlas te apaga.

## Reglas del reto

- **≤ 32 KB:** el juego completo es un único `index.html` (~15 KB), que es exactamente lo que descarga el navegador. El build falla si se pasa del límite.
- **Código propio:** JavaScript puro con Canvas 2D y Web Audio. Sin librerías, frameworks ni motores.
- **Cero assets:** el pixel art (cuevas, criatura, flora), la luz tramada, la tipografía vectorial, los efectos y la música generativa se crean con código.

## Desarrollo

```bash
npm install      # solo instala terser (minificador, en build)
npm run build    # src/ → minifica → empaqueta → index.html (y comprueba el límite de 32 KB)
```

El código fuente legible está en `src/game.js`. `index.html` en la raíz es el build que se publica en GitHub Pages; `pack.mjs` es el compresor LZ77 propio con el que se empaqueta.

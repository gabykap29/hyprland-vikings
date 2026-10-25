# Escenas

Una escena es una visualización completa del fondo de escritorio. El panel de
configuración lista todas las que estén en `Registry.js`.

## Agregar una escena

1. Creá `scenes/<id>/` con tus renderers (JS con `.pragma library`, dibujando en un
   `Canvas 2D` de baja resolución que Quickshell escala con píxeles nítidos).
2. Exportá un objeto `scene` desde `scenes/<id>/Scene.js` con esta forma:

```js
var scene = {
  id: "miEscena",                       // único, sin espacios
  name: "Nombre visible",
  description: "Una línea para la tarjeta del panel.",
  swatches: ["#0e1e30", "#4ecdc4"],     // colores de la vista previa en la tarjeta
  geometry: { pw: 384, ph: 216, groundY: 158, waterY: 168 },
  supports: {
    timeOfDay: true,                    // false = la escena ignora la hora del día
    effects: ["aurora", "stars"]        // toggles que el panel muestra para esta escena
  },
  createState: function(pw, ph) { return {} },
  step: function(sim, weather, geometry, env) { /* un tick de simulación (24/s) */ },
  renderBackdrop: function(ctx, geometry, env) { /* parte estática */ },
  renderDynamic: function(ctx, sim, weather, geometry, env) { /* parte animada */ },
  lightning: function(sim, x) { /* opcional: reacción al clic / tormenta */ }
}
```

3. Agregala a la lista en `Registry.js`:

```js
.import "miEscena/Scene.js" as MiEscena
var SCENES = [Valhalla.scene, MiEscena.scene]
```

## Qué recibe tu escena

* `env.tod`: `"night" | "dawn" | "day" | "dusk"` (ya resuelto, también en modo automático).
* `env.effects`: los toggles e intensidades del usuario (`aurora`, `lightning`, `ravens`,
  `vikings`, `stars`, `fire`, `arrows`, `wildlife`, `auroraStrength`, `precipitation`). Respetalos si tu escena los usa;
  `supports.effects` define cuáles muestra el panel para tu escena.
* `weather`: clima ya escalado por la intensidad de lluvia/nieve del usuario y con
  `thunderFrequency` en 0 si los relámpagos están apagados.

La escena `valhalla/` es la referencia: `Palettes.js` muestra cómo variar colores por hora.

## Piezas compartidas

* `shared/Atmosphere.js`: estrellas, aurora, rayos, lluvia con salpicaduras, nieve y niebla.
  La escena `battle/` lo usa; la de `valhalla/` todavía trae su propia copia.
* `valhalla/BackdropRenderer.js` exporta `drawSky`, `drawMountains` y `drawForest`, que reutiliza `battle/`.
* `battle/` es un buen ejemplo de una escena con simulación propia (combate, flechas, cuervos).
* `voyage/` reutiliza el drakkar de Valhalla (`drawDrakkar(ctx, t, { sy, oarSwing, noOars })`) con `ctx.translate/scale`. Hoy se ve lejano (1x); subir `SHIP.scale` en `voyage/Layout.js` lo acerca.

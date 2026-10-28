# ᛟ Hyprland Viking — Escritorio Pixel Art Nórdico Configurable

Live Wallpaper **16-bit Pixel Art** en tiempo real inspirado en **Assassin's Creed Valhalla** para **Hyprland**, hecho con **Quickshell** (funciona en cualquier distro, sin Omarchy). Incluye un **panel de configuración**: elegí la visualización, el clima, la hora del día, los efectos y tu ciudad. Opcionalmente, pantalla de bloqueo (hyprlock) y fastfetch a juego.

## 📋 Requisitos

* [Hyprland](https://hyprland.org)
* [Quickshell](https://quickshell.org) (comando `qs`). **CachyOS / Arch**: `sudo pacman -S quickshell` · Nix: `nixpkgs#quickshell` · otras distros: [compilarlo](https://quickshell.org/docs/guide/install-setup/) (en Debian Trixie funciona compilándolo con `-DCRASH_HANDLER=OFF -DINSTALL_QML_PREFIX=lib/qt6/qml`, y necesita `qt6-declarative-private-dev`, `qt6-shadertools-dev`, `libjemalloc-dev` y `libcli11-dev`).
* Fuente **Noto Sans Runic** (para las runas): CachyOS/Arch `noto-fonts` · Debian/Ubuntu `fonts-noto-core`.
* Opcionales: `hyprlock`, `fastfetch`, `curl` y `python3` (clima real).

---

## 📸 Vista Previa

![Valhalla Pixel World](assets/screenshots/pixel-viking-world.png)

---

## ⚙️ Panel de Configuración

Abrilo desde la terminal (o asignale un atajo en tu `hyprland.conf`):

```bash
hyprland-viking-ctl settings
# atajo de ejemplo: bind = SUPER ALT, V, exec, hyprland-viking-ctl settings
```

`Esc` o clic fuera del panel lo cierra. Los cambios se aplican al instante y se guardan en `~/.config/hyprland-viking/config.json` (el instalador nunca lo pisa).

| Sección | Qué configura |
|---|---|
| **Visualización** | Escena activa: *Valhalla · Fiordo del Cuervo* (por defecto), *Batalla · Clan del Cuervo vs Sajones* o *Travesía · Drakkar en alta mar*. Se agregan más sin tocar el motor, ver [`scenes/README.md`](quickshell/hyprland-viking/scenes/README.md). |
| **Clima y ciudad** | Modo manual (despejado / lluvia / tormenta / nieve) o automático, y tu ciudad. |
| **Hora del día** | Automático (según la hora real), noche, amanecer, día o atardecer. |
| **Efectos** | Los de la escena activa: aurora, relámpagos, cuervos, vikingos, estrellas, incendios, flechas y fauna marina; intensidad de la aurora y de lluvia/nieve. |
| **Rendimiento** | 8 / 12 / 24 fps (la velocidad de la animación no cambia) y apagar el fondo. |

Todo también se puede cambiar desde la CLI:

```bash
hyprland-viking-ctl scene valhalla
hyprland-viking-ctl city "Buenos Aires"
hyprland-viking-ctl time dusk            # auto | night | dawn | day | dusk
hyprland-viking-ctl preset storm         # rain | storm | snow | clear
hyprland-viking-ctl toggle
```

### Ejemplo de `config.json`

```json
{
  "scene": "valhalla",
  "performance": { "fps": 24 },
  "timeOfDay": { "mode": "auto" },
  "weather": { "mode": "manual", "condition": "rain", "city": "Buenos Aires" },
  "effects": { "aurora": true, "lightning": true, "ravens": true, "vikings": true, "stars": true,
               "auroraStrength": 1.0, "precipitation": 1.0 }
}
```

Los valores inválidos se corrigen solos al cargar, así que editar el archivo a mano nunca rompe el fondo.

---

## ⚔️ Escena de Batalla

Elegila en **Visualización**. Nórdicos del **Clan del Cuervo** (escudos azul noche con el cuervo en blanco hueso, ribete turquesa y boss dorado) contra sajones (escudos rojos y ocres), frente a una empalizada en llamas y un drakkar varado en la costa.

* Cada guerrero elige al enemigo más cercano, se acerca, ataca (preparar, golpear, recuperar), bloquea con el escudo, recibe daño y cae. Los campeones (el jefe nórdico con casco de cuernos y el *thegn* sajón) se buscan entre sí y muestran su barra de vida al ser heridos.
* Los arqueros disparan flechas en arco; algunas hieren, otras se clavan en el suelo. De noche, algunos sajones lanzan flechas incendiarias.
* Llegan refuerzos por la playa y por la puerta rota, así que la batalla nunca termina; los caídos quedan en el campo y los cuervos de Odín bajan a posarse sobre ellos.
* **Clic en el escritorio**: un rayo de Thor cae donde hagas clic. Abate a los sajones cercanos y los nórdicos lo celebran con una runa.
* Respeta la hora del día, el clima (lluvia, nieve, niebla, tormenta) y los efectos del panel (relámpagos, cuervos, incendios, flechas).

---

## ⛵ Escena de Travesía

El drakkar del Clan del Cuervo surca el mar abierto, visto desde lejos: la tripulación boga al unísono, el timonel gobierna con su remo y el vigía sopla el cuerno cuando avista algo.

* **Oleaje en paralaje**: el mar se desliza más rápido cuanto más cerca, con estela y espuma de proa. El cabeceo del barco crece con el viento y la lluvia.
* **Eventos**: una ballena emerge a lo lejos, lanza su chorro y se sumerge; pasan islas con una baliza encendida. La tripulación reacciona con runas.
* **Cielo cambiante** (noche, amanecer, día, atardecer) con la luna o el sol reflejados en el agua, gaviotas de día y los cuervos de Odín. Un cuervo vigila desde el mástil y se va volando cuando cae un rayo.
* **Clic en el escritorio**: cae un rayo de Thor en el mar; si cae cerca del barco, la tripulación lo celebra.

---

## 🏗️ Arquitectura

```text
hyprland-viking/
├── install.sh                         # Instalador (--world, --hyprlock, --fastfetch, --looknfeel)
├── assets/
│   ├── backgrounds/                   # Wallpapers estáticos y en video
│   └── screenshots/
├── scripts/
│   ├── backup.sh                      # Respaldo de la configuración previa
│   ├── uninstall.sh                   # Desinstalación y restauración
│   └── weather-api-sync.sh            # Conector de clima real con Open-Meteo API
├── hypr/                              # hyprlock.conf y looknfeel.lua (bordes dorados/turquesa)
├── fastfetch/                         # Arte ASCII del Clan del Cuervo
└── quickshell/hyprland-viking/        # Live Wallpaper configurable (se carga con `qs -c hyprland-viking`)
    ├── shell.qml                      # Punto de entrada de Quickshell
    ├── Service.qml                    # Orquestador: config, escena activa, IPC, capas Wayland
    ├── hyprland-viking-ctl            # CLI sobre el IPC (settings, preset, scene, city, time...)
    ├── config/                        # Valores por defecto, validación y persistencia
    ├── core/                          # Clima (WeatherController.js) y hora del día (TimeOfDay.js)
    ├── scenes/                        # valhalla/, battle/, voyage/ + Registry.js (ver scenes/README.md)
    └── ui/                            # Panel de configuración (QML) y sus controles
```

---

## 🚀 Instalación

```bash
git clone <url-del-repo> hyprland-viking && cd hyprland-viking
./install.sh
```

Instala el wallpaper, hyprlock y fastfetch (con respaldo previo). Después agregá a tu `hyprland.conf`:

```ini
exec-once = qs -c hyprland-viking
```

Asegurate de tener `~/.local/bin` en tu `PATH` para usar `hyprland-viking-ctl`.

### Módulos individuales
```bash
./install.sh --world       # Solo el Live Wallpaper y su panel (requiere Quickshell)
./install.sh --hyprlock    # Solo la pantalla de bloqueo y los fondos
./install.sh --fastfetch   # Solo fastfetch
./install.sh --looknfeel   # Copia ~/.config/hypr/viking-looknfeel.lua (opcional)
```

`looknfeel.lua` usa la configuración Lua de Hyprland y no se activa solo: incluilo desde tu configuración (por ejemplo `require("viking-looknfeel")`).

### Desinstalar
```bash
./install.sh --uninstall
```

---

## 🌦️ Clima y Ciudad

El clima tiene dos modos (sección **Clima y ciudad** del panel):

* **Manual**: elegís despejado, lluvia, tormenta o nieve. También con `hyprland-viking-ctl preset <rain|storm|snow|clear>`.
* **Automático**: el clima lo define un proveedor externo que escribe en `~/.config/hyprland-viking/weather.json` (el plugin lo vigila en vivo). **Todavía no hay un proveedor elegido**: la ciudad que ingreses se guarda y se muestra como ubicación, lista para cuando se conecte uno.

Mientras tanto podés usar el script de ejemplo [`scripts/weather-api-sync.sh`](scripts/weather-api-sync.sh), que consulta **Open-Meteo** (sin API key) por coordenadas y escribe ese archivo:

```bash
./scripts/weather-api-sync.sh -34.6037 -58.3816 "Buenos Aires"
```

Solo tiene efecto con el modo **Automático** activado. Podés ejecutarlo cada 15 minutos con un timer de usuario o cron.

---

## 📄 Licencia

El código se distribuye bajo la [Apache License 2.0](LICENSE).

Los fondos de `assets/backgrounds/` **no** están cubiertos por esa licencia: algunos están inspirados en *Assassin's Creed Valhalla* (© Ubisoft) y pertenecen a sus respectivos autores. *Assassin's Creed* y *Valhalla* son marcas de Ubisoft; este proyecto es un trabajo de fans, sin relación con Ubisoft.

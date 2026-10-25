# ᛟ Omarchy Valhalla — Norse Animus & 16-Bit Pixel Viking Desktop

Entorno completo de escritorio inspirado en **Assassin's Creed Valhalla** para **Omarchy + Hyprland**, diseñado con una **arquitectura modular** que incluye tema visual nórdico, barra HUD de brújula, menú con medallones rúnicos del *Elder Futhark* y un motor **Live Wallpaper 16-bit Pixel Art** en tiempo real preparado para conectarse con APIs meteorológicas reales.

---

## 📸 Vista Previa

### 1. Live Wallpaper 16-Bit Pixel Art (`gabriel.valhalla-world`) + HUD Bar
![Valhalla Pixel World](assets/screenshots/pixel-viking-world.png)

### 2. Menú con Medallones Rúnicos Elder Futhark (`gabriel.menu`)
![Valhalla Rune Menu](assets/screenshots/rune-menu.png)

### 3. Barra Superior HUD estilo Brújula (`gabriel.bar` + `gabriel.workspaces`)
![Valhalla HUD Bar](assets/screenshots/hud-bar.png)

---

## 🏗️ Arquitectura Modular

```text
omarchy-valhalla/
├── install.sh                         # Instalador modular por componentes (--all, --theme, --bar, --menu, --world, --configs)
├── README.md                          # Documentación general y guía de arquitectura
├── assets/
│   └── screenshots/                   # Capturas reales del entorno funcionando
├── scripts/
│   ├── backup.sh                      # Respaldo automático de la configuración previa
│   ├── uninstall.sh                   # Desinstalación limpia y restauración del backup
│   └── weather-api-sync.sh            # Conector de clima real con Open-Meteo API
└── modules/
    ├── theme/
    │   └── valhalla/                  # Paleta Raven Clan (Teal Aurora, Oro Animus, Pizarra Nórdica) y wallpapers
    ├── bar/
    │   ├── gabriel.bar/               # Barra HUD estilo AC Valhalla con cápsula central y diamantes dorados
    │   └── gabriel.workspaces/        # Espacios de trabajo nombrados según los Nueve Reinos (MIDGARD, ASGARD, etc.)
    ├── menu/
    │   └── gabriel.menu/              # Menú del sistema con medallones de runas vikingas y buscador nativo de Apps
    ├── world/
    │   └── gabriel.valhalla-world/    # Motor Live Wallpaper 16-Bit Pixel Art (WlrLayer.Background)
    │       ├── manifest.json          # Metadatos del plugin de servicio Quickshell
    │       ├── Service.qml            # Orquestador QML Wayland + IPC + FileView reactivo
    │       ├── weather.json           # Estado meteorológico desacoplado (JSON)
    │       ├── valhalla-world-ctl     # CLI para cambiar climas o disparar relámpagos
    │       ├── core/
    │       │   ├── WeatherController.js # Normalizador de estado de clima y presets
    │       │   └── WorldSimulation.js   # IA autónoma de vikingos, cuervos de Odín y física de partículas
    │       └── render/
    │           ├── BackdropRenderer.js  # Renderizador 16-bit de escenario estático (Mead Hall, Forja, Drakkar, Fiordo)
    │           └── EntityRenderer.js    # Renderizador dinámico (Vikingos, lluvia, nieve, aurora, relámpagos, reflejos)
    └── configs/
        ├── omarchy/                   # shell.json, extensiones de menú y branding ASCII
        ├── hypr/                      # Bordes dorados/turquesa en looknfeel.lua y pantalla de bloqueo Hyprlock
        └── fastfetch/                 # Arte ASCII del Clan del Cuervo y métricas con runas
```

---

## 🚀 Instalación

### Instalar todo el entorno (con backup automático)
```bash
cd ~/omarchy-valhalla
./install.sh
```

### Instalar módulos individuales
Puedes instalar o actualizar únicamente los módulos que desees:
```bash
./install.sh --theme      # Solo el tema de colores y fondos
./install.sh --bar        # Solo la barra HUD y los 9 Reinos
./install.sh --menu       # Solo el menú con medallones rúnicos
./install.sh --world      # Solo el Live Wallpaper 16-bit Pixel Art
./install.sh --configs    # Solo las configs de Hyprland, Hyprlock y Fastfetch
```

### Desinstalar y restaurar estado original
```bash
./install.sh --uninstall
```

---

## 🌦️ Control del Clima y Conexión con API Meteorológica Real

El módulo `gabriel.valhalla-world` separa completamente la **simulación visual** (`core/` y `render/`) del **estado climático** (`weather.json` e IPC), permitiendo cambiar el clima manualmente o conectarlo a una API real.

### 1. Control manual desde CLI o Menú
* Desde el menú de Omarchy (`Super + Alt + Space` → **Style** → **Valhalla Live World**).
* Desde la terminal:
  ```bash
  ~/.config/omarchy/plugins/gabriel.valhalla-world/valhalla-world-ctl rain
  ~/.config/omarchy/plugins/gabriel.valhalla-world/valhalla-world-ctl storm
  ~/.config/omarchy/plugins/gabriel.valhalla-world/valhalla-world-ctl snow
  ~/.config/omarchy/plugins/gabriel.valhalla-world/valhalla-world-ctl clear
  ~/.config/omarchy/plugins/gabriel.valhalla-world/valhalla-world-ctl thunder
  ```

### 2. Sincronizar con el clima real de tu ciudad (Open-Meteo API)
El proyecto incluye el script [`scripts/weather-api-sync.sh`](scripts/weather-api-sync.sh) que consulta la API gratuita de **Open-Meteo** (sin requerir API Key), traduce el código meteorológico WMO a intensidades de lluvia, nieve, viento, niebla y tormenta eléctrica, y actualiza el mundo pixel art en vivo:

```bash
# Ejemplo: Sincronizar con coordenadas (Latitud, Longitud, Nombre)
./scripts/weather-api-sync.sh -34.6037 -58.3816 "Buenos Aires · Midgard"
```

Puedes automatizarlo cada 15 minutos con un timer de usuario o cron ejecutando ese mismo script.

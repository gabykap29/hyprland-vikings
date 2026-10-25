-- Assassin's Creed Valhalla Look'n'Feel for Omarchy + Hyprland

local valhalla_active_border = {
  colors = {
    "rgba(4ecdc4ee)",
    "rgba(38b2a6ee)",
    "rgba(d49b4bee)",
    "rgba(e5a93cee)",
  },
  angle = 45,
}

local valhalla_inactive_border = "rgb(25313a)"

hl.config({
  general = {
    gaps_in = 6,
    gaps_out = 10,
    border_size = 2,
    col = {
      active_border = valhalla_active_border,
      inactive_border = valhalla_inactive_border,
    },
  },

  decoration = {
    rounding = 6,
    rounding_power = 3,
    dim_inactive = true,
    dim_strength = 0.10,
    shadow = {
      enabled = true,
      render_power = 4,
      range = 20,
      color = "rgba(05080aee)",
      color_inactive = "rgba(05080a99)",
    },
    blur = {
      enabled = true,
      size = 6,
      passes = 2,
      vibrancy = 0.2,
    },
  },

  group = {
    col = {
      border_active = valhalla_active_border,
      border_inactive = valhalla_inactive_border,
    },
  },
})

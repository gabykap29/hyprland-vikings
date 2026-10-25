-- Assassin's Creed Valhalla (Raven Clan) Hyprland Theme Configuration

local activeBorderColor = {
  colors = {
    "rgba(4ecdc4ee)",
    "rgba(38b2a6ee)",
    "rgba(d49b4bee)",
    "rgba(e5a93cee)",
  },
  angle = 45,
}

local inactiveBorderColor = "rgb(25313a)"

hl.config({
  general = {
    col = {
      active_border = activeBorderColor,
      inactive_border = inactiveBorderColor,
    },
    gaps_in = 6,
    gaps_out = 10,
    border_size = 2,
  },
  group = {
    col = {
      border_active = activeBorderColor,
      border_inactive = inactiveBorderColor,
    },
    groupbar = {
      col = {
        active = "rgba(d49b4bff)",
        inactive = "rgba(162028ff)",
      },
      text_color = "rgba(0d1318ff)",
      text_color_inactive = "rgba(e8dfc8aa)",
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
  animations = {
    enabled = true,
  },
})

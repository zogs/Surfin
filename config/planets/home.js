var planet = {
    id: 'home',
    name: 'home',
    location: '',
    information: "",
    order: 1000,
    levels: [],
    active: false,
    unlock: true,
    "colors": {
      "sea": {"top": "#00557F","bottom": "#57C9ff"},
      "wave": [["#04567d",0,0],["#2ea8e3",0,50],["#36aee8",0,100]],
      "lip": {"top": "#216587", "bottom": "rgba(255,255,255,0.2)"},
      "splash": {"top": "#FFF","bottom": "#FFF"},
      "sand": {"hue": 0, "sat":0, "lum":0, "con": 0, "alpha":1},
    },
    "images": {
      "background": "spot_back_home",
      "frontground": "spot_front_home"
    },
    lines: {
      horizon: 240,
      break: 450,
      peak: 500,
      beach: 580,
      obstacle: 750,
    },
}
PLANETS.push(planet);
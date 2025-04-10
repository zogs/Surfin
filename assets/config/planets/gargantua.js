var planet = {
    id: 'gargantua',
    name: 'Gargantua',
    location: 'Somewhere behind a black hole ',
    information: "",
    order: 6,
    levels: [],
    active: false,
    unlock: false,
    images: {
      background: 'spot_back',
      frontground: 'spot_front',
    },
    colors: {
      sea: {top: "#00557F", bottom: "#57C9ff"},
      wave: [["#04567d",0,0],["#2ea8e3",0,50],["#36aee8",0,100]],
      lip: {top: "#216587", bottom: "rgba(255,255,255,0.2)"},
      splash: {top: "#FFF",bottom: "#FFF"},
      sand: {"hue": 0, "sat":0, "lum":0, "con": 0, "alpha":1},
    },
    lines: {
      horizon: 250,
      break: 450,
      peak: 500,
      beach: 580,
      obstacle: 750,
    },
    levels: [
      "Gargantua1",
    ]
}
PLANETS.push(planet);
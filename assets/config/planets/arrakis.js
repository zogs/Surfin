var planet = {
    id: 'arrakis',
    name: 'Arrakis',
    location: 'Canopus Systems',
    information: "> Planet is under the blocus of the Imperial fleet. \n> Rumors about war preparation \n> Tourist are authorized to leave \n> Enter at your own risk !!! \n> Beach are desert :)",
    order: 2,
    active: true,
    unlock: true,
    colors: {
      sea: {top: "#fc9b70",bottom: "#318a4c"},
      wave: [["#358e54",0,0],["#46ae68",0,50],["#358e54",0,100]],
      lip: {top: "#328a51", bottom: "rgba(255,255,255,0.1)"},
      splash: {top: "#FFF", bottom: "#FFF"},
      sand: {"hue": -18, "sat":38, "lum":16, "con": 0, "alpha":1},
    },
    images: {
      background: "arrakis_back",
      frontground: "spot_front",
      extra: [
        {
          asset: 'arrakis_sunreflect',
          x: 0,
          y: 265,
          alpha:0.5
        }
      ]
    },
    lines: {
      horizon: 300,
      break: 550,
      peak: 600,
      beach: 650,
      obstacle: 800,
    },
    levels: [
      'Arrakis0',
      'Arrakis1',
      'Arrakis2',
      'Arrakis3',
    ]
}
PLANETS.push(planet);
var planet = {
    id: 'caladan',
    name: 'Caladan',
    location: 'Delta Pavonis',
    information: "> Planet is under the blocus of the Imperial fleet. \n> Rumors about war preparation \n> Tourist are authorized to leave \n> Enter at your own risk !!! \n> Beach are desert :)",
    order: 6,
    levels: [],
    active: true,
    unlock: true,
    colors: {
      sea: {top: "#2c78f5",bottom: "#1e3bb3"},
      wave: [["#0d1544",0,0],["#3a52b8",0,50],["#2943ae",0,100]],
      lip: {top: "#233993", bottom: "#a9b3f188"},
      splash: {top: "#FFF", bottom: "#FFF"},
      sand: {"hue": 11, "sat":-71, "lum":0, "con": 0, "alpha":1},
    },
    images: {
      background: "caladan_back",
      frontground: "spot_front"
    },
    lines: {
      horizon: 300,
      break: 550,
      peak: 600,
      beach: 650,
      obstacle: 800,
    },
    levels: [
      'Caladan1',
    ]
}
PLANETS.push(planet);
var planet = {
    id: 'terre',
    name: 'Terre',
    location: 'Système Solaire',
    information: "> Planet is under the blocus of the Imperial fleet. \n> Rumors about war preparation \n> Tourist are authorized to leave \n> Enter at your own risk !!! \n> Beach are desert :)",
    order: 0,
    active: false,
    unlock: true,
    colors: {
      sea: {top: "#ad84a0",bottom: "#526e92"},
      wave: [["#586684",0,0],["#6f7f9c",0,50],["#5c729c",0,100]],
      lip: {top: "#7888a5", bottom: "#a2bbcf"},
      splash: {top: "#b8bdcc", bottom: "#657185"},
      sand: {"hue": 0, "sat":0, "lum":0, "con": 0, "alpha":1},
    },
    images: {
      background: "terre_back",
      frontground: "terre_front",
      extra: []
    },
    lines: {
      horizon: 300,
      break: 500,
      peak: 550,
      beach: 550,
    },
    levels: [
      'Terre0',
    ]
}
PLANETS.push(planet);
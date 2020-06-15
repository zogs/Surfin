var planet = {
    id: 'naboo',
    name: 'Naboo',
    location: 'Bordure Médiane',
    information: "",
    order: 5,
    levels: [],
    active: true,
    unlock: true,
    colors: {
      sea: {top: '#45878f',bottom: '#155665'},
      wave: [['#2b768b',0,0],['#498e95',0,50],['#1d5e6e',0,100]],
      lip: { top: '#2d6675', bottom: 'rgba(165,213,237,0.2)'},
      splash: { top: '#FFF', bottom: '#FFF'},
      "sand": {"hue": -5, "sat":6, "lum":-15, "con": 0, alpha:1},
    },
    images: {
      background: 'naboo_back',
      frontground: 'spot_front',
      extra: [
      {
          asset: 'naboo_coast',
          x: 110,
          y: 110,
          alpha:1
        }
      ]
    },
    lines: {
      horizon: 170,
      break: 550,
      peak: 600,
      beach: 650,
      obstacle: 800,
    },
    levels: [
      "Naboo1",
    ]
}
PLANETS.push(planet);
var planet = {
    id: 'namek',
    name: 'Namek',
    location: 'Dragon ball universe',
    information: "",
    order: 4,
    levels: [],
    active: true,
    unlock: true,
    colors: {
      sea: {top: '#69b266',bottom: '#377840'},
      wave: [['#24714d',0,0],['#81bd6b',0,50],['#81bd6b',0,100]],
      lip: { top: '#236e4b', bottom: 'rgba(179,237,165,0.2)'},
      splash: { top: '#FFF', bottom: '#FFF'},
      "sand": {"hue": 5, "sat":-14, "lum":11, "con": 0, alpha:1},
    },
    images: {
      background: 'namek_back',
      frontground: 'spot_front',
      extra: [
        {
          asset: 'namek_front',
          x: 0,
          y: 115,
          alpha:1
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
      'Namek1',
    ]
}
PLANETS.push(planet);
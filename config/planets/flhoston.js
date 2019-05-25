var planet = {
    id: 'flhoston',
    name: 'Flhoston',
    location: 'Angel Constellation',
    information: "",
    levels: [],
    unlock: true,
    colors: {
      sea: {top: '#164e79',bottom: '#37b3d6'},
      wave: [['#195b87',0,0],['#61b8d8',0,50],['#37a7d6',0,100]],
      lip: { top: '#3ba9d7', bottom: 'rgba(255,255,255,0.2)'},
      splash: { top: '#FFF', bottom: '#FFF'},
      "sand": {"hue": 11, "sat":-55, "lum":29, "con": 0, alpha:1},
    },
    images: {
      background: 'flhoston_back',
      frontground: 'spot_front',
    },
    lines: {
      horizon: 240,
      break: 500,
      peak: 550,
      beach: 600,
      obstacle: 750,
    },
}
PLANETS.push(planet);
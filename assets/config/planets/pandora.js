var planet = {
    id: 'pandora',
    name: 'Pandora',
    location: 'Alpha Centauri A',
    information: "",
    order: 3,
    levels: [],
    active: true,
    unlock: true,
    colors: {
      sea: {top: '#123765',bottom: '#549fb4'},
      wave: [['#4a88af',0,0],['#5ba8bd',0,50],['#4e99ae',0,100]],
      lip: { top: '#4f89ad', bottom: 'rgba(255,255,255,0.2)'},
      splash: { top: '#FFF', bottom: '#FFF'},
      sand: {hue: -18, sat:23, lum:12, con: 0, alpha:1},
    },
    images: {
      background: 'pandora_back',
      frontground: 'spot_front',
    },
    lines: {
      horizon: 300,
      break: 550,
      peak: 600,
      beach: 650,
      obstacle: 800,
    },
    levels: [
      'Pandora1',
    ]
}
PLANETS.push(planet);
var planet = {
    id: 'pandora',
    name: 'Pandora',
    location: 'Alpha Centauri A',
    information: "",
    levels: [],
    unlock: true,
    colors: {
      sea: {top: '#092f5e',bottom: '#37b3d6'},
      wave: [['#195b87',0,0],['#61b8d8',0,50],['#37a7d6',0,100]],
      lip: { top: '#3ba9d7', bottom: 'rgba(255,255,255,0.2)'},
      splash: { top: '#FFF', bottom: '#FFF'},
      "sand": {"hue": -18, "sat":23, "lum":12, "con": 0, alpha:1},
    },
    images: {
      background: 'pandora_back',
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
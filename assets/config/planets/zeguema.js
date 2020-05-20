var planet = {
    id: 'zeguema',
    name: 'Zeguema',
    location: 'UCF Outer Rings',
    information: "",
    order: 5,
    levels: [],
    active: true,
    unlock: true,
    colors: {
      sea: {top: '#aa8bee',bottom: '#3c1792'},
      wave: [['#5a39a7',0,0],['#8e6cd8',0,50],['#6244a7',0,100]],
      lip: { top: '#5a39a7', bottom: 'rgba(255,255,255,0.2)'},
      splash: { top: '#FFF', bottom: '#FFF'},
      "sand": {"hue": -22, "sat":10, "lum":23, "con": 0, alpha:1},
    },
    images: {
      background: 'zeguema_back',
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
      'Zeguema1',
    ]
}
PLANETS.push(planet);
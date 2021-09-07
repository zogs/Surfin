var planet = {
    id: 'flhoston',
    name: 'Flhoston',
    location: 'Angel Constellation',
    information: "",
    order: 4,
    levels: [],
    active: true,
    unlock: true,
    colors: {
      sea: {top: '#164e79',bottom: '#37b3d6'},
      wave: [['#195b87',0,0],['#61b8d8',0,50],['#37a7d6',0,100]],
      lip: { top: '#3ba9d7', bottom: 'rgba(255,255,255,0.2)'},
      splash: { top: '#FFF', bottom: '#FFF'},
      sand: {hue: 11, sat:-55, lum:29, con: 0, alpha:1},
    },
    images: {
      background: 'flhoston_back',
      frontground: 'spot_front',
      extra: [
        {
          asset: 'flhoston_back_reflect',
          x: 910,
          y: 270,
          alpha:0.5
        },
        {
          asset: 'flhoston_back_islands',
          x: 69,
          y: 240,
          alpha:1
        }
      ]
    },
    levels: [
      'Flhoston0',
      'Flhoston1',
      'Flhoston2_0',
      'Flhoston2',
      'Flhoston3',
    ],
    lines: {
      horizon: 300,
      break: 550,
      peak: 600,
      beach: 650,
      obstacle: 800,
    },
}
PLANETS.push(planet);
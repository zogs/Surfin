var conf = {  
  id: 11,
  name: 'Small wave',
  alias: 'Small wave',
  config: {
    colors: {
      top: '#00354f',
      bottom: '#166f99'
    },
    lines: {
      horizon: 240,
      break: 500,
      peak: 600,
      beach: 700,
      obstacle: 750,
    },
    series: {
      length :  2,
      speed : 20000,
      frequency : 5000,
      interval : 14000,       
      spread : 200, 
      xshift: 10,     
    },  
    surfers: {
      proportion: 1.5,
      velocities: {
        x: 1,
        y: 1
      },
      weapons: []
    },
    waves: {
      height : 180,
      width : 0,
      real_height: 2,
      breaking: {
        width: 180,
        x_speed: 50,
        x_speed_max: 50,
        x_speed_interval: 0,
        x_speed_pause: 200,
        y_speed: 1200,
        y_ease: 'quartIn',
        splash_h_percent: 100,
        splash_h_ease: 0.4,
        left: {
          width: 20,
          width_max: 30,        
          width_interval: 1000,
          width_pause: 0,
          block_interval: 1000,
          block_interval_max: 2000,
          block_width: 5,
          block_width_max: 50,
        },          
        right: {
          width: 20,
          width_max: 30,
          width_interval: 1000,
          width_pause: 1000,
          block_interval: 1000,
          block_interval_max: 2000,
          block_width: 5,
          block_width_max: 55,
        }
      },
      lip: {
        thickness: 10,
        colors: {
          top: '#093950',
          bottom: 'rgba(255,255,255,0.2)',
        },
        cap: {
          width: 700,
          height: 10,
          lifetime: 800,
        },        
      },
      splash: {
        colors: {
          top: '#FFF',
          bottom: '#FFF',
        }
      },
      paddling_effort: 1,
      bottom_fall_scale: 0.8,
      top_fall_scale: 0.15, 
      tube_difficulty_min : 1,  
      tube_difficulty_max : 10, 
      suction: {x: 5, y: 4},
      colors: [
        ['#093950',0,0],
        ['#146389',0,50],
        ['#0f597d',0,100]
      ],
      obstacles: {
        'float': {
          'interval': 0,
          'interval_max': 2000,
          'objects' : {
            'paddler' : {percentage: 0},
            'photographer' : {percentage: 100},
            'bomb': {percentage: 0}, 
            'trooper': {percentage: 0},
          },                  
        },
        'fly': {
          'interval': 0,
          'interval_max': 3000,
          'objects' : {
            'prize' : {percentage: 80},
            'cigogne' : {percentage: 20},
            'drone': {percentage: 0},          
          },                  
        }
      },
      shoulder : {
        left : {
          width: 1000,
          inner: 300,
          outer: 300,
          marge: 50,
          slope: 0
        },
        right : {
          width: 1000,
          inner: 300,
          outer: 300,
          marge: 50,
          slope: 0
        }
      }
    },    
  }
};

SPOTSCONF.push(conf);

(function() {

  function Caladan1(params) {

    let defaults = {
      id: 'Caladan1',
      name: 'Caladan 1',
      planet: 'caladan',
      "series": {
        "length": 1,
        "speed": 20000,
        "frequency": 7000,
        "interval": 7000,
        "spread": 200,
        "xshift": 0
      },
      init: {
        type: 'waiting',
      },
      timelimit: null,
      goals: [
        { type: 'score', current:0, aim: 2000, name: 'Faire un score de 2000 points ({n})' },
        { type: 'tube', current:0, aim: 5, name: 'Faire un tube de 5s ou + ({n})' },
        { type: 'timed', current:0, aim: 20, name: 'Survivre 20 secondes ({n}s)' },
      ],
      "surfers": {
        "max": 1,
        "proportion": 1.5,
        "x": 750,
        "y": 470,
        "velocities": {
          "x": 1,
          "y": 1
        },
        "weapons": []
      },
      "waves": {
        "height": 290,
        "width": 1500,
        "real_height": 3,
        "breaking": {
          "width": 180,
          "y_speed": 1200,
          "y_ease": "quartIn",
          "splash_h_percent": 100,
          "splash_h_ease": 0.4,
          "left": {
            "width": 25,
            "width_max": 30,
            "width_interval": 0,
            "width_pause": 0,
            "block_interval": 0,
            "block_interval_max": 0,
            "block_width": 100,
            "block_width_max": 200
          },
          "right": {
            "width": 20,
            "width_max": 30,
            "width_interval": 0,
            "width_pause": 1000,
            "block_interval": 2000,
            "block_interval_max": 3000,
            "block_width": 20,
            "block_width_max": 50
          }
        },
        "lip": {
          "thickness": 10,
          "cap": {
            "width": 700,
            "height": 10,
            "lifetime": 800
          }
        },
        "paddling_effort": 1,
        "bottom_fall_scale": 0.8,
        "top_fall_scale": 0.15,
        "tube_difficulty_min": 1,
        "tube_difficulty_max": 10,
        "suction": {
          "x": 5,
          "y": 4
        },
        "obstacles": {
          "float": {
            "interval": 1000,
            "interval_max": 3000,
            "objects": {
              "paddler": {
                "percentage": 30
              },
              "photographer": {
                "percentage": 30
              },
            }
          },
          "fly": {
            "interval": 10000,
            "interval_max": 15000,
            "objects": {
              "cigogne": {
                "percentage": 100
              },
            }
          }
        },
        "shoulder": {
          "left": {
            "width": 1000,
            "inner": 300,
            "outer": 300,
            "marge": 50,
            "slope": 0
          },
          "right": {
            "width": 1000,
            "inner": 300,
            "outer": 300,
            "marge": 50,
            "slope": 0
          }
        }
      }
    }

    let config = extend(defaults, params);

    this.Container_constructor();
    this.init(config);
  }

  var prototype = createjs.extend(Caladan1, window.Spot);

  SPOTS.Caladan1 = Caladan1;
  LEVELS.push(Caladan1);

}());
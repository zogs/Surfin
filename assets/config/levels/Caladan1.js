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
        { type: 'score', current:0, count: 2000, name: 'Faire un score de {c} points ({n})' },
        { type: 'tube', current:0, count: 5, name: 'Faire un tube de {c}s ou + ({n})' },
        { type: 'timed', current:0, count: 20, name: 'Survivre {c} secondes ({n}s)' },
      ],
      player: {

      },
      paddlers: {
        nb: 0,
        xmin: 200,
        xmax: 1300,
        ymin: 400,
        ymax: 520,
        skills: {}
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
          "unroll": {
            "width": 25,
            "width_max": 30,
            "width_interval": 0,
            "width_pause": 0,
            "block_interval": 0,
            "block_interval_max": 0,
            "block_width": 100,
            "block_width_max": 200
          },
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
        "obstacles": [
               { name:'paddletrooper', tmin:0, tmax:0, interval:1000, intervalMax:2000, y:0 },
               { name:'beachtrooper', tmin:0, tmax:0, interval:1000, intervalMax:2000, y:0 },
               { name:'cigogne', tmin:0, tmax:0, interval:1000, intervalMax:2000, y:0 },
        ],
        "shoulder": {
          "width": 1000,
          "inner": 300,
          "outer": 300,
          "marge": 50,
          "slope": 0
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
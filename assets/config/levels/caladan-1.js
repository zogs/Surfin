var conf = {
  id: 1,
  name: 'caladan1',
  alias: 'caladan1',
  planet: 'caladan',
  level: 1,
  "init": {
    "type": "waving"
  },
  "series": {
    "length": 1,
    "speed": 20000,
    "frequency": 7000,
    "interval": 7000,
    "spread": 200,
    "xshift": 10
  },
  "scores": {},
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
  "goals": [
      { type: 'timed', current:0, aim: 10, name: 'Survivre 10 secondes ({n}s)' },
  ],
  "waves": {
    "height": 250,
    "width": 0,
    "real_height": 3,
    "breaking": {
      "width": 180,
      "y_speed": 1200,
      "y_ease": "quartIn",
      "splash_h_percent": 100,
      "splash_h_ease": 0.4,
      "left": {
        "width": 20,
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
        "width_max": 0,
        "width_interval": 0,
        "width_pause": 1000,
        "block_interval": 2000,
        "block_interval_max": 600,
        "block_width": 100,
        "block_width_max": 200
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
      "y": 0
    },
    "obstacles": {
      "float": {
        "interval": 0,
        "interval_max": 1000,
        "objects": {
          "paddler": {
            "percentage": 30
          },
          "photographer": {
            "percentage": 30
          },
          "bomb": {
            "percentage": 40
          },
          "trooper": {
            "percentage": 0
          }
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

  //endconfig
};

LEVELS.push(conf);

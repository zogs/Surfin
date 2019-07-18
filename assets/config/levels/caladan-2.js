var conf = {
  id: 1,
  name: 'caladan2',
  alias: 'caladan2',
  planet: 'caladan',
  level: 2,
  unlock: true,
  "init": {
    "type": "waving"
  },
  "series": {
    "length": 3,
    "speed": 20000,
    "frequency": 5000,
    "interval": 14000,
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
        "width_max": 25,
        "width_interval": 1000,
        "width_pause": 0,
        "block_interval": 2000,
        "block_interval_max": 4000,
        "block_width": 80,
        "block_width_max": 100
      },
      "right": {
        "width": 20,
        "width_max": 25,
        "width_interval": 1000,
        "width_pause": 0,
        "block_interval": 2000,
        "block_interval_max": 4000,
        "block_width": 80,
        "block_width_max": 100
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
        "interval": 5000,
        "interval_max": 8000,
        "objects": {
          "stars": {
            "percentage": 100
          },
        }
      },
      "fly": {
        "interval": 0,
        "interval_max": 1000,
        "objects": {
          "prize": {
            "percentage": 30
          },
          "cigogne": {
            "percentage": 30
          },
          "drone": {
            "percentage": 40
          }
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

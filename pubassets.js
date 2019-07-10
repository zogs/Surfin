/*
Publish assets in ./dist folder
 */

var fs = require('fs');
var path = require('path');
var recursive = require('recursive-readdir');
var mkdirp = require('mkdirp');


// Copy folders
var folders = ['assets/font','assets/js','assets/sounds']
var dest = 'dist';

folders.map(folder => {

  recursive(folder, function(err, files) {

    files.map(function(file) {
      let newfile = file.replace("assets","dist")
      newfile = path.resolve('.', newfile)
            console.log(newfile);

      let dir = path.dirname(newfile);
      mkdirp(dir, function(err) {
        if(err) console.log(err);
      });

      fs.readFile(file, function (err, data) {
        if (err) throw err;
        fs.writeFile(newfile, data, function (err) {
            if (err) throw err;
        });
      });
    })

  });

})
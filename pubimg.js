var fs = require('fs');
var path = require('path');
var recursive = require('recursive-readdir');
var mkdirp = require('mkdirp');
var sizeOf = require('image-size');
var sharp = require('sharp');
var Jimp = require('jimp');

var args = process.argv.slice(2);
var res = args[0]? args[0]: '1500x800';

console.log('Generating images for resolution: ', res);

var origin = path.relative(path.resolve(), path.resolve('assets','img','1500x800'));
var dest = path.relative(path.resolve(), path.resolve('dist','img',res));
var orgX = 1500;
var orgY = 800;
var destX = parseInt(res.split('x')[0]);
var destY = parseInt(res.split('x')[1]);
var ratioX = destX / orgX;
var ratioY = destY / orgY;
var allowed = ['.jpg','.jpeg','.png','.gif'];

console.log('Destination folder:', dest);

// Copy and resize images
recursive(origin, function(err, files) {

  files.map(function(file) {

    //define new file
    let newfile = dest+file.replace(origin,"");

    //create folder if not exist
    let dir = path.dirname(newfile);
    mkdirp(dir, function(err) {
      if(err) console.log(err);
    });

    //resize if it is an img
    if(allowed.indexOf(path.extname(file)) !== -1) {

      //get img size
      let size = sizeOf(file);
      let width = size.width;
      let height = size.height;

      //calcul new size
      let newwidth = parseInt(width * ratioX);
      let newheight = parseInt(height * ratioY);

      Jimp.read(file,(err,img) => {
       if(err) throw err;
       img.resize(newwidth, newheight).write(newfile);
      })

      // print debug
      console.log(newfile, newwidth, newheight);
    }
    // copy the rest
    else {
      fs.readFile(file, function (err, data) {
        if (err) throw err;
        fs.writeFile(newfile, data, function (err) {
            if (err) throw err;
            console.log(newfile);
        });
      });

    }
  })
})



const fs = require('fs');

function make() {
  fs.readdir('./icons/', function(err, files) {
    if (err) console.log(err);

    const all = files
      // Assume all icons include both size 11 and 15
      .filter(file => file.indexOf('.svg') !== -1)
      .map(file => file.split('.svg')[0]);

    fs.writeFile('./layouts/all.json', JSON.stringify(all), function(err) {
      if (err) console.log(err);
      console.log('✓ Successfully generated all.json layout');
    });
  });
}

make();

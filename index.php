<html lang="fr">
	<head>
	<meta charset="UTF-8">
	<meta name='viewport' content="width=device-width,user-scalable=no, initial-scale=1,maximum-scale=1,user-scalable=0" />
	<meta name='apple-mobile-web-app-capable' content="yes" />
	<meta name='apple-mobile-we-app-status-bar-style' content="black-translucent" />
	<meta name="apple-mobile-web-app-capable" content="yes">
	<meta name="mobile-web-app-capable" content="yes">
	<meta name="theme-color" content="#674081">

	<link rel="manifest" href="manifest.json">

	<link rel="stylesheet" href="dist/font/Bubblegum/stylesheet.css">
	<link href="https://fonts.googleapis.com/css?family=Blinker&display=swap" rel="stylesheet">


	<style type="text/css">
			body { margin: 0; padding: 0; background: #000; }
			canvas { display:block; margin:0 auto; background: #000; }
	</style>

	</head>

	<body onload="load()">
			<canvas id="canvas" width="1500" height="800">You need to activate javascript to play this game !</canvas>
	</body>


	<script src="lib/createjs/easeljs-1.1.js"></script>
	<script src="lib/justice.mapped.min.js"></script>
	<script src="lib/gl-matrix-min.js"></script>
	<script src="lib/victor/victor.min.js"></script>
	<script src="lib/victor/victor_custom.js"></script>
	<script src="lib/dat/dat.gui.min.js"></script>
	<script src="commons/utils.js" type="text/javascript"></script>
	<script src="commons/shaker.js" type="text/javascript"></script>
	<script src="commons/variations.js" type="text/javascript"></script>
	<script src="commons/particles.js" type="text/javascript"></script>
	<script src="assets/config/levels.conf.js" type="text/javascript"></script>
	<?php loadJsDir('assets/config/levels/'); ?>
	<script src="assets/config/planets.conf.js" type="text/javascript"></script>
	<?php loadJsDir('assets/config/planets/'); ?>
	<script src="src/user.js" type="text/javascript"></script>
	<script src="src/control_ui.js" type="text/javascript"></script>
	<script src="src/score_ui.js" type="text/javascript"></script>
	<script src="src/scoreboard.js" type="text/javascript"></script>
	<script src="src/xpbar.js" type="text/javascript"></script>
	<script src="src/spots.js" type="text/javascript"></script>
	<script src="src/waves.js" type="text/javascript"></script>
	<script src="src/surfers.js" type="text/javascript"></script>
	<script src="src/paddlers.js" type="text/javascript"></script>
	<script src="src/bots.js" type="text/javascript"></script>
	<script src="src/screens.js" type="text/javascript"></script>
	<script src="src/objects.js" type="text/javascript"></script>
	<script src="src/menu.js" type="text/javascript"></script>
	<?php loadJsDir('src/objects/'); ?>
	<script src="src/customizer.js" type="text/javascript"></script>
	<script src="main.js" type="text/javascript"></script>
	<script>
	if ('serviceWorker' in navigator) {
	  window.addEventListener('load', () => {
	    navigator.serviceWorker.register('/sw.js');
	  });
	}
	</script>

<?php

function loadJsDir($dir) {

	$handle = opendir($dir);
	while(($file = readdir($handle))!==false) {
		if($file == '.' || $file == '..') continue;
		$file = $dir.$file;
		echo '<script src="'.$file.'" type="text/javascript"></script>';
	}
	closedir($handle);
}
?>
</html>

<html lang="fr">
	<head>
	<meta charset="UTF-8">
	<meta name='viewport' content="width=device-width,user-scalable=no, initial-scale=1,maximum-scale=1,user-scalable=0" />
	<meta name='apple-mobile-web-app-capable' content="yes" />
	<meta name='apple-mobile-we-app-status-bar-style' content="black-translucent" />

	<link rel="stylesheet" href="assets/font/Alba/stylesheet.css">
	<link rel="stylesheet" href="assets/font/Boogaloo/stylesheet.css">
	<link rel="stylesheet" href="assets/font/Bubblegum/stylesheet.css">
	
	<style type="text/css">
			body { margin: 0; padding: 0; background: #000; }
			canvas { display:block; margin:0 auto; background: #000; }
	</style>

	</head>

	<body onload="loaded()">
			<canvas id="canvas" width="1500" height="800"><!-- dont touch the dimension, it is use to calculate the proportion --></canvas>			
		</div>
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
	<script src="config/spots.conf.js" type="text/javascript"></script>
	<?php loadJsDir('config/spots/'); ?>
	<script src="game/objects/user.js" type="text/javascript"></script>
	<script src="game/objects/obstacles.js" type="text/javascript"></script>
	<script src="game/objects/score.js" type="text/javascript"></script>
	<script src="game/objects/spots.js" type="text/javascript"></script>
	<script src="game/objects/waves.js" type="text/javascript"></script>
	<script src="game/objects/surfers.js" type="text/javascript"></script>
	<script src="game/objects/paddlers.js" type="text/javascript"></script>
	<script src="game/objects/bots.js" type="text/javascript"></script>
	<script src="game/objects/screens.js" type="text/javascript"></script>
	<script src="game/customizer.js" type="text/javascript"></script>
	<script src="main.js" type="text/javascript"></script>

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

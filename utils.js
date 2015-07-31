function get2dDistance(x1,y1,x2,y2){

		return Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2));
}

function get1dDistance(x1,x2){

		return Math.sqrt(Math.pow(x2-x1,2));
}

function proxy(method, scope, args) { 
	if(args == undefined ) return function() { return method.apply(scope, arguments); } 
	else return function() { return method.apply(scope, args); } 
}
// function googleMap(params){
// 	var initialize = function (componentId, latLng1, latLng2, zm) {
// 		var mapCanvas = document.getElementById(componentId);
// 		var mapOptions = {
// 		  center: new google.maps.LatLng(latLng1, latLng2),
// 		  zoom: zm,
// 		  mapTypeId: google.maps.MapTypeId.ROADMAP
// 		}
// 		var map = new google.maps.Map(mapCanvas, mapOptions)
// 	}
// 	var init = function(){ return initialize(params.componentId, params.latLng1, params.latLng2, params.zm) };
// 	init();
// }

function googleMap_initialize() {
	var mapOptions = {
		zoom: 8,
		center: new google.maps.LatLng(-34.397, 150.644),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	var mapObj = document.getElementById('googleMap1');
	console.log(mapObj);
	var map = new google.maps.Map(mapObj, mapOptions);
	console.log('init')
}
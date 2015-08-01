function googleMap(params){
	var initialize = function (componentId, latLng1, latLng2, zm) {
		var mapCanvas = document.getElementById(componentId);
		var mapOptions = {
		  center: new google.maps.LatLng(latLng1, latLng2),
		  zoom: zm,
		  mapTypeId: google.maps.MapTypeId.ROADMAP
		}
		var map = new google.maps.Map(mapCanvas, mapOptions)
	}
	var init = function(){ return initialize(params.componentId, params.latLng1, params.latLng2, params.zm) };
	google.maps.event.addDomListener(window, 'load', init);
}
(function () {
	const lat = document.querySelector('#lat') || 19.2830764;
	const lng = document.querySelector("#lng") || -99.6355924;
	const mapa = L.map("mapa").setView([lat, lng], 16);
  let marker;
  
  const geocodeService = L.esri.Geocoding.geocodeService();

	L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	}).addTo(mapa);

	marker = new L.marker([lat, lng], {
		draggable: true,
		autoPan: true,
  }).addTo(mapa);
  
  marker.on('moveend', function (e) {
    marker = e.target;
    const posicion = marker.getLatLng();
    mapa.panTo(new L.LatLng(posicion.lat, posicion.lng))

    geocodeService.reverse().latlng(posicion, 13).run(function (error, resultado) {
      marker.bindPopup(resultado.address.LongLabel)

      document.querySelector('.calle').textContent = resultado?.address?.Address ?? '';
      document.querySelector('#calle').value = resultado?.address?.Address ?? '';
      document.querySelector('#lat').value = resultado?.latlng?.lat ?? '';
      document.querySelector('#lng').value = resultado?.latlng?.lng ?? '';

    })
  })

})();

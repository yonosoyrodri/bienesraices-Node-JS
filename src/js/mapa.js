(function () {
	const lat = 19.2830764;
	const lng = -99.6355924;
  const mapa = L.map("mapa").setView([lat, lng], 16);
  let marker;

	L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(mapa);
  
  marker = new L.marker([lat, lng], {
    draggable: true,
    autoPan: true
  }).addTo(mapa)

})();

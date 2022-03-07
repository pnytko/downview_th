//CONFIG
const minzoom = 11;																	// Zoom min.	
const maxzoom = 21;																	// Zoom max .
const s_zoom = 18;																	// Zoom startowy
start_xy = [20.98663689072215, 50.01223577093259]; 									// Koordynaty startowe

//PREDEFINIOWANE KIERUNKI
const N_dir = 0																		//0 stopni, orto wyjściowo skierowane jest na północ
const S_dir = (3.14)																//180deg	
const W_dir = ((3*3.14)/2)															//270deg	
const E_dir = (3.14/2)																//90deg	

//POMIARY WSPÓŁRZĘDNYCH

const mousePositionControl = new ol.control.MousePosition({
	coordinateFormat: ol.coordinate.createStringXY(4),
	projection: 'EPSG:4326',
	className: 'custom-mouse-position',
	target: document.getElementById('mouse-position'),
});

const projectionSelect = document.getElementById('projection');
projectionSelect.addEventListener('change', function (event) {
  mousePositionControl.setProjection(event.target.value);
});

const precisionInput = document.getElementById('precision');
precisionInput.addEventListener('change', function (event) {
  const format = ol.coordinate.createStringXY(event.target.valueAsNumber);
  mousePositionControl.setCoordinateFormat(format);
});

//STRUKTURA WARSTW
// 1 - OSM
// 2 - ORTO
// 3 - CIENIOWANIE
// 4 - MIEG MAP, TARNOW1944
// 5 - DZIAŁKI
// 6 - ULICE
// 100 - VECTOR LAYER

// WARSTWA WEKTOROWA

let vector_layer = new ol.layer.Vector({
	source: new ol.source.Vector(),
	zIndex: 100,
    visible: true
});


// WARSTWA OSM
const osm_layer = new ol.layer.Tile({
	source: new ol.source.OSM(),
	title: 'OSM',
	visible: true,
	zIndex: 1
});

// WARSTWA ORTO HD:
const ortoHD = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: 'https://mapy.geoportal.gov.pl/wss/service/PZGIK/ORTO/WMS/HighResolution', //https://mapy.geoportal.gov.pl/wss/service/PZGIK/ORTO/WMTS/HighResolution
        params:{
            //'FORMAT': 'image/png',
            'TILED': true,
            'VERSION': '1.3.0',
			'REQUEST':"GetMap",
			'LAYERS':'Raster'
        },
        transition: 0,
        projection: 'EPSG:4326'
    }),
	visible: false,
	title: 'OrthoHD',
    zIndex: 2
});

// WARSTWA CIENIOWANIE:
const cieniowanie = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: 'https://mapy.geoportal.gov.pl/wss/service/PZGIK/NMT/GRID1/WMS/ShadedRelief',
        params:{
            'FORMAT': 'image/png',
            'TILED': true,
            'VERSION': '1.1.1',
			'REQUEST':"GetMap",
			'LAYERS':'Raster'
        },
        transition: 0,
        projection: 'EPSG:2180'
    }),
	visible: false,
	title: 'Działki',
    zIndex: 3
});

// WARSTWA DZIAŁKI:
const dzialki = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: 'https://integracja.gugik.gov.pl/cgi-bin/KrajowaIntegracjaEwidencjiGruntow',
        params:{
            'FORMAT': 'image/png',
            'TILED': true,
            'VERSION': '1.3.0',
			'REQUEST':"GetMap",
			'LAYERS':'dzialki,numery_dzialek'
        },
        transition: 0,
        projection: 'EPSG:2180'
    }),
	visible: false,
	title: 'Działki',
    zIndex: 5
});

//MIEG MAP

const miegmap= new ol.layer.Tile({
    source: new ol.source.XYZ({
    url:
        './orto/{z}/{x}/{y}.png'
    }),
	visible: false,
	title: 'MiegMap',
    zIndex: 4
});

//WARSTWA ULIC
const ulice=new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: 'https://wms.epodgik.pl/cgi-bin/KrajowaIntegracjaPunktowAdresowych',
        params:{
            'FORMAT': 'image/png',
            'TILED': true,
            'VERSION': '1.3.0',
            'LAYERS': "emuia-ulice"
        },
        transition: 0,
        projection: 'EPSG:4326'
    }),
	visible: false,
	title: 'Ulice',
    zIndex: 6
});


//WARSTWA MAPY - INTEGRACJA MAP

let interaction = new ol.interaction.DragRotateAndZoom(); //ROTACJA SHIFT+LPM

const map = new ol.Map({
    projection: 'EPSG:4326',
	controls: ol.control.defaults().extend([mousePositionControl]),
	interactions: ol.interaction.defaults().extend([
		interaction
    ]),
    layers: [
		osm_layer,
		vector_layer,
        ortoHD,
		ulice,
		dzialki,
		cieniowanie,
		miegmap
	],
			
    target: 'map',
    view: new ol.View({
        center:  ol.proj.fromLonLat(start_xy),
        zoom: s_zoom,
        minZoom: minzoom,
        maxZoom: maxzoom,
		rotation: 0
    })
});

//MARKERY


var markers = new ol.layer.Vector({
    source: new ol.source.Vector(),
    zIndex: 200,
    style: new ol.style.Style({
      image: new ol.style.Icon({
        anchor: [0.5, 1],
        src: 'img/marker.png',
      })
    })
  });
  map.addLayer(markers);
  
  var marker1 = new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat([20.9884, 50.0125])));
  var marker2 = new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat([20.9972, 49.9891])));
  markers.getSource().addFeature(marker1);
  markers.getSource().addFeature(marker2);

// PRZEŁĄCZNIK WARSTW
function ToogleLayersWMS_Osm(){
    osm_layer.setVisible(!osm_layer.getVisible());
    document.querySelector("#osm-wms")
}

function ToggleLayersWMS_OrtoHD(){
    ortoHD.setVisible(!ortoHD.getVisible());
    document.querySelector("#ortoHD-wms")
}

function ToggleLayersWMS_Ulice(){
    ulice.setVisible(!ulice.getVisible());
    document.querySelector("#ulice-wms")
}

function ToggleLayersWMS_Dzialki(){
    dzialki.setVisible(!dzialki.getVisible());
    document.querySelector("#dzialki-wms")
}

function ToggleLayersWMS_Cieniowanie(){
    cieniowanie.setVisible(!cieniowanie.getVisible());
    document.querySelector("#cieniowanie-wms")
}

function ToggleLayersWMS_MiegMap(){
    miegmap.setVisible(!miegmap.getVisible());
    document.querySelector("#miegmap-wms")
}

//AKTYWACJA POPUP'A
function DisplayPopupDiv(){
    let popup = document.querySelector('#popup-div');

    if(popup.classList.contains('popup-div-visible')==false){
        popup.classList.remove('popup-div-novisible');
        popup.classList.add('popup-div-visible');
    }
}
function ClosePopup(){
    let popupdiv=document.querySelector('#popup-div');
    popupdiv.classList.remove('popup-div-visible');
    popupdiv.classList.add('popup-div-novisible');
}
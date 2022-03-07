//POMIARY

let rysuj;                                                                          //zmienna rysowania
var helpTooltipElement = document.getElementsByClassName("ol-tooltip")[1];                                                             //Tooltip dla pomocy
let helpTooltip;                                                                    //Overlay dla helpa
let measureTooltipElement;                                                          //Tooltip dla pomiaru
let measureTooltip;                                                                 //Overlay dla pomiaru
const continuePolygonMsg = 'Kliknij aby kontynuować rysowanie wielokątu';           //Wiadomość podczas rysowania poligonu
const continueLineMsg = 'Kliknij aby kontynuoować rysowanie linii';                 //Wiadomość podczas rysowania linii

let wskaznik = function (evt)
{ 
	if (evt.dragging)
	{						
		return;
	}
	
	if (!document.getElementById("measureCheckbox").checked)                           //Jeżeli checkbox "Mierz" nie jest zaznaczony
	{
		return; 
	}	
	else
	{
		let helpMessage = 'Kliknij aby zacząć pomiar';

		if (rysuj) {												                    //Jeżeli trwa pomiar
			const geom = rysuj.getGeometry();			      //Stwórz stałą, pobierz dla pomiaru typ geometrii - Linestring/Polygon
			  if (geom instanceof ol.geom.Polygon)					        //Jeżeli typ geometrii to Polygon 
			  {				 
				  helpMessage = continuePolygonMsg;					          //Pokaż Tooltipa kontynuuacji rysowania poligonu
			  } 
			  else if (geom instanceof ol.geom.LineString) 		    	//Albo jeżeli typ geometrii to LineString
			  {
				  helpMessage = continueLineMsg;						          // Pokaż Tooltipa kontynuacji rysowania linii
			  }
	}
			
	helpTooltipElement.innerHTML = helpMessage;
	helpTooltip.setPosition(evt.coordinate);
	helpTooltipElement.classList.remove('hidden');
	}
};


map.on('pointermove', wskaznik);                                            
map.getViewport().addEventListener('mouseout', function () 
{        
  if (helpTooltipElement != undefined) {
    helpTooltipElement.classList.add('hidden');
  }            
});

const typeSelect = document.getElementById('type');

let draw; // global so we can remove it later

const formatLength = function (line) {
  const length = ol.sphere.getLength(line);
  let output;
  if (length >= 100) {
    output = Math.round((length / 1000) *100 ) / 100 + ' ' + 'km';
  } else {
    output = Math.round(length * 100) / 100 + ' ' + 'm';
  }
  return output;
};

const formatArea = function (polygon) {
  const area = ol.sphere.getArea(polygon);
  let output;
  if (area >= 10000) {
    output = Math.round(area / 1000000) + ' ' + 'km<sup>2</sup>';
  } else {
    output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>';
  }
  return output;
};

function addInteraction() {
	const type = typeSelect.value == 'area' ? 'Polygon' : 'LineString';
	draw = new ol.interaction.Draw({
		source: vector_layer.getSource(),
		type: type,
		style: new ol.style.Style({
			fill: new ol.style.Fill({
				color: 'rgba(255, 255, 255, 0.2)',
      }),

      stroke: new ol.style.Stroke({
        color: 'rgba(0,0,255,0.46)',
        lineDash: [10, 5],
        width: 3,
      }),
      image: new ol.style.Circle({
        radius: 5,
        stroke: new ol.style.Stroke({
          color: 'rgba(0, 0, 0, 0.7)',
        }),
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 255, 0.2)',
        }),
      }),
    }),
  });
  map.addInteraction(draw);
  createMeasureTooltip();
  createHelpTooltip();
}



let listener;

function ToogleMeasures(){
	let checkbox = document.querySelector('#measureCheckbox');
	if(checkbox.checked)
	{
		addInteraction();
		createHelpTooltip();

  draw.on('drawstart', function (evt) {
    // set sketch
    rysuj = evt.feature;
    let tooltipCoord = evt.coordinate;

    listener = rysuj.getGeometry().on('change', function (evt) {
      const geom = evt.target;
      let output;
      if (geom instanceof ol.geom.Polygon) {
        output = formatArea(geom);
        tooltipCoord = geom.getInteriorPoint().getCoordinates();
      } else if (geom instanceof ol.geom.LineString) {
        output = formatLength(geom);
        tooltipCoord = geom.getLastCoordinate();
      }
      measureTooltipElement.innerHTML = output;
      measureTooltip.setPosition(tooltipCoord);
    });
  });

  
draw.on('drawend', function () {
    measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
    measureTooltip.setOffset([0, -7]);
    // unset sketch
    rysuj = null;
    // unset tooltip so that a new one can be created
    measureTooltipElement = null;
    createMeasureTooltip();
    ol.Observable.unByKey(listener);
  });
	}
	else{
		map.removeInteraction(draw)
		map.removeInteraction(helpMessage)
	}
  
}

//Tworzenie nowego Tooltipa

function createHelpTooltip() {
  if (helpTooltipElement) {
    helpTooltipElement.parentNode.removeChild(helpTooltipElement);
  }
  helpTooltipElement = document.createElement('div');
  helpTooltipElement.className = 'ol-tooltip hidden';
  helpTooltip = new ol.Overlay({
    element: helpTooltipElement,
    offset: [15, 0],
    positioning: 'center-left',
  });
  map.addOverlay(helpTooltip);
}

//Tworzenie nowego Tooltipa pomiarowego

function createMeasureTooltip() {
  if (measureTooltipElement) {
    measureTooltipElement.parentNode.removeChild(measureTooltipElement);
  }
  measureTooltipElement = document.createElement('div');
  measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
  measureTooltip = new ol.Overlay({
    element: measureTooltipElement,
    offset: [0, -15],
    positioning: 'bottom-center',
    stopEvent: false,
    insertFirst: false,
  });
  map.addOverlay(measureTooltip);
}

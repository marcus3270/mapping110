//variables
let map;
var directionsManager;
let searchmanager;


const poiDropdown = document.getElementById("poiDropdown");
poiDropdown.addEventListener("onchange", getNearByLocations);

    

//Query URL to the PointsOfInterest data source

var sdsDataSourceUrl = 'http://spatial.virtualearth.net/REST/v1/data/Microsoft/PointsOfInterest';
function GetMap() {
    //CREATE INSTANCE OF THE MAP
    map = new Microsoft.Maps.Map('#myMap', {
        //credentials: 'Am_55J7TQBZ8GZRLhg - obr5nh0awrX - MpDUDvXY2UV1jHIaNnwdCtewEZR4IBat3',
    });
    //Request the user's location
    map.entities.clear();
    navigator.geolocation.getCurrentPosition(function (position) {
        //console.log(position);
        var loc = new Microsoft.Maps.Location(
            position.coords.latitude,
            position.coords.longitude);
        //Create custom Pushpin
        var pin = new Microsoft.Maps.Pushpin(loc, {
            color: 'red'
        });

        //Add a pushpin at the user's location.
        //var pin = new Microsoft.Maps.Pushpin(loc);
        map.entities.push(pin);
        
        //Center the map on the user's location.
        map.setView({ center: loc, zoom: 15 });
        

    });
    //Create an infobox to display content for each result.
    infobox = new Microsoft.Maps.Infobox(map.getCenter(), { visible: false });
    infobox.setMap(map);

    //Create a layer for the results.
    layer = new Microsoft.Maps.Layer();
    map.layers.insert(layer);

    //Add a click event to the layer to show an infobox when a pushpin is clicked.
    Microsoft.Maps.Events.addHandler(layer, 'click', function (e) {
        var m = e.target.metadata;

        infobox.setOptions({
            title: m.DisplayName,
            description: m.AddressLine + ', ' + m.Locality + ', ' + m.__Distance,
            location: e.target.getLocation(),
            visible: true,
            action: {
                label: 'Get Directions',
                eventHandler: LoadDirections(e)
            }
        });
    });       
    
    //Load the directions module.
    Microsoft.Maps.loadModule('Microsoft.Maps.Directions', LoadDirections);
    //Load the Bing Spatial Data Services module.
    Microsoft.Maps.loadModule('Microsoft.Maps.SpatialDataService', function () {
        //Add an event handler for when the map moves.
        Microsoft.Maps.Events.addHandler(map, 'viewchangeend', getNearByLocations);

        //Trigger an initial search.
       //getNearByLocations();
        
    });
}//end function

// variables
var slider = document.getElementById("myRange");
var output = document.getElementById("demo");

//slider for radius value
output.innerHTML = slider.value;

function getNearByLocations() {
    
   
    //let radiusValue = document.getElementById("slide").value;
    let dropdownValue = document.getElementById("poiDropdown").value;
    
    //Remove any existing data from the map.
   // map.entities.clear();
    
    //Hide infobox.
    infobox.setOptions({ visible: false });
    //console.log(radiusValue);
    //Create a query to get nearby data.
    var queryOptions = {
        queryUrl: sdsDataSourceUrl,
        spatialFilter: {
            spatialFilterType: 'nearby',
            location: map.getCenter(),
            radius: slider.value
        },
        //Filter to retrieve Ga.
        filter: new Microsoft.Maps.SpatialDataService.Filter('EntityTypeID', 'eq', dropdownValue ),
        
    };
    
    //Process the query.
    Microsoft.Maps.SpatialDataService.QueryAPIManager.search(queryOptions, map, function (data) {
        //Add results to the map.
        console.log(data)
        var outputHtml = "";
        
        for (let i = 0; i < data.length; i++) {
            // code to be executed
            outputHtml +=data[i].metadata.DisplayName;
            outputHtml +=data[i].metadata.AddressLine;
            outputHtml += data[i].metadata.__Distance;

        }//end of loop
        document.getElementById("results").innerHTML = outputHtml;
        map.entities.push(data);
        //Add results to the layer.
        layer.add(data);
        
    });
}
   

function LoadDirections(e) {
    
    //Request the user's location
    //map.entities.clear();
   
    let tempToWaypoint = e.target.getLocation();
    navigator.geolocation.getCurrentPosition(function (position) {

        var lat = position.coords.latitude;
        var lon = position.coords.longitude; 
        console.log(lat);
        //Create an instance of the directions manager.
        directionsManager = new Microsoft.Maps.Directions.DirectionsManager(map); //<-- pass map to render directions on
        //Create waypoints to route between.
        //Create waypoints to route between.
        console.log(lat);
        var workWaypoint = new Microsoft.Maps.Directions.Waypoint({ address: 'Work', location: new Microsoft.Maps.Location( lat , lon ) });
        directionsManager.addWaypoint(workWaypoint);
        var secondWaypoint = new Microsoft.Maps.Directions.Waypoint({ location: tempToWaypoint });
        directionsManager.addWaypoint(secondWaypoint);

        var requestOptionsData = {
            distanceUnit: Microsoft.Maps.Directions.DistanceUnit.miles,
            routeAvoidance: [Microsoft.Maps.Directions.RouteAvoidance.avoidLimitedAccessHighway]
        };

        //Set the request options that avoid highways and uses kilometers.
        directionsManager.setRequestOptions(requestOptionsData);

        //Make the route line thick and green. Replace the title of waypoints with an empty string to hide the default text that appears.
        var routeStyleData = {
            drivingPolylineOptions: { strokeColor: 'green', strokeThickness: 6 },
            waypointPushpinOptions: { title: '' }
        }

        directionsManager.setRenderOptions(routeStyleData);
        //Specify the element in which the itinerary will be rendered.
        directionsManager.setRenderOptions({ itineraryContainer: '#directionsItinerary' });


        //Calculate directions.
        directionsManager.calculateDirections();
    });
}
slider.oninput = function () {
    output.innerHTML = this.value;
}

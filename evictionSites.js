// TO MAKE THE MAP APPEAR YOU MUST
// ADD YOUR ACCESS TOKEN FROM
// https://account.mapbox.com
//
//
let evictions;
let hydrants;

function setup(){

    evictions = loadJSON('/data/nyc_evictions_2019-2020.json');
    hydrants = loadJSON('/data/nyc_hydrants.json');

}


mapboxgl.accessToken = 'pk.eyJ1IjoibW50bm0iLCJhIjoiY2tvNjQ5cHpiMWNobjJubHIxczcyYTl4YSJ9.rwhEtzQHJIBEVcw0QgMeVw';

var mappa = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mntnm/ckohqsc9w3x0l17mx5z89pntj',
    center: [-73.946331, 40.780991],
    zoom: 13
});


mappa.on('load', function(){
    

    mappa.addSource('hydrants', hydrants );
    mappa.addLayer({
        'id': 'hydrants',
        'type': 'circle',
        'source': 'hydrants',
        'layout': {
            'visibility': 'none'
        },
        'paint': {
            'circle-color': 'blue',
            'circle-radius': 2,
        }
    });

    mappa.addSource('evictions', evictions );
    mappa.addLayer({
        'id': 'evictions',
        'type': 'circle',
        'source': 'evictions',
        'paint': {
            'circle-color': 'red',
            'circle-radius': 4,
            'circle-opacity': 0.5,
        },
        'layout': {
            'visibility': 'none'
        },
    });

    // Create a popup, but don't add it to the map yet.
    var popup = new mapboxgl.Popup({
        className: "eviction-popup",
        closeButton: true,
        closeOnClick: true,
    }).setMaxWidth(600);


    // commGardens
    mappa.on('mouseenter', 'evictions', function (e) {
        // Change the cursor style as a UI indicator.
        mappa.getCanvas().style.cursor = 'pointer';

        var coordinates = e.features[0].geometry.coordinates.slice();

        var courtidxnum = e.features[0].properties.courtidxnum;
        var rescomm = e.features[0].properties.rescomm;
        var evicposs = e.features[0].properties.evicposs;
        var borough = e.features[0].properties.borough;


        var d_coordinates = "<div>coordinates: " + coordinates + "</div>";
        var d_courtidxnum = "<div>Court Index Number: " + courtidxnum + "</div>";
        var d_rescomm = "<div>Residential/Commercial: " + rescomm + "</div>";
        var d_evicposs = "<div>Eviction / Legal Possession: " + evicposs + "</div>";

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        // Populate the popup and set its coordinates
        // based on the feature found.
        popup.setLngLat(coordinates).setHTML(
                                             d_coordinates+
                                             d_courtidxnum+
                                             d_rescomm+
                                             d_evicposs
                                             ).addTo(mappa);
    });

    mappa.on('mouseleave', 'emptyLots', function () {
        mappa.getCanvas().style.cursor = '';
        //popup.remove();
    });


    // some utils
    insert = function insert(main_string, ins_string, pos) {
       if(typeof(pos) == "undefined") {
        pos = 0;
      }
       if(typeof(ins_string) == "undefined") {
        ins_string = '';
      }
       return main_string.slice(0, pos) + ins_string + main_string.slice(pos);
        }

    function addNewLines (str) { 
        var indices = [];
        for(var i=0; i<str.length;i++) {
            if (str[i] === ",") indices.push(i);}
        insertnewline = []
        var c = 0;
        for (var idx in indices){
            if (c % 3 == 0 && c != 0){
                insertnewline.push(indices[idx])
            }
            c++; 
        }
        insertnewline.reverse();
        var finalstr = str;
        for (var idx in insertnewline){
            finalstr = insert(finalstr, "<br>",insertnewline[idx]+1)
        }
        return finalstr;
    }

    // emptyLots
    mappa.on('mouseenter', 'emptyLots', function (e) {
        // Change the cursor style as a UI indicator.
        mappa.getCanvas().style.cursor = 'pointer';

        console.log(e.features[0]);

        var coordinates = e.features[0].geometry.coordinates.slice();
        var name = e.features[0].properties.name;
        var occupation = e.features[0].properties.occupation;

        var lotnr = e.features[0].properties.lotnr;
        var pic1 = e.features[0].properties.pic1;
        var description = e.features[0].properties.description;
        var streetview = e.features[0].properties.streetview;

        description = addNewLines(description);


        var d_name = "<h2 style='color:blue;'>" + "Empty Lot" + "</h2>";
        var d_occupation = "<div>occupation: " + occupation + "</div>";
        var d_description = "<div>description: <br> " + description + "</div>";
        var d_coordinates = "<div>coordinates: " + coordinates + "</div>";
        var d_pic1 = "<img src=/assets/emptyLots/" + pic1 + " class='popupImage'>";
        var d_streetview = "<a target='_blank' href='" + streetview + "'>link to streetview</a>";
        var d_lotnr = "<div>lotnr: " + lotnr + "</div>";

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        // Populate the popup and set its coordinates
        // based on the feature found.
        popup.setLngLat(coordinates).setHTML(d_pic1+
                                             d_name+
                                             d_coordinates+
                                             d_lotnr+
                                             d_occupation+
                                             d_description+
                                             d_streetview
                                             ).addTo(mappa);
    });

    mappa.on('mouseleave', 'emptyLots', function () {
        mappa.getCanvas().style.cursor = '';
        //popup.remove();
    });

    // After the last frame rendered before the map enters an "idle" state.
    mappa.on('idle', function () {
        // If these two layers have been added to the style,
        // add the toggle buttons.
        if (mappa.getLayer('evictions') && mappa.getLayer('hydrants')) {
            // Enumerate ids of the layers.
            var toggleableLayerIds = ['evictions', 'hydrants'];
            // Set up the corresponding toggle button for each layer.
            for (var i = 0; i < toggleableLayerIds.length; i++) {
                var id = toggleableLayerIds[i];
                if (!document.getElementById(id)) {
                    // Create a link.
                    var link = document.createElement('a');
                    link.id = id;
                    link.href = '#';
                    link.textContent = id;
                    link.className = '';
                    // Show or hide layer when the toggle is clicked.
                    link.onclick = function (e) {
                        var clickedLayer = this.textContent;
                        e.preventDefault();
                        e.stopPropagation();
                         
                        var visibility = mappa.getLayoutProperty(
                            clickedLayer,
                            'visibility'
                        );
                         
                        // Toggle layer visibility by changing the layout object's visibility property.
                        if (visibility === 'visible') {
                            mappa.setLayoutProperty(
                            clickedLayer,
                            'visibility',
                            'none'
                        );
                            this.className = '';
                        } else {
                            this.className = 'active';
                            mappa.setLayoutProperty(
                                clickedLayer,
                                'visibility',
                                'visible'
                            );
                        }
                    };
                     
                    var layers = document.getElementById('menu');
                    layers.appendChild(link);
                }
            }
        }
    });

});


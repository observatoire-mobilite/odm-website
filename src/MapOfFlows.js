import React from 'react';
import DeckGL from '@deck.gl/react';
import {Map} from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import {BASEMAP} from '@deck.gl/carto';
import FlowMapLayer from '@flowmap.gl/core';
//import FlowMapLayer from '@flowmap.gl/react';
//import FlowMapLayer from '@flowmap.gl/layers';
import 'maplibre-gl/dist/maplibre-gl.css';
import {CSVLoader} from '@loaders.gl/csv';
import {load} from '@loaders.gl/core';


// Viewport settings
const INITIAL_VIEW_STATE = {
  longitude: 6.131935,
  latitude: 49.8,
  zoom: 9,
  pitch: 0,
  bearing: 0
};

function getLocations() {
  return [
    {id: 1011,name: "Bascharage", lat: 49.574, lon: 5.90563005},
    {id: 1021, name: "Clemency", lat: 49.603, lon: 5.88867729}
  ];
  
  const dta = load('data/demand/locations.csv', CSVLoader);
  return dta;
}

function getFlows() {
  return [
    {origin: 1011, dest: 1021, flow: 100}
  ]
  return load('data/demand/flows.csv', CSVLoader);
}


function FlowMap(props) {

  const {multiplier = 1} = props;

  return (
    <DeckGL 
        initialViewState={INITIAL_VIEW_STATE} 
        controller={true} 
        getTooltip={({d}) => d && `<b>Lieu:</b> ${d.StopPointShortName}`}
        width="100%"
        height="600px"
        style={{ position: 'relative'}}>
      <Map mapLib={maplibregl} mapStyle={BASEMAP.POSITRON} />
      <FlowMapLayer
        id="mobility_demand"
        showOnlyTopFlows={10}
        clusteringEnabled={true}
        clusteringLevel={2}
        feckDech={true}
        locations={getLocations()}
        flows={getFlows()}
        getFlowMagnitude={(flow) => flow.count * multiplier || 0}
        getFlowOriginId={(flow) => flow.origin}
        getFlowDestId={(flow) => flow.dest}
        getLocationId={(loc) => loc.id}
        getLocationCentroid={(location) => [location.lon, location.lat]}
        pickable={true} 
      />
    </DeckGL>
  )
}

export default FlowMap;
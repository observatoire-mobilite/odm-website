import React, {useEffect, useState} from 'react';
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

import Tooltip from '@mui/material/Tooltip';

// Viewport settings
const INITIAL_VIEW_STATE = {
  longitude: 6.131935,
  latitude: 49.8,
  zoom: 9,
  pitch: 0,
  bearing: 0
};

function getLocations() {
  return []
}

function getFlows() {
  return [
    {origin: 1011, dest: 1021, flow: 100}
  ]
  return load('data/demand/flows.csv', CSVLoader);
}


function LoadData() {
  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [flows, setFlows] = useState([]);
  const [loadingFlows, setLoadingFlows] = useState(true);
  const [highlighted, setHighlighted] = useState([]);
  useEffect(() => {
    load('data/demand/locations.csv', CSVLoader).then(dta => {
      setLocations(dta);
      setLoadingLocations(false)
    })
    load('data/demand/flows.csv', CSVLoader).then(dta => {
      setFlows(dta);
      setLoadingFlows(false);
    })
  }, [])  // empty array: don't call effect on updates

  const multiplier = 1
  return (
    <DeckGL 
      initialViewState={INITIAL_VIEW_STATE} 
      controller={true} 
      getTooltip={({d}) => d && `<b>Lieu:</b> ${d.StopPointShortName}`}
      width="100%"
      height="600px"
      style={{ position: 'relative'}}
    >
      <p>{highlighted?.name} ({highlighted?.id})</p>
      <Map mapLib={maplibregl} mapStyle={BASEMAP.POSITRON} />
      {(loadingFlows & loadingLocations) ? (<p>Loading...</p>) : (
        <FlowMapLayer
          id="mobility_demand"
          showOnlyTopFlows={20}
          clusteringEnabled={true}
          clusteringLevel={2}
          adaptiveScalesEnabled={true}
          locations={locations}
          flows={flows}
          getFlowMagnitude={(flow) => flow.count}
          getFlowOriginId={(flow) => flow.origin}
          getFlowDestId={(flow) => flow.dest}
          getLocationId={(loc) => loc.id}
          getLocationName={(loc) => loc.name}
          getLocationCentroid={(location) => [location.lon, location.lat]}
          pickable={true} 
          colorScheme="Teal"
          highlightColor="orange"
          maxTopFlowsDisplayNum={5000}
          visible={true}
          highlightedLocationId={highlighted?.id}
          onClick={(info) => setHighlighted(info?.object)}
        />
      )}
    </DeckGL>
  )
}


function FlowMap(props) {

  const {multiplier = 1} = props;

  return (
      <LoadData />
  )
}

export default FlowMap;
import React from 'react';
import DeckGL from '@deck.gl/react';
import {Map} from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import {BASEMAP} from '@deck.gl/carto';
import {ScatterplotLayer} from '@deck.gl/layers';
import {CSVLoader} from '@loaders.gl/csv';
import FlowMapLayer from '@flowmap.gl/core';
import 'maplibre-gl/dist/maplibre-gl.css';


// Viewport settings
const INITIAL_VIEW_STATE = {
  longitude: 6.131935,
  latitude: 49.8,
  zoom: 9,
  pitch: 0,
  bearing: 0
};


function DeckGLMap() {

  return (
    <DeckGL initialViewState={INITIAL_VIEW_STATE} controller={true} getTooltip={({d}) => d && `<b>Stop:</b> ${d.StopPointShortName}`} width="100%" height="100%" style={{ position: 'relative'}}>
      <Map mapLib={maplibregl} mapStyle={BASEMAP.POSITRON} />
      <ScatterplotLayer 
        data="stops.csv"
        loaders={[CSVLoader]}
        loadOptions={{
          csv: {
            header: true
          }
        }}
        pickable={true}
        opacity={0.8}
        filled={true}
        getPosition={d => [d.StopPointLongitude, d.StopPointLatitude]}
        getFillColor={d => [255, 140, 0]}
        getLineColor={d => [0, 0, 0]}
        getRadius={d => d.passengers}
        radiusScale={.1}
        radiusMinPixels={1}
        radiusMaxPixels={100}
      />
      <FlowMapLayer
        id="my-flowmap-layer"
        locations={[
          { id: 1, name: 'New York', lat: 40.713543, lon: -74.011219 }, 
          { id: 2, name: 'London', lat: 51.507425, lon: -0.127738 }, 
          { id: 3, name: 'Rio de Janeiro', lat: -22.906241, lon: -43.180244 }
        ]}
        flows={[
          { origin: 1, dest: 2, count: 42 },
          { origin: 2, dest: 1, count: 51 },
          { origin: 3, dest: 1, count: 50 },
          { origin: 2, dest: 3, count: 40 },
          { origin: 1, dest: 3, count: 22 },
          { origin: 3, dest: 2, count: 42 }
        ]}
        getFlowMagnitude={(flow) => flow.count || 0}
        getFlowOriginId={(flow) => flow.origin}
        getFlowDestId={(flow) => flow.dest}
        getLocationId={(loc) => loc.id}
        getLocationCentroid={(location) => [location.lon, location.lat]}
      />
    </DeckGL>
  )
}

export default DeckGLMap;
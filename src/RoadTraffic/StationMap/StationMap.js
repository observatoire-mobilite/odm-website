import { useMemo, useState, useCallback } from "react"
import { shallow } from "zustand/shallow"

import { useTheme, styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton'

import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CropFreeIcon from '@mui/icons-material/CropFree';

import {useRoadTrafficStore} from "../store/useRoadTrafficStore"

import DeckGL from '@deck.gl/react';
import {Map} from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import {ScatterplotLayer} from '@deck.gl/layers';
import 'maplibre-gl/dist/maplibre-gl.css';


const InitialHint = styled(Typography)(({theme}) => ({
    borderRadius: '.4em',
    top: 'calc(50% - 4em)',
    width: '20em',
    inlineSize: '15em',
    left: 'calc(50% - 10em)',
    fontSize: '1em',
    color: 'white',
    position: 'absolute',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0, .6)'
}))

// Viewport settings
const INITIAL_VIEW_STATE = {
    longitude: 6.131935,
    latitude: 49.8,
    zoom: 9,
    pitch: 0,
    bearing: 0
};


export default function StationMap({countsByStation=[], ymax=null, radiusScale=.001}) {
    console.count('station-map')
    const [locations, hourly, currentStation, setCurrentStation] = useRoadTrafficStore(
      (state) => [state.locations, state.hourly, state.currentStation, state.setCurrentStation], shallow)
  
    const {overview, maxCount} = useMemo(() => {
      if (hourly === null) return {overview: [], maxCount: 0}
      const overview = hourly.reduce((kv, {id, count_weekday}) => {
        kv[id] = (kv[id] ?? 0) + count_weekday
        return kv
      }, {})
      return {overview, maxCount: ymax === null ? Math.max(...Object.values(overview)) : ymax}
    }, [hourly])
  
    const theme = useTheme()
    const [colorPrimary, colorSecondary] = useMemo(() => ([
      theme.palette.primary.main_rgb,
      theme.palette.secondary.main_rgb
    ]))
    const [viewState, setViewState] = useState(INITIAL_VIEW_STATE)
    const handleResetView = useCallback((evt) => { setViewState(INITIAL_VIEW_STATE) })
    const handleZoomIn = useCallback((evt) => { setViewState({...viewState, zoom: viewState.zoom + .5}) })
    const handleZoomOut = useCallback((evt) => { setViewState({...viewState, zoom: viewState.zoom - .5}) })
    console.log(viewState)
    return (
      <DeckGL 
        controller={{doubleClickZoom: false, touchRotate: false}}
        style={{position: 'relative', height: '100%'}}
        getCursor={({isHovering}) => isHovering ? 'pointer' : 'grab'}
        viewState={viewState}
        onViewStateChange={(evt) => setViewState(evt.viewState)}
      >
        <Map mapLib={maplibregl} mapStyle="style.json" doubleClickZoom={false} />
        <ScatterplotLayer 
          data={locations?.filter(({POSTE_ID}) => overview[POSTE_ID] > 0) ?? locations}
          opacity={0.8}
          getPosition={({DDLon, DDLat}) => [DDLon, DDLat]}
          getFillColor={({POSTE_ID}) => { return (POSTE_ID == currentStation?.POSTE_ID ? colorSecondary : colorPrimary)}}
          getRadius={({POSTE_ID}) => overview[POSTE_ID]}
          radiusScale={radiusScale}
          radiusMinPixels={10}
          radiusMaxPixels={30}
          pickable={true}
          highlightColor={theme.palette.secondary.dark}
          autoHighlight={true}
          onClick={({object}, evt) => { setCurrentStation(object ?? currentStation); }}
          updateTriggers={{
            getRadius: [overview, maxCount],
            getPosition: [locations],
            getFillColor: [currentStation]
          }}
        />
        <Stack style={{right: '0', position: 'absolute'}}>
          <IconButton color="primary" title="zoomer en avant sur la carte" onClick={handleZoomIn}><ZoomInIcon /></IconButton>
          <IconButton color="primary" title="zoomer en arrière sur la carte" onClick={handleZoomOut}><ZoomOutIcon /></IconButton>
          <IconButton color="primary" title="centrer sur le Luxembourg" onClick={handleResetView}><CropFreeIcon /></IconButton>
        </Stack>
        {currentStation === null ? <InitialHint sx={{p: 2}}>Cliquez sur un compteur de traffic (disques bleus) sur la carte</InitialHint> : null}
      </DeckGL>
    )
  }
  
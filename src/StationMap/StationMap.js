import {useState, Link} from 'react';

import DeckGL from '@deck.gl/react';
import {Map} from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import {ScatterplotLayer} from '@deck.gl/layers';
import 'maplibre-gl/dist/maplibre-gl.css';

import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CropFreeIcon from '@mui/icons-material/CropFree';
import LockIcon from '@mui/icons-material/Lock';

import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import { useTheme } from '@mui/material/styles';
import Alert from '@mui/material/Alert';


// Viewport settings
const INITIAL_VIEW_STATE = {
    longitude: 6.131935,
    latitude: 49.8,
    zoom: 9,
    pitch: 0,
    bearing: 0
};
  

export default function StationMap({stations, onSelect=((e) => undefined), countsByStation=[], currentStation=null}) {
    const [currentIndex, setCurrentIndex] = useState(null)
    const theme = useTheme()

    if (! stations) return <Skeleton />
  
    return (
      <DeckGL initialViewState={INITIAL_VIEW_STATE} controller={true} style={{position: 'relative', height: '100%'}} getCursor={({isHovering}) => isHovering ? 'pointer' : 'grab'}>
        <Map mapLib={maplibregl} mapStyle="style.json" />
        {stations.length == 0 && <Alert severity="warning">There is not a single station on the map.</Alert>}
        <ScatterplotLayer 
          data={stations}
          opacity={0.8}
          getPosition={({x, y}) => [x, y]}
          getFillColor={theme.palette.primary.main_rgb}
          getRadius={10}
          radiusScale={1}
          radiusMinPixels={3}
          radiusMaxPixels={30}
          pickable={true}
          highlightColor={theme.palette.secondary.main_rgb}
          highlightedObjectIndex={currentIndex}
          onClick={({object, index}) => { onSelect(object); setCurrentIndex(index) }}
          updateTriggers={{}}
        />
        <Stack style={{right: '0', position: 'absolute'}}>
          <IconButton color="primary" title="zoom in on map"><ZoomInIcon /></IconButton>
          <IconButton color="primary" title="zoom out of map"><ZoomOutIcon /></IconButton>
          <IconButton color="primary" title="put entrie country into view"><CropFreeIcon /></IconButton>
          <IconButton color="primary" title="lock map - can simplify scrolling down to other widgets" disabled><LockIcon /></IconButton>
        </Stack>
        {currentIndex === null ? <Typography sx={{p: 2}} style={{
          borderRadius: '.4em',
          top: 'calc(50% - 4em)',
          width: '20em',
          inlineSize: '15em',
          left: 'calc(50% - 10em)',
          fontSize: '1em',
          color: 'white',
          position: 'absolute',
          textAlign: 'center',
          backgroundColor: 'rgba(0,0,0, .6)'}}>Click any counting station (dot on the map) to start.<br />Dot-sizes are proportional to average charged energy.</Typography> : null}
      </DeckGL>
    )
  }
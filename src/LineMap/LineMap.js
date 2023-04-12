import { useEffect, useState, useCallback, useContext } from 'react';
import { useTheme } from '@mui/material/styles';
import ZoomableSVG from './ZoomableSVG.js'
import Line from './Line.js'
import Station from './Station.js'
import Stop from './Stop.js'
import MapState from './MapState.js'

export default function LineMap({mapdata='data/publictransport/trainmap.json', children}) {
    console.count('map')
    
    const theme = useTheme()

    const [mapLoaded, setMapLoaded] = useState(false);
    const [lineMap, setLineMap] = useState(null);
    useEffect(() => {
        setMapLoaded(false);
        fetch(mapdata)
        .then((r) => r.json())
        .then((dta) => {
            setLineMap(dta);
            setMapLoaded(true);
        }).catch((e) => {
            console.log(e.message)
        });
    }, [])

    if (! mapLoaded) return
    
    return (<MapState>
        <ZoomableSVG>
            <g id='frontier'><path d={lineMap.frontier} stroke={theme.palette.grey[300]} style={{storke: 'black', fill: 'none', strokeWidth: '5'}} /></g>
            <g id='lines'>
                {lineMap.lines.map((line, idx) => <Line key={`line-${idx}`} line={line} />)}
            </g>
            <g id="stations">
                {lineMap.stations.map((station, idx) => <Station key={`station-marker-${idx}`} station={station} />)}
            </g>
            <g id="stops">
                {lineMap.stops.map((stop, idx) => <Stop key={`stop-marker-${idx}`} stop={stop}/>)}
            </g>
        </ZoomableSVG>
        {children}
    </MapState>)
}

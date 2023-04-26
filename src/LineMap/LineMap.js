import { Fragment } from 'react';
import { useTheme } from '@mui/material/styles';
import ZoomableSVG from './ZoomableSVG'
import Line from './Line'
import Stop from './Stop'
import { useLineMap } from './store';
import {styled} from '@mui/material/styles';


const BorderLine = styled('path')(({theme}) => ({
    stroke: theme.palette.grey[300],
    storke: 'black',
    fill: 'none',
    strokeWidth: '5'
}))


const StationCircle = styled('circle')(({theme}) => ({
    pointerEvents: "visible",
    stroke: 'none',
    fill: 'black'
}))


export default function LineMap({url, children, svgClass}) {
    
    const theme = useTheme()
    const lineMap = useLineMap(url)
    
    if (lineMap === null) return
    return (<Fragment>
        <ZoomableSVG svgClass={svgClass}>
            <g id='frontier'><BorderLine d={lineMap.frontier} /></g>
            <g id='lines'>
                {lineMap.lines.map((line, idx) => <Line key={`line-${idx}`} line={line} />)}
            </g>
            <g id="stations">
                {lineMap.stations.map((station, idx) => 
                    <StationCircle key={`station-marker-${idx}`} cx={station.cx} cy={station.cy} r={station.r} />
                )}
            </g>
            <g id="stops">
                {lineMap.stops.map((stop, idx) => <Stop key={`stop-marker-${idx}`} stop={stop}/>)}
            </g>
        </ZoomableSVG>
        {children}
    </Fragment>)
    
}

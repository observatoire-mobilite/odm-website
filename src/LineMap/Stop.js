import { useCallback, useContext } from 'react';
import { useTheme } from '@mui/material/styles';
import { animated, useSpring } from '@react-spring/web'
import {MapContext} from './MapState.js'


export default function Stop({stop}) {
    const { setCurrentStop } = useContext(MapContext)
    const iAmChosen = useCallback(() => setCurrentStop(stop))
    const theme = useTheme()

    //console.count('busstop')
    const [springs, api] = useSpring(() => ({r: stop.r, opacity: 0}))

    const textStyle = {
        fontSize: (stop.r > 13 && stop.label != 'Senningerberg' && stop.label != 'Leudelange') ? 15 : 5,
        paintOrder: 'stroke',
        stroke: 'white',
        strokeWidth: stop.r ? stop.r / 20: 1,
        alignmentBaseline: 'central'
    }

    const stopMarkerStyle = {    
        stroke: 'black',
        fill: 'none'
    }

    const highlightedStopMarkerStyle = {
        fill: theme.palette.secondary.main,
        stroke: theme.palette.secondary.light,
        opacity: springs.opacity,
    }

    const hiddenStopMarkerStyle = {
        fill: 'none',
        stroke: 'none',
        cursor: 'pointer'
    }

    const text = <text x={stop.lx ?? (stop.cx  + stop.r * 0.7071 * 1.3)} y={stop.ly ?? (stop.cy - stop.r * 0.7071 * 1.3)} style={textStyle}>{stop.label}</text>

    if (stop.path) {
        return(<g id={`stop-${stop.id}`}>
            {text}
            <path d={stop.path} style={stopMarkerStyle} />
            <animated.path d={stop.path} style={highlightedStopMarkerStyle} />
            <path d={stop.path} style={hiddenStopMarkerStyle} 
                pointerEvents="visible"
                onMouseEnter={() => api.start({opacity: 1})} 
                onMouseLeave={() => api.start({opacity: 0})}
                onClick={iAmChosen}
            />
        </g>)
    }
    
    if (stop.cx && stop.cy && stop.r) {
        return (<g id={`stop-${stop.id}`}>
            {text}
            <circle cx={stop.cx} cy={stop.cy} r={stop.r} style={stopMarkerStyle} />
            <animated.circle cx={stop.cx} cy={stop.cy} r={springs.r} style={highlightedStopMarkerStyle} />
            <circle cx={stop.cx} cy={stop.cy} r={stop.r + 5} style={hiddenStopMarkerStyle}
                pointerEvents="visible"
                onMouseEnter={() => api.start({r: stop.r + 5, opacity: 1})} 
                onMouseLeave={() => api.start({r: stop.r, opacity: 0})}
                onClick={() => setCurrentStop(stop)}
            /> 
        </g>)
    }
}
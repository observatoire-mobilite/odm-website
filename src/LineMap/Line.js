import { useCallback, useContext } from 'react';
import { useTheme } from '@mui/material/styles';
import { animated, useSpring, to } from '@react-spring/web'
import {MapContext} from './MapState.js'


export default function Line({line}) {
    //console.count('busline')
    const theme = useTheme()
    const { setCurrentLine } = useContext(MapContext)
    const [style, api] = useSpring(() => ({stroke: theme.palette.primary.main}))
    const key = `line-${line.id}`
    const iAmTheChosenOne = useCallback(() => setCurrentLine(line))

    return (<g id={key} style={{ fill: 'none' }}>
        <g style={{ stroke: 'white', strokeWidth: 4, opacity: 0.9 }}>
            {line.d.map((d, idx) => <path key={`${key}-underlay-${idx}`} d={d} />)}
        </g>
        <animated.g style={{ stroke: style.stroke, strokeWidth: 2 }}>
            {line.d.map((d, idx) => <path key={`${key}-itinerary-${idx}`} d={d}/>)}
        </animated.g>
        <g style={{ stroke: 'none', strokeWidth: 5, cursor: 'pointer' }}
            pointerEvents="visibleStroke"
            onMouseEnter={(evt) => api.start({stroke: theme.palette.secondary.main})} 
            onMouseLeave={(evt) => api.start({stroke: theme.palette.primary.main})} 
            onClick={iAmTheChosenOne}
        >
            {line.d.map((d, idx) => <path key={`${key}-uioverlay-${idx}`} d={d} />)}
        </g>
    </g>)
}
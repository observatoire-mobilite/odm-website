import { useCallback, Fragment } from 'react';
import { useLineMapCurrent } from '../store';
import { styled } from '@mui/material';

// styles: town labels
const StopLabel = styled('text')(({theme}) => ({
    paintOrder: 'stroke',
    stroke: theme.palette.primary.contrastText,
    fill: theme.palette.text,
    alignmentBaseline: 'central'
}))

const [StopMarkerCircle, StopMarkerPath] = ['circle', 'path'].map((k) => styled(k)(({theme}) => ({
    stroke: theme.palette.grey[900],
    strokeWidth: 1,
    fill: 'none',
})))

const [StopMarkerCircleOverlay, StopMarkerPathOverlay] = ['circle', 'path'].map((k) => styled(k)(({theme}) => ({
    fill: theme.palette.secondary.main,
    stroke: theme.palette.secondary.light,
    cursor: 'pointer',
    pointerEvents: 'visible',
    opacity: 0,
    transition: 'opacity 0.5s',
    '&:hover': {
        opacity: 1
    }
})))

const StopMarkerAnnularOverlay = styled('circle')(({theme}) => ({
    stroke: theme.palette.secondary.main,
    strokeWidth: 5,
    fill: 'none',
    opacity: 0,
    cursor: 'pointer',
    pointerEvents: 'visibleStroke',
    transition: 'opacity 0.5s',
    '&:hover': {
        opacity: 1
    }
}))

export default function Stop({stop}) {
    const [ setCurrentStop ] = useLineMapCurrent('Stop')
    const handleClick = useCallback((evt) => { setCurrentStop(stop) }, [stop])

    return (<g id={`stop-${stop.id}`}>
        {stopmarker(stop, handleClick)}
    </g>)

}

function stopmarker(stop, handleClick) {

    const label = (
        <StopLabel
            fontSize={(stop.r > 13 && stop.label != 'Senningerberg' && stop.label != 'Leudelange') ? 15 : 7}
            x={stop.lx ?? (stop.cx  + stop.r * 0.7071 * 1.3)}
            y={stop.ly ?? (stop.cy - stop.r * 0.7071 * 1.3)}
        >{stop.label}</StopLabel>
    )

    if (stop.id == 407) {
        return (<Fragment>
            <StopMarkerCircle cx={stop.cx} cy={stop.cy} r={stop.r} />
            {label}
            <StopMarkerAnnularOverlay cx={stop.cx} cy={stop.cy} r={stop.r} onClick={handleClick} /> 
        </Fragment>)
    }

    if (stop.path)
        return(<Fragment>
            <StopMarkerPath d={stop.path} />
            {label}
            <StopMarkerPathOverlay d={stop.path} onClick={handleClick}/>
        </Fragment>)
    
    if (stop.cx && stop.cy && stop.r)
        return (<Fragment>
            <StopMarkerCircle cx={stop.cx} cy={stop.cy} r={stop.r} />
            {label}
            <StopMarkerCircleOverlay cx={stop.cx} cy={stop.cy} r={stop.r + 5} onClick={handleClick} /> 
        </Fragment>)

    console.log(`WARNING: no geometry specified for "${stop.label}" (${stop.id})`)
    return (<Fragment></Fragment>)

}

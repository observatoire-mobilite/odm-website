import { useCallback, useContext } from 'react';
import { useTheme } from '@mui/material/styles';
import { animated, useSpring, to } from '@react-spring/web'
import { useLineMapStore } from '../store';
import {styled} from '@mui/material/styles'


const LineUnderlay = styled('g')(({theme}) => ({
    fill: 'none',
    stroke: theme.palette.primary.contrastText,
    strokeWidth: 4,
    opacity: 0.9
}))

const LineTrace = styled('g')(({theme}) => ({
    fill: 'none',
    stroke: theme.palette.primary.main,
    strokeWidth: 2,
}))

const LineUIOverlay = styled('g')(({theme}) => ({
    fill: 'none',
    opacity: 0,
    stroke: theme.palette.secondary.main,
    strokeWidth: 2,
    strokeLinejoin: "round",
    strokeLineend: "round",
    cursor: 'pointer',
    pointerEvents: 'visibleStroke',
    '&:hover': {
        opacity: 1, 
        strokeWidth: 5
    }
}))


export default function Line({line}) {
    //console.count('busline')
    const theme = useTheme()
    const [ setCurrentLine ] = useLineMapStore((state) => [state.setCurrentLine])
    const key = `line-${line.id}`
    const iAmTheChosenOne = useCallback(() => setCurrentLine(line))

    return (<g id={key}>
        <LineUnderlay>
            {line.d.map((d, idx) => <path key={`${key}-underlay-${idx}`} d={d} />)}
        </LineUnderlay>
        <LineTrace>
            {line.d.map((d, idx) => <path key={`${key}-itinerary-${idx}`} d={d}/>)}
        </LineTrace>
        <LineUIOverlay onClick={iAmTheChosenOne}>
            {line.d.map((d, idx) => <path key={`${key}-uioverlay-${idx}`} d={d} />)}
        </LineUIOverlay>
    </g>)
}
import { useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { useZonalFlowMapStore } from '../store';
import { shallow } from 'zustand/shallow';
import { styled } from '@mui/material/styles';

const ZoneFlowMapZone = styled('g')(({theme}) => ({
    fill: theme.palette.primary.main,
    stroke: 'white',
    strokeWidth: 1,
    strokeLinecap: 'butt',
    strokeLinejoin: 'round',
    strokeMiterlimit: 4,
    strokeDasharray: 'none',
    cursor: 'pointer',
    pointerEvents: 'visiblePainted',
    transition: 'fill 0.3s ease',
    '&.lighter': {
        fill: theme.palette.primary.light
    },
    '&:hover': {
        fill: theme.palette.primary.dark,
    },
    '&.chosen': {
        fill: theme.palette.secondary.main
    },
    '&.chosen:hover': {
        fill: theme.palette.secondary.light
    },
}))


export default function Zones({
    lighterIf=(z, currentZone) => z.country != 'Luxembourg',
}) {
    const theme = useTheme()
    const [zones, currentZone, setCurrentZone] = useZonalFlowMapStore(
        (state) => [state.zones, state.currentZone, state.setCurrentZone],
        shallow
    )
    if (zones === null) return

    return (
        <g id="zones" style={{display: 'inline'}}>
            {zones.map((z) => {   
                return (
                    <ZoneFlowMapZone 
                        key={`zone-${z.index}`} 
                        className={`${z && lighterIf(z) && 'lighter'} ${z?.index === currentZone?.index && 'chosen'}`}
                        onClick={(evt) => setCurrentZone(z)}
                    >
                        {z.paths.map((path, i) => <path key={`zone-${z.index}-path-${i}`} d={`M ${path}`} />)}
                    </ZoneFlowMapZone>
                )
            })}
        </g>
    )
}
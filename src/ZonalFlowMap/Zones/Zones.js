import { useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { useZonalFlowMapStore } from '../store';
import { shallow } from 'zustand/shallow';
import { styled } from '@mui/material/styles';

const ZoneFlowMapZone = styled('g')(({theme}) => ({
    stroke: 'white',
    strokeWidth: 1,
    strokeLinecap: 'butt',
    strokeLinejoin: 'round',
    strokeMiterlimit: 4,
    strokeDasharray: 'none',
    cursor: 'pointer',
    pointerEvents: 'visiblePainted',
    transition: 'fill 0.3s ease',
    fill: theme.palette.grey[500],
    '&.lighter': {
        fill: theme.palette.grey[400],
    },
    '&:hover': {
        fill: theme.palette.grey[600],
    },
    '&.chosen': {
        fill: theme.palette.grey[700],
    },
    '&.chosen:hover': {
        fill: theme.palette.grey[800],
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
import {useEffect, useMemo} from 'react';
import { useTheme } from '@mui/material/styles';
import { useErrorBoundary } from 'react-error-boundary';
import { useZonalFlowMapStore } from '../store'
import { shallow } from 'zustand/shallow';
import { animated, useSprings } from 'react-spring';
import { styled } from '@mui/material/styles';


const FlowLine = styled('g')(({theme}) => ({
    stroke: theme.palette.primary.contrastText,
    strokeLinecap: "round",
    opacity: "0.8",
    pointerEvents: 'none'
}))


const country2point = ({country}, {width, height}) => {
    let dims = []
    switch (country) {
        case 'Belgique':
            dims = [0, 0.5]
            break
        case 'Allemagne':
            dims = [1, 0.5]
            break
        case 'France':
            dims = [0.5, 1]
            break
        default:
            dims = [0.5, 0.5]
            break
    }
    return [width * dims[0], height * dims[1]]
}


export default function Flows({url='data/demand/flows.json', maxStrokeWidth=20, hideInternalFlow=false}) {
    const {showBoundary} = useErrorBoundary()
    const theme = useTheme()
    const [zones, flows, fetchFlows, currentZone, currentScenario, viewBox] = useZonalFlowMapStore(
        (state) => [state.zones, state.flows, state.fetchFlows, state.currentZone, state.currentScenario, state.viewBox],
        shallow
    )
    useEffect(() => { 
        fetchFlows(url).catch((e) => showBoundary(e)) 
    }, [url])
    
    const displayData = useMemo(() => {
        if (currentZone === null || flows === null || zones === null) return null
        const flow = flows[currentZone.index][`flux_${currentScenario == 0 ? 2017 : 2035}`]
        const maxFlow = Math.max(...flow)
        const [x1, y1] = zones[currentZone.index].centroid ?? [0, 0]
        return flow.map((flow, toZone) => {
            const [x2, y2] = zones[toZone].centroid ?? country2point(zones[toZone], viewBox)
            return {x1, y1, x2, y2, strokeWidth: flow / maxFlow * maxStrokeWidth}
        })
    }, [flows, currentZone])

    const [springs, api] = useSprings(displayData?.length ?? 0, (i) => (displayData[i]), [displayData])

    return (<FlowLine>{springs.map((props, i) => {
        return <animated.line key={`zone-${i}`} {...props} />
    })}</FlowLine>)
}


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


export default function Flows({url='data/demand/flows.json', maxStrokeWidth=20, hideInternalFlow=false}) {
    const {showBoundary} = useErrorBoundary()
    const theme = useTheme()
    const [zones, flows, fetchFlows, currentZone, currentScenario] = useZonalFlowMapStore(
        (state) => [state.zones, state.flows, state.fetchFlows, state.currentZone, state.currentScenario],
        shallow
    )
    useEffect(() => { 
        fetchFlows(url).catch((e) => showBoundary(e)) 
    }, [url])
    
    const displayData = useMemo(() => {
        if (currentZone === null || flows === null || zones === null) return null
        const modes = flows[currentScenario][currentZone.index]
        const allflows = modes[0].map((_, toZone) => ({
            toZone, 
            flow: modes.reduce((kv, mode) => kv + (mode[toZone] ?? 0), 0)
        }))
        const flow = hideInternalFlow ? allflows.filter(({toZone}) => toZone != currentZone.index ) : allflows
        console.log(flow)
        const maxFlow = Math.max(...flow.map(({flow}) => flow))
        
        const [x1, y1] = zones[currentZone.index].centroid ?? [0, 0]
        return flow.map(({flow, toZone}) => {
            const [x2, y2] = zones[toZone].centroid ?? [0, 0]
            return {x1, y1, x2, y2, strokeWidth: flow / maxFlow * maxStrokeWidth}
        })
    }, [flows, currentZone])

    const [springs, api] = useSprings(displayData?.length ?? 0, (i) => (displayData[i]), [displayData])

    return (<FlowLine>{springs.map((props, i) => {
        return <animated.line key={`zone-${i}`} {...props} />
    })}</FlowLine>)
}


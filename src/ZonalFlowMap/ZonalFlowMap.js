import { useEffect } from 'react'
import { useErrorBoundary } from 'react-error-boundary';
import { useZonalFlowMapStore } from './store'
import Flows from './Flows'
import Zones from './Zones'

export default function ZonalFlowMap({
    urlZones='data/demand/zones.json', 
    urlFlows='data/demand/flows.json', 
    width="100%", height="600px"
}) {

    const [fetchZones, fetchFlows] = useZonalFlowMapStore((state) => [state.fetchZones, state.fetchFlows])
    const {showBoundary} = useErrorBoundary()
    useEffect(() => {
        fetchZones(urlZones).catch((e) => showBoundary(e))
        fetchFlows(urlFlows).catch((e) => showBoundary(e))
    }, [])

    return (
        <svg width={width} height={height} viewBox="0 0 877 1000">
            <Zones />
            <Flows />
        </svg>
    )
}
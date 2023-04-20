import { useEffect } from 'react'
import { useErrorBoundary } from 'react-error-boundary';
import { useZonalFlowMapStore } from './store'
import Flows from './Flows'
import Zones from './Zones'


const flattenViewbox = ({x, y, width, height}) => `${x} ${y} ${width} ${height}`


export default function ZonalFlowMap({
    urlZones='data/demand/zones.json', 
    urlFlows='data/demand/flows.json', 
    width="100%", height="600px"
}) {

    const [fetchZones, fetchFlows, viewBox] = useZonalFlowMapStore((state) => [state.fetchZones, state.fetchFlows, state.viewBox])
    const {showBoundary} = useErrorBoundary()
    useEffect(() => {
        fetchZones(urlZones).catch((e) => showBoundary(e))
        fetchFlows(urlFlows).catch((e) => showBoundary(e))
    }, [])

    return (
        <svg width={width} height={height} viewBox={flattenViewbox(viewBox)}>
            <Zones />
            <Flows />
        </svg>
    )
}
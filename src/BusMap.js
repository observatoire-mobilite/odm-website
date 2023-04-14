import BusMapDialog from './BusMapDialog.js';
import LineMap from './LineMap'


export function BusMap() {

    return (
        <LineMap mapdata="data/publictransport/busmap.json">
            <BusMapDialog />
        </LineMap>    )
}

import LineMap from './LineMap'
import DataDialog from './LineMap/DataDialog'
import PassengerServiceGrid from './LineMap/PassengerServiceGrid'


export default function PageTrain() {
    return (
        <LineMap url='data/publictransport/trainmap.json'>
            <DataDialog statsLabel="Line" idField="line" labelField="line" prefix="CFL ligne">
                <PassengerServiceGrid
                    url='data/publictransport/trainstats-line.json'
                    statsLabel="Line"
                    comment="compilation basée sur les données CFL"
                    unit="voyageurs (montées + descentes divisées par 2)"
                    idField="line"
                    fromYear={2017}
                />
            </DataDialog>
            <DataDialog statsLabel="Stop" idField="label">
                <PassengerServiceGrid 
                    url='data/publictransport/trainstats.json'
                    statsLabel="Stop"
                    comment="compilation basée sur les données CFL"
                    unit="montées + descentes"
                    idField="label"
                    fromYear={2017}
                />
            </DataDialog>
        </LineMap>
    )
}
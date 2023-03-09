import {useState, useMemo} from 'react'
import Grid from '@mui/material/Grid';
import { animated, useSpring } from '@react-spring/web'
import { HeatMap } from './BusMap.js'
import { HourlyTraffic } from './RoadTraffic.js'


export default function PageTram() {
    const data = {
        stops: [
            {id: 101, label: 'Luxexpo', cat: 2},
            {id: 102, label: 'Alphone Weicker', cat: 0},
            {id: 103, label: 'National Bibliothéik', cat: 0},
            {id: 104, label: 'Universitéit', cat: 0},
            {id: 105, label: 'Coque', cat: 0},
            {id: 106, label: 'Europaparlament', cat: 0},
            {id: 107, label: 'Philharmonie / MUDAM', cat: 0},
            {id: 108, label: 'Rout Bréck - Pafendall', cat: 1},
            {id: 109, label: 'Theater', cat: 0},
            {id: 110, label: 'Faïencerie', cat: 0},
            {id: 111, label: 'Stäereplaz / Etoile', cat: 1},
            {id: 112, label: 'Hamilius', cat: 1},
            {id: 113, label: 'Place de Metz', cat: 0},
            {id: 114, label: 'Paräisser Plaz', cat: 0},
            {id: 115, label: 'Gare Centrale', cat: 1},
            {id: 116, label: 'Dernier Sol', cat: 0},
            {id: 117, label: 'Lycée Bouneweg', cat: 1},
        ]
    }

    const [currentStop, setCurrentStop] = useState(data.stops[0])
    const dailyStats = useMemo(() => Array.from({length: 365}, () => Math.floor(Math.random() * 100000)), [currentStop])
    const hourlyStats = useMemo(() => Array.from({length: 24}, () => Math.floor(Math.random() * 100000 / 24)).map((pax, i) => ({hour: i, count_weekend: pax * Math.random(), count_weekday: pax})), [currentStop])

    return (
        <Grid container>            
            <Grid item xs={4}>
                <LineGraph stops={data.stops} currentStop={currentStop} onSelection={(stop) => setCurrentStop(stop)} />
            </Grid>
            <Grid item xs={8}>
                <h1>{currentStop.label}</h1>
                <HeatMap year={2023} />
                <HourlyTraffic countsByHour={[
                    {hour: 0, count_weekend: 400, count_weekday: 800},
                    {hour: 1, count_weekend: 200, count_weekday: 600},
                    {hour: 2, count_weekend: 10, count_weekday: 200},
                    {hour: 3, count_weekend: 2, count_weekday: 10},
                    {hour: 4, count_weekend: 100, count_weekday: 100},
                    {hour: 5, count_weekend: 400, count_weekday: 1000},
                    {hour: 6, count_weekend: 900, count_weekday: 4000},
                    {hour: 7, count_weekend: 1000, count_weekday: 9000},
                    {hour: 8, count_weekend: 4000, count_weekday: 13000},
                    {hour: 9, count_weekend: 5000, count_weekday: 10000},
                    {hour: 10, count_weekend: 3000, count_weekday: 8000},
                    {hour: 11, count_weekend: 2000, count_weekday: 7000},
                    {hour: 12, count_weekend: 3000, count_weekday: 7500},
                    {hour: 13, count_weekend: 2500, count_weekday: 6500},
                    {hour: 14, count_weekend: 2000, count_weekday: 6000},
                    {hour: 15, count_weekend: 1500, count_weekday: 5500},
                    {hour: 16, count_weekend: 1200, count_weekday: 6000},
                    {hour: 17, count_weekend: 1000, count_weekday: 9000},
                    {hour: 18, count_weekend: 800, count_weekday: 9500},
                    {hour: 19, count_weekend: 600, count_weekday: 9000},
                    {hour: 20, count_weekend: 800, count_weekday: 7000},
                    {hour: 21, count_weekend: 900, count_weekday: 4000},
                    {hour: 22, count_weekend: 700, count_weekday: 1000},
                    {hour: 23, count_weekend: 500, count_weekday: 900}
                ]}/>
                <HeatMap year={2023} getValues={(x) => x} data={dailyStats} />
                <HourlyTraffic countsByHour={hourlyStats} />
            </Grid>
        </Grid>
    )
}


function LineGraph({stops, currentStop, onSelection=(evt) => undefined}) {

    const [mouseOverStop, setMouseOverStop] = useState()
    
    return (
        <svg height="640px" viewBox={`0 0 ${30 * 20} ${stops.length * 60}`}>
            <LineGraphTrunk height={(stops.length - 1) * 60}/>
            {stops.map((stop, i) => 
                <LineGraphStop 
                    pos={i * 60} 
                    stop={stop} 
                    selected={stop?.id==currentStop?.id}
                    highlighted={stop?.id==mouseOverStop?.id}
                    onSelection={onSelection}
                    onHover={(stop) => setMouseOverStop(stop)} 
                />
            )}
            
        </svg>
    )
}

function LineGraphStop({
    stop, 
    fill='#34455eff', 
    pos=0,
    selected=false,
    highlighted=false,
    xOffset=30,
    onSelection=(stop) => undefined, 
    onHover=(stop) => undefined
}) {


    const radius = selected ? 30 : (highlighted ? 20 : 10)
    const fontSize = selected ? 20 : (highlighted ? 15 : 10)
                    
    const springs = useSpring({
        r_outer: radius,
        r_inner: radius - 5,
        x_text: xOffset + fontSize / 2 + radius,
        fontSize
    })
    
    return (<g
        onClick={(evt) => onSelection(stop)}
        onMouseEnter={(evt) => onHover(stop)}
        onMouseLeave={(evt) => onHover()}
    >
        <animated.circle cx={xOffset} cy={20 + pos} r={springs.r_outer} style={{fill, stroke: 'black', strokeWidth: 0.5}} />
        <animated.circle cx={xOffset} cy={20 + pos} r={springs.r_inner} style={{fill, stroke: 'white', strokeWidth: 4}} />
        <animated.text 
            x={springs.x_text} y={20 + pos}
            style={{
                dominantBaseline: 'middle',
                fontSize: springs.fontSize,
                fontWeight: stop.cat > 0 ? 'bold' : 'normal',
                cursor: 'pointer', pointerEvents: 'visible'
            }}
        >
            {stop.label}
        </animated.text>
        <rect x={xOffset} y={pos} width={200} height={40} style={{fill: 'none', stroke: 'none', cursor: 'pointer', pointerEvents: 'visible'}}/>
    </g>)
}


function LineGraphTrunk({height}) {
    const styleTram = { fill: '#34455eff', stroke: 'white', strokeWidth: 2.5 }
    return (<g>
        <rect x={20} y={20} width={20} height={height} style={styleTram} />
    </g>)
}

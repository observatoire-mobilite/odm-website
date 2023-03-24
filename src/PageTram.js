import {useState, useMemo, useTransition} from 'react'
import Grid from '@mui/material/Grid';
import { animated, useSpring, config } from '@react-spring/web'
import { HeatMap } from './BusMap.js'
import { HourlyTraffic } from './RoadTraffic.js'

import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';


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
                <AggregateStatistics dailyStats={dailyStats} trend={'+1.4%'} />
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
    const fontSize = (selected ? 20 : (highlighted ? 15 : 10)) * 2
                    
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


function prettyPrintNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u2009");
}

function FancyNumber({ count }) {
    const { number } = useSpring({
      from: { number: 0 },
      number: count,
      config: { mass:1, tension:200, friction:20, clamp: true }
    });
   
    return <animated.span>{
        number.to(val => Math.floor(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u2009"))
    }</animated.span>;
}
   

export function AggregateStatistics({dailyStats, passengers=0, countedStops=0, totalStops=0, trend=0, toggle=false}) {

    const [aggLevel, setAggLevel] = useState('workday')
    const aggStat = useMemo(() => {
        if (aggLevel == 'month') {
            return dailyStats.reduce((kv, v) => kv + v, 0)
        } else if (aggLevel == 'workday') {
            return dailyStats.reduce((kv, v) => kv + v, 0) / 31
        } else if (aggLevel == 'weekend') {
            return dailyStats.reduce((kv, v) => kv + v, 0) / 300
        }
    }, [dailyStats, aggLevel])

    const marks = [
        {value: 1, label: 'weekend', description: 'on an average Saturday or Sunday'},
        {value: 2.5, label: 'workday', description: 'on an average workday'},
        {value: 5, label: 'month', description: 'total during the current month'},
        {value: 8, label: 'quarter', description: 'total during the last quarter'}
    ]

    return (
        <Paper
            sx={{
                p: 2,
                margin: 'auto',
                //maxWidth: 500,
                flexGrow: 1,
                backgroundColor: '#fff',
            }}
        >
            <Grid container spacing={2}>
                <Grid item lg={8}>
                    <Grid item>
                        <Typography variant="h6">
                            Passengers
                        </Typography>
                        <Typography variant="h3">
                            <FancyNumber count={aggStat} />
                        </Typography>
                        <Typography variant="caption">
                            Who boarded between 2023/01/01 and 2023/01/31
                        </Typography>
                    </Grid>
                    <Grid item>
                        {toggle ? 
                            <ToggleButtonGroup exclusive value={aggLevel} onChange={(evt, newVal) => { setAggLevel(newVal) }} variant="elevated" size="small" aria-label="aggregation period">
                                {marks.map((m) => {
                                    <ToggleButton value={m.value}>{m.description}</ToggleButton>    
                                })}
                            </ToggleButtonGroup> 
                            :
                            <Box sx={{p: 2, width:'80%'}}>
                            <Slider
                                aria-label="aggregation period"
                                valueLabelDisplay="off"
                                marks={marks}
                                step={null}
                                min={marks.at(0).value}
                                max={marks.at(-1).value}
                                onChange={(evt, newVal) => setAggLevel(marks.filter((m) => m.value == newVal)[0].label)}
                                value={marks.filter((m) => m.label == aggLevel)[0].value}
                            />
                            </Box>
                        }
                    </Grid>
                    <Grid item>
                        <Typography variant="caption">
                            Extrapolated from {countedStops} counted stops out of {totalStops}
                        </Typography>
                    </Grid>
                </Grid>
                <Grid item container lg={4}>
                    <Grid><Chip label={trend} variant="outlined" /></Grid>
                    <Grid><Typography variant="caption">Compared to same month last year</Typography></Grid>
                </Grid>
          </Grid>
    </Paper>
    )
  }


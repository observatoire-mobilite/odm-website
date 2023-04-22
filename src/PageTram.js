import {useState, useMemo, useTransition, useEffect, Fragment, Children, useContext, createContext, useCallback} from 'react'
import Grid from '@mui/material/Grid';
import { animated, useSpring, config } from '@react-spring/web'
//import { HeatMap } from './BusMap.js'
import CalendarHeatMap from './CalendarHeatMap'
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
import Container from '@mui/material/Container';
import Chip from '@mui/material/Chip';
import Drawer from '@mui/material/Drawer';
import { useTheme } from '@mui/material/styles';

import SingleStat from './DataGrids/SingleStat.js'
import ComplexStat from './DataGrids/ComplexStat.js'
import YearToggle from './YearToggle'

import FAQList from './FAQ/List'
import FAQEntry from './FAQ/Entry'
import PassengerServiceGrid from './LineMap/PassengerServiceGrid';
import { styled } from '@mui/material/styles';
import { useLineMapStore } from './LineMap/store';

const Offset = styled('div')(({ theme }) => theme.mixins.toolbar);

export default function PageTram() {
    const data = {
        stops: [
            {id: 'LUXEXP', label: 'Luxexpo', cat: 2},
            {id: 'WEICKE', label: 'Alphonse Weicker', cat: 0},
            {id: 'NATBIB', label: 'National Bibliothéik', cat: 0},
            {id: 'UNIVER', label: 'Universitéit', cat: 0},
            {id: 'COQUE', label: 'Coque', cat: 0},
            {id: 'PAREUR', label: 'Europaparlament', cat: 0},
            {id: 'PHILHA', label: 'Philharmonie / MUDAM', cat: 0},
            {id: 'ROUBRE', label: 'Rout Bréck - Pafendall', cat: 1},
            {id: 'THEATE', label: 'Theater', cat: 0},
            {id: 'FAÏENC', label: 'Faïencerie', cat: 0},
            {id: 'STÄREP', label: 'Stäereplaz / Etoile', cat: 1},
            {id: 'HAMILI', label: 'Hamilius', cat: 1},
            {id: 'METZ', label: 'Place de Metz', cat: 0},
            {id: 'PARIS', label: 'Paräisser Plaz', cat: 0},
            {id: 'GARCEN', label: 'Gare Centrale', cat: 1},
            {id: 'DERSOL', label: 'Dernier Sol', cat: 0},
            {id: 'LY.BON', label: 'Lycée Bouneweg', cat: 1},
        ]
    }

    const [setCurrentStop, currentStop, fetchStats] = useLineMapStore((state) => [state.setCurrentStop, state.currentStop, state.fetchStopStats])
    const [open, setOpen] = useState(currentStop === null)
    const handleClick = useCallback((evt) => setOpen(! open))
    const handleSelect = useCallback((stop) => { setCurrentStop(stop); setOpen(false) })
    

    return (<Container maxWidth="lg">
        <Drawer open={open} variant="persistent" anchor="right">
            <Offset />
            <LineGraph stops={data.stops} currentStop={currentStop} onSelection={handleSelect} />
        </Drawer>
        <Typography variant="h4">{currentStop?.label}</Typography>
        <Button onClick={(evt) => setOpen(! open)}>choisir un autre arrêt</Button>
        <Typography variant="caption">données du comptage automatique LUXTRAM corrigées pour le taux de comptage</Typography>
        <PassengerServiceGrid 
            url='data/publictransport/tramstats.json'
            statsLabel="Stop"
            comment=""
            unit="montées + descentes"
            idField="id"
            fromYear={2018}
        />
        </Container>
        
    )
}


function LineGraph({stops, currentStop, onSelection=(evt) => undefined}) {

    const [mouseOverStop, setMouseOverStop] = useState()
    
    return (
        <svg height="640px" viewBox={`0 -30 ${30 * 20} ${stops.length * 60 + 30}`}>
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
    pos=0,
    selected=false,
    highlighted=false,
    xOffset=30,
    onSelection=(stop) => undefined, 
    onHover=(stop) => undefined
}) {

    const theme = useTheme()
    const fill = theme.palette.primary.main
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
    const theme = useTheme()
    const fill = theme.palette.primary.main
    const styleTram = { fill, stroke: 'white', strokeWidth: 2.5 }
    return (<g>
        <rect x={20} y={20} width={20} height={height} style={styleTram} />
    </g>)
}


function prettyPrintNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u2009");
}

export function FancyNumber({ count }) {
    const { number } = useSpring({
      from: { number: 0 },
      number: count,
      config: { mass:1, tension:200, friction:20, clamp: true }
    });
   
    return <animated.span>{
        number.to(val => Math.floor(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u2009"))
    }</animated.span>;
}
   
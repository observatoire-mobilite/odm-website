import {useState, useMemo, useTransition, useEffect, Fragment, Children, useContext, createContext, useCallback} from 'react'
import Grid from '@mui/material/Grid';
import { animated, useSpring, config } from '@react-spring/web'
//import { HeatMap } from './BusMap.js'


import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Drawer from '@mui/material/Drawer';
import Link from '@mui/material/Link';
import { useTheme } from '@mui/material/styles';
import PassengerServiceGrid from './LineMap/PassengerServiceGrid';
import { styled } from '@mui/material/styles';
import { useLineMapStore } from './LineMap/store';
import { shallow } from "zustand/shallow";
import Container from '@mui/material/Container';
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

    const [setCurrentStop, currentStop] = useLineMapStore((state) => [state.setCurrentStop, state.currentStop], shallow)
    const [open, setOpen] = useState(currentStop === null)
    const handleSelect = useCallback((stop) => { setCurrentStop(stop); setOpen(false) })
    useEffect(() => {
        setCurrentStop(data.stops[0])
        setOpen(false)
    }, [])
    

    return (<Container maxWidth="lg">
            <Drawer open={open} variant="persistent" anchor="right" sx={{maxWidth: '100vw'}} PaperProps={{sx: {p: 2}}} hideBackdrop={false}>
                <Offset />
                <LineGraph stops={data.stops} currentStop={currentStop} onSelection={handleSelect} />
            </Drawer>
            <Grid container direction="row" justifyContent="flex-start" alignItems="center" spacing={2} sx={{p: 2}}>
                <Grid item><Typography variant="h4">{currentStop?.label}</Typography></Grid>
                <Grid item justifyContent="middle"><Button onClick={(evt) => setOpen(! open)} variant="outlined">choisir un autre arrêt</Button></Grid>
            </Grid>
            <Container sx={{ mb: 2}}>
                <Typography variant="caption" textAlign="center">Données du comptage automatique LUXTRAM corrigées pour le taux de comptage &#x2014; voir <Link href="https://transports.public.lu/dam-assets/planifier/observatoire/note2301.pdf">Note 23/01</Link></Typography>
            </Container>
            <PassengerServiceGrid
                url='data/publictransport/tramstats.json'
                statsLabel="Stop"
                comment=""
                unit="montées + descentes"
                idField="id"
                fromYear={2018}
                showNoDataHint
                noDataComment=" Le réseau LUXTRAM a connu plusieurs extensions; il n'existe des données pour un arrêt que depuis l'année de son ouverture."
            />
    </Container>        
    )
}


function LineGraph({stops, currentStop, onSelection=(evt) => undefined}) {

    const [mouseOverStop, setMouseOverStop] = useState()
    
    return (
        <svg width="100%" viewBox={`0 -30 ${30 * 15} ${stops.length * 60 + 30}`}>
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


const LineGraphInnerCircle = styled(animated('circle'))(({theme}) => ({
    fill: theme.palette.primary.main,
    stroke: theme.palette.text.primary,
    strokeWidth: 0.5
}))

const LineGraphOuterCircle = styled(animated('circle'))(({theme}) => ({
    fill: theme.palette.primary.main,
    stroke: theme.palette.primary.contrastText,
    strokeWidth: 4
}))

const LineGraphLabel = styled(animated('text'))(({theme}) => ({
    dominantBaseline: 'middle',
    fontSize: 20,
    fontWeight: 'normal',
}))


const LineGraphUIOverlay = styled('rect')(({theme}) => ({
    fill: 'none',
    stroke: 'none',
    cursor: 'pointer',
    pointerEvents: 'visible'
}))


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
    const fontSize = (selected ? 35 : (highlighted ? 25 : 20))
                    
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
        <LineGraphInnerCircle cx={xOffset} cy={20 + pos} r={springs.r_outer} />
        <LineGraphOuterCircle cx={xOffset} cy={20 + pos} r={springs.r_inner} />
        <LineGraphLabel
            x={springs.x_text} y={20 + pos}
            style={{
                fontSize: springs.fontSize,
                fontWeight: stop.cat > 0 ? 'bold' : 'normal'
            }}
        >
            {stop.label}
        </LineGraphLabel>
        <LineGraphUIOverlay x={xOffset} y={pos} width={200} height={40}/>
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
   
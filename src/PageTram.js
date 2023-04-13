import {useState, useMemo, useTransition, useEffect, Fragment, Children, useContext, createContext} from 'react'
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

import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


import { styled } from '@mui/material/styles';
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

    const [currentStop, setCurrentStop] = useState(data.stops[0])
    const [currentYear, setCurrentYear] = useState(2023)
    const [loading, setLoading] = useState(false)
    const [stats, setStats] = useState()
    
    useEffect(() => {
        setLoading(true)
        fetch('data/publictransport/tramstats.json')
        .then((res) => res.json())
        .then((res) => {
            setLoading(false)
            setStats(res)
            console.log(res)
        }).catch((reason) => {
            console.log(reason)
        })
    }, [])

    const [open, setOpen] = useState(false)
    const toggleDrawer = () => {
        setOpen(!open);
    };

    const displayStats = useMemo(() => {
        if (! stats || ! currentStop?.id || ! currentYear) return {hourly: [], daily: []}
        
        const hourlyStats = stats['hourly'][currentStop?.id][currentYear]
        const hourly = hourlyStats ? Object.values(hourlyStats).reduce((kv, v) => v?.count ?? kv, []) : []
        console.log(hourly)

        return {
            daily: (stats && stats['daily'][currentStop?.id] && stats['daily'][currentStop?.id][currentYear]) ? stats['daily'][currentStop?.id][currentYear]['passengers'] : [],
            hourly
        }
    }, [currentYear, currentStop, stats])
    console.log(displayStats)

    if (loading) return

    return (<Box>
        <Drawer open={open} variant="persistent" anchor="right">
            <Offset />
            <LineGraph stops={data.stops} currentStop={currentStop} onSelection={(stop) => setCurrentStop(stop)} />
        </Drawer>
        <Grid container direction="row" justifyContent="space-around" alignItems="stretch" spacing={4}>
            <Grid item xs={12}>
                <h1>{currentStop.label}</h1>
            </Grid>
            <Grid item xs={4}>
                <SingleStat 
                    title="Trips on a weekend"
                    caption="boarding and deboarding events"
                    value={displayStats.hourly && displayStats.hourly.reduce((kv, v) => kv + v ?? 0, 0)}
                />
                <Button onClick={toggleDrawer}>click</Button>
            
            </Grid>
            <Grid item xs={4}>
                <SingleStat 
                    title="Trips on a weekday"
                    caption="boarding and deboarding events"
                    value={displayStats.hourly && displayStats.hourly.reduce((kv, v) => kv + v ?? 0, 0)}
                />
            </Grid>
            <Grid item xs={4}>
                <SingleStat 
                    title="Trips per year"
                    caption={`boarding and deboarding events observed over ${displayStats.daily && displayStats.daily.reduce((kv, v) => kv + (v && v > 0 ? 1 : 0), 0)} days in ${currentYear}`}
                    value={displayStats.daily && displayStats.daily.reduce((kv, v) => kv + v ?? 0, 0)}
                    info={<FAQList>
                        <FAQEntry title="What do we mean by `trips per year`?" name="panel-1">
                            <Typography>"Trips per year" is the sum total of all boarding and deboarding events observed by all LUXTRAM tram-cars whose counting equipment was operational as they stopped at {currentStop.label} in {currentYear}.
                            It is the number of tram-trips that originated and ended at {currentStop.label}.
                            The result is directly comparable between different stops and thus measures the importance of {currentStop.label} within the LUXTRAM network. 
                            </Typography>
                            <Typography>
                            Beware: it is different from number of individual passangers that rode or even boarded and deboarded the tram;
                            the simple reason being that people may be counted multiple times.
                            For example, a commuter arriving at at {currentStop.label} in the morning and leaving via that same stop in the evening counts as two distinct trips.                            
                            </Typography>
                        </FAQEntry>
                        <FAQEntry title="Why are you counting trips and not passengers ?">
                            <Typography>
                                Despite their name, passenger counting systems actually count boarding and deboarding events, not passengers.
                                The difference is subtle, but important:
                                a passenger is a person taking a trip on a tram.
                                A trip starts at boarding and ends with deboarding.
                                Ideally, a counter registers both events.
                                By design, counters cannot reidentify people between events.
                                This respects the principle of <a href="https://edps.europa.eu/data-protection/data-protection/glossary/d_en#data_minimization" target="_blank">data minimization</a>,
                                but reduces our knowledge to the fact that someone just started (respectively finished) a tram-trip at the given stop.
                                There is no way of knowing when or where that trip finished (respectively began), nor whether the rider has taken other tram-rides before this one.
                            </Typography>
                            <Typography>
                                Over the entire network, every boarding must eventually be followed by a deboarding &emdash; barring sensor error.
                                Every pair of such events is evidence of a trip, and every trip implies a passenger.
                                Thus it is possible to calculate the number of passengers transported on the network, even if there is no way of knowing how many of those passengers are in fact the same person taking multiple trips.
                                Importantly, in this calculation, it only matters that those boardings and deboardings happened, not where.
                                When only considering the events at one single stop, that reasoning breaks down.
                            </Typography>
                        </FAQEntry>
                        <FAQEntry title="Why do you sum up boardings and deboardings ?"  name="panel-2">
                            <Typography>
                            We follow the conventions of the <a hef="https://pnm2035.lu">PNM2305</a>.
                            Summing boardings and deboardings yields the number of trips, both incoming and outgoing, in relation to a stop.
                            As a disadvantage, individuals taking more than one trip per day are counted multiple times.
                            Thus the number of trips cannot be taken as a proxy for the number of passengers.
                            Summing only boardings (or deboardings) seemingly mitigates that problem.
                            However, this would severely limit comparability 

                            However, it would be a poor indication

                            </Typography>
                        </FAQEntry>
                        <FAQEntry title="How confident are you of those results ?"  name="panel-3">
                            <Typography>
                            Automatic passenger counting systems are not perfect. For any number of reasons, counters may miscount, fail to count or fail to transmit the result. There are no corrections made except the clamping of excessive values (&gt; 300 boardings or deboardings).
                            </Typography>                        
                        </FAQEntry>
                        <FAQEntry title="Why aren't there 365 days of observations?"  name="panel-4">
                            <Typography>
                            The number of days accounted for in the sum may differ form one year if (a) the calendar year is incomplete, (b) the site has not been updated yet or (c) there were indeed no data recorded.
                            Trams have been circulating every day, even throughout the COVID-19 panedmic. Gaps in the data are just that.
                            While the odds of all counters on all vehicles failing on the same day are small, network-wide outages with complete and irreversible data-loss can and do happen when backend systems fail.
                            </Typography>
                        </FAQEntry>
                    </FAQList>}
                />
            </Grid>
            <Grid item xs={12}>
                <ComplexStat
                    title="Passengers per day"
                >
                    <Box sx={{p: 2}}>
                        <YearToggle from={2018} to={2023} currentYear={currentYear} onChange={(evt, newVal) => setCurrentYear(newVal ?? currentYear)} />
                        <CalendarHeatMap year={currentYear} data={displayStats.daily} />
                    </Box>
                </ComplexStat>
            </Grid>
            <Grid item xs={12}>
                <ComplexStat
                    title="Passengers per hour"
                >
                    <HourlyTraffic countsByHour={displayStats.hourly ? displayStats.hourly.map((k, i) => ({hour: i, count_weekday: k, count_weekend: k})): []} />
                </ComplexStat>
            </Grid>
        </Grid>
    </Box>)
}


const FAQContext = createContext()

export function FAQList({children}) {
  const [expanded, setExpanded] = useState('panel-1');

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const ctx = {expanded, setExpanded, handleChange}

  return (
    <Fragment>
        <FAQContext.Provider value={ctx}>
            {children}
        </FAQContext.Provider>
    </Fragment>
  )
}


export function FAQEntry({title, children, name='panel1'}) {
    const {expanded, handleChange} = useContext(FAQContext)
    return (
      <Accordion expanded={expanded === name} onChange={handleChange(name)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`${name}-content`} id={`${name}-header`}>
          <Typography variant="h6">
            <a id={`${name}-link`}>{title}</a>
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {children}
        </AccordionDetails>
      </Accordion>
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
   
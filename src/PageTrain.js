import { useState, forwardRef, useEffect, useRef, useCallback, useMemo, memo, Suspense, createContext, useContext } from 'react';
import LineMap from './LineMap'
import { useTheme } from '@mui/material/styles';

import {MapContext} from './LineMap/MapState.js';
import YearToggle from './YearToggle';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import HomeIcon from '@mui/icons-material/Home';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardHeader from '@mui/material/CardHeader';
import InfoIcon from '@mui/icons-material/Info';
import { styled } from '@mui/material/styles';

import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import { animated, useSpring, config } from '@react-spring/web'
import CalendarHeatMap from './CalendarHeatMap/CalendarHeatMap.js'
import { HourlyTraffic } from './RoadTraffic.js'
import { AggregateStatistics, FancyNumber } from './PageTram.js'
import SingleStat from './DataGrids/SingleStat.js'
import ComplexStat from './DataGrids/ComplexStat.js'
import BarChart from './BarChart'

import { DateTime } from "luxon";



export default function PageTrain() {
    return (<LineMap><MapDialog /></LineMap>)
}



const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});

// adjusts for the height of the AppBar (cf. https://mui.com/material-ui/react-app-bar/#fixed-placement)
const Offset = styled('div')(({ theme }) => theme.mixins.toolbar);

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']

export function MapDialog() {
    console.count('trainmapdialog')
    const {currentStop, setCurrentStop} = useContext(MapContext)
    const handleClose = useCallback(() => {setCurrentStop(null)})

    const [statsLoaded, setStatsLoaded] = useState(false);
    const [stats, setStats] = useState({});

    const [currentYear, setCurrentYear] = useState(2023)

    useEffect(() => {
        setStatsLoaded(false);
        fetch('data/publictransport/trainstats.json')
        .then((r) => r.json())
        .then((dta) => {
            setStats(dta);
            setStatsLoaded(true);
        }).catch((e) => {
            console.log(e.message)
        });
    }, [])

    const displayData = useMemo(() => {
        const empty = {monthly: []}
        console.log(stats)
        if (currentStop?.label === undefined) return empty
        try {
            const monthly = stats[currentStop.label][currentYear]['week_avg']
            const n_months = monthly.reduce((kv, v) => kv + (v === null ? 0 : 1), 0)
            const n_days = monthly.reduce((kv, v, i) => {
                const first = DateTime.local(currentYear, i+1)
                return kv + (v === null ? 0 : first.daysInMonth)
            }, 0)
            const total = monthly.reduce((kv, v) => kv + (v ?? 0), 0)
            return {monthly, labels: ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'] , dailyAvg: total / n_days, monthlyAvg: total / n_months, total}
        } catch (error) {
            return empty
        }
    }, [currentStop, currentYear])

    const allMax = useMemo(() => {
        if (currentStop?.label === undefined) return null
        try {
            return Math.max(...Object.values(stats[currentStop.label]).map((v) => Math.max(...v['week_avg'])))
        } catch (error) {
            console.log(error)
            return null
        }
    }, [currentStop])
    
    if (! statsLoaded) return
    
    return (
        <Dialog
            fullScreen
            open={currentStop !== null}
            onClose={handleClose}
            TransitionComponent={Transition}
        >
            <AppBar position="fixed">
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={handleClose}
                        aria-label="close"
                    >
                        <CloseIcon />
                    </IconButton>
                    <h1>{currentStop?.label}</h1>
                </Toolbar>
            </AppBar>
            <Offset />
            {displayData ?
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Grid container direction="row" justifyContent="space-around" alignItems="stretch" spacing={4}>
                    <Grid item xs={4}>
                        <SingleStat 
                            title="Trips per day"
                            caption={`boardings and deboardings on average per day in ${currentYear}`}
                            value={displayData?.dailyAvg}
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <SingleStat 
                            title="Trips per month"
                            caption={`boardings and deboardings per month in ${currentYear}`}
                            value={displayData?.monthlyAvg}
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <SingleStat 
                            title={`Total in ${currentYear}`}
                            caption={`boardings and deboardings in ${currentYear}`}
                            value={displayData?.total}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <ComplexStat
                            title="Passengers per month"
                        >
                            <Box sx={{p: 2}}>
                                <YearToggle from={2017} to={2023} currentYear={currentYear} onChange={(evt, val) => setCurrentYear(val ?? currentYear)} />
                            </Box>
                            <Box sx={{p: 2}}>
                                <BarChart data={displayData?.monthly} labels={MONTHS} ymax={allMax} />
                            </Box>
                        </ComplexStat>
                    </Grid>
                </Grid>
            </Container>:<h1>No data</h1>}
        </Dialog>
    );
}



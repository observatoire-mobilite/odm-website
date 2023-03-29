import {useContext, forwardRef, useCallback, useMemo, useState, useEffect} from 'react';
import {BusMapContext} from './BusMap.js';

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
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';


import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import { animated, useSpring, config } from '@react-spring/web'
import CalendarHeatMap from './CalendarHeatMap/CalendarHeatMap.js'
import { HourlyTraffic } from './RoadTraffic.js'
import { AggregateStatistics, FancyNumber } from './PageTram.js'

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const useDelayedRender = delay => {
    const [delayed, setDelayed] = useState(true);
    useEffect(() => {
      const timeout = setTimeout(() => setDelayed(false), delay);
      return () => clearTimeout(timeout);
    }, []);
    return fn => !delayed && fn();
  };



export default function BusMapDialog() {
    console.count('busmapdialog')
    const {currentStop, setCurrentStop} = useContext(BusMapContext)
    const handleClose = useCallback(() => {setCurrentStop(null)})

    const [busStatsLoaded, setBusStatsLoaded] = useState(false);
    const [busStats, setBusStats] = useState();

    const [currentYear, setCurrentYear] = useState(2023)

    useEffect(() => {
        setBusStatsLoaded(false);
        fetch('data/publictransport/busstats.json')
        .then((r) => r.json())
        .then((dta) => {
            setBusStats(dta);
            setBusStatsLoaded(true);
        }).catch((e) => {
            console.log(e.message)
        });
    }, [])

    const displayData = useMemo(() => {
        if (currentStop?.label) {
            if (busStats['daily'][currentYear][currentStop.label] === undefined) return
            if (busStats['hourly'][currentYear][currentStop.label] === undefined) return
            if (busStats['hourly'][currentYear][currentStop.label][0] === undefined) return
            if (busStats['hourly'][currentYear][currentStop.label][1] === undefined) return
            return {
                hourly: Array.from({length: 24}, (_, h) => ({
                    hour: h,
                    count_weekend: busStats['hourly'][currentYear][currentStop.label][1]['corrected_boardings'][h] ?? 0,
                    count_weekday: busStats['hourly'][currentYear][currentStop.label][0]['corrected_boardings'][h] ?? 0
                })),
                daily: busStats['daily'][currentYear][currentStop.label]['corrected_boardings']
            }
        } else {
            return
        }
    }, [currentStop, currentYear])
    console.log(displayData)

    if (! busStatsLoaded) return
    
    return (
        <Dialog
            fullScreen
            open={currentStop}
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
            {displayData ?
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Grid container direction="row" justifyContent="space-around" alignItems="stretch" spacing={4}>
                    <Grid item xs={12}>
                        <h1>{currentStop?.label}</h1>
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                        <SingleStat
                            title="Resident population"
                            caption="people living in the respective area as per January 2023, source: STATEC / RNPP"
                            value={Math.ceil(Math.random() * currentStop?.r / 25 * 10000)}
                            avatar={<Avatar sx={{ width: 70, height: 70 }}><HomeIcon sx={{fontSize: 70}}  /></Avatar>}
                        />
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                        <SingleStat 
                            title="Distance to closest stop"
                            avatar={<Avatar sx={{ width: 70, height: 70 }}><ArchitectureIcon sx={{fontSize: 70}}  /></Avatar>}
                            value={Math.floor(Math.random() * 10000) / 10}
                            unit="m"
                            caption="average distance per address point to the closest stop in the region"
                        />
                    </Grid>    
                    <Grid item xs={12} md={12} lg={4}>
                    <SingleStat 
                            title="Some other stat"
                            subtitle="something interesting"
                            avatar={<Avatar sx={{ width: 70, height: 70 }}><ArchitectureIcon sx={{fontSize: 70}}  /></Avatar>}
                            value={Math.floor(Math.random() * 40) / 10}
                            unit="unit"
                        />
                    </Grid>   
                    <Grid item xs={12}>
                        <ComplexStat
                            title="Passengers on average"
                            caption="boardings averaged over time"    
                        >
                            <AggregateStatistics dailyStats={displayData?.daily} />
                        </ComplexStat>
                    </Grid>
                    <Grid item xs={4}>
                        <SingleStat 
                            title="Passengers on a weekend"
                            caption="boardings averaged over time"    
                            value={displayData?.hourly.reduce((kv, v) => kv + v.count_weekend ?? 0, 0)}
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <SingleStat 
                            title="Passengers on a weekday"
                            caption="boardings averaged over time"    
                            value={displayData?.hourly.reduce((kv, v) => kv + v.count_weekday ?? 0, 0)}
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <SingleStat 
                            title="Passengers per month"
                            caption="boardings averaged over time"    
                            value={displayData?.daily.reduce((kv, v) => kv + v ?? 0, 0)}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <ComplexStat
                            title="Passengers per day"
                        >
                            <Box sx={{p: 2}}>
                                <YearToggle />
                                <CalendarHeatMap year={2023} getValues={(x) => x} data={displayData?.daily} />
                            </Box>
                        </ComplexStat>
                    </Grid>
                    <Grid item xs={12}>
                        <ComplexStat
                            title="Passengers per hour"
                        >
                            <HourlyTraffic countsByHour={displayData?.hourly} />
                        </ComplexStat>
                    </Grid>
                </Grid>
            </Container>:<h1>No data</h1>}
        </Dialog>
    );
}


function YearToggle({from=2020, to=2023}) {
    const [currentYear, setCurrentYear] = useState(to)
    return (<ToggleButtonGroup exclusive value={currentYear} aria-label="year to explore" onChange={(evt, val) => setCurrentYear(val)}>
        {Array.from({length: to-from + 1}).map((_, i) => {
            return (<ToggleButton value={from + i} aria-label={from + i}>{from + i}</ToggleButton>)
        })}
     </ToggleButtonGroup>
    )
}


function SingleStat({title, subtitle=null, caption=null, value, avatar=<></>, unit=undefined}) {
    return (
        <Paper sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minWidth: '200px'
        }}>
            <Grid container direction="row" justifyContent="space-around" alignItems="stretch" spacing={2}>
                <Grid item xs="auto">{avatar}</Grid>
                <Grid item xs>
                    <Typography variant="h6" color="primary">
                        {title}
                    </Typography>
                    {subtitle && <Typography variant="subtitle">
                        {subtitle}
                    </Typography>}
                    <Typography variant="h4">
                        <FancyNumber count={value} />{unit === undefined ? '' : `\u202F${unit}`}
                    </Typography>
                    <Button color="primary" variant="filledTonal" size="small">last month</Button>
                    {caption && <Typography variant="caption">
                        {caption}
                    </Typography>}
                    <Typography>
                    <Button startIcon={<InfoIcon/>} size="small">learn more...</Button>
                    </Typography>
                </Grid>
            </Grid>        
        </Paper>
        
    )
}

function ComplexStat({children, title, subtitle, caption}) {
    return (<Paper sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minWidth: '200px'
    }}>
        <Typography variant="h6" color="primary">
            {title}
        </Typography>
        {subtitle && <Typography variant="subtitle">
            {subtitle}
        </Typography>}
        {children}
        {caption && <Typography variant="caption">
            {caption}
        </Typography>}
    </Paper>)
}
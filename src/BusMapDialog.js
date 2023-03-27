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

import Grid from '@mui/material/Grid';
import { animated, useSpring, config } from '@react-spring/web'
import { HeatMap } from './BusMap.js'
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

    const dailyStats = useMemo(() => Array.from({length: 365}, () => Math.floor(Math.random() * 100000)), [currentStop])
    const hourlyStats = useMemo(() => Array.from({length: 24}, () => Math.floor(Math.random() * 100000 / 24)).map((pax, i) => ({hour: i, count_weekend: pax * Math.random(), count_weekday: pax})), [currentStop])

    const [busStatsLoaded, setBusStatsLoaded] = useState(false);
    const [busStats, setBusStats] = useState();

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

    /*const dailyStats = useMemo(() => {
        if (currentStop.label) {
            const stop = busStats['hourly'][2023][currentStop.label]
            Array.from({length: 24}, (h) => ({hour: h, count_weekend: stop[h]}))
        }
    }, [currentStop])*/


    if (! busStatsLoaded) return

    
    return (
        <Dialog
            fullScreen
            open={currentStop}
            onClose={handleClose}
            TransitionComponent={Transition}
        >
            <AppBar sx={{ position: 'relative' }}>
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
            <Box sx={{ width: '100%', justify: 'center' }}>
                <Grid container spacing={2} sx={{maxWidth: 'xl'}}>
                    <Grid item m={4}>
                        <Paper sx={{width: '100%', p:2}}>
                            <Grid container spacing={2}>
                                <Grid item xs={4} justify = "center">
                                    <Avatar><HomeIcon /></Avatar>
                                </Grid>
                                <Grid item xs={8}>
                                    <Typography variant="p">
                                        Resident population
                                    </Typography>
                                    <Typography variant="h4">
                                        <FancyNumber count={Math.floor(Math.random() * 100000)} />
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                    <Grid item m={4}>
                        <Paper sx={{width: '100%', p:2}}>
                            <Grid container>
                                <Grid item xs={4}>
                                <Avatar><ArchitectureIcon sx={{fontSize: "3em"}}  /></Avatar>
                                </Grid>
                                <Grid item xs={8}>
                                    <Typography variant="p">
                                        Average distance to bus-stop
                                    </Typography>
                                    <Typography variant="h4">
                                        <FancyNumber count={Math.floor(Math.random() * 10000) / 10} />&nbsp;m
                                    </Typography>
                                </Grid>
                            </Grid>
                            
                        </Paper>
                    </Grid>    
                    <Grid item m={4}>
                        <Paper sx={{width: '100%', p:2}}>
                            <Grid container>
                                <Grid item xs={4}>
                                <Avatar><ArchitectureIcon sx={{fontSize: "3em"}}  /></Avatar>
                                </Grid>
                                <Grid item xs={8}>
                                    <Typography variant="p">
                                        Some other stat
                                    </Typography>
                                    <Typography variant="h4">
                                        <FancyNumber count={Math.floor(Math.random() * 100) / 10} />
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>   
                    <Grid item xs={12}>
                        <AggregateStatistics dailyStats={dailyStats} trend={'+1.4%'} />
                        <HeatMap year={2023} getValues={(x) => x} data={dailyStats} />
                        <HourlyTraffic countsByHour={hourlyStats} />
                    </Grid>
                </Grid>
            </Box>
        </Dialog>
    );
}
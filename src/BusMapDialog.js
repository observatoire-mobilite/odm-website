import {forwardRef, useCallback, useMemo, useState, useEffect, Fragment} from 'react';
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

import { ErrorBoundary, useErrorBoundary } from "react-error-boundary";

import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'

import FAQList from './FAQ/List'
import FAQEntry from './FAQ/Entry'
import { useLineMapStore } from './LineMap/store/index.js';
import { shallow } from 'zustand/shallow';


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


// adjusts for the height of the AppBar (cf. https://mui.com/material-ui/react-app-bar/#fixed-placement)
const Offset = styled('div')(({ theme }) => theme.mixins.toolbar);

export default function BusMapDialog() {
    console.count('busmapdialog')
    const [currentStop, setCurrentStop, fetchStats] = useLineMapStore((state) => [state.currentStop, state.setCurrentStop, state.fetchStopStats], shallow)
    const {showBoundary} = useErrorBoundary()
    useEffect(() => {
        fetchStats('data/publictransport/busstats.json')
        .catch((e) => {showBoundary(new Error('Failed to retrieve data from server'))});
    }, [])
    const handleClose = useCallback(() => {setCurrentStop(null)})
    
    return (
        <Dialog
            fullScreen
            open={currentStop !== null}
            onClose={handleClose}
            TransitionComponent={Transition}
            keepMounted
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
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <ErrorBoundary FallbackComponent={NoBusData}>
                    <BusData />
                </ErrorBoundary>
            </Container>
        </Dialog>
    );
}

 
function BusData({}) {
    // internal state
    const [currentYear, setCurrentYear, currentStop, busStats] = useLineMapStore((state) => [state.currentYear, state.setCurrentYear, state.currentStop, state.stopStats], shallow)
    
    // local data processing
    const displayData = useMemo(() => {
        if (currentStop === null || busStats === null) return
        const data = busStats['daily'][currentYear][currentStop.label]
        const daily = data['corrected_boardings'].map((v, i) => (v ?? 0) + (data['corrected_disembarkments'][i] ?? 0))
        const nonzero = (d) => d.reduce((kv, v) => ((v ?? 0) > 0 ? 1 : 0) + kv, 0)
        const sum = (d) => d.reduce((kv, v) => (v ?? 0) + kv, 0)
        const annual_total = sum(daily)
        const counting_ratio = sum(data['share_counted_stops']) / nonzero(data['share_counted_stops'])

        return {
            daily,
            daily_average: annual_total / nonzero(daily),
            annual_total,
            total_stops: sum(data['total_stops']),
            counting_ratio
        }
    }, [currentStop, currentYear, busStats])

    return (<Grid container direction="row" justifyContent="space-around" alignItems="stretch" spacing={4}>
        <Grid item xs={4}>
            <SingleStat 
                title="Daily average movements"
                caption="boardings and deboardings averaged over time"    
                value={displayData?.daily_average}
            />
        </Grid>
        <Grid item xs={4}>
            <SingleStat 
                title="Annual total"
                caption={`total boardings and deboardings in ${currentYear}`}
                value={displayData?.annual_total}
            />
        </Grid>
        <Grid item xs={4}>
            <SingleStat 
                title="Counting ratio"
                caption="Times a vehicle stopped"    
                value={displayData?.counting_ratio}
                unit={`%`}
            />
        </Grid>
        <Grid item xs={12}>
            <ComplexStat
                title="Passengers per day"
            >
                <Box sx={{p: 2}}>
                    <YearToggle currentYear={currentYear} onChange={(evt, val) => setCurrentYear(val ?? currentYear)} />
                    <CalendarHeatMap year={2023} data={displayData?.daily} />
                </Box>
            </ComplexStat>
        </Grid>
    </Grid>)
}


function NoBusData({}) {
    const [currentStop] = useLineMapStore((state) => [state.currentStop], shallow)
  
    return (<Fragment>
        <Alert severity="error" sx={{ width: '100%', mt: 2, mb: 4 }}>
            <AlertTitle>No data available</AlertTitle>
            There is nothing to display, because are strictly no data listed under the label "{currentStop?.label}".
        </Alert>
        <Container maxWidth="md">
            <Paper>
                <FAQList>
                    <FAQEntry title="What is going on?" name="panel-1">
                        <Typography>If you see this dialog, it means that ODM has strictly no data on file for the chosen location or line. This is not a case of incomplete or partial data, but the complete absence of any observations over the entire timespan otherwise covered by ODM.</Typography>
                    </FAQEntry>
                    <FAQEntry title="How is this possible?" name="panel-2">
                        <Typography>Obviously, data have been lost. So far, we know of three reasons:
                            <ol>
                                <li>data get lost on their way from the vehicles to ODM due to technical problems or process errors.</li>
                                <li>there never were any data, due to operational reasons. For example, some lines are serviced exclusively by vehicles lacking passenger counting equipment.</li>
                                <li>there is an issue with the way ODM processed the data. For this particular dataset, we found the main source of errors to be the allocation of stop events to lines and locations. While that should be a simple task, it is not due to the lack of truly coherent data governance practices. Harmonizing those is a core task of the ODM programme.</li>
                            </ol>
                        </Typography>
                    </FAQEntry>
                    <FAQEntry title="So now what?" name="panel-3">
                        <Typography>
                            We aim for maximum data quality.
                            At this stage, we cannot exclude ODM itself from the list of possible error sources (see preceeding question).
                            Therefore, we encourage you to <a href="mailto:observatoire@mob.etat.lu">let us know</a> if you stumbled onto this dialog.
                        </Typography>
                        <Typography>
                            In the current version, data gaps are known for:
                            <ul>
                                <li>all stops in Germany between Vianden and Bittburg</li>
                                <li>Kahren in Germany</li>
                                <li>Micheville in France</li>
                                <li>Neubrück in Belgium</li>
                                <li>Kalborn</li>
                            </ul>
                        </Typography>
                    </FAQEntry>
                </FAQList>
            </Paper>
        </Container>

    </Fragment>)

}
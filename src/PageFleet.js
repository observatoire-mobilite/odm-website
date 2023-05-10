import { useState, forwardRef, useEffect, useRef, useCallback, useMemo, memo, Suspense, createContext, useContext } from 'react';
import { useTheme } from '@mui/material/styles';

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
import { AggregateStatistics, FancyNumber } from './PageTram.js'
import SingleStat from './DataGrids/SingleStat.js'
import ComplexStat from './DataGrids/ComplexStat.js'
import BarChart from './BarChart'

import { DateTime } from "luxon";

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import IconCar from './ODMIcons/IconCar.js';
import IconTruck from './ODMIcons/IconTruck.js';
import IconBus from './ODMIcons/IconBus.js';
import TwoWheelerIcon from '@mui/icons-material/TwoWheelerOutlined';
import VanIcon from '@mui/icons-material/AirportShuttle';
import AreaChart from './AreaChart'
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'



const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre','décembre']


export function AggLevel({labels, icons=[], current=null, onChange=(evt, newval) => null}) {
    return (<ToggleButtonGroup exclusive value={current} aria-label="aggregation level" onChange={onChange}>
        {labels.map((label, i) => {
            return (<Tooltip title={label} describeChild={true}><ToggleButton key={label} value={label}>{icons[i] ?? label}</ToggleButton></Tooltip>)
        })}
     </ToggleButtonGroup>
    )
}


export function AggLevelDropdown({labels, displayLabels=[], current=null, onChange=(evt, newval) => null}) {
    return (<FormControl sx={{ minWidth: 120 }}>
            <Select value={current} aria-label="caractéristique à visualiser" onChange={onChange} >
                { labels.map((value, i) => <MenuItem key={value} value={value}>{displayLabels[i] ?? value}</MenuItem>)}
            </Select>
        </FormControl>
    )
}


export default function Fleet() {

    const [stats, setStats] = useState(null)
    const [statsLoaded, setStatsLoaded] = useState(false)
    const [currentCat, setCurrentCat] = useState(null)
    const [currentStat, setCurrentStat] = useState(null)
    const theme = useTheme()


    useEffect(() => {
        setStatsLoaded(false)
        fetch('data/fleet/fleetstats.json')
        .then((res) => res.json())
        .then((res) => {
            setStats(res)
            setStatsLoaded(true)
            setCurrentCat('Voitures')
            setCurrentStat('carburant')
        })
    }, [])

    const {dates, xticks} = useMemo(() => {
        if (stats === null) return []
        const dates = stats['refdates'].map((d) => DateTime.fromISO(d))
        return {
            dates: dates.map((date) => `${MONTHS[date.month - 1]} ${date.year}`),
            xticks: dates.map((date, i) => ({label: date.year, i, visible: date.month == 1})).filter((l) => l.visible)
        }
    }, [stats])
    
    if (! statsLoaded) return

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container direction="row" justifyContent="space-around" alignItems="stretch" spacing={2}>
                <Grid item xs={12}>
                    Compilation des donnes de la SNCA - données disponibles en <a href="https://data.public.lu/fr/datasets/parc-automobile-du-luxembourg" target="_blank">OpenData</a>
                </Grid>
                <Grid item xs={12}>
                    <ComplexStat
                        title="Parc automobile depuis 2017 (SNCA)"
                    >
                        <Grid container direction="row" justifyContent="space-between" sx={{p: 2}}>
                            <Grid item xs={12}>
                                <Grid container direction="row" justifyContent="flex-start" alignItems="center" spacing={2}>
                                    <Grid item>
                                        <AggLevel 
                                            current={currentCat} 
                                            onChange={(evt, newval) => setCurrentCat(newval ?? currentCat)}
                                            labels={['Voitures', 'Motos', 'Camionnettes', 'Camions', 'Autobus']}
                                            icons={[<IconCar color={theme.palette.text.secondary} width="1.2rem" height="1.2rem" />, 
                                                    <TwoWheelerIcon />,
                                                    <VanIcon />, 
                                                    <IconTruck color={theme.palette.text.secondary} width="1.5rem" height="1.5rem" />,
                                                    <IconBus color={theme.palette.text.secondary} width="1.5rem" height="1.5rem" />]}
                                        />
                                    </Grid>
                                    <Grid item>
                                        <AggLevelDropdown
                                            displayLabels={[
                                                'motorisation',
                                                <span>année de 1<sup>ère</sup> immatriculation</span>,
                                                'constructeurs (top 7)',
                                                'couleur'
                                            ]} 
                                            current={currentStat} 
                                            onChange={(evt) => setCurrentStat(evt.target.value ?? currentStat)}
                                            labels={['carburant', 'année', 'marque', 'couleur']}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={12}>
                                <AreaChart data={stats[currentCat][currentStat]} xlabels={dates} xticks={xticks} />
                                <Typography variant="caption">Dernière mise à jour des données: février 2023</Typography>
                            </Grid>
                        </Grid>

                    </ComplexStat>
                </Grid>
            </Grid>
        </Container>
    )
}

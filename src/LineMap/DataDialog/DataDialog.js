import { useState, forwardRef, useEffect, useRef, useCallback, useMemo, memo, Suspense, createContext, useContext } from 'react';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import { useErrorBoundary } from 'react-error-boundary';

import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';

import YearToggle from './YearToggle';
import CalendarHeatMap from './CalendarHeatMap/CalendarHeatMap.js'
import SingleStat from './DataGrids/SingleStat.js'
import ComplexStat from './DataGrids/ComplexStat.js'
import BarChart from './BarChart'

import { DateTime } from "luxon";
import { useLineMapStore } from './LineMap/store'



export default function DataDialog({label, id, prefix="CFL ligne", comment, fromYear=2017, toYear=2023, setCurrent, currentYear, setCurrentYear, stats, appBarColor="secondary"}) {
    const handleClose = useCallback(() => {setCurrent(null); })
    
    const displayData = useMemo(() => {
        const empty = {monthly: []}
        if (id === undefined) return empty
        try {
            const monthly = stats[id][currentYear]['monthly']
            const daily = stats[id][currentYear]['daily']
            const total = monthly.reduce((kv, v) => kv + (v ?? 0), 0)
            return {monthly, labels: MONTHS, dailyAvg: daily, monthlyAvg: null, total}
        } catch (error) {
            return empty
        }
    }, [id, currentYear])

    const allMax = useMemo(() => {
        if (id === undefined) return null
        try {
            return Math.max(...Object.values(stats[id]).map((v) => Math.max(...v['monthly'])))
        } catch (error) {
            console.log(error)
            return null
        }
    }, [id])
    
    if (stats === null) return
    
    return (
        <Dialog
            fullScreen
            open={id !== null}
            onClose={handleClose}
            TransitionComponent={Transition}
        >
            <AppBar position="fixed" color={appBarColor}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={handleClose}
                        aria-label="fermer ce dialogue et retourner vers la carte du réseau"
                    >
                        <CloseIcon />
                    </IconButton>
                    <h1>{prefix ? `${prefix} ` : ''}{label}</h1>
                </Toolbar>
            </AppBar>
            <Offset />
            {displayData ?
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                
            </Container>:<h1>Pas de données</h1>}
        </Dialog>
    );
}



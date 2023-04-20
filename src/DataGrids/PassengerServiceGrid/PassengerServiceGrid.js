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
import { shallow } from 'zustand/shallow'


const capitalize = (txt) => txt.charAt(0).toUpperCase() + txt.slice(1)


export default function PassengerServiceGrid({comment, unit="voyageurs (montées + descentes divisées par 2)", stateLabel="Line"}) {

    
    const [currentYear, setCurrentYear, stats, id] = useLineMapStore((state) => [state.currentYear, state.setCurrentYear, state[`stats${stateLabel}`], state[`current${stateLabel}`]], shallow)
    const handleChangeYear = useCallback((evt, newval) => setCurrentYear(newval ?? currentYear), [])

    const {countingRatio=null, dailyAvg=null, annualTotal=null, monthly=null, daily=null} = stats[id][currentYear]
    
    return (
        <Grid container direction="row" justifyContent="space-around" alignItems="stretch" spacing={4}>
            {comment && <Grid item xs={12} sx={{p: 2}}>
                {comment}
            </Grid>}
            <Grid item xs={12} sx={{p: 2}}>
                <YearToggle from={fromYear} to={toYear} currentYear={currentYear} onChange={handleChangeYear}  />
            </Grid>
            <Grid item md={countingRatio ? 3 : 6} sm={6} xs={12}>
                <SingleStat 
                    title="Moyenne journalière (lu.-ve.)"
                    caption={`${unit} par jour en ${currentYear}`}
                    value={dailyAvg}
                />
            </Grid>
            <Grid item md={countingRatio ? 3 : 6} sm={6} xs={12}>
                <SingleStat 
                    title="Total annuel"
                    caption={`${unit} en ${currentYear}`}
                    value={annualTotal}
                />
            </Grid>
            {countingRatio && <Grid item md={3} sm={12} xs={12}>
                <SingleStat 
                    title={`Taux de comptage`}
                    caption={`rapport entre haltes comtpés et haltes observés`}
                    value={countingRatio}
                />
            </Grid>
            }
            <Grid item xs={12}>
                <ComplexStat
                    title={`${capitalize(unit)} par mois en ${currentYear}`}
                >
                    {monthly && <Box sx={{p: 2}}>
                        <BarChart data={monthly} />
                    </Box>}
                    {daily && <Box sx={{p: 2}}>
                        <CalendarHeatMap year={currentYear} data={daily} />
                    </Box>}
                </ComplexStat>
            </Grid>
        </Grid>
    )
}

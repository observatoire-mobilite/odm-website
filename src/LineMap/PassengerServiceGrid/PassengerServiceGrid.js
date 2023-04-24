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
import Grid from '@mui/material/Grid';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import BarChartIcon from '@mui/icons-material/BarChart';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

import YearToggle from '../../YearToggle';
import CalendarHeatMap from '../../CalendarHeatMap/CalendarHeatMap.js'
import SingleStat from '../../DataGrids/SingleStat.js'
import ComplexStat from '../../DataGrids/ComplexStat.js'
import BarChart from '../../BarChart'

import { DateTime } from "luxon";
import { useLineMapCurrentStats } from '../store'


const capitalize = (txt) => txt.charAt(0).toUpperCase() + txt.slice(1)
const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre','décembre']


export default function PassengerServiceGrid({url, comment, unit="voyageurs", statsLabel="Stop", idField="id", fromYear=2017, toYear=DateTime.now().year}) {
    const { currentYear, setCurrentYear, data } = useLineMapCurrentStats(url, statsLabel, idField)
    const{counting_ratio=null, annual_daily_average_corrected=null, annual_total_corrected=null, 
          day_offset=0, monthly=null, daily=null} = data ?? {}
    const [ currentTab, setCurrentTab] = useState('monthly')
    const handleChangeYear = useCallback((evt) => setCurrentYear(parseInt(evt.target.value) ?? currentYear), [])
    
    return (
        <Grid container direction="row" justifyContent="space-between" alignItems="stretch" spacing={2}>
            {comment && <Grid item xs={12}>
                {comment}
            </Grid>}
            <Grid item xs={12}>
                <YearToggle from={fromYear} to={toYear} currentYear={currentYear} onChange={handleChangeYear}  />
            </Grid>
            <Grid item md={counting_ratio === null ? 6 : 4} sm={6} xs={12}>
                <SingleStat 
                    title="Moyenne journalière (lu-ve)"
                    caption={`${unit} par jour en ${currentYear}`}
                    value={annual_daily_average_corrected}
                />
            </Grid>
            <Grid item md={counting_ratio === null ? 6 : 4} sm={6} xs={12}>
                <SingleStat 
                    title="Total annuel"
                    caption={`${unit} en ${currentYear}`}
                    value={annual_total_corrected}
                />
            </Grid>
            {counting_ratio && <Grid item md={4} sm={12} xs={12}>
                <SingleStat 
                    title="Taux de comptage"
                    caption="rapport entre haltes comtpées et haltes observées"
                    value={counting_ratio}
                    unit="%"
                />
            </Grid>
            }
            <Grid item xs={12}>
                <ComplexStat
                    title={`${capitalize(unit)} ${currentTab == 'monthly' ? 'par mois' : 'par jour'} en ${currentYear}`}
                >
                    <Tabs
                        value={currentTab}
                        onChange={(evt, newval) => setCurrentTab(newval ?? currentTab)}
                        aria-label={`choisir le niveau d'aggrégation des données de ${unit}`}
                    >
                        {monthly && <Tab icon={<BarChartIcon />} label="par mois" value="monthly" />}
                        {daily && <Tab icon={<CalendarMonthIcon />} label="par jour" value="daily" />}
                    </Tabs>
                    {monthly && currentTab == 'monthly' && <Box sx={{p: 2}}>
                        <BarChart data={Array.from({length: 12}, (_, i) => monthly[i] ?? null)} svgWidth={1618 * 3} svgHeight={1000} labels={MONTHS} ymax={null} width="100%" />
                    </Box>}
                    {daily && currentTab == 'daily' && <Box sx={{p: 2}}>
                        <CalendarHeatMap year={currentYear} data={daily} offsetDay={day_offset} />
                    </Box>}
                </ComplexStat>
            </Grid>
        </Grid>
    )
}

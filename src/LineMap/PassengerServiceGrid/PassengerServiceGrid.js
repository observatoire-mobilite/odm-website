import { useState, useCallback, Fragment } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { styled } from '@mui/material/styles';

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

import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';



const capitalize = (txt) => txt.charAt(0).toUpperCase() + txt.slice(1)
const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre','décembre']


export default function PassengerServiceGrid({url, comment, unit="voyageurs", statsLabel="Stop", idField="id", fromYear=2017, toYear=DateTime.now().year, noDataComment="", showNoDataHint=false}) {
    const { currentYear, setCurrentYear, data, dataLoaded, availableYears } = useLineMapCurrentStats(url, statsLabel, idField)
    const {counting_ratio=null, annual_daily_average_corrected=null, annual_total_corrected=null, 
          day_offset=0, month_offset=0, monthly=null, daily=null, noData=false} = data ?? {}
    const [ currentTab, setCurrentTab] = useState('monthly')
    const handleChangeYear = useCallback((evt) => setCurrentYear(parseInt(evt.target.value) ?? currentYear), [])
    const theme = useTheme();
    const screenMD = useMediaQuery(theme.breakpoints.up('md'));
    
    return (
        <Grid container direction="row" justifyContent="space-between" alignItems="stretch" spacing={2}>
            {comment && <Grid item xs={12}>
                <Typography textAlign="center" variant="caption">{comment}</Typography>
            </Grid>}
            <Grid item xs={12}>
                <YearToggle from={2021} to={DateTime.now().year} currentYear={currentYear} availableYears={availableYears} onChange={handleChangeYear}  />
            </Grid>
            {(showNoDataHint && noData) ? <NoData comment={noDataComment} statsLabel={statsLabel} /> : <Fragment>
            <Grid item md={counting_ratio === null ? 6 : 4} sm={6} xs={12}>
                <SingleStat 
                    title="Moyenne journalière (lu-ve)"
                    caption={`${unit} par jour en ${currentYear}`}
                    value={annual_daily_average_corrected}
                    ymin={1}
                    loading={! dataLoaded}
                />
            </Grid>
            <Grid item md={counting_ratio === null ? 6 : 4} sm={6} xs={12}>
                <SingleStat 
                    title="Total annuel"
                    caption={`${unit} en ${currentYear}`}
                    value={annual_total_corrected}
                    ymin={1}
                    loading={! dataLoaded}
                />
            </Grid>
            {counting_ratio !== null && <Grid item md={4} sm={12} xs={12}>
                <SingleStat 
                    title="Taux de comptage"
                    caption="rapport entre haltes comptées et haltes observées"
                    value={counting_ratio}
                    unit="%"
                    ymin={1}
                    loading={! dataLoaded}
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
                    {monthly && currentTab == 'monthly' && dataLoaded && <Box sx={{p: 2}}>
                        <BarChart 
                            data={Array.from({length: 12}, (_, i) => monthly[i - month_offset] ?? null)}
                            svgWidth={screenMD ? 1618 * 3 : 1000}
                            svgHeight={screenMD ? 1000 : 620 }
                            labels={MONTHS}
                            ymax={null}
                            width="100%" 
                        />
                    </Box>}
                    {daily && currentTab == 'daily' && dataLoaded && <Box sx={{p: 2}}>
                        <CalendarHeatMap year={currentYear} data={daily} offsetDay={day_offset} />
                    </Box>}
                    {dataLoaded || <Box sx={{p: 2}}>Loading...</Box>}
                </ComplexStat>
            </Grid>
            </Fragment>}
        </Grid>
    )
}



function NoData({comment, error, statsLabel="Stop"}) {
    
    return (
      <Container sx={{m: 6}}>
        <Alert severity="info" sx={{p: 2}}>
          <AlertTitle>{error?.years && error.years.length > 0 ? "Pas de données pour l'année choisie." : "Aucune information disponible"}</AlertTitle>
          {(error?.years && error.years.length > 0) 
            ? <Typography>Astuce: des données sont enregistrées pour les années: {error.years.join(', ')}.</Typography>
            : <Typography>L'ODM n'a pas encore reçu de données pour {statsLabel=="Stop" ? "cet arrêt" : "cette ligne"}.</Typography>
          }
        </Alert>
      </Container>  
    )
  }
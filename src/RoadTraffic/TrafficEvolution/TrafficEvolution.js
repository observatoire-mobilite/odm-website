import { useState } from "react"

import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import BarChartIcon from '@mui/icons-material/BarChart';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

import {useRoadTrafficStore} from "../store/useRoadTrafficStore"
import {MONTHS} from '../RoadTraffic'

import CalendarHeatMap from '../../CalendarHeatMap'
import BarChart from '../../BarChart';


export default function TrafficEvolution({displayData}) {
    const [currentTab, setCurrentTab] = useState('monthly')
    const currentYear = useRoadTrafficStore((state) => state.currentYear)
  
    return (
      <Paper sx={{p: 2}}>
        <Typography variant="h6" color="primary">
          {`Trafic dans les deux sens par ${currentTab=='monthly' ? 'mois' : 'jour'} en ${currentYear}`}
        </Typography>
  
        <Tabs
          value={currentTab}
          onChange={(evt, newval) => setCurrentTab(newval ?? currentTab)}
          aria-label={`choisir le niveau d'aggrégation`}
        >
          <Tab icon={<BarChartIcon />} label="par mois" value="monthly" />
          <Tab icon={<CalendarMonthIcon />} label="par jour" value="daily" />
        </Tabs>
        {currentTab == 'monthly' && <Box sx={{p: 2}}>
          <BarChart data={displayData?.monthly ?? []} svgWidth={1618 * 3} svgHeight={1000} ymax={null} labels={MONTHS} />
        </Box>}
        {currentTab == 'daily' && <Box sx={{p: 2}}>
          <CalendarHeatMap getValue={(x) => x.count} getDate={(x) => x.date} year={currentYear} data={displayData?.daily ?? []} />
        </Box>}
      </Paper>
    )
  
  }
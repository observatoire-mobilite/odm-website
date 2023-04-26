import {Chart} from '../../LineChart/Chart.js';
import { useTheme } from '@mui/material/styles';

export default  function HourlyTraffic({countsByHour}) {
    const theme = useTheme()
    return (
        <Chart xExtent={[0, 24]} yExtent={[0, Math.max(...countsByHour.map(c => c.count_weekday), ...countsByHour.map(c => c.count_weekend))]}>
            <Chart.LineSeries data={countsByHour.map((c) => {return {x: c.hour, y: c.count_weekday}})} stroke={theme.palette.primary.dark} />
            <Chart.LineSeries data={countsByHour.map((c) => {return {x: c.hour, y: c.count_weekend}})} stroke={theme.palette.secondary.light}/>
        </Chart>
    )
  }
  
  
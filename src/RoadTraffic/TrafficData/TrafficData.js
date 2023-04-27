import { Fragment } from "react"

import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';

import SingleStat from "../../DataGrids/SingleStat";
import HourlyTraffic from "../HourlyTraffic";
import TrafficEvolution from "../TrafficEvolution";

export default function TrafficData({vehicleTypeLabel='véhicules', displayData}) {
      
      return (
        <Fragment>
            <Grid item xs={6}>
            <SingleStat 
                title="Trafic moyen journalier"
                subtitle="un jour en semaine (lu-ve)"
                caption={`${vehicleTypeLabel} par jour dans les deux sens`}    
                value={displayData?.weekdayAverage ?? null}
                />
            </Grid>
            <Grid item xs={6}>
            <SingleStat 
                title="Trafic moyen journalier"
                subtitle="un jour le weekend (sa-di)"
                caption={`${vehicleTypeLabel} par jour dans les deux sens`}
                value={displayData?.weekendAverage ?? null}
                />
            </Grid>
            <Grid item xs={12}>
            <TrafficEvolution displayData={displayData} />
            </Grid>
            <Grid item xs={12}>
            <Paper sx={{p: 2}}>
                <Typography variant="h6" color="primary">
                {`Trafic moyen par heure dans les deux sens`}
                </Typography>
                <Typography variant="subtitle" color="primary">en semaine (lu-ve)</Typography>
                <Typography variant="subtitle"> et </Typography>
                <Typography variant="subtitle" color="secondary.light">le weekend (sa-di)</Typography>
                
                <HourlyTraffic countsByHour={displayData?.hourly ?? []} />
            </Paper>
            </Grid>
        </Fragment>)
        
  }
  
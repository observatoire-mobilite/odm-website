import React from 'react';
import Typography from '@mui/material/Typography';
import {TraficData} from './RoadTraffic.js'



export default function Cycling() {
    return (
      <div>
        <h2>Cycling Traffic</h2>
        <Typography variant="body1">
          Utilisation des vélos selon les systèmes de captage automatisé du trafic de l'APC.
        </Typography>
        <TraficData
            locationsPath={() => 'data/road/Compteurs_xy.csv'}
            countsByDayPath={(year) => `data/road/Bike/comptage_${year}_velo_days_year.csv`}
            countsByHourPath={(year) => `data/road/Bike/comptage_${year}_velo_day_hour.csv`}
        />
      </div>
    )
  }
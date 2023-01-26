import React from 'react';
import Typography from '@mui/material/Typography';
import {TraficData} from './RoadTraffic.js'


export function Cycling() {
  return (
    <div>
      <h2>Cycling traffic</h2>
      <Typography variant="body1">
        Bicycles counted by the NRA's national counting station network.
      </Typography>
      <TraficData
          locationsPath={() => 'data/road/Compteurs_xy.csv'}
          countsByDayPath={(year) => `data/road/Bike/comptage_${year}_velo_days_year.csv`}
          countsByHourPath={(year) => `data/road/Bike/comptage_${year}_velo_day_hour.csv`}
          getHourlyCounts={(c) => { return { 'hour': c.ind, 'count_weekday': c.average_week_day, 'count_weekend': c.average_week_end }}}
      />
    </div>
  )
}


export function Trucks() {
  return (
    <div>
      <h2>Heavy-duty vehicle traffic</h2>
      <Typography variant="body1">
        Heavy-duty trucks (vehicles longer than 6.5m) counted by the NRA's national counting station network.
      </Typography>
      <TraficData
          locationsPath={() => 'data/road/Compteurs_xy.csv'}
          countsByDayPath={(year) => `data/road/Mot/comptage_${year}_mot_days_year.csv`}
          countsByHourPath={(year) => `data/road/Mot/comptage_${year}_mot_day_hour.csv`}
          getHourlyCounts={(c) => { return { 'hour': c.ind, 'count_weekday': c.C_weekday, 'count_weekend': c.C_weekend }}}
          getDailyCount={(c) => c.C}
      />
    </div>
  )
}

export function Cars() {
  return (
    <div>
      <h2>Passenger car traffic</h2>
      <Typography variant="body1">
      Passenger cars (vehicles shorter than 6.5m) counted by the NRA's national counting station network.
      </Typography>
      <TraficData
          locationsPath={() => 'data/road/Compteurs_xy.csv'}
          countsByDayPath={(year) => `data/road/Mot/comptage_${year}_mot_days_year.csv`}
          countsByHourPath={(year) => `data/road/Mot/comptage_${year}_mot_day_hour.csv`}
          getHourlyCounts={(c) => { return { 'hour': c.ind, 'count_weekday': c.V_weekday, 'count_weekend': c.V_weekend }}}
          getDailyCount={(c) => c.V}
      />
    </div>
  )
}
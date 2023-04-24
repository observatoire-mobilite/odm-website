import RoadTraffic from "./RoadTraffic"


export function Cycling() {
  return (
      <RoadTraffic
          vehicleTypeLabel='vélos'
          locationsPath={() => 'data/road/Compteurs_xy.csv'}
          countsByDayPath={(year) => `data/road/Bike/comptage_${year}_velo_days_year.csv`}
          countsByHourPath={(year) => `data/road/Bike/comptage_${year}_velo_day_hour.csv`}
          getHourlyCounts={(c) => { return { 'hour': c.ind, 'count_weekday': c.average_week_day, 'count_weekend': c.average_week_end }}}
          getDailyCount={(c) => c.average_values == 'NA' ? null : c.average_values}
      />
  )
}


export function Trucks() {
  return (
      <RoadTraffic
          vehicleTypeLabel='camions'
          locationsPath={() => 'data/road/Compteurs_xy.csv'}
          countsByDayPath={(year) => `data/road/Mot/comptage_${year}_mot_days_year.csv`}
          countsByHourPath={(year) => `data/road/Mot/comptage_${year}_mot_day_hour.csv`}
          getHourlyCounts={(c) => { return { 'hour': c.ind, 'count_weekday': c.C_weekday, 'count_weekend': c.C_weekend }}}
          getDailyCount={(c) => c.C}
      />
  )
}

export function Cars() {
  return (
      <RoadTraffic
          vehicleTypeLabel='voitures'
          locationsPath={() => 'data/road/Compteurs_xy.csv'}
          countsByDayPath={(year) => `data/road/Mot/comptage_${year}_mot_days_year.csv`}
          countsByHourPath={(year) => `data/road/Mot/comptage_${year}_mot_day_hour.csv`}
          getHourlyCounts={(c) => { return { 'hour': c.ind, 'count_weekday': c.V_weekday, 'count_weekend': c.V_weekend }}}
          getDailyCount={(c) => c.V}
      />
  )
}
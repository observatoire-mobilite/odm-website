import { useCallback } from 'react';

import Grid from '@mui/material/Grid'; 
import Typography from '@mui/material/Typography'; 
import Skeleton from '@mui/material/Skeleton';

import StationMap from './StationMap';
import TrafficData from './TrafficData';
import YearToggle from '../YearToggle';
import useRoadTrafficData from './store/useRoadTrafficData';
import { useRoadTrafficStore } from './store/useRoadTrafficStore';

import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';


export const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre','décembre']
const YEARS = [2016, 2017, 2018, 2019, 2020, 2021]

function Layout({comment, children}) {
  const [currentYear, setCurrentYear, currentStation] = useRoadTrafficStore((state) => ([
    state.currentYear,
    state.setCurrentYear,
    state.currentStation, 
  ]))
  const handleChangeCurrentYear = useCallback((evt) => setCurrentYear(parseInt(evt.target.value)) ?? currentYear)

  return (
    <Grid container spacing={2}>
      {comment && <Grid item xs={12}>
        {comment}
      </Grid>}
      <Grid item xs={12} sx={{p: 2}}>
        <Typography variant="caption">Comptages automatiques de l'Administration des ponts et chaussées - infos détaillées sur <a href="https://pch.gouvernement.lu/fr/administration/competences/comptage-trafic.html" target="_blank">Comptage du trafic</a> - données disponibles en <a href="https://data.public.lu/fr/datasets/pch-comptage-du-trafic-sur-le-reseau-routier-national/" target="_blank">OpenData</a></Typography>
      </Grid>
      <Grid item xs={12} md={6} lg={5} sx={{height: {xs: '40vh', md: '80vh'}}}>
        <StationMap />
      </Grid>
      <Grid item xs={12} md={6} lg={7}>
        <Grid container spacing={2} sx={{p: 2}}>
          <Grid item xs={12}>
            <Typography variant="h4">{currentStation ? `${currentStation?.ROUTE} ${currentStation?.LOCALITE}` : 'Choisir un compteur sur la carte'}</Typography>
          </Grid>
          <Grid item xs={12}>
            <YearToggle from={Math.min(...YEARS)} to={Math.max(...YEARS)} currentYear={currentYear} onChange={handleChangeCurrentYear} />
          </Grid>
          {children}
        </Grid>  
      </Grid>
    </Grid>
  )
}

export default function RoadTraffic({comment=null, ...rest}) {
  const displayData = useRoadTrafficData(rest)
  return (
    <Layout comment={comment}>
      {(displayData && displayData.hourly.length > 0) ? <TrafficData displayData={displayData} /> : <NoData />}
    </Layout>
  )
}

function NoData() {
  return (
    <Container sx={{m: 6}}>
      <Alert severity="info" sx={{p: 2}}>
        <AlertTitle>Pas de données pour le compteur et l'année choisis.</AlertTitle>
        <Typography>Veuillez choisir soit un autre compteur, soit une année plus récente.</Typography>
      </Alert>
    </Container>  
  )
}

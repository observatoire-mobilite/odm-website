import './App.css';
import React from 'react';
import PublicTransportStops from './PublicTransport.js';
import Layout from './Layout.js';
import { Routes, Route, Link } from "react-router-dom";
import Typography from '@mui/material/Typography';

import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import PageDemand from './PageDemand.js'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="publictransport" element={<PublicTransportStops />} />
        <Route path="demand" element={<PageDemand />} />
        <Route path="roadtraffic" element={<RoadTraffic />} />
        <Route path="cycling" element={<Cycling />} />
        <Route path="fleet" element={<Fleet />} />
        <Route path="*" element={<NoMatch />} />
      </Route>
    </Routes>
  );
}


function Home() {
  return (
    <div>
      <h2>Welcome</h2>
      <Typography variant="body1">
        Observatoire digital de la mobilité, at your service!
      </Typography>
      <img src="ObsMob_simplified.svg" alt="Fancy conceptual artwork" />

    </div>
  );
}


function RoadTraffic() {
  return (
    <Grid container direction="column" justifyContent="space-evenly">
      <Grid item>
        <h2>Road Traffic</h2>
        <Typography variant="body1">
          Trafic sur les routes luxembourgeoises selon les systèmes de captage automatisé du trafic de l'APC.
        </Typography>      
      </Grid>
      <Grid item>
        <div style={{'width': '800px'}}>
        <CalendarHeatmap
          startDate={new Date('2021-01-01')}
          endDate={new Date('2021-12-30')}
          values={[
            { date: '2021-01-01', count: 12 },
            { date: '2021-01-22', count: 122 },
            { date: '2021-01-30', count: 38 },
            { date: '2021-01-30', count: 0 },
            { date: '2021-2-1', count: 0 }
          ]}
        />
        </div>
      </Grid>
    </Grid>
  )
}

function Cycling() {
  return (
    <div>
      <h2>Cycling Traffic</h2>
      <Typography variant="body1">
        Utilisation des vélos selon les systèmes de captage automatisé du trafic de l'APC.
      </Typography>
    </div>
  )
}


function Fleet() {
  return (
    <div>
      <h2>Flotte automobile du Luxembourg</h2>
      <Typography variant="body1">
        Véhicules immatriculés au Luxembourg
      </Typography>
    </div>
  )
}

function NoMatch() {
  return (
    <div>
      <h2>Nothing to see here!</h2>
      <p>
        <Link to="/">Go to the home page</Link>
      </p>
    </div>
  );
}

import './App.css';
import React from 'react';
import PublicTransportStops from './PublicTransport.js';
import RoadTraffic from './RoadTraffic.js';
import Layout from './Layout.js';
import { Routes, Route, Link } from "react-router-dom";
import Typography from '@mui/material/Typography';

import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import PageDemand from './PageDemand.js'
import Cycling from './PageCycling.js'

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

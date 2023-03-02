import './App.css';
import React from 'react';
import Typography from '@mui/material/Typography';
import { Routes, Route, Link } from "react-router-dom";

import PageDemand from './PageDemand.js'
import {Cycling, Trucks, Cars} from './PageRoadCounts.js';
import PublicTransportStops from './PublicTransport.js';
import {BusMap} from './BusMap.js';
import Layout from './Layout.js';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="publictransport" element={<PublicTransportStops />} />
        <Route path="busmap" element={<BusMap />} />
        <Route path="demand" element={<PageDemand />} />
        <Route path="cartraffic" element={<Cars />} />
        <Route path="trucktraffic" element={<Trucks />} />
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

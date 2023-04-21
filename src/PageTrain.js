import { useState, forwardRef, useEffect, useRef, useCallback, useMemo, memo, Suspense, createContext, useContext } from 'react';
import LineMap from './LineMap'
import { useTheme } from '@mui/material/styles';

import YearToggle from './YearToggle';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import HomeIcon from '@mui/icons-material/Home';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardHeader from '@mui/material/CardHeader';
import InfoIcon from '@mui/icons-material/Info';
import { styled } from '@mui/material/styles';

import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import { animated, useSpring, config } from '@react-spring/web'
import CalendarHeatMap from './CalendarHeatMap/CalendarHeatMap.js'
import { HourlyTraffic } from './RoadTraffic.js'
import { AggregateStatistics, FancyNumber } from './PageTram.js'
import SingleStat from './DataGrids/SingleStat.js'
import ComplexStat from './DataGrids/ComplexStat.js'
import BarChart from './BarChart'
import IconTrain from './ODMIcons/IconTrain';


import DataDialog from './LineMap/DataDialog'
import PassengerServiceGrid from './LineMap/PassengerServiceGrid'

import { DateTime } from "luxon";
import { useErrorBoundary } from 'react-error-boundary';
import { useLineMapStore } from './LineMap/store'



export default function PageTrain() {
    return (
        <LineMap>
            <DataDialog>
                <PassengerServiceGrid 
                    statsLabel="Line"
                    comment=""
                    unit="voyageurs (montées + descentes divisées par 2)"
                    idField="id"
                    fromYear={2017}
                />
            </DataDialog>
            <DataDialog>
                <PassengerServiceGrid 
                    statsLabel="Stop"
                    comment=""
                    unit="montées + descentes"
                    idField="id"
                    fromYear={2017}
                />
            </DataDialog>
        </LineMap>
    )
}
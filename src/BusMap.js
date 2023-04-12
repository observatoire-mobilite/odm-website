import React, { useState, useEffect, useRef, useCallback, useMemo, memo, Suspense, createContext, useContext } from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid';
import { animated, useSpring, to } from '@react-spring/web'
import { TransformWrapper, TransformComponent, useTransformEffect } from "react-zoom-pan-pinch";
import {useWindowSize} from './common.js'
import { DateTime } from "luxon";
import { createUseGesture, dragAction, pinchAction, scrollAction, wheelAction } from '@use-gesture/react'
import { createMemoryHistory } from '@remix-run/router';
import { width } from '@mui/system';
import BusMapDialog from './BusMapDialog.js';
import { useTheme } from '@mui/material/styles';
import CalendarHeatMap from './CalendarHeatMap/CalendarHeatMap.js'

import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CropFreeIcon from '@mui/icons-material/CropFree';
import LockIcon from '@mui/icons-material/Lock';

import LineMap from './LineMap'

export const BusMapContext = createContext({
    currentStop: null,
    setCurrentStop: () => null,
});
  

export function BusMap() {

    return (
        <LineMap mapdata="data/publictransport/busmap.json">
            <BusMapDialog />
        </LineMap>    )
}

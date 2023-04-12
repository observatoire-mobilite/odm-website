import { useState, useEffect, useRef, useCallback, useMemo, memo, Suspense, createContext, useContext } from 'react';
import LineMap from './LineMap'

import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid';


export default function PageTrain() {
    return (<LineMap />)
}
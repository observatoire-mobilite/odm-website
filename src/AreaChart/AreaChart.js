import { useState, forwardRef, useEffect, useRef, useCallback, useMemo, memo, Suspense, createContext, useContext, Fragment } from 'react';
import { animated, useSprings, useSpring, config } from '@react-spring/web'
import { useTheme } from '@mui/material/styles';
import './AreaChart.css'
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import ScreenRotationIcon from '@mui/icons-material/ScreenRotation';
import FancyNumber from '../DataGrids/FancyNumber.js';
import { DateTime } from 'luxon';


export default function AreaChart({data, xlabels}) {
    /* expects data to be an object whose properties are the series to be plotted
        data = {
            group1: [ <values> ],
            group2: [ <values> ],
        }
    */
    const ref = useRef(null)
    const theme = useTheme()
    
    const displayData = useMemo(() => {
        const keys = Object.keys(data)
        const n = data[keys[0]].length
        const cumsum = keys.reduce((kv, group) => {
            const upper = kv.at(-1).map((v, i) => v + data[group][i] ?? 0)
            return [...kv, upper]
        }, [Array(n).fill(0)])
        const allMax = Math.max(...cumsum.at(-1))
        const rcumsum = cumsum.map((c) => c.map(s => s / allMax))
        
        const dx = 1000 / n
        const dy = 620
        
        return keys.map((group, i) => {
            const lower = rcumsum[i]
            const upper = rcumsum[i + 1]
            const points = [
                ...upper.map((y, i) => ({y, x: i})), 
                ...lower.slice().reverse().map((y, i) => ({y, x: lower.length - i - 1}))
            ]
            const d = points.map(({x, y}) => `${x * dx},${(1 - y) * dy}`).reduce((kv, v) => kv + ' ' + v, 'M') + ' z'
            const mid = Math.ceil(upper.length / 2)
            const delta_mid = upper[mid] - lower[mid]
            return {
                upper,
                lower,
                name: group,
                data: data[group],
                relative: rcumsum.at(-1).map((t, j) => (upper[j] - lower[j]) / t),
                d,
                label: delta_mid > 0.1 ? group: null,
                label_x: delta_mid > 0.1 ? dx * mid : null,
                label_y: delta_mid > 0.1 ? (1 - (delta_mid / 2 + lower[mid])) * dy : null,
            }
        })
    }, [data])

    const [springs, api] = useSprings(displayData.length, (i) => ({ to: { d: displayData[i].d }}), [displayData])
    const n = displayData.length
    const m = displayData[0].data.length
    console.count('area')

    const [pointer, act] = useSpring(() => ({to: {x: 0, y: 0}, config: config.stiff }))
    const [info, setInfo] = useState(null)

    const locateMouse = ({clientX, clientY}) => {
        if (! ref?.current) return
        const {x, y, width, height}= ref.current.getBoundingClientRect()
        const [rx, ry] = [(clientX - x) / width, (clientY - y) / height]
        
        const i = Math.floor(rx * xlabels.length)
        const chosen = displayData.find(({upper, lower}) => ((1 - ry >= lower[i]) && (1 - ry <= upper[i]))) ?? displayData.at(-1)
        
        act.start({
            x: i * 1000 / chosen.data.length, 
            y1: (1 - chosen.lower[i]) * 620,
            y2: (1 - chosen.upper[i]) * 620,
            x_t: i / chosen.data.length * width, 
            name: chosen.name
        })
        setInfo({
            caption: xlabels[i],
            value: chosen.data[i],
            title: chosen.name, 
            percent: Math.round(chosen.relative[i] * 1000) / 10
        })
    }

    return (<Box style={{position: 'relative'}}>
        <svg ref={ref} width="100%" viewBox="0 0 1000 620" onMouseMove={locateMouse} onMouseLeave={(evt) => setInfo(null)}>
            <AreaCurves displayData={displayData} />
            <animated.line x1={pointer.x} x2={pointer.x} y1={0} y2={620} stroke="black" strokeDasharray="1, 5" />
            <animated.line x1={pointer.x} x2={pointer.x} y1={pointer.y1} y2={pointer.y2} stroke={theme.palette.secondary.main} strokeWidth="4" />
        </svg>
        <Tooltip 
            {...info} 
            style={{
                x: pointer.x_t,
                y: pointer.y2,
                display: info === null ? 'none': 'block', left: pointer.left
        }} />
        <Box sx={{display: {xs: 'block', sm: 'none'}, position: 'absolute', top: 'calc(50% - 1rem)', left: 'calc(50% - 1rem)', width: '2rem', height: '2rem'}}>
            <ScreenRotationIcon />
        </Box>
    </Box>
    )
}


function AreaCurves({displayData}) {
    console.count('area-curves')
    const [springs, api] = useSprings(displayData.length, (i) => ({ to: { d: displayData[i].d }}), [displayData])
    return (<g>{springs.map((spring, i) => {return <g key={`area-group-${i}`}>
            <animated.path className="areachart" data-scaledvalue={10 - i} d={spring.d} />
            <animated.text justifyContent="center" alignmentBaseline="middle" fill="white" x={displayData[i].label_x} y={displayData[i].label_y}>{displayData[i].label}</animated.text>
        </g>})}</g>)
}


function Tooltip({style, caption, value, title, percent=43}) {
    return (<animated.div style={{position: 'absolute', left: 0, top:0, pointerEvents: 'none', width: '15rem', ...style}}>
        <Paper sx={{
            p: 2,
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100px',
            minWidth: '200px',
        }}>
            <Grid container spacing={0} direction="row" justifyContent="space-between" alignItems="baseline">
                <Grid item xs={12}>
                    {title && <Typography variant="h6" color="primary">
                        {title}
                    </Typography>}
                </Grid>
                <Grid item xs={8}>
                    {value && <Typography variant="h4">
                        <FancyNumber count={value} />
                    </Typography>}
                </Grid>
                <Grid item xs={4}>
                    {percent && <Typography variant="caption">
                        <FancyNumber count={percent} round="1" /><small>{`\u202F%`}</small>
                    </Typography>}
                </Grid>
                <Grid item xs={12}>
                    {caption && <Typography variant="caption">
                        {caption}
                    </Typography>}
                </Grid>
            </Grid>
        </Paper>
        </animated.div>        
    )
}
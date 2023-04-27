import { useState, forwardRef, useEffect, useRef, useCallback, useMemo, memo, Suspense, createContext, useContext, Fragment } from 'react';
import { animated, useSprings, useSpring, config } from '@react-spring/web'
import { useTheme, styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import ScreenRotationIcon from '@mui/icons-material/ScreenRotation';
import FancyNumber from '../DataGrids/FancyNumber.js';
import { DateTime } from 'luxon';


export default function AreaChart({xlabels, data}) {
    console.count('area-chart')
    
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
                label: delta_mid > 0.05 ? group: null,
                label_x: delta_mid > 0.05 ? dx * mid : null,
                label_y: delta_mid > 0.05 ? (1 - (delta_mid / 2 + lower[mid])) * dy : null,
            }
        })
    }, [data])

    return(<AreaPlot displayData={displayData} xlabels={xlabels}>
            <AreaCurves displayData={displayData} />
        </AreaPlot>)

}


const AreaCurveLabel = styled(animated('text'))(({theme}) =>({
    justifyContent: "center",
    alignmentBaseline: "middle",
    fill: theme.palette.primary.contrastText
}))


const colors = ['#ffbb1c', '#ccc01d', '#9bbf36', '#69bb52', '#2db46d',
                '#00aa84', '#009f96', '#0093a1', '#0085a3', '#05779c', 
                '#05779c']  // last color twice -> category 10 -> anything that would exactly map to 9
const AreaCurvePath = styled(animated('path'))(({theme}) => ({
    stroke: theme.palette.primary.contrastText,
    strokeWidth: 1,
    fill: theme.palette.grey[400],
    ...Object.fromEntries(colors.map((fill, i) => ([`&[data-scaledvalue="${i}"]`, { fill }]))),
}))



function AreaCurves({displayData}) {
    

    const [springs, api] = useSprings(displayData.length, (i) => ({ to: { d: displayData[i].d }}), [displayData])
    console.count('area-curves')

    return (
        <g>
            {springs.map((spring, i) => (
                <g key={`area-group-${i}`}>
                    <AreaCurvePath data-scaledvalue={10 - i} d={spring.d} />
                    <AreaCurveLabel  x={displayData[i].label_x} y={displayData[i].label_y}>{displayData[i].label}</AreaCurveLabel>
                </g>
            ))}
        </g>)

}


export function AreaPlot({children, displayData, xlabels, viewBox={x: 0, y: 0, width: 1000, height: 620}}) {
    /* expects data to be an object whose properties are the series to be plotted
        data = {
            group1: [ <values> ],
            group2: [ <values> ],
        }
    */
    console.count('area-tooltip')
    
    const [pointer, act] = useSpring(() => ({to: {x: 0, y: 0}, config: config.stiff }))
    const [info, setInfo] = useState(null)
    const canvasRef = useRef(null)
    const tooltipRef = useRef(null)
    const theme = useTheme()
    const spacing = useMemo(() => [0, 1, 2].map((_, i) => parseFloat(theme.spacing(i))), [])
    const n = xlabels.length
    
    const locateMouse = useCallback(({clientX, clientY}) => {
        const {x, y, width: canvasWidth, height: canvasHeight}= canvasRef.current.getBoundingClientRect()
        
        // relative position of mouse on canvas
        const [rx, ry] = [(clientX - x) / canvasWidth, (clientY - y) / canvasHeight]
        
        const i = Math.floor(rx * n)
        const chosen = displayData.find(({upper, lower}) => ((1 - ry >= lower[i]) && (1 - ry <= upper[i]))) ?? displayData.at(-1)
        
        // relative position rounded to next x and y element
        const x_rel = i / n
        const y_rel = (1 - chosen.upper[i])

        const {width: tooltipWidth, height: tooltipHeight} = tooltipRef.current.getBoundingClientRect()
        const [x_tt, y_tt] = [x_rel * canvasWidth, y_rel * canvasHeight]
        act.start({
            x: x_rel * viewBox.width, 
            y1: (1 - chosen.lower[i]) * viewBox.height,
            y2: y_rel * viewBox.height,
            x_t:  x_tt - (x_tt > tooltipWidth ? tooltipWidth + spacing[2]  : 0), 
            y_t: (y_tt + tooltipHeight + spacing[1] > canvasHeight ? canvasHeight - tooltipHeight - spacing[1] : y_tt), 
            name: chosen.name,
        })
        setInfo({
            caption: xlabels[i],
            value: chosen.data[i],
            title: chosen.name, 
            percent: Math.round(chosen.relative[i] * 1000) / 10,
        })
    })
        

    return (<Box style={{position: 'relative'}}>
        <svg ref={canvasRef} width="100%" viewBox="0 0 1000 620" onMouseMove={locateMouse} onMouseLeave={(evt) => setInfo(null)}>
            {children}
            <animated.line x1={pointer.x} x2={pointer.x} y1={0} y2={620} stroke="black" strokeDasharray="1, 5" />
            <animated.line x1={pointer.x} x2={pointer.x} y1={pointer.y1} y2={pointer.y2} stroke={theme.palette.secondary.main} strokeWidth="4" />
        </svg>
        <DataTooltipContainer 
            ref={tooltipRef}
            {...info} 
            style={{
                x: pointer.x_t,
                y: pointer.y_t,
                display: info === null ? 'none': 'block'
            }}
        >
            <DataTooltip {...info} />
        </DataTooltipContainer>
        <Box sx={{display: {xs: 'block', sm: 'none'}, position: 'absolute', top: 'calc(50% - 1rem)', left: 'calc(50% - 1rem)', width: '2rem', height: '2rem'}}>
            <ScreenRotationIcon />
        </Box>
    </Box>
    )
}



const DataTooltipContainer = styled(animated('div'))(({theme}) => ({
    position: 'absolute',
    left: theme.spacing(1),
    top: theme.spacing(1),
    pointerEvents: 'none',
    width: '15rem',
    height: '8rem',
    '&.left': {
        left: '-15rem'
    }
}))


function DataTooltip({caption, value, title, percent=43, ...rest}) {
    return (<Paper sx={{
            p: 2,
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            width: 1,
            height: 1
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
                    {percent && <Typography variant="h6">
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
    )
}
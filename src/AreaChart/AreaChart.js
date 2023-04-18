import { useState, forwardRef, useEffect, useRef, useCallback, useMemo, memo, Suspense, createContext, useContext } from 'react';
import { animated, useSprings } from '@react-spring/web'
import { useTheme } from '@mui/material/styles';
import './AreaChart.css'


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
            return {
                name: group,
                data: data[group],
                d
            }
        })
    }, [data])

    const [springs, api] = useSprings(displayData.length, (i) => ({ to: { d: displayData[i].d }}), [displayData])


    return (
        <svg ref={ref} width="100%" viewBox="0 0 1000 620">
            {springs.map((spring, i) => <animated.path className="areachart" data-scaledvalue={10} d={spring.d} />)}
            {Array.from({length: displayData.n * 0}, (_, i) => {
                return <rect fill="none" stroke="none" x={1000/displayData.n * i} y="0" width={1000/displayData.n} height="620" />
            })}
        </svg>
    )
}

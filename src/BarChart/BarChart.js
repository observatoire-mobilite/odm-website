import { useState, useEffect, useRef, useCallback, useMemo, memo, Suspense, createContext, useContext, Fragment } from 'react';
import { animated, useSpring, useSprings, to } from '@react-spring/web'
import { useTheme } from '@mui/material/styles';
import './BarChart.css'


export default function BarChart({data, labels=[], svgWidth=2 * 1618, svgHeight=1000, barWidth=1 / 1.618, ymax=100000, ymin=0}) {
    const displayData = useMemo(() => {
        const maxValue = ymax === null ? Math.max(...data) : ymax
        const minValue = ymin === null ? Math.min(...data) : ymin
        return data.map((v) => ({value: v, scaledValue: v === null ? null : ((v ?? 0) - minValue) / (maxValue - minValue)}))
    }, [data])

    const theme = useTheme() 
    const n = data.length
    const dx = svgWidth / n
    const [springs, api] = useSprings(n, (i) => {
        const s = displayData[i].scaledValue
        return {
            height: s * svgHeight, 
            y:  (1 - s) * svgHeight,
            label_y: svgHeight * (1 - s) - dx / 6,
            label_value: displayData[i].value
        }
    }, [data])
    console.log(springs)
    return (
        <SVGcanvas viewBox={{x: 0, y: -dx / 3, width: svgWidth, height: svgHeight + dx/2 + dx / 3}}>
            {displayData.map(({scaledValue, value}, i) => {
                const x = dx * i + (1 - barWidth) * dx / 2
                return (
                    <g key={`barchart-rects-${i}`}>
                        <animated.rect 
                            x={x} y={springs[i].y}
                            width={dx * barWidth} height={springs[i].height}
                            rx="5" 
                            className="barchart"
                            data-scaledvalue={scaledValue === null ? "null" : Math.round(scaledValue * 10)}
                            strokeWidth="5"
                            stroke="none"
                        />
                        <text
                            x={dx * (i + .5)} y={svgHeight + dx/4}
                            fontSize={dx / 5}
                            alignmentBaseline="middle"
                            textAnchor="middle"
                            fill={value === null ? theme.palette.grey[300] : theme.palette.text.primary}
                        >{labels[i] === undefined ? i : labels[i]}</text>
                        <animated.text
                            x={dx * (i + .5)} y={springs[i].label_y}
                            fontSize={dx / 6}
                            alignmentBaseline="middle"
                            textAnchor="middle"
                            fill={value === null ? theme.palette.grey[300] : theme.palette.text.primary}
                        >{value === null ? '' : springs[i].label_value?.to(val => Math.floor(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u202F"))}</animated.text>
                        <rect
                            x={dx * i} y={0} 
                            width={dx} height={svgHeight} 
                            fill={"none"}
                        />
                        
                    </g>)
            })}
        </SVGcanvas>
    )
}


function SVGcanvas({children, width='100%', height, viewBox}) {
    const flatViewBox = useMemo(() => `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`, [viewBox])
    return (
        <svg width={width} height={height} viewBox={flatViewBox}>
            {children}
        </svg>
    )
}

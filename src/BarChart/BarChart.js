import { useMemo, useRef, useEffect, useLayoutEffect, useState } from 'react';
import { animated, useSprings } from '@react-spring/web'
import { useTheme, styled } from '@mui/material/styles';
import Container from '@mui/material/Container'

const colors = ['#ffbb1c', '#ccc01d', '#9bbf36', '#69bb52', '#2db46d',
                '#00aa84', '#009f96', '#0093a1', '#0085a3', '#05779c', 
                '#05779c']  // last color twice -> category 10 -> anything that would exactly map to 9
const BarChartBar = styled(animated('rect'))(({theme}) => ({
    stroke: 'none',
    rx: 5,
    strokeWidth: 0,
    fill: theme.palette.grey[400],
    ...Object.fromEntries(colors.map((fill, i) => ([`&[data-scaledvalue="${i}"]`, { fill }]))),
    '&:hover': {
        fill: theme.palette.secondary.main,
        stroke: theme.palette.secondary.main,
        strokeWidth: 15
    }    
}))


const BarChartText = styled(animated('text'))(({theme}) => ({
    alignmentBaseline: 'middle',
    textAnchor: 'middle',
    fill: theme.palette.text.primary,
    '&.nodata': { fill: theme.palette.grey[300] }
}))


const BarChartClickTrap = styled('rect')(({theme}) => ({
    fill: 'none'
}))

const toNumber = (spring) => spring?.to(val => Math.floor(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u202F")) ?? ''
const getAspectRatio = (ref) => {
    const {current} = ref
}

export default function BarChart({data, labels=[], icons=[], svgWidth=1618, svgHeight=1000, width, height, barWidth=1 / 1.618, ymax=100000, ymin=0, style}) {
    
    const displayData = useMemo(() => {
        const maxValue = ymax === null ? Math.max(...data) : ymax
        const minValue = ymin === null ? Math.min(...data) : ymin
        return data.map((v) => ({value: v, scaledValue: v === null ? null : ((v ?? 0) - minValue) / (maxValue - minValue)}))
    }, [data])
    const ref = useRef(null)
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
    
    const viewBox={x: 0, y: -dx / 3, width: svgWidth, height: svgHeight + dx/2 + dx / 3}
    return (<svg style={style} width={width} height={height} viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}>
        
            {displayData.map(({scaledValue, value}, i) => {
                const x = dx * i + (1 - barWidth) * dx / 2
                return (
                    <g key={`barchart-rects-${i}`}>
                        <BarChartBar
                            x={x} 
                            y={springs[i].y}
                            width={dx * barWidth}
                            height={springs[i].height}
                            data-scaledvalue={scaledValue === null ? "null" : Math.round(scaledValue * 10)}
                        />
                        {<g transform={`translate(${dx * (i + .5)} ${svgHeight + dx/4})`}>
                            {icons[i] ??
                                <BarChartText
                                    fontSize={dx / 5}
                                    className={value === null && 'nodata'}
                                >{labels[i] === undefined ? i : labels[i]}</BarChartText>
                            }
                        </g>}
                        <BarChartText
                            x={dx * (i + .5)}
                            y={springs[i].label_y}
                            fontSize={dx / 6}
                            className={value === null && 'nodata'}
                        >{value === null ? '' : toNumber(springs[i].label_value)}</BarChartText>
                        <BarChartClickTrap
                            x={dx * i}
                            y={0} 
                            width={dx}
                            height={svgHeight} 
                        />
                    </g>
                )
            })}
        </svg>
    )
}

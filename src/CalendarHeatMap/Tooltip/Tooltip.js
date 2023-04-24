import { useCallback, useState } from 'react' 
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { animated, useSpring, config } from "react-spring"
import { styled } from '@mui/material/styles'
import FancyNumber from '../../DataGrids/FancyNumber'


const TooltipContainer = styled(animated('div'))(({theme}) => ({
    position: 'absolute', 
    left: 0,
    top: 0,
    pointerEvents: 'none',
    width: '15rem'
}))


export function useTooltip({ref, displayData, xlabels}) {
    const [pointer, act] = useSpring(() => ({to: {x: 0, y: 0}, config: config.stiff }))
    const [info, setInfo] = useState(null)

    const onMouseMove = useCallback(({clientX, clientY}) => {
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
    })

    const onMouseLeave = useCallback((evt) => setInfo(null))

    return {onMouseMove, onMouseLeave, pointer, info, act}

}


export default function Tooltip({style, caption, value, title, percent=43}) {
    return (<TooltipContainer style={style}>
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
        </TooltipContainer>        
    )
}
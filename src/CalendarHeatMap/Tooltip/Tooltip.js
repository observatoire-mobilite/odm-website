import { useCallback, useState, useEffect, useRef } from 'react' 
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { animated, useSpring, config } from "react-spring"
import { styled } from '@mui/material/styles'
import FancyNumber from '../../DataGrids/FancyNumber'


const TooltipContainer = styled(animated('div'))(({theme}) => ({
    position: 'absolute', 
    left: '1rem',
    top: '1rem',
    pointerEvents: 'none',
    width: '15rem'
}))


export function useTooltip({displayData, viewBox}) {
    const ref = useRef(null)
    const [info, setInfo] = useState(null)
    const [spring, act] = useSpring(() => {})
    
    // do the actual tooltip-updating
    const handleHover = useCallback(({clientX, clientY}) => {
      if (! ref?.current) return
      const {x, y, width, height}= ref.current.getBoundingClientRect()
      const [rx, ry] = [(clientX - x) / width, (clientY - y) / height]
      
      const svgpos = [viewBox.x + rx * viewBox.width, viewBox.y + ry * viewBox.height]
      const i = Math.floor((svgpos[0] - 150) / 100)
      const j = Math.ceil((svgpos[1]) / 100)
      act.start({
          x: rx * width,
          y: ry * height,
          display: i >= 0 && i <= 53 && j >= 0 && j < 7 ? 'block' : 'none'
      })
      const janfirst = displayData.janfirst
      const ordinal = i * 7 + j - janfirst.weekday
      const day = janfirst.plus({days: ordinal})
      
      setInfo({
          caption: day.toFormat('cccc, dd LLLL yyyy'),
          title: 'Data',
          value: displayData.data[ordinal] ?? '(no data)',
      })
    })
    
    // attach it to the reference
    useEffect(() => {
        if (ref && ref.current) {
            ref.current.addEventListener("mouseover", handleHover, false)
            return function cleanup() {
                ref.current.removeEventListener("mouseover", handleHover, false);
           };
        }
    }, [ref])
    
    return [ref, info, spring]
  
}


export default function Tooltip({style, caption, value, title, percent=43}) {
    return (<TooltipContainer style={style}>
        <Paper sx={{
            p: 2,
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

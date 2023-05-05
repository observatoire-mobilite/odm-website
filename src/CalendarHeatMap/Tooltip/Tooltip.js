import { useCallback, useState, useEffect, useRef, forwardRef } from 'react' 
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { animated, useSpring, config } from "react-spring"
import { styled } from '@mui/material/styles'
import FancyNumber from '../../DataGrids/FancyNumber'
import BlockIcon from '@mui/icons-material/Block';



const TooltipContainer = styled(animated('div'))(({theme}) => ({
    position: 'absolute', 
    left: '0',
    top: '0',
    pointerEvents: 'none',
    width: '15rem',
    opacity: 0
}))


export function useTooltip({displayData, viewBox}) {
    const ref = useRef(null)
    const tooltipRef = useRef(null)
    const [info, setInfo] = useState(null)
    const [spring, act] = useSpring(() => {})
    
    // do the actual tooltip-updating
    const handleHover = useCallback(({clientX, clientY}) => {
      if (! ref?.current || ! tooltipRef?.current) return
      const {x, y, width: canvasWidth, height: canvasHeight}= ref.current.getBoundingClientRect()
      const {width: tooltipWidth, height: tooltipHeight} = tooltipRef.current.getBoundingClientRect()
        
      const [rx, ry] = [(clientX - x) / canvasWidth, (clientY - y) / canvasHeight]
      
      const svgpos = [viewBox.x + rx * viewBox.width, viewBox.y + ry * viewBox.height]
      const i = Math.floor((svgpos[0] - 150) / 100)
      const j = Math.ceil((svgpos[1]) / 100)
    
      const [sx, sy] = [canvasWidth / viewBox.width * 100, canvasHeight / viewBox.height * 100]
      const [x_tt, y_tt] = [i * sx, j * sy]
      

      act.start({
          x: ((x_tt + tooltipWidth > canvasWidth) ? x_tt - tooltipWidth + 2.5 * sx : x_tt + 4.5 * sx), 
          y: y_tt, 
          //display: i >= 0 && i <= 53 && j >= 0 && j <= 7 ? 'block' : 'none',
          //opacity: i >= 0 && i <= 53 && j >= 0 && j <= 7 ? 1 : 0,
      })
      const janfirst = displayData.janfirst
      const monday = i * 7 - janfirst.weekday + 1
      const ordinal = monday + j - 1
      const day = janfirst.plus({days: ordinal})
      setInfo({
          date: j > 0 ? day.toFormat('cccc, dd LLLL yyyy') : `semaine du ${janfirst.plus({days: monday}).toFormat("d/M")} au ${janfirst.plus({days: monday + 6}).toFormat("d/M")}`,
          value: j > 0 ? displayData.data[ordinal]?.value ?? null : displayData.data.slice(monday < 0 ? 0 : monday, monday + 7).reduce((kv, v) => kv + v.value ?? 0, 0),
          captions: (displayData.dayInfo[day] ?? []).map(({kind, label}) => {
              switch (kind) {
                case 'holiday':
                  return `férié (${label})`
                case 'schoolHoliday':
                  return `vacance scolaire (${label})`
                case 'event':
                  return label
              }
          })
      })
    }, [displayData, displayData.janfirst])

    const handleShow = useCallback(() => { act.start({opacity: 1}) })
    const handleHide = useCallback(() => { act.start({opacity: 0}) })

    // attach it to the reference
    useEffect(() => {
        if (ref && ref.current) {
            ref.current.addEventListener("mouseover", handleHover, false)
            ref.current.addEventListener("mouseenter", handleShow, false)
            ref.current.addEventListener("mouseleave", handleHide, false)
            return function cleanup() {
                if (ref && ref.current) {
                    ref.current.removeEventListener("mouseover", handleHover, false);
                    ref.current.removeEventListener("mouseenter", handleShow, false)
                    ref.current.removeEventListener("mouseleave", handleHide, false)
                }
            };
        }
    }, [handleHover])
    
    return {ref, info, spring, tooltipRef}
  
}


const Tooltip = forwardRef(({style, captions=null, value=null, title=null, date=null, percent=null}, ref) => {
    return (<TooltipContainer style={style} ref={ref}>
        <Paper sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100px',
            minWidth: '200px',
        }}>
            <Grid container spacing={0} direction="row" justifyContent="space-between" alignItems="baseline">
                {title && <Grid item xs={12}>
                    <Typography variant="h6" color="primary">
                        {title}
                    </Typography>
                </Grid>}
                <Grid item xs={12}>
                    <Typography variant="body2" color="primary">
                        {date}
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    {value ? 
                        <Typography variant="h4">
                            <FancyNumber count={value} />
                        </Typography>
                    :
                        <Grid container alignItems="center" justifyItems="center" direction="row" spacing="2">
                            <Grid item><BlockIcon /></Grid>
                            <Grid item><Typography>pas de données</Typography></Grid>
                        </Grid>
                    }
                </Grid>
                {captions && captions.map((c) => {
                  return <Grid item xs={12}><Typography variant="caption">{c}</Typography></Grid>
                })}
            </Grid>
        </Paper>
        </TooltipContainer>        
    )
})

export default Tooltip;

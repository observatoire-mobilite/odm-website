import { useState, useRef } from 'react';
import { animated, useSpring, to } from '@react-spring/web'
import { createUseGesture, dragAction, pinchAction, scrollAction, wheelAction } from '@use-gesture/react'

import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CropFreeIcon from '@mui/icons-material/CropFree';
import LockIcon from '@mui/icons-material/Lock';


// custom action hook
const useGesture = createUseGesture([dragAction, pinchAction, scrollAction, wheelAction])


export default function ZoomableSVG({children, svgSize={width: 1472.387, height: 2138.5}, step=1000, maxZoomLevel=5, backgroundColor='white'}) {
    /* A SVG tag with the ability of dynamimc pan and zoom in its viewbox */
    
    const mapRef = useRef()
    const [viewBox, setViewBox] = useState({x: 0, y: 0, ...svgSize})
    
    // handler: zoom to a specific point on the map
    const resetZoom = ({y=0, width=svgSize.width, height=svgSize.height}) => {
        const {width: box_width, height: box_height} = mapRef.current.getBoundingClientRect()
        const apparent_width = svgSize.height * box_width / box_height
        setViewBox({x: -(apparent_width / 2 - width / 2), y, width: width, height: height})
    }

    // handler: adjust zoom level around center point of viewbox
    const zoom = ({zl=.1}) => {
        const {width: box_width, height: box_height} = mapRef.current.getBoundingClientRect()
        const apparent_width = viewBox.height * box_width / box_height
        const dx =  apparent_width * .5 * (1 - 1 / zl)
        const dy = viewBox.height * .5 * (1 - 1 / zl)
        setViewBox({x: viewBox.x + dx, y: viewBox.y + dy, width: viewBox.width / zl, height: viewBox.height / zl})
    }

    useGesture(
        {
            onDrag: ({ pinching, cancel, offset: [dx, dy], ...rest }) => {
                if (pinching) return cancel()
                setViewBox({x: -dx, y: -dy, width: viewBox.width, height: viewBox.height})
            },
            onPinch: ({ origin: [ox, oy], first, movement: [ms], offset: [s, a], memo, event}) => {
                return memo
            },
            onWheel: ({movement: [mx, my], offset: [ddx, ddy], event: {clientX: ox, clientY: oy}, event}) => {
                event.preventDefault()
                const zl = 1 - my / step
                
                const {x, y, width, height} = mapRef.current.getBoundingClientRect()
                const scale = viewBox.height / height
                const dx =  scale * (ox - x) * (1 - 1 / zl)
                const dy = scale * (oy - y) * (1 - 1 / zl)
                setViewBox({
                    x: viewBox.x + dx, 
                    y: viewBox.y + dy, 
                    width: viewBox.width / zl, 
                    height: viewBox.height / zl
                })
            }
        },
        { 
            target: mapRef,
            wheel: { 
                bounds: {top: -180, bottom: 0},
                rubberband: true,
                preventDefault: true,
                eventOptions: { passive: false }
                //preventScroll: true
            },
            drag: {
                //bounds: {left: 0, right: svgSize.with * maxZoomLevel, bottom: 0, top: svgSize.height * maxZoomLevel},
                eventOptions: { passive: false },
                transform: ([x, y]) => {
                    // converts pixels to SVG units and compensates for scaling
                    // since viewBox is already scaled
                    if (mapRef.current) {
                        const {height} = mapRef.current.getBoundingClientRect()
                        const f = viewBox.height / height
                        return [x * f, y * f]
                    }
                    return [x, y]
                    
                },
                from: () => {
                    // have to be negative to match drag direction
                    return [-viewBox.x, -viewBox.y]
                },
                rubberband: true,
                preventDefault: true,
                filterTaps: true,
            },
            pinch: {
                preventDefault: true
            }
        }
    )
    
    return (<Box style={{position: 'relative', height: '100%'}}>
        <svg ref={mapRef} 
            preserveAspectRatio="xMinYMid meet"
            viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`} 
            style={{
                width: '100%',
                height: 'calc(100vh - 150px)',
                touchAction: 'none',
                backgroundColor,
                willChange: 'transform',
                transformOrigin: 'center',
                cursor: 'grab',
                userSelect: 'none',
            }}
        >
            {children}
        </svg>

        <Stack style={{right: '0', position: 'absolute', top: '0'}}>
            <IconButton onClick={(evt) => zoom({zl: 1.1})} color="primary" title="zoom in on map"><ZoomInIcon /></IconButton>
            <IconButton onClick={(evt) => zoom({zl: 0.9})} color="primary" title="zoom out of map"><ZoomOutIcon /></IconButton>
            <IconButton onClick={(evt) => resetZoom({})} color="primary" title="put entrie country into view"><CropFreeIcon /></IconButton>
            <IconButton color="primary" title="lock map - can simplify scrolling down to other widgets" disabled><LockIcon /></IconButton>
        </Stack>
      </Box>
    )
}
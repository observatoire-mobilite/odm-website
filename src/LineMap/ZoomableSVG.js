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
    const resetZoom = ({}) => {
        const box = mapRef.current.getBoundingClientRect()
        const apparent_width = svgSize.height * box.width / box.height
        setViewBox({x: -(apparent_width / 2 - width / 2), y: 0, ...svgSize})
    }

    const zoom = ({zl=1, origin: [ox, oy], relative=false}) => {
        // size of contaire (svg tag) in screen units
        const container = mapRef.current.getBoundingClientRect()
        
        // full width in SVG units, assuming the SVG-viebox is wider than the actual image
        const apparent_width = viewBox.height * container.width / container.height
        
        // get zoom-center relative to width and height of the SVG-viewbox
        const [rx, ry] = relative ? [ox, oy] : [(ox - container.x) / container.width, (oy - container.y) / container.height]
        
        const dx = apparent_width * rx * (1 - 1 / zl)
        const dy = viewBox.height * ry * (1 - 1 / zl)
        setViewBox({
            x: viewBox.x + dx, 
            y: viewBox.y + dy, 
            width: viewBox.width / zl, 
            height: viewBox.height / zl
        })
    }

    useGesture(
        {
            onDrag: ({ pinching, cancel, offset: [dx, dy], ...rest }) => {
                if (pinching) return cancel()
                setViewBox({x: -dx, y: -dy, width: viewBox.width, height: viewBox.height})
            },
            onPinch: ({ origin: [ox, oy], movement: [ms], event}) => {
                event.preventDefault()
                const zl = 1 - ms / step
                zoom({zl, origin: [ox, oy]})
            },
            onWheel: ({movement: [_, my], event: {clientX: ox, clientY: oy}, event}) => {
                event.preventDefault()
                const zl = 1 - my / step
                zoom({zl, origin: [ox, oy]})
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
            <IconButton onClick={(evt) => zoom({zl: 1.1, relative: true, origin: [0.5, 0.5]})} color="primary" title="zoom in on map"><ZoomInIcon /></IconButton>
            <IconButton onClick={(evt) => zoom({zl: 0.9, relative: true, origin: [0.5, 0.5]})} color="primary" title="zoom out of map"><ZoomOutIcon /></IconButton>
            <IconButton onClick={(evt) => resetZoom({})} color="primary" title="put entrie country into view"><CropFreeIcon /></IconButton>
            <IconButton color="primary" title="lock map - can simplify scrolling down to other widgets" disabled><LockIcon /></IconButton>
        </Stack>
      </Box>
    )
}
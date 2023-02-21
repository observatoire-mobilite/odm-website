import React, {useEffect, useState} from 'react';


export function CorridorMap({
    zones,
    flows,
    selectedZone=0,
    onZoneSelected=(zone) => undefined,
    zoneLabel=false
}) {
    
    return (
        <svg width="100%"  height="600px" viewBox="0 0 877 1000">
            <g id="zones" style={{display: 'inline'}}>
                {zones.map((z) =>
                    <CorridorMultiPolygon 
                        index={z.index}
                        paths={z.paths}
                        selected={z.index === selectedZone}
                        onSelection={(zone) => onZoneSelected(zone)}
                        value={flows[z.index]} 
                        opacity={z.country == "Luxembourg" ? 1.0 : 0.50}
                    />
                )}
                {zoneLabel && zones.map((z) => z.centroid && <text x={z.centroid[0]} y={z.centroid[1]}>{z.index}</text>)}
            </g>
            {flows.map((flow, to_zone) => zones[selectedZone].centroid && zones[to_zone].centroid && <Arrow from={zones[selectedZone].centroid} to={zones[to_zone].centroid} width={flow * 20} />)}
        </svg>
    )
}


function CorridorMultiPolygon({paths, index, opacity=1.0, selected=false, onSelection=(zone) => undefined, value=0}){
    return (
        <g 
            id={`zone${index}`}
            pointerEvents="visiblePainted"
            style={{
                fill: selected ? `red` : `rgba(${Math.round((value > 1 ? 1 : value) * 255)}, 100, 100, ${opacity})`,
                stroke: 'white',
                strokeWidth: 1,
                strokeLinecap: 'butt',
                strokeLinejoin: 'round',
                strokeMiterlimit: 4,
                strokeDasharray: 'none',
                cursor: 'pointer'
            }}
            onClick={evt => onSelection(index)}
        >
            {paths.map((path) => <path d={`M ${path}`} />)}
        </g>
    )
}


function Arrow({from, to, width=1}) {

    const center_coord = (centroid) => `${centroid[0]},${centroid[1]}`;

    return (            
        <path d={`M ${center_coord(from)} ${center_coord(to)}`}
            style={{fill: 'none', stroke: 'rgba(255, 255, 255, .5)', strokeWidth: width, strokeLinecap: "round"}}/>
    )
}

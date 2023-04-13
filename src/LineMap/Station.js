export default function BusStation({station}) {
    return (
        <circle 
            pointerEvents="visible"
            cx={station.cx} cy={station.cy} r={station.r} 
            style={{
                stroke: 'none',
                fill: 'black'
            }}
        />
    )
}

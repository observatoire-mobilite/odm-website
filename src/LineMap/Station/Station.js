import {styled} from '@mui/material/styles'



export default function BusStation({station}) {
    return (
        <circle 
            cx={station.cx} cy={station.cy} r={station.r} 
            style={{

            }}
        />
    )
}


const StationCircle = styled('circle')(({theme}) => ({
    pointerEvents: "visible",
    stroke: 'none',
    fill: 'black'
}))
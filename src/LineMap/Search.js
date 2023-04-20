import {useMemo} from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import { useLineMapStore } from './store';


export default function Search({}) {
    const theme = useTheme()
    const [zoomTo, lineMap] = useLineMapStore((state) => [state.zoomTo, state.lineMap])
    
    const places = useMemo(() => {
        if (lineMap == null) return null
        const places = lineMap.stops.map((stop) => ({id: stop.id, label: stop.label, zoom: {x: stop.cx, y: stop.cy, z: 3}})).sort((a, b) => ('' + a.label).localeCompare(b.label))
        const lines = lineMap.lines.map((line) => ({id: line.id, label: line.line})).sort((a, b) => ('' + a.label).localeCompare(b.label))
        return [...places, ...lines]
    }, [lineMap])

    /* BTW: I found the value={null} bit in one of the lowest voted answers on
       https://stackoverflow.com/questions/59790956/material-ui-autocomplete-clear-value */
    return (
        <Autocomplete
            loading={places === null}
            style={{position: 'absolute', top: '1rem', right: '4rem'}}
            autoHighlight
            openOnFocus
            id="map-search"
            options={places}
            getOptionLabel={(option) => `${option.label}`}
            groupBy={(option) => option?.label?.charAt(0)}
            sx={{ width: 300 }}
            renderInput={(params) => <TextField {...params} style={{backgroundColor: 'white'}} label="Search for places or bus-lines" />}
            blurOnSelect
            clearOnBlur
            value={null}
            onChange={(evt, place) => {zoomTo(place.zoom)}}
        />
    )
}
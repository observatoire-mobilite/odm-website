import {useEffect, useState} from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';


export default function Search({}) {
    const [places, setPlaces] = useState(null)
    const theme = useTheme()
    
    useEffect(() => {
        setPlaces(null)
        fetch('data/publictransport/busmap.json')
        .then((r) => r.json())
        .then((dta) => {
            const places = dta.stops.map((stop) => ({id: stop.id, label: stop.label})).sort((a, b) => ('' + a.label).localeCompare(b.label))
            const lines = dta.lines.map((line) => ({id: line.id, label: line.line})).sort((a, b) => ('' + a.label).localeCompare(b.label))
            setPlaces([...places, ...lines])
        }).catch((e) => {
            console.log(e.message)
        });
    }, [])

    /*const places = useMemo(() => {
        const places = stops.map((stop) => ({id: stop.id, label: stop.label})).sort((a, b) => ('' + a.label).localeCompare(b.label))
        const lines = lines.map((line) => ({id: line.id, label: line.line})).sort((a, b) => ('' + a.label).localeCompare(b.label))
        return [...places, ...lines]
    }, [stops, lines])*/

    /* BTW: I found the value={null} bit in one of the lowest voted answers on
       https://stackoverflow.com/questions/59790956/material-ui-autocomplete-clear-value */
    return (
        <Autocomplete
            loading={places === null}
            style={{position: 'absolute', top: '5rem', right: '3rem'}}
            autoHighlight
            openOnFocus
            id="map-search"
            options={places}
            getOptionLabel={(option) => `${option.label}`}
            groupBy={(option) => option?.label?.charAt(0)}
            sx={{ width: 300 }}
            renderInput={(params) => <TextField {...params} style={{backgroundColor: 'white'}} label="Search" />}
            blurOnSelect
            clearOnBlur
            value={null}
            onChange={(evt, place) => {alert('image I just zoomed')}}
        />
    )
}
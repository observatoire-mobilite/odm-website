import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';


export default function YearToggle({from=2020, to=2023, currentYear=2023, onChange=(evt, val) => null, special=null}) {
    return (<ToggleButtonGroup exclusive value={currentYear} aria-label="year to explore" onChange={onChange}>
        {special && <ToggleButton value={special} aria-label={special}>{special}</ToggleButton>}
        {Array.from({length: to-from + 1}).map((_, i) => {
            return (<ToggleButton value={from + i} aria-label={from + i}>{from + i}</ToggleButton>)
        })}
     </ToggleButtonGroup>
    )
}


function YearSelect({years, selectedYear=undefined, selectionChanged=((y) => undefined)}) {
    if (selectedYear === undefined) { selectedYear = years[0] }
    
    return (
      <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
        <InputLabel id="select-year">Year</InputLabel>
        <Select labelId="select-year" id="select-year-small" value={selectedYear} label="Year" onChange={(evt) => selectionChanged(evt.target.value)} >
          { years.map((value, index) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
        </Select>
      </FormControl>
    )
  }
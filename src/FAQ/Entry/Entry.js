import {useContext} from 'react';
import FAQContext from '../Context'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


export default function FAQEntry({title, children, name='panel1'}) {
    const {expanded, handleChange} = useContext(FAQContext)
    return (
      <Accordion expanded={expanded === name} onChange={handleChange(name)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`${name}-content`} id={`${name}-header`}>
          <Typography variant="h6">
            <a id={`${name}-link`}>{title}</a>
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {children}
        </AccordionDetails>
      </Accordion>
    )
}

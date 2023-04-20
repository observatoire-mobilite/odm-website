import {useState, Fragment} from 'react';
import FAQContext from '../Context'


export default function FAQList({children}) {
  const [expanded, setExpanded] = useState('panel-1');

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const ctx = {expanded, setExpanded, handleChange}

  return (
    <Fragment>
        <FAQContext.Provider value={ctx}>
            {children}
        </FAQContext.Provider>
    </Fragment>
  )
}



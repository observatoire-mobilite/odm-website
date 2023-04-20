import {useState} from 'react';
import BusMapDialog from './BusMapDialog.js';
import LineMap from './LineMap'
import { ErrorBoundary } from "react-error-boundary";

import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'


function ErrorNotice({error, resetErrorBoundary}) {
    const [open, setOpen] = useState(true)
    const handleClose = (evt) => { setOpen(false); }
    return (<Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert severity="error" sx={{ width: '100%' }} onClose={handleClose}>
            {error.message}
        </Alert>
    </Snackbar>)
}


export default function BusMap() {

    return (
        <LineMap mapdata="data/publictransport/busmap.json">
            <ErrorBoundary FallbackComponent={ErrorNotice} onReset={(details) => {
                console.log(details)
            }}>
                <BusMapDialog />
            </ErrorBoundary>
        </LineMap>    
    )
}

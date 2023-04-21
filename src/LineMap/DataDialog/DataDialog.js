import { forwardRef, useCallback, useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import { useErrorBoundary } from 'react-error-boundary';
import { useLineMapStoreStats } from './LineMap/store'

import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';


const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="top" ref={ref} {...props} />;
});
  
// adjusts for the height of the AppBar (cf. https://mui.com/material-ui/react-app-bar/#fixed-placement)
const Offset = styled('div')(({ theme }) => theme.mixins.toolbar);

export default function DataDialog({stateLabel='Line', idField='id', labelField='label', prefix='Line', byLine=null, appBarColor='primary'}) {
    const [setCurrent, id, label] = useLineMapStoreCurrent(stateLabel, [idField, labelField])
    const handleClose = useCallback(() => (evt) => setCurrent(null))

    return (
        <Dialog
            fullScreen
            open={id !== null}
            onClose={handleClose}
            TransitionComponent={Transition}
        >
            <AppBar position="fixed" color={appBarColor}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={handleClose}
                        aria-label="fermer ce dialogue et retourner vers la carte du réseau"
                    >
                        <CloseIcon />
                    </IconButton>
                    <h1>{prefix ? `${prefix} ` : ''}{label ?? '(untitled)'}</h1>
                </Toolbar>
            </AppBar>
            <Offset />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                {children}
            </Container>
        </Dialog>
    );
}

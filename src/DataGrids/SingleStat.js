import {useContext, forwardRef, useCallback, useMemo, useState, useEffect, useRef, Fragment} from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import InfoIcon from '@mui/icons-material/Info';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import FancyNumber from './FancyNumber.js';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';


const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));



export default function SingleStat({title, subtitle=null, caption=null, value, avatar=<></>, unit=undefined, info=null, ymin=null, ymax=null, loading=false}) {
    const displayData = useMemo(() => {
      const suffix = (! unit  || ! value) ? null : `\u202F${unit}`
      if (ymin !== null && value !== null && value <= ymin)
        return {value: ymin, clip: '\u2264', suffix}
      
      if (ymax !== null && value !== null && value >= ymax)
        return {value: ymax, clip: '\u2265', suffix}
        
      return {value, clip: null, suffix}
    }, [value, ymin, ymax, unit])
    return (
        <Paper sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
        }}>
            <Grid container direction="row" justifyContent="space-around" alignItems="stretch" spacing={2}>
                <Grid item xs="auto">{avatar}</Grid>
                <Grid item xs>
                    <Typography variant="h6" color="primary">
                        {title}
                    </Typography>
                    {subtitle && <Typography variant="subtitle">
                        {subtitle}
                    </Typography>}
                    <Typography variant="h4">
                      {loading ? <p>Loading...</p> : (<Fragment>
                        {displayData.clip && <small>{displayData.clip}</small>}
                        <FancyNumber count={displayData.value} />
                        {displayData.suffix && <small>{displayData.suffix}</small>}
                        </Fragment>)}
                    </Typography>
                    {caption && <Typography variant="caption">
                        {caption}
                    </Typography>}
                    {info && <ScrollDialog title={title}>{info}</ScrollDialog>}
                </Grid>
            </Grid>        
        </Paper>
        
    )
}



function ScrollDialog({children, title, label='further explanations'}) {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const descriptionElementRef = useRef(null);

  useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [open]);

  return (
    <>
      <Button onClick={handleClickOpen}>{label}</Button>
      <Dialog
        open={open}
        onClose={handleClose}
        scroll="paper"
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="scroll-dialog-title">{title ?? 'More information...'}</DialogTitle>
        <DialogContent dividers>
          <DialogContentText
            id="scroll-dialog-description"
            ref={descriptionElementRef}
            tabIndex={-1}
          >
           {children}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
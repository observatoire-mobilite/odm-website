import {useContext, forwardRef, useCallback, useMemo, useState, useEffect, useRef} from 'react';
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



export default function SingleStat({title, subtitle=null, caption=null, value, avatar=<></>, unit=undefined}) {

    return (
        <Paper sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minWidth: '200px'
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
                        <FancyNumber count={value} /><small>{unit === undefined || value === undefined ? '' : `\u202F${unit}`}</small>
                    </Typography>
                    {caption && <Typography variant="caption">
                        {caption}
                    </Typography>}
                    <ScrollDialog title={title}>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quam vulputate dignissim suspendisse in est ante in nibh mauris. Dui faucibus in ornare quam viverra orci. Aliquet nibh praesent tristique magna. Volutpat consequat mauris nunc congue nisi vitae suscipit tellus mauris. Porttitor lacus luctus accumsan tortor posuere ac. Nisl purus in mollis nunc sed. Lorem ipsum dolor sit amet consectetur. Dictum varius duis at consectetur lorem. Sit amet commodo nulla facilisi nullam vehicula ipsum. Dictum at tempor commodo ullamcorper a. Nibh sed pulvinar proin gravida. In mollis nunc sed id semper. Fames ac turpis egestas maecenas. Sem viverra aliquet eget sit amet tellus cras adipiscing. Nisl tincidunt eget nullam non nisi est. Egestas congue quisque egestas diam in arcu cursus euismod quis. Arcu cursus vitae congue mauris rhoncus aenean vel. Ut eu sem integer vitae justo eget magna fermentum. Praesent elementum facilisis leo vel fringilla est ullamcorper.</p>
                    </ScrollDialog>
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
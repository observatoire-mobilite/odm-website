import React, {Fragment} from 'react';
import { Outlet, useSearchParams } from "react-router-dom";
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import NotificationsIcon from '@mui/icons-material/Notifications';
import {MainMenu} from './Menu.js';
import { ErrorBoundary } from "react-error-boundary";
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import FAQList from './FAQ/List'
import FAQEntry from './FAQ/Entry'

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://mmtp.gouvernement.lu/">
        Ministère de la Mobilité et des Travaux publics
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    '& .MuiDrawer-paper': {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      boxSizing: 'border-box',
      ...(!open && {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
          width: theme.spacing(9),
        },
      }),
    },
  }),
);

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null;
}

const themeVars = {
  palette: {
    mode: 'light',
    primary: {
      main: '#206f89',
    },
    secondary: {
      main: '#ffbb1c',
    },
  },
}
themeVars.palette.primary.main_rgb = hexToRgb(themeVars.palette.primary.main)
themeVars.palette.secondary.main_rgb = hexToRgb(themeVars.palette.secondary.main)
const theme = createTheme(themeVars);

export default function Layout() {
  const [open, setOpen] = React.useState(false);
  const toggleDrawer = () => {
    setOpen(!open);
  };
  const [searchParams, setSearchParams] = useSearchParams();
  const embed = searchParams.get("embed")


  if (embed) {
    return (
    <ThemeProvider theme={theme}>
      <Box 
        component="main"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[100]
              : theme.palette.grey[900],
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
        }}
      >
        <Container maxWidth="100vw">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
          <Copyright sx={{ pt: 4 }} />
        </Container>
      </Box>
    </ThemeProvider>
    )
  }
  
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex' }}>
        <AppBar position="absolute" open={open}>
          <Toolbar sx={{ pr: '24px' /* keep right padding when drawer closed */ }} >
            <IconButton 
              edge="start" color="inherit" aria-label="open drawer" onClick={toggleDrawer} 
              sx={{ marginRight: '36px',  ...(open && { display: 'none' }), }}
            >
              <MenuIcon />
            </IconButton>
            <Typography component="h1" variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>
              Observatoire digital de la mobilité
            </Typography>
          </Toolbar>
        </AppBar>

        <Drawer variant="permanent" open={open}>
          <Toolbar
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              px: [1],
            }}
          >
            <IconButton onClick={toggleDrawer}>
              <ChevronLeftIcon />
            </IconButton>
          </Toolbar>
          <Divider />
          <MainMenu />
        </Drawer>

        <Box 
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto',
          }}
        >
          <Toolbar />
          <Container maxWidth="100vw">
            <ErrorBoundary fallbackComponent={ErrorNotice}>
              <Outlet />
            </ErrorBoundary>
            <Copyright sx={{ pt: 4 }} />
          </Container>
        </Box>

      </Box>
    </ThemeProvider>
  );
}


function ErrorNotice({error}) {
  return (<Fragment>
    <Alert severity="error" sx={{ width: '100%', mt: 2, mb: 4 }}>
      <AlertTitle>Something went wrong</AlertTitle>
        {error.message}
    </Alert>
    <Container maxWidth="md">
      <Paper>
          <FAQList>
              <FAQEntry title="What just happened??" name="panel-1">
                  <Typography>If you see this dialog, it means that the ODM dashboard you have been trying to use crashed</Typography>
              </FAQEntry>
          </FAQList>
      </Paper>
    </Container>
  </Fragment>
  )
}
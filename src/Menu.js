import {useState} from 'react';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

import DashboardIcon from '@mui/icons-material/Dashboard';
import FollowTheSignsIcon from '@mui/icons-material/FollowTheSigns';
import CarRentalIcon from '@mui/icons-material/CarRental';
import DepartureBoardIcon from '@mui/icons-material/DepartureBoard';

import IconPedestrian from './ODMIcons/IconPedestrian.js';
import IconCar from './ODMIcons/IconCar.js';
import IconTruck from './ODMIcons/IconTruck.js';
import IconBicycle from './ODMIcons/IconBicycle.js';
import IconBus from './ODMIcons/IconBus.js';
import IconTramway from './ODMIcons/IconTramway.js';
import EvStationIcon from '@mui/icons-material/EvStation';
import IconTrain from './ODMIcons/IconTrain.js';

import { NavLink, useLocation } from "react-router-dom";


function NavItem({to, title, icon, ...props}) {
    return (
      <ListItemButton component={NavLink} to={to} selected={useLocation().pathname === to} >
        <ListItemAvatar>
            <Avatar>
              {icon}
            </Avatar>
        </ListItemAvatar>
        <ListItemText primary={title} />
      </ListItemButton>  
    )
}


export function MainMenu() {
  const [selected, setSelected] = useState(1)

  return (
    <List component="nav">
      <NavItem to="/" title="Home" icon={<DashboardIcon />} />
      <NavItem to="/demand" title="Mobility Demand" icon={<IconPedestrian height="66%" />} />
      <NavItem to="/cartraffic" title="Car Traffic" icon={<IconCar height="66%" />} />
      <NavItem to="/trucktraffic" title="Truck Traffic" icon={<IconTruck height="66%" />} />
      <NavItem to="/cycling" title="Cycling and walking" icon={<IconBicycle height="50%" />} />
      <NavItem to="/busmap" title="Bus Map" icon={<IconBus height="66%" />} />
      <NavItem to="/tram" title="Tramway" icon={<IconTramway height="80%" />} />
      <NavItem to="/charging" title="EV Chargers" icon={<EvStationIcon />} />
      <NavItem to="/railway" title="Railways" icon={<IconTrain height="80%" />} />
      <NavItem to="/charging" title="EV Chargers" icon={<EvStationIcon />} />
      <NavItem to="/fleet" title="Vehilce Fleet" icon={<CarRentalIcon />} />
      <Divider sx={{ my: 1 }} />
    </List>
  )
}

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
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CarRentalIcon from '@mui/icons-material/CarRental';
import DepartureBoardIcon from '@mui/icons-material/DepartureBoard';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';

import { NavLink, useLocation } from "react-router-dom";


function NavItem({to, title, icon, ...props}) {
  console.log(useLocation())
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
      <NavItem to="/demand" title="Mobility Demand" icon={<FollowTheSignsIcon />} />
      <NavItem to="/cartraffic" title="Car Traffic" icon={<DirectionsCarIcon />} />
      <NavItem to="/trucktraffic" title="Truck Traffic" icon={<LocalShippingIcon />} />
      <NavItem to="/cycling" title="Cycling and walking" icon={<DirectionsBikeIcon />} />
      <NavItem to="/publictransport" title="Public Transport" icon={<DepartureBoardIcon />} />
      <NavItem to="/fleet" title="Vehilce Fleet" icon={<CarRentalIcon />} />
      <Divider sx={{ my: 1 }} />
    </List>
  )
}

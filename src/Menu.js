import * as React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';

import DashboardIcon from '@mui/icons-material/Dashboard';
import FollowTheSignsIcon from '@mui/icons-material/FollowTheSigns';
import TrafficIcon from '@mui/icons-material/Traffic';
import CarRentalIcon from '@mui/icons-material/CarRental';
import DepartureBoardIcon from '@mui/icons-material/DepartureBoard';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';

import { NavLink } from "react-router-dom";


export default function NavItem(props) {

    return (
        <ListItemButton component={NavLink} to={props.to}>
        <ListItemAvatar>
            <Avatar>
              {props.icon}
            </Avatar>
        </ListItemAvatar>
        <ListItemText primary={props.title} />
      </ListItemButton>  
    )
}

export const mainListItems = (
  <React.Fragment>
    <NavItem to="/" title="Home" icon={<DashboardIcon />} />
    <NavItem to="/demand" title="Mobility Demand" icon={<FollowTheSignsIcon />} />
    <NavItem to="/roadtraffic" title="Road Traffic" icon={<TrafficIcon />} />
    <NavItem to="/publictransport" title="Public Transport" icon={<DepartureBoardIcon />} />
    <NavItem to="/cycling" title="Cycling and walking" icon={<DirectionsBikeIcon />} />
    <NavItem to="/fleet" title="Vehilce Fleet" icon={<CarRentalIcon />} />
  </React.Fragment>
);

import React from "react";
import { makeStyles } from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import PermIdentityIcon from '@material-ui/icons/PermIdentity';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { userService } from '../../auth/services';
import SettingsOutlinedIcon from '@material-ui/icons/SettingsOutlined';
import { FlexSpaceBetween } from '../../core/design';

import './styles.css';

const useStyles = makeStyles({
    list: {
      width: 300,
      "@media (max-width: 800px)": {
        width: 300,
      }
    },
});

export default function Navbar({ handleShowSidebar }) {
    const classes = useStyles();
    const [openDrawer, setOpenDrawer] = React.useState(false);
    
    function toggleDrawer() {
        setOpenDrawer(!openDrawer);
    }

    const handleLogout = () => {
        userService.logout();
        window.location.reload();
    };

    return(
        <>
            <Drawer className="drawer" anchor="right" open={openDrawer} onClose={toggleDrawer}>
                <div className={classes.list}>
                    <List className="list" component="nav" aria-label="main mailbox folders">
                        <ListItem component="a" href="/configs">
                            <ListItemIcon>
                                <SettingsOutlinedIcon />
                            </ListItemIcon>
                            <ListItemText primary="Configurações" />
                        </ListItem>
                        <ListItem button onClick={handleLogout}>
                            <ListItemIcon>
                                <ExitToAppIcon />
                            </ListItemIcon>
                            <ListItemText primary="Sair" />
                        </ListItem>
                    </List>
                </div>
            </Drawer>
            
            <div className="header-nav">
                <div className="nav">
                    <FlexSpaceBetween className="flex-navbar">
                        <div className="left-nav">
                            <div className="collapse-sidebar">
                                <button className="btnCollapseSidebar" onClick={handleShowSidebar}>
                                    <MenuIcon className="icon" />
                                </button>
                            </div>
                        </div>
                        <div className="user-menu">
                            <div className="user-button" onClick={toggleDrawer}>
                                <PermIdentityIcon className="icon" />
                            </div>
                        </div>
                    </FlexSpaceBetween>
                </div>
            </div>
        </>
    );
}
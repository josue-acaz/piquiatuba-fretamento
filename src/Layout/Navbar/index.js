import React from "react";
import MenuIcon from '@material-ui/icons/Menu';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import PermIdentityIcon from '@material-ui/icons/PermIdentity';
import { userService } from '../../auth/services';
import { Dropdown } from "../../components";

import './styles.css';

export default function Navbar({ handleShowSidebar }) {

    const handleLogout = () => {
        userService.logout();
        window.location.reload();
    };

    const options = [
        {
            id: 1,
            label: "Sair",
            onClick: handleLogout,
            icon: ExitToAppIcon
        }
    ];

    return(
        <div className="header-nav">
            <div className="nav">
                <div className="user-menu">
                    <Dropdown options={options} Icon={PermIdentityIcon} />
                </div>
                <div className="collapse-sidebar">
                    <button className="btnCollapseSidebar" onClick={handleShowSidebar}>
                        <MenuIcon className="icon" />
                    </button>
                </div>
            </div>
        </div>
    );
}
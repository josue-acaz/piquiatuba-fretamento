import React, { useState } from "react";
import MonetizationOnOutlinedIcon from '@material-ui/icons/MonetizationOnOutlined';
import FindInPageOutlinedIcon from '@material-ui/icons/FindInPageOutlined';
import DashboardIcon from '@material-ui/icons/Dashboard';
import LocalHospitalOutlinedIcon from '@material-ui/icons/LocalHospitalOutlined';
import ViewListIcon from '@material-ui/icons/ViewList';
import AirplanemodeActiveIcon from '@material-ui/icons/AirplanemodeActive';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import ExploreIcon from '@material-ui/icons/Explore';

import Sidebar from "./Sidebar";
import Content from "./Content";
import Navbar from "./Navbar";

import './styles.css';

export default function Layout({ children }) {
    const[open, setOpen] = useState(true);
    const handleOpen = () => { setOpen(!open) };
    const options = [
        {
            id: 1,
            label: "Dashboard",
            Icon: DashboardIcon,
            to: "/dashboard",
        },
        {
            id: 2,
            label: "Cadastros",
            Icon: ViewListIcon,
            options: [
                {
                    id: 1,
                    label: "Aeronaves",
                    Icon: AirplanemodeActiveIcon,
                    to: "/aircrafts"
                },
                {
                    id: 2,
                    label: "Bases",
                    Icon: ExploreIcon,
                    to: "/bases",
                }
            ],
        },
        {
            id: 3,
            label: "Cotações",
            Icon: MonetizationOnOutlinedIcon,
            options: [
                {
                    id: 1,
                    label: "Cotações",
                    Icon: FindInPageOutlinedIcon,
                    to: "/quotations"
                },
                {
                    id: 2,
                    label: "Gerar Cotação",
                    Icon: AddCircleOutlineIcon,
                    to: "/quotations/generate"
                },
                {
                    id: 3,
                    label: "Informações Médicas",
                    Icon: LocalHospitalOutlinedIcon,
                    to: "/quotations/medical",
                },
            ],
        },
    ];

    const[showSidebar, setShowSidebar] = useState(false);
    const handleShowSidebar = () => { setShowSidebar(!showSidebar) };

    return(
        <div className="layout">
            <Sidebar 
                open={open}
                show={showSidebar}
                className={open ? "" : "minimizedSidebar"}
                handleOpen={handleOpen}
                handleShow={handleShowSidebar}
                options={options} 
            />
            <Navbar handleShowSidebar={handleShowSidebar} />
            <Content className={open ? "" : "maximizedMain"}>
                {children}
            </Content>
        </div>
    );
}

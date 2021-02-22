import React, { useState } from "react";
import FindInPageOutlinedIcon from '@material-ui/icons/FindInPageOutlined';
import DashboardIcon from '@material-ui/icons/Dashboard';
import LocalHospitalOutlinedIcon from '@material-ui/icons/LocalHospitalOutlined';
import ViewListIcon from '@material-ui/icons/ViewList';
import AirplanemodeActiveIcon from '@material-ui/icons/AirplanemodeActive';
import ExploreIcon from '@material-ui/icons/Explore';
import BusinessCenterIcon from '@material-ui/icons/BusinessCenter';
import InsertChartOutlinedIcon from '@material-ui/icons/InsertChartOutlined';
import TimelineOutlinedIcon from '@material-ui/icons/TimelineOutlined';

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
                },
            ],
        },
        {
            id: 3,
            label: "Comercial",
            Icon: BusinessCenterIcon,
            options: [
                {
                    id: 1,
                    label: "Cotações",
                    Icon: FindInPageOutlinedIcon,
                    to: "/quotations"
                },
                {
                    id: 3,
                    label: "Formulários médicos",
                    Icon: LocalHospitalOutlinedIcon,
                    to: "/medical-forms",
                },
            ],
        },
        {
            id: 4,
            label: 'Monitoramento',
            Icon: InsertChartOutlinedIcon,
            options: [
                {
                    id: 1,
                    label: "Programação",
                    Icon: TimelineOutlinedIcon,
                    to: "/coordination/programming"
                },
            ]
        }
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

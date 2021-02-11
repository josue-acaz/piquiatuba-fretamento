import React from "react";
import { Link } from "react-router-dom";
import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';

import './styles.css';

function ActionItem({children, options={to: '', expansive: false}}) {

    return options.expansive ? (
        <div className="a-menu">{children}</div>
    ) : (
        <Link className="a-menu" to={options.to}>{children}</Link>
    );
}

function SubmenuItem({to='', label, Icon, active=false, toggleSidebar}) {
    return (
        <Link className="a-submenu" to={to} onClick={toggleSidebar}>
            <div className={`submenu-item ${active ? 'submenu-item-active' : ''}`}>
                <div className="col-item">
                    <div className="to-center">
                        <Icon className={`icon-submenu ${active ? 'active' : ''}`} />
                    </div>
                </div>
                <div className="col-item">
                    <div className="to-center">
                        <p className={`label ${active ? 'active' : ''}`}>{label}</p>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function MenuItem({ 
    style={}, 
    label='', 
    to='', 
    Icon, 
    toggleSidebar,
    expansive_options=[],
    active=false, 
    minimize=false, 
    expansive=false,
    open=false,
    toggleOpen,
}) {
    return(
        <ActionItem options={{expansive, to}}>
            <div onClick={expansive ? toggleOpen : toggleSidebar} style={style} className={`menu-item ${active ? 'menu-item-active' : ''}`}>
                <div className={`left ${minimize ? 'justify-center' : ''}`}>
                    <div className="col-item">
                        <div className="to-center">
                            <Icon className={`icon ${active ? 'active' : ''}`} />
                        </div>
                    </div>
                    <div style={minimize ? {display: 'none'} : {}} className="col-item">
                        <div className="to-center">
                            <p className={`label ${active ? 'active' : ''}`}>{label}</p>
                        </div>
                    </div>
                </div>
                {expansive && (
                    !minimize && (
                        <div className="right">
                            <IconButton size="small" onClick={toggleOpen}>
                                {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                            </IconButton>
                        </div>
                    )
                )}
            </div>
            {expansive && (
                open && (
                    <div className={`submenus ${minimize ? 'minimized-submenus' : ''}`}>
                        {expansive_options.map(option => (
                            <SubmenuItem 
                                to={option.to} 
                                label={option.label} 
                                Icon={option.Icon}
                                toggleSidebar={toggleSidebar} 
                            />
                        ))}
                    </div>
                )
            )}
        </ActionItem>
    );
}
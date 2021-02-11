import React, { useState } from "react";
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import OutsideClickHandler from "react-outside-click-handler";
import FilterListIcon from '@material-ui/icons/FilterList';
import { Select, MenuItem } from "@material-ui/core";
import Switch from '@material-ui/core/Switch';
import { Inline } from "../../components";
import { event } from "../../utils";

import './styles.css';

export default function Filter({ handleFilters, filters }) {
    const [open, setOpen] = useState(false);
    const [disableOutside, setDisableOutside] = useState(false);
    function handleOpen() {
      if(!disableOutside) {
        setOpen(!open);
      }
    };
    const handleOpenSelect = () => {
      setDisableOutside(true);
    };
    const handleCloseSelect = () => {
      setDisableOutside(false);
    };
    const handleClosedOnly = (e) => {
      const { checked } = e.target;
      handleFilters(event("closedOnly", checked));
    };

    return(
        <div className="filter-container">
            <Tooltip title="Lista de Filtros" onClick={handleOpen}>
              <IconButton aria-label="filter list">
                <FilterListIcon className="icon" />
              </IconButton>
            </Tooltip>
            {open && (
                <OutsideClickHandler onOutsideClick={handleOpen}>
                    <div className="filter-dialog">
                        <div className="dialog">
                          <div className="col-dialog">
                            <p className="label">Ordenar por</p>
                            <Select 
                              id="orderBy" 
                              name="orderBy" 
                              onOpen={handleOpenSelect}
                              onClose={handleCloseSelect}
                              className="select" 
                              displayEmpty={true} 
                              value={filters.orderBy}
                              disableUnderline={true}
                              onChange={handleFilters}
                            >
                              <MenuItem value={"createdAt"}>Data de criação</MenuItem>
                              <MenuItem value={"client_name"}>Nome do cliente</MenuItem>
                              <MenuItem value={"code"}>Código</MenuItem>
                            </Select>
                          </div>
                          <div className="col-dialog">
                            <p className="label">Ordem</p>
                            <Select 
                              id="order" 
                              name="order" 
                              onOpen={handleOpenSelect}
                              onClose={handleCloseSelect}
                              className="select" 
                              displayEmpty={true} 
                              value={filters.order}
                              disableUnderline={true}
                              onChange={handleFilters}
                            >
                              <MenuItem value={"desc"}>Decrescente</MenuItem>
                              <MenuItem value={"asc"}>Crescente</MenuItem>
                            </Select>
                          </div>
                        </div>
                        <div className="dialog">
                          <div className="col-dialog">
                            <p className="label">Filtrar por</p>
                            <Select 
                              id="filterBy" 
                              name="filterBy"
                              onOpen={handleOpenSelect}
                              onClose={handleCloseSelect} 
                              className="select" 
                              displayEmpty={true} 
                              value={filters.filterBy}
                              disableUnderline={true}
                              onChange={handleFilters}
                            >
                              <MenuItem value={"all"}>Tudo</MenuItem>
                              <MenuItem value={"code"}>Código</MenuItem>
                              <MenuItem value={"client_name"}>Nome do cliente</MenuItem>
                              <MenuItem value={"pdf_url"}>Nome da cotação</MenuItem>
                            </Select>
                          </div>
                        </div>
                        <div className="dialog">
                          <div className="col-dialog">
                            <Inline components={[
                              {
                                id: 1,
                                component: (<p className="closedQuotationsAwnser">Somente Fechadas? <strong>{filters.closedOnly ? "SIM" : "NÃO"}</strong></p>)
                              },
                              {
                                id: 2,
                                component: (
                                  <Switch 
                                    name="closedOnly"
                                    checked={filters.closedOnly}
                                    onChange={handleClosedOnly}
                                    color="primary"
                                  />
                                )
                              }
                            ]} />
                          </div>
                        </div>
                    </div>
                </OutsideClickHandler>
              )}
        </div>
    );
}
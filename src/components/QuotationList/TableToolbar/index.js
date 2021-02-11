import React from "react";
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { lighten, makeStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/Delete';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import DoneOutlineIcon from '@material-ui/icons/DoneOutline';
import ClearAllIcon from '@material-ui/icons/ClearAll';
import PersonIcon from '@material-ui/icons/Person';
import SwapHorizIcon from '@material-ui/icons/SwapHoriz';
import { Filter, Search } from "../../../components";
import { event } from "../../../utils";

const useToolbarStyles = makeStyles((theme) => ({
    root: {
      paddingLeft: 0,
      paddingRight: 0,
    },
    highlight:
      theme.palette.type === 'light'
        ? {
            color: theme.palette.secondary.main,
            backgroundColor: lighten(theme.palette.secondary.light, 0.85),
          }
        : {
            color: theme.palette.text.primary,
            backgroundColor: theme.palette.secondary.dark,
          },
    title: {
      flex: '1 1 100%',
    },
  }));
  
export default function TableToolbar({ numSelected, toggleSelect, handleFilters, handleDeleteQuotation, handleChangePage, handleCloseQuotation, filters }) {
    const classes = useToolbarStyles();

    function handleChangeQuotes() {
      handleFilters(event("all", false));
      handleChangePage(null, 0);
    }

    function handleSearch(text) {
      handleFilters(event("text", text));
    }
  
    return (
      <Toolbar
        className={clsx(classes.root, {
          [classes.highlight]: numSelected > 0,
        })}
      >
        {numSelected > 0 ? (
          <Typography style={styles.paddingToolbar} className={classes.title} color="inherit" variant="subtitle1" component="div">
            <p>{numSelected} selecionado(s)</p>
          </Typography>
        ) : (
          <Typography className={classes.title} variant="h6" id="tableTitle" component="div">
            <Search handleChangeText={handleSearch} placeholder="Pesquise uma cotação..." />
          </Typography>
        )}
  
        
        {numSelected > 0 ? (
          <>
            <Tooltip title="Deletar">
              <IconButton onClick={handleDeleteQuotation} aria-label="delete">
                <DeleteIcon className="icon" />
              </IconButton>
            </Tooltip>
            <Tooltip onClick={() => { handleCloseQuotation(true) }} title="Marcar como fechado">
              <IconButton aria-label="closed">
                <DoneOutlineIcon className="icon" />
              </IconButton>
            </Tooltip>
            <Tooltip onClick={() => { handleCloseQuotation(false) }} title="Marcar como não fechado">
              <IconButton aria-label="closed">
                <HighlightOffIcon style={{fontSize: '26px'}} className="icon" />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <>
            <Tooltip title="Alternar entre selecionar ou expandir" onClick={toggleSelect}>
              <IconButton aria-label="all">
                <SwapHorizIcon className="icon" />
              </IconButton>
            </Tooltip>
            {filters.all ? (
              <Tooltip title="Apenas meus orçamentos" onClick={handleChangeQuotes}>
                <IconButton aria-label="all">
                  <PersonIcon className="icon" />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Mostrar todos" onClick={() => { handleFilters(event("all", true)) }}>
                <IconButton aria-label="all">
                  <ClearAllIcon className="icon" />
                </IconButton>
              </Tooltip>
            )}
            <Filter 
              handleFilters={handleFilters} 
              filters={filters} 
            />
          </>
        )}
      </Toolbar>
    );
}

const styles = {
  paddingToolbar: {paddingLeft: '1rem', paddingRight: '0rem'}
}
  
TableToolbar.propTypes = {
    numSelected: PropTypes.number.isRequired,
};
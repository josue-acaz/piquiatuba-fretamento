import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/Delete';
import FilterListIcon from '@material-ui/icons/FilterList';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import SwapHorizIcon from '@material-ui/icons/SwapHoriz';
import clsx from 'clsx';
import { lighten, makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Search from '../../Search';

import './styles.css';

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
  
const TableTaskToolbar = ({numSelected, withSwap, onSearch, toggleSwap, handleRemoveSelecteds, toolbar_search_placeholder, handleOpenFilterList}) => {
    const classes = useToolbarStyles();

    return (
      <Toolbar
        className={clsx(classes.root, {
          [classes.highlight]: numSelected > 0,
        })}
      >
        {numSelected > 0 ? (
          <Typography className={classes.title} style={{paddingLeft: '1rem'}} color="inherit" variant="subtitle1" component="div">
            {numSelected} {numSelected === 1 ? 'selecionado' : 'selecionados'}
          </Typography>
        ) : (
          <Typography className={classes.title} variant="h6" id="tableTitle" component="div">
            <Search handleChangeText={onSearch} placeholder={toolbar_search_placeholder} />
          </Typography>
        )}
  
        {numSelected > 0 ? (
          <Tooltip title="Delete" onClick={handleRemoveSelecteds}>
            <IconButton aria-label="delete">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <>
            {withSwap && (
              <Tooltip title="Alternar entre selecionar ou expandir" onClick={toggleSwap}>
                  <IconButton aria-label="all">
                    <SwapHorizIcon className="icon" />
                  </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Filter list" onClick={handleOpenFilterList}>
              <IconButton aria-label="filter list">
                <FilterListIcon />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Toolbar>
    );
};

export default TableTaskToolbar;

TableTaskToolbar.propTypes = {
    numSelected: PropTypes.number.isRequired,
};
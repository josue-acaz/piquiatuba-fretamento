import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableContainer from '@material-ui/core/TableContainer';
import TablePagination from '@material-ui/core/TablePagination';
import Skeleton from 'react-loading-skeleton';

// Table Components
import TableTaskToolbar from './Toolbar';
import TableTaskHead from './Head';
import TableTaskRow from './Row';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  table: {
    minWidth: 750,
  },
}));

export default function TableTask({
  headCells, 
  rows, 
  loading, 
  count, 
  page, 
  limit, 
  onSearch,
  onChangePage, 
  onChangeRowsPerPage, 
  handleRemoveSelecteds,
  toolbar_search_placeholder,
  handleOpenFilterList,
  expansion = false,
}) {
  const classes = useStyles();
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('calories');
  const [selected, setSelected] = React.useState([]);
  const [swap, setSwap] = React.useState(false); // Usado para alternar entre o modo de seleção ou expansão
  const toggleSwap = () => setSwap(!swap);

  const rowsPerPage = limit;
  // Usado para monitorar quando algum registro é excluído, e retirar a seleção
  React.useEffect(() => {
    setSelected([]);
  }, [rows]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    onChangePage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const value = parseInt(event.target.value, 10);
    onChangeRowsPerPage(value);
    onChangePage(0);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  return (
    <div className="table-task">
      <div className={classes.root}>
        <TableTaskToolbar 
          numSelected={selected.length} 
          onSearch={onSearch} 
          swap={swap} 
          toggleSwap={toggleSwap}
          toolbar_search_placeholder={toolbar_search_placeholder} 
          withSwap={expansion}
          handleRemoveSelecteds={() => handleRemoveSelecteds(selected)}
          handleOpenFilterList={handleOpenFilterList}
        />
          {!loading && (
            <TableContainer>
              <Table
                  className={classes.table}
                  aria-labelledby="tableTitle"
                  size="medium"
                  aria-label="enhanced table"
              >
                  <TableTaskHead
                    classes={classes}
                    headCells={headCells}
                    numSelected={selected.length}
                    order={order}
                    orderBy={orderBy}
                    onSelectAllClick={handleSelectAllClick}
                    onRequestSort={handleRequestSort}
                    rowCount={rows.length}
                    withSwap={expansion}
                    swap={swap}
                  />
                  <TableBody>
                  {rows.map((row, index) => {
                          const isItemSelected = isSelected(row.id);
                          const labelId = `enhanced-table-checkbox-${index}`;

                          return(
                            <TableTaskRow 
                              key={row.id}
                              row={row}
                              swap={swap}
                              labelId={labelId}
                              expansion={expansion}
                              isItemSelected={isItemSelected} 
                              handleClick={handleClick}
                            />
                          );
                      })}
                  </TableBody>
              </Table>
          </TableContainer>
          )}

          {loading && (
            <div className="table-task-skeleton">
              <Skeleton height={52} count={rowsPerPage} />
            </div>
          )}

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={count}
            rowsPerPage={rowsPerPage}
            page={page}
            labelRowsPerPage="Registros por página"
            labelDisplayedRows={({ from, to }) => (`${from}-${to} de ${count !== -1 ? count : `${to}`}`)}
            onChangePage={handleChangePage}
            onChangeRowsPerPage={handleChangeRowsPerPage}
          />
      </div>
    </div>
  );
}

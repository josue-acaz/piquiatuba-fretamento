import React, { useState, Fragment } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { useSelector } from 'react-redux';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Skeleton from 'react-loading-skeleton';
import GetAppIcon from '@material-ui/icons/GetApp';
import Collapse from '@material-ui/core/Collapse';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';
import FormDialog from '../FormDialog';
import { Share, EnhancedTableHead, ClosedItem, Details } from "../../components";
import { event, Download, formatDatetime, getFilename, shareOnWhatsapp, getTransportType, capitalize } from "../../utils";
import TableToolbar from "./TableToolbar";
import api from '../../api';

import './styles.css';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  table: {
    minWidth: 750,
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
}));

const rowStyles = {
  paddingCell: {
    padding: 0,
    border: 'none'
  }
};

function Row(props) {
  const admin = useSelector(state => state.authentication.user.company);
  const { row, isItemSelected, labelId, handleClick, history, select=false } = props;
  const[expand, setExpand] = useState(false);
  const handleExpand = () => { setExpand(!expand) };

  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleSetAnchorEl = (event) => {
      setAnchorEl(event.currentTarget);
  };

  const handleUnsetAnchorEl = () => {
      setAnchorEl(null);
  };

  const [open, setOpen] = useState({
    dialog: false,
  });

  function handleOpen(key) {
    setOpen(open => ({ ...open, [key]: true }));
  }

  function handleClose(key) {
    setOpen(open => ({ ...open, [key]: false }));
  }

  const [processing, setProcessing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [receiver, setReceiver] = useState(row.client_name);
  const [patientInformation, setPatientInformation] = useState(null);

  //shareOnWhatsapp(`cotações/${row.id}/medical-informations/0/passenger`);

  async function handleRequestForm() {
    setSubmitted(true);

    // Se o receptor não for informado, anular
    if(!receiver) {
        return;
    }

    // Formulário vazio anexado à uma cotação
    setProcessing(true);
    try {
        const response = await api.post('/new-medical-form', {
            receiver: capitalize(receiver.trim(), true),
            admin_id: admin.id,
            internal_quotation_id: row.id,
        });
        setPatientInformation(response.data);
        setProcessing(false);
    } catch (error) {
        console.error(error);
        setProcessing(false);
    }
  }

  function handleSend() {
    shareOnWhatsapp(`cotações/${row.id}/medical-informations/${patientInformation.id}/passenger`);
    handleClose();
    setReceiver(null);
    setSubmitted(false);
    setPatientInformation(null);
  }

  async function handleExit() {
    handleClose('dialog');

    // Se for cancelado e formulário tiver sido criado, excluir
    if(submitted && patientInformation) {
        await api.delete(`/patient-information/${patientInformation.id}/delete`);
    }

    // Resetar o form dialog para o estado inicial
    setReceiver(row.client_name);
    setSubmitted(false);
    setPatientInformation(null);
  }

  return(
    <Fragment>
      <FormDialog 
        open={open.dialog} 
        processing={processing}
        submitted={submitted && patientInformation}
        title="Solicitar formulário médico"
        msg="Por favor, informe abaixo quem irá receber este formulário."
        handleClickOpen={handleOpen} 
        handleClose={handleExit} 
        handleSubmit={handleRequestForm}
        handleSend={handleSend}
    >
        {submitted && patientInformation ? (
            <p>O código de controle é <strong>#{patientInformation.code}</strong></p>
        ) : (
            !processing && (
                <>
                  <TextField
                      autoFocus
                      margin="dense"
                      id="name"
                      label="Nome do receptor"
                      value={receiver}
                      onChange={(e) => setReceiver(e.target.value)}
                      error={submitted && !receiver}
                      textE
                      type="text"
                      fullWidth
                      placeholder="Informe o nome do receptor"
                      helperText={(submitted && !receiver) && 'Este campo não pode ser vazio.'}
                  />
                  {row.patient_informations.length > 0 && (
                    <p className="obs-new-form">Obs.: Já existe um formulário anexado à está cotação. Ao criar um novo, o atual será apagado.</p>
                  )}
                </>
            )
        )}
    </FormDialog>
      <TableRow
        hover
        role="checkbox"
        aria-checked={isItemSelected}
        tabIndex={-1}
        key={row.id}
        selected={isItemSelected}
      >
        <TableCell padding="checkbox">
          {select ? (
            <Checkbox
              checked={isItemSelected}
              onClick={(event) => handleClick(event, row.id)}
              inputProps={{ 'aria-labelledby': labelId }}
            />
          ) : (
            <IconButton aria-label="expand row" size="small" onClick={handleExpand}>
              {expand ? <KeyboardArrowUpIcon className="icon expand" /> : <KeyboardArrowDownIcon className="icon expand" />}
            </IconButton>
          )}
        </TableCell>
        <TableCell component="th" id={labelId} scope="row" padding="none">
          <p>{"#"+row.code}</p>
        </TableCell>
        <TableCell>
          <p>{row.client_name}</p>
        </TableCell>
        <TableCell align="right">
          <ClosedItem 
            closed={false} 
            undetermined={true}
            quotation={row} 
          />
        </TableCell>
        <TableCell align="right"><p>{getTransportType(row.type_of_transport)}</p></TableCell>
        <TableCell align="right"><p>{getFilename(row)}</p></TableCell>
        <TableCell align="right"><p>{formatDatetime(row.createdAt)}</p></TableCell>
        <TableCell align="right">
          <div className="actions">
              {row.type_of_transport === 'aeromedical' && (
                <>
                  <Tooltip title="Solicitar formulário médico" onClick={handleSetAnchorEl}>
                    <div className="attach-medical-information">
                      <AssignmentIndIcon className="icon" />
                    </div>
                  </Tooltip>
                  <Menu
                    id="simple-menu"
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleUnsetAnchorEl}
                  >
                    <MenuItem onClick={() => handleOpen('dialog')}>Criar novo formulário</MenuItem>
                    <MenuItem onClick={() => {}}>Anexar existente</MenuItem>
                  </Menu>
                </>
              )}
              <Tooltip title="Compartilhar">
                <Share 
                  quotation={row} 
                  history={history} 
                /> 
              </Tooltip>
              <Tooltip title="Baixar esta cotação">
                <div 
                  className="down"
                  onClick={() => { Download(row) }}
                >
                  <GetAppIcon className="icon" />
                </div>
              </Tooltip>
          </div>
        </TableCell>
      </TableRow>
      <TableRow style={{padding: 0}}>
        <TableCell style={rowStyles.paddingCell} colSpan={12}>
          <Collapse in={expand} timeout="auto" unmountOnExit>
            <Details quotation={row} history={history} />
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  );
}

export default function QuotationList({ 
  headCells=[], 
  handleMarkClosed, 
  handleDelete, 
  rows=[], 
  filters, 
  loading=false, 
  handleFilters=(e)=>e, 
  handlePagination=()=>{}, 
  pagination, 
  history 
}) {
  const classes = useStyles();
  const [selected, setSelected] = React.useState([]);
  const page = pagination.page;
  const orderBy = filters.orderBy;
  const rowsPerPage = pagination.limit;
  const count = pagination.count;
  const order = filters.order;

  const [select, setSelect] = useState(false);

  function toggleSelect() {
    setSelect(!select);
  }

  const handleRequestSort = (e, property) => {
    const isAsc = orderBy === property && order === 'asc';
    handlePagination(event("order", isAsc ? 'desc' : 'asc'));
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

  const handleChangePage = (e, newPage) => {
    let offset = 0;
    if(newPage > 0) {
      offset = (newPage+1)*rowsPerPage;
    }

    handlePagination(event("offset", offset));
    handlePagination(event("page", newPage));
  };

  const handleChangeRowsPerPage = (e) => {
    const limit = parseInt(e.target.value, 10);
    handlePagination(event("limit", limit));
    handlePagination(event("page", 0));
  };

  const handleCloseQuotation = (toClose=false) => { handleMarkClosed(selected, toClose) };
  const handleDeleteQuotation = () => { handleDelete(selected) };

  const isSelected = (id) => selected.indexOf(id) !== -1;
  //const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  return (
    <div className="quotation-list">
      <TableToolbar 
        filters={filters}
        numSelected={selected.length} 
        handleChangePage={handleChangePage}
        handleFilters={handleFilters}
        toggleSelect={toggleSelect}
        handleCloseQuotation={handleCloseQuotation}
        handleDeleteQuotation={handleDeleteQuotation}
      />
        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size="medium"
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              classes={classes}
              select={select}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              headCells={headCells}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rowsPerPage}
            />
            {!loading && (
              <TableBody>
                {rows.map((row, index) => {
                    const isItemSelected = isSelected(row.id);
                    const labelId = `enhanced-table-checkbox-${index}`;

                    return (
                      <Row 
                        key={row.id}
                        row={row} 
                        isItemSelected={isItemSelected} 
                        labelId={labelId} 
                        select={select}
                        handleClick={handleClick} 
                        history={history}
                      />
                    );
                  })}
              </TableBody>
            )}
          </Table>
        </TableContainer>
        
        {loading && (
          <div style={styles.skeleton}>
            <Skeleton height={52} count={rowsPerPage} />
          </div>
        )}
        
        <TablePagination
          className="table-pagination"
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={count}
          rowsPerPage={rowsPerPage}
          page={page}
          labelRowsPerPage="Registros por página"
          labelDisplayedRows={({ from, to }) => {
            const label = `${from}-${to} de ${count !== -1 ? count : `${to}`}`;
            return label;
          }}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
    </div>
  );
}

const styles = {
  skeleton: {lineHeight: 0.05, fontSize: 40}
};
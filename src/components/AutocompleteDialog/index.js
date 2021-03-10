import React, {useState, useEffect} from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import MenuList from '@material-ui/core/MenuList';
import DialogTitle from '@material-ui/core/DialogTitle';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import CloseIcon from '@material-ui/icons/Close';
import FilterListIcon from '@material-ui/icons/FilterList';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import OutsideClickHandler from 'react-outside-click-handler';
import RenderOption from './RenderOption';
import { currency } from '../../utils';
import api from '../../api';

import './styles.css';

export default function AutocompleteDialog({open=true, endpoint, handleClose, title='Anexar à cotação...', handleSelectedOption}) {
    const [fullScreen, setFullScreen] = useState(false);
    const toggleFullScreen = () => setFullScreen(!fullScreen);
    const [openFilterList, setOpenFilterList] = useState(false);
    const toggleOpenFilterList = () => setOpenFilterList(!openFilterList);

    // autocomplete options
    const [options, setOptions] = useState([]);
    const [processing, setProcessing] = useState(true);
    const [params, setParams] = useState({
        limit: 15,
        offset: 0,
        type_of_transport: 'aeromedical',
        text: '',
        target: 'origin',
        order: 'DESC',
        orderBy: 'created_at',
    });

    function handleChangeParams(e) {
        const {name, value} = e.target;
        setParams(params => ({ ...params, [name]: value }));
    }

    useEffect(() => {
        async function index() {
            setProcessing(true);
            const response = await api.get(endpoint, {params});
            setOptions(response.data);
            setProcessing(false);
        }

        index();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.text, params.target, params.order]);
    
    return(
        <Dialog fullScreen={fullScreen} fullWidth className="auto-dialog" open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
            <DialogTitle className={`auto-dialog-title ${fullScreen ? 'auto-dialog-header-fullscreen' : ''}`}>
                <div className="auto-header">
                    <div className="left">
                        <Tooltip className="tooltip-med" onClick={() => {
                            if(fullScreen) {
                                setFullScreen(false);
                            }
                            handleClose();
                        }} title="Fechar dialógo">
                            <IconButton aria-label="closed">
                                <CloseIcon className="icon" />
                            </IconButton>
                        </Tooltip>
                        <p>{title}</p>
                    </div>
                    <div className="right">
                        <Tooltip className="tooltip-filter" onClick={toggleOpenFilterList} title="Lista de filtros">
                            <IconButton aria-label="filter-list">
                                <FilterListIcon className="icon" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip className="tooltip-med" onClick={toggleFullScreen} title={fullScreen ? 'Minimizar dialógo' : 'Maximizar dialógo'}>
                            <IconButton aria-label="fullscreen">
                                {fullScreen ? <FullscreenExitIcon className="icon" /> : <FullscreenIcon className="icon" />}
                            </IconButton>
                        </Tooltip>
                        {openFilterList && (
                            <OutsideClickHandler onOutsideClick={() => {/**toggleOpenFilterList */}}>
                                <div className="filter-list">
                                    <p className="filter-title">Filtros</p>
                                    <div className="filters">
                                        <div className="filter-item">
                                            <p>Buscar cotações por: </p>
                                            <Select 
                                                id="target" 
                                                name="target" 
                                                className="select" 
                                                displayEmpty={true} 
                                                value={params.target}
                                                disableUnderline={true}
                                                onChange={handleChangeParams}
                                            >
                                                <MenuItem value={"origin"}>Origem</MenuItem>
                                                <MenuItem value={"destination"}>Destino</MenuItem>
                                            </Select>
                                        </div>
                                        <div className="filter-item">
                                            <p>Ordem: </p>
                                            <Select 
                                                id="order" 
                                                name="order" 
                                                className="select" 
                                                displayEmpty={true} 
                                                value={params.order}
                                                disableUnderline={true}
                                                onChange={handleChangeParams}
                                            >
                                                <MenuItem value={"DESC"}>Mais recente</MenuItem>
                                                <MenuItem value={"ASC"}>Mais antigo</MenuItem>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </OutsideClickHandler>
                        )}
                    </div>
                </div>

                <div className="auto-dialog-input">
                    <input 
                        id="text"
                        name="text"
                        type="text" 
                        value={params.text} 
                        onChange={handleChangeParams} 
                        placeholder="Pesquise uma cotação..." 
                    />
                    {processing && (
                        <span className="spinner-progress">
                            <div className="auto-dialog-loader"></div>
                        </span>
                    )}
                </div>
            </DialogTitle>
            <DialogContent className={fullScreen ? 'auto-dialog-content-maximized' : 'auto-dialog-content'}>
                {(!processing && options.length > 0) ? (
                    <MenuList style={{
                        padding: 0,
                    }}>
                        {options.map((op, index) => {
                            const firstRecord = index === 0;
                            const lastRecord = index === options.length-1;
                            return(
                                <RenderOption 
                                    key={index} 
                                    handleSelectedOption={() => handleSelectedOption(op, index)} 
                                    firstRecord={firstRecord} 
                                    lastRecord={lastRecord}
                                >
                                    <div className="render-op">
                                        <p>{op.full_name}</p>
                                        {/**
                                         * op.origin_aerodrome && (
                                            <>
                                                <p><strong>Origem ➟ </strong>{op.origin_aerodrome.full_name}, {op.origin_aerodrome.city_uf}</p>
                                                <p><strong>Destino ➟ </strong>{op.destination_aerodrome.full_name}, {op.destination_aerodrome.city_uf}</p>
                                                <p>Criada em {op.createdAt}</p>
                                                <p><strong>{currency(op.price)}</strong></p>
                                            </>
                                        )
                                         */}
                                    </div>
                                </RenderOption>
                            );
                        })}
                    </MenuList>
                ) : (
                    <div className="no-options">
                        <p className="no-options-text">Nenhuma cotação foi encontrada!</p>
                    </div>
                )}
            </DialogContent>
      </Dialog>
    );
}
import React, { useState, useEffect } from 'react';
import { FlexContent, FlexSpaceBetween } from '../../core/design';
import Checkbox from '@material-ui/core/Checkbox';
import DeleteIcon from '@material-ui/icons/Delete';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';

import './styles.css';

export default function Extra({ defaultValues, getSelectedOptions=()=>[] }) {
    const[id, setId] = useState(1);
    const[text, setText] = useState('');
    const[infos, setInfos] = useState(defaultValues ? defaultValues : []);
    const[control, setControl] = useState(false);

    function handleChangeText(e) {
        setText(e.target.value);
    };

    function handleAdd() {
        if(text) {
            setInfos(infos => [...infos, {
                id,
                checked: true,
                value: text,
                editing: false
            }]);
    
            setId(id+1);
            setText('');
            setControl(true);
        }
    }

    function handleRemoveItem(id) {
        if(infos.length !== 0) {
            setInfos(infos.filter((info) => info.id !== id));
            setControl(true);
        }
    };

    function handleChangeChecked(e, index) {
        const { checked } = e.target;
        let newArr = [...infos];
        newArr[index].checked = checked;

        setInfos(newArr);
        setControl(true);
    };

    function handleChangeInput(e, index) {
        let newArr = [...infos];
        newArr[index].value = e.target.value;
        setInfos(newArr);
        setControl(true);
    };
    
    // Retorna dados
    useEffect(() => {
        if(control) {
            let returnArr = [];
            const arr = infos.filter(info => info.checked);

            for (let i = 0; i < arr.length; i++) {
                const el = arr[i];
                returnArr[i] = {
                    id: el.id,
                    value: el.value
                };
            }
            
            getSelectedOptions(returnArr);
            setControl(false);
        }
    }, [infos, getSelectedOptions, control]);

    return(
        <div className="extra-info">
            <h3>Informações extras</h3>
            <p className="title">Tópicos a serem adicionados: {infos.filter(info => info.checked).length}</p>
            {infos.length > 0 && (
                <div className="content">
                    {infos.map((info, index) => (
                        <FlexSpaceBetween key={index} style={index === infos.length-1 ? { borderBottom: 'none', backgroundColor: ((index+1)%2 !== 0) ? '#f2f2f2' : '#ffffff', } : {
                        backgroundColor: ((index+1)%2 !== 0) ? '#f2f2f2' : '#ffffff',
                    }} className="single-info">
                        <FlexContent className="left">
                            <Checkbox
                                id={"check_"+info.id}
                                name={"check_"+info.id}
                                disabled={info.editing}
                                className="check-box"
                                checked={info.checked}
                                onChange={(e) => { handleChangeChecked(e, index) }}
                                inputProps={{ 'aria-label': 'indeterminate checkbox' }}
                            />
                            <input 
                                id={"input"+info.id} 
                                name={"input"+info.id} 
                                value={info.value}
                                onChange={(e) => { handleChangeInput(e, index) }}
                            />
                        </FlexContent>
                        <div className="right" onClick={() => { handleRemoveItem(info.id) }}>
                            <div className="remove">
                                <Tooltip title="Remover">
                                    <DeleteIcon className="icon" />
                                </Tooltip>
                            </div>
                        </div>
                    </FlexSpaceBetween> 
                    
                ))}
                </div>
            )}
            <div className="footer">
                <div id="form">
                    <textarea 
                        id="text" 
                        name="text" 
                        value={text} 
                        onChange={handleChangeText}
                        placeholder="Escreva o texto aqui..." 
                    />
                    <Button variant="contained" color="primary" disabled={!text} onClick={handleAdd}>
                        Adicionar
                    </Button>
                </div>
            </div>
        </div>
    );
};
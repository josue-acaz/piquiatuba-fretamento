import React, {useEffect, useState} from 'react';
import api from '../../api';
import SearchIcon from '@material-ui/icons/Search';
import Core from './core';

export default function Autocompletar({
    name,
    inputText='',
    params={}, 
    endpoint, 
    renderOption, 
    fieldName='name',
    error,
    onOptionSelected, 
    placeholder,
    Icon}) {
    const [value, setValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [options, setOptions] = useState([]);
    const [initializing, setInitializing] = useState(true);

    async function getOptions(value) {
        setLoading(true);
        try {
            const response = await api.get(endpoint, {
                params: {
                    ...params,
                    limit: 10,
                    offset: 0,
                    text: value.trim(),
                }
            });
            setOptions(response.data);
            setLoading(false);
            setVisible(true);
        } catch (error) {
            setLoading(false);
            setVisible(true);
            console.error(error);
        }
    }

    // Faz uma busca vazia para inicializar o componente
    useEffect(() => {
        async function initialize() {
            try {
                await api.get(endpoint, {
                    params: {
                        text: '',
                    },
                });

                setInitializing(false);
            } catch (error) {
                setInitializing(false);
                console.error(error);
            }
        }

        initialize();
    }, [endpoint]);

    async function handleChange(e) {
        setValue(e.target.value);
        await getOptions(e.target.value);
    }

    function toggleVisible() {
        setVisible(!visible);
    }

    async function handleClickInput() {
        if(value) { // limpar input toda vez que o usuario clicar
            setValue('');
            onOptionSelected({
                target: {
                    name,
                    value: '',
                }
            })
        }
        setVisible(true);
        await getOptions('');
    }

    function handleOptionSelected(option) {
        setValue(option[fieldName]);
        onOptionSelected({
            target: {
                name: name,
                value: option,
            }
        });
        setVisible(false);
    }

    useEffect(() => {
        setValue(inputText);
    }, [inputText]);

    return(
        <Core 
            value={value} 
            visible={visible}
            error={error}
            options={options}
            loading={loading}
            initializing={initializing}
            onChange={handleChange} 
            Icon={Icon ? Icon : SearchIcon} 
            placeholder={placeholder}
            toggleVisible={toggleVisible}
            handleClickInput={handleClickInput}
            renderOption={renderOption}
            onOptionSelected={handleOptionSelected}
        />
    );
}
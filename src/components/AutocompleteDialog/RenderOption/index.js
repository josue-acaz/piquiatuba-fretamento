import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import {withStyles} from '@material-ui/core/styles';

import './styles.css';

const StyledMenuItem = withStyles((theme) => ({
    root: {
      '&:focus': {
        backgroundColor: '#e3f6f5',
        '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
          color: theme.palette.common.white,
        },
      },
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
      borderBottomStyle: 'solid',
      width: '100%',
      padding: 0
    },
}))(MenuItem);

export default function RenderOption({
  children, 
  style, 
  className, 
  handleSelectedOption,
  firstRecord,
  lastRecord,
}) {

  function handlePressEnter(e) {
    if(e.key === 'Enter') {
      handleSelectedOption();
    }
  }

  return(
        <StyledMenuItem 
          style={style} 
          onKeyDown={handlePressEnter} 
          onDoubleClick={handleSelectedOption} 
          className={`render-option ${className} ${firstRecord ? 'render-op-border-top' : ''}`}
        >
          <div className="op">
            {children}
          </div>
        </StyledMenuItem>
    );
}
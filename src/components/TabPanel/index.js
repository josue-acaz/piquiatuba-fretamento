import React from 'react';
import PropTypes from 'prop-types';

import './styles.css';

export default function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      className="tabpanel"
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
      {...other}
    >
      {value === index && (
          <div className="tabpanel-content">
            {children}
          </div>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};


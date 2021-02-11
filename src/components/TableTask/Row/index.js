import React, {useState} from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import Collapse from '@material-ui/core/Collapse';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';

import './styles.css';

export default function TableTaskRow({isItemSelected, labelId, row, handleClick, swap, expansion}) {
  const [expanded, setExpanded] = useState(false);  
  const toggleExpanded = () => setExpanded(!expanded);
  
  return (
      <>
        <TableRow
          hover
          role="checkbox"
          aria-checked={isItemSelected}
          tabIndex={-1}
          selected={isItemSelected}
        >
          <TableCell padding="checkbox">
            {(swap || !expansion) ? (
              <Checkbox
                checked={isItemSelected}
                onClick={(event) => handleClick(event, row.id)}
                inputProps={{ 'aria-labelledby': labelId }}
              />
            ) : (
              <IconButton aria-label="expand row" size="small" onClick={toggleExpanded}>
                {expanded ? <KeyboardArrowUpIcon className="icon expand" /> : <KeyboardArrowDownIcon className="icon expand" />}
              </IconButton>
            )}
          </TableCell>
          {row.cells.map(cell => (
              <TableCell 
                  key={cell.id}
                  padding={cell.disablePadding ? 'none' : 'default'} 
                  align={cell.align}
              >
                  {cell.text}
              </TableCell>)
          )}
        </TableRow>
        <TableRow className="expand-row">
          <TableCell style={{padding: 0}} className="expand-cell" colSpan={12}>
            <Collapse className="expand-collapse" in={expanded} timeout="auto" unmountOnExit>
              <div className="expansive-content-row">
                {expansion ? (
                  <>
                    {row.expansive.rows.length > 0 && (
                      <Table size="small" aria-label="purchases">
                        <TableHead>
                          <TableRow>
                            {row.expansive.headCells.map(exp_label => (
                              <TableCell 
                                key={exp_label.id}
                                style={{border: 'none'}} 
                                align={exp_label.align}
                              >{exp_label.label}</TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {row.expansive.rows.map(exp_row => (
                            <TableRow key={exp_row.id}>
                              {exp_row.cells.map(exp_cell => (
                                <TableCell 
                                  key={exp_cell.id}
                                  padding={exp_cell.disablePadding ? 'none' : 'default'} 
                                  align={exp_cell.align}
                                >
                                  {exp_cell.text}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                    {row.expansive.custom && <row.expansive.custom />}
                  </>
                ) : (<></>)}
              </div>
            </Collapse>
          </TableCell>
        </TableRow>
      </>
    );
}
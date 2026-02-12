import React from 'react';
import PopupDialog from '../../components/PopupDialog';
import { Accordion, AccordionDetails, AccordionSummary, Button, Collapse, IconButton, List, ListItemButton, ListItemText, Snackbar, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ExpandMore } from '@mui/icons-material';

import { useAppStore } from '../../store/appDataStore';

interface DatabaseViewProps {
  show: boolean;
  onCloseEditor: () => void;
}

const DatabaseViewer: React.FC<DatabaseViewProps> = ({show, onCloseEditor}) => {
   const panel: React.CSSProperties = {
        minWidth: 520,
        margin: 2,          
        border: '1px solid',
        borderBottom: '2px solid',
    };
    const panelheader: React.CSSProperties = {
        background: 'background.paper',
    };
    const heading: React.CSSProperties = {
        fontSize: 15,
        fontWeight: 700,
    };
    const paneldetail: React.CSSProperties = {
        padding: '8px 12px 12px',
        maxHeight: 300,
        overflow: 'auto',
        background: 'background.default',
    };
    const dblist: React.CSSProperties = {
        width: '100%', 
        padding: 0, 
        overflow: 'auto',
        background: 'background.default',
    };
    const dbtableitem: React.CSSProperties = {
        border: '1px solid',
        background: 'background.paper',
    };

    const { projectData } = useAppStore();    
    const dbData:any[] = (projectData) ? setDBData(projectData) : [];

    const handleCloseEditor = () => {
        onCloseEditor();
    };

    const [expanded, setExpanded] = React.useState<string | false>(false);
    const handleExpansion = (panel: string) => (
        _: unknown,
        isExpanded: boolean
    ) => {
        setExpanded(isExpanded ? panel : false);
    };

    const [collapseDBs, setCollapseDBs] = React.useState('');    
    function handleExpandCollapseFields(event: React.MouseEvent<HTMLDivElement>) {
        const dataset = event.currentTarget.dataset;
        const _tablename: string = dataset?.name ?? '';
        
        let strTable = collapseDBs;      
        strTable = setCollapseDBTables(strTable, _tablename);
        setCollapseDBs(strTable);
    }        

    return (
        <PopupDialog 
            open={show}
            onClose={handleCloseEditor}
            dialogTitle={
                <div style={{display:'flex', justifyContent:'space-between'}}>
                    <Typography variant="h6">Database</Typography>
                    <IconButton aria-label="Close" onClick={handleCloseEditor}>
                        <CloseIcon />
                    </IconButton>
                </div>
            }
            children={
                <>
                    {dbData.map((item, index) => 
                        <Accordion key={'dbpanel'+index} style={panel} 
                                expanded={expanded === 'dbpanel'+index} onChange={handleExpansion('dbpanel'+index)}>
                            <AccordionSummary style={panelheader}
                                expandIcon={<ExpandMore />}
                                aria-controls="panelb-content"
                                id="panelb-header"
                            >
                                <Typography style={heading}>{item.title}</Typography>
                            </AccordionSummary>
                            <AccordionDetails style={paneldetail}>
                                <List component="nav" dense={true} style={dblist} >
                                    {item.data.map((table:any, index:number) => (
                                        <div key={table.name+index} style={{marginBottom:2}}>
                                            <ListItemButton style={dbtableitem} data-name={table.name} 
                                                    onClick={handleExpandCollapseFields}>
                                                <ListItemText style={{margin:0}} primary={table.name +' ('+table.type+')'}></ListItemText>
                                            </ListItemButton>
                                            <Collapse in={!strTableCollpase(collapseDBs, table.name)} timeout="auto" unmountOnExit style={{margin:'0px 16px'}}>
                                                {table.csvfile && 
                                                    <div style={{display:'flex', alignItems:'center'}}>
                                                        <Typography variant='body2' style={{fontWeight:'bold'}}>CSV File name:</Typography>
                                                        <Typography variant='caption' style={{marginLeft:8}}>{table.csvfile}</Typography>
                                                    </div>
                                                }
                                                <table id="dbfields" className="bordered-table" >
                                                    <thead>
                                                        <tr>
                                                            <th style={{width:"300px"}} >Field Name</th>
                                                            <th style={{width:"120px"}} >Data Type</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {table.fields.map((field:any) => (
                                                            <tr key={field.fieldname}>
                                                                <td > {field.fieldname} </td>
                                                                <td > {field.dbType} </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </Collapse>
                                        </div>
                                    ))}
                                </List>                             
                            </AccordionDetails>
                        </Accordion>    
                    )}                        
                    <Snackbar
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'center'}}
                        open={true}
                        autoHideDuration={10000}
                        message={<span id="message-id">Database can be edited via Console only.</span>}                            
                    />
                </>
            }
            actions={
                <>
                    <Button sx={{textTransform:'none'}}
                        onClick={() => {
                            handleCloseEditor()                            
                        }}
                        variant="contained"
                        color="primary"
                    >
                        Close
                    </Button>
                </>
            }
        />
    )

    function setDBData(projectdata: Record<string, any>) {
        let _dbs = [];

        let _ldbs:any[] = [];
        projectdata.TableDefs.forEach((ldb:any) => {
            let ldbObj = {};
            if(ldb.view){
                const _viewFields = (ldb.fields) ? ldb.fields : [];
                ldbObj = {name:ldb.tablename, type:"view", fields:_viewFields};
            }else if(ldb.trigger){
                ldbObj = {name:ldb.triggername, type:"trigger", fields:[]};
            }else if(ldb.procedure){
                ldbObj = {name:ldb.procedurename, type:"procedure", fields:[]};
            }else {
                ldbObj = {name:ldb.tablename, type:"table", fields:ldb.fields, csvfile:ldb.csvfilename};
            }
            _ldbs.push(ldbObj);
        });    
        _dbs.push({title:"Local Database", data:_ldbs});
        
        let _rdbs:any[] = [];
        projectdata.RemoteTableDefs.forEach((rdb:any) => {
            let rdbObj = {};
            if(rdb.servicename !== "Mobilous"){
                rdbObj = {name:rdb.tablename, type:"plugin", fields:rdb.fields};
            }else{
                if(rdb.view){
                    const _viewFields = (rdb.fields) ? rdb.fields : [];
                    rdbObj = {name:rdb.tablename, type:"view", fields:_viewFields};
                }else if(rdb.trigger){
                    rdbObj = {name:rdb.triggername, type:"trigger", fields:[]};
                }else if(rdb.procedure){
                    rdbObj = {name:rdb.procedurename, type:"procedure", fields:[]};
                }else {
                    rdbObj = {name:rdb.tablename, type:"table", fields:rdb.fields, csvfile:rdb.csvfilename};
                }
            }
            _rdbs.push(rdbObj);
        });
        _dbs.push({title:"Remote Database", data:_rdbs});

        return _dbs;
    }


    function setCollapseDBTables(strTable:string, name:string){
        let _name = name +",";
        if(strTable.indexOf(name) > -1){
            strTable = strTable.replace(_name , "");
        }else{
            strTable += _name;
        }
    
        return strTable;
    }
    function strTableCollpase(strTable:string, name:string){    
      if(strTable.toString().indexOf(name) > -1){
        return false;
      }else{
        return true;
      }
    }

};

export default DatabaseViewer;
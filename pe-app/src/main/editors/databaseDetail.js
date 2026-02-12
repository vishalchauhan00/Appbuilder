import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { List, ListItem, ListItemText, Collapse, Typography } from '@material-ui/core';

class DatabaseDetail extends React.Component {
    constructor(props) {
      super(props);
      
      this.state = {
        dbData: this.props.data,
        
        open: false,
        anchorEl: null,
        
      };      
      

    }
  
    componentDidMount() {      
      
    }
    
    
    render() {
      const { dbData } = this.state;
            
      return ( 
        <div id="dbdetails" className="horizontal-align" style={{alignItems:'inherit'}} >
          <DBViewer data={dbData}/>
        </div>               
      );      
    }
  }

  function DBViewer(props) {    
    const useStyles = makeStyles(theme => ({
                        root: {
                          width: 300, height: 300, overflowX: 'hidden',
                          display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around',
                        },
                        dblist: {
                          width:'100%', 
                          padding:0, 
                          overflow:'auto',
                          background: theme.palette.background.default,
                        },
                        dbitem: {
                          marginBottom:2,
                        },
                        dbtableitem: {
                          border: '1px solid',
                          background: theme.palette.background.paper,
                        },
                        dbtablename: {
                          margin: theme.spacing(0),
                        },
                        tablefields: {
                          margin: theme.spacing(0, 2),
                        },
                      }));
    const classes = useStyles();
    
    const dbData = props.data;

    const [collapseDBs, setCollapseDBs] = React.useState('');    
    function handleExpandCollapseFields(event) {
      let _tablename = event.currentTarget.dataset.name;
      
      let strTable = collapseDBs;      
      strTable = setCollapseDBTables(strTable, _tablename);
      //console.log(_tablename, "............. handleExpandCollapse ............", strTable);

      setCollapseDBs(strTable);
    }

    function setCollapseDBTables(strTable, name){
      let _name = name +",";
      if(strTable.indexOf(name) > -1){
        strTable = strTable.replace(_name , "");
      }else{
        strTable += _name;
      }
  
      return strTable;
    }
    function strTableCollpase(strTable, name){    
      if(strTable.toString().indexOf(name) > -1){
        return false;
      }else{
        return true;
      }
    }

    return (
        <List component="nav" dense={true}
              className={classes.dblist}
        >
          {dbData.data.map((table, index) => (
            <div key={table.name+index} className={classes.dbitem}>
              <ListItem button className={classes.dbtableitem} data-name={table.name} 
                        onClick={handleExpandCollapseFields}>
                <ListItemText className={classes.dbtablename} primary={table.name +' ('+table.type+')'}></ListItemText>
              </ListItem>
              <Collapse in={!strTableCollpase(collapseDBs, table.name)} timeout="auto" unmountOnExit className={classes.tablefields}>
                {table.csvfile && 
                  <div style={{display:'flex', alignItems:'center'}}>
                    <Typography variant='body2' style={{fontWeight:'bold'}}>CSV File name:</Typography>
                    <Typography variant='caption' style={{marginLeft:8}}>{table.csvfile}</Typography>
                  </div>
                }
                <table id="dbfields" className="tg" >
                  <thead>
                  <tr>
                    <th width="300px" >Field Name</th>
                    <th width="120px" >Data Type</th>
                  </tr>
                  </thead>
                  <tbody>
                    {table.fields.map(field => (
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
    );
  }

  export default DatabaseDetail;
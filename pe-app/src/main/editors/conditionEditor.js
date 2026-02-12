import React from 'react';
import { makeStyles, withStyles, fade } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
//import MuiDialogActions from '@material-ui/core/DialogActions';
import { List, ListItem, ListItemText, Collapse, InputBase, NativeSelect } from '@material-ui/core';
import { IconButton, Typography, Box, Paper, Grid, Button, Snackbar, SnackbarContent, Slide } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';


const styles = theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
    maxHeight: 48,
    background: theme.palette.background.paper,
  },
  closeButton: {
    position: 'absolute',
    top: theme.spacing(0),
    right: theme.spacing(1),
    maxHeight: 48,
    color: theme.palette.text.primary,
  },
});
const DialogTitle = withStyles(styles)(props => {
  const { children, classes, onClose } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root}>
      {onClose ? (
        <IconButton aria-label="Close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
      <Typography variant="h6">{children}</Typography>
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles(theme => ({
  root: {
    minHeight: 520,
    padding: theme.spacing(0),
    display: 'flex', 
    flexDirection: 'row', 
    justifyContent: 'space-around',
    overflow: 'hidden',
    background: theme.palette.background.default,
  },
}))(MuiDialogContent);

/* const CollapsedListItem = withStyles(theme => ({
  root: {
      padding: theme.spacing(0),
      '&:focus': {
          backgroundColor: "#65bc45",
          '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
              color: theme.palette.common.white,
          },
      },
      '&:hover': {
          background: theme.palette.background.hover,
          '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
            color: theme.palette.common.white,
          },
      },
  },
  selected: {}
}))(ListItem); */

const ListHeader = withStyles(theme => ({
  root: {
    width: 'calc(100% - 16px)',
    maxHeight: 20,
    //borderTop: '1px solid rgba(255, 0, 0, .825)',
    //borderBottom: '1px solid rgba(255, 0, 0, .825)', 
    background: theme.palette.background.default,
    padding: theme.spacing(0),
  },    
}))(ListItem);
const ListHeading = withStyles(theme => ({
  root: {
    width: '100%',
    textAlign: 'center',
  },
  primary: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightBold,    
  }, 
}))(ListItemText);

const TextInput = withStyles(theme => ({
  root: {},
  input: {
    borderRadius: 4,
    position: 'relative',
    background: theme.palette.background.default,
    border: '1px solid',
    fontSize: 14,
    width: 'auto',
    minWidth: 160,
    padding: theme.spacing(0.25,1),
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    // Use the system font instead of the default Roboto font.
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    '&:focus': {
      boxShadow: `${fade(theme.palette.primary.main, 0.25)} 0 0 0 0.1rem`,
      borderColor: theme.palette.primary.main,
    },
  },
}))(InputBase);

const DropDownInput = withStyles(theme => ({
  root: {},
  input: {
    width: 80,
    height: 'inherit',
    position: 'relative',
    background: theme.palette.background.default,
    border: '1px solid #ced4da',
    borderRadius: 4,
    fontSize: 14,
    padding: '3px 8px 0px 8px',
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    '&:focus': {
      borderRadius: 4,
      borderColor: theme.palette.primary.main,
      background: theme.palette.background.default,
      boxShadow: '0 0 0 0.1rem rgba(0,123,255,.25)',
    },
  },
}))(InputBase);

class ConditionEditor extends React.Component {
    constructor(props) {
      super(props);
      
      this.state = {        
        conditionData: this.props.data,        
        show: this.props.show,

        prevConditionData: [],
        actionList: [],
      }; 
    }
  
    componentDidMount() { 
      this.setState({ prevConditionData : JSON.parse(JSON.stringify(this.state.conditionData)) });
    }

    handleCloseConditionEditor(param, data) {
      /* console.log(param, ". handleCloseConditionEditor >>>>>>>>", this.state.prevConditionData, this.state.conditionData);
      if(param !== "ok"){
        this.setState({ conditionData : JSON.parse(JSON.stringify(this.state.prevConditionData)) });
      } */

      if(param === "ok"){
        this.setState({ conditionData : data });
        this.props.onCloseConditionEditor(data);
      }else {
        this.props.onCloseConditionEditor();
      }      
    }
    
    
    render() {
      const { prevConditionData, conditionData, show } = this.state;
      
      if(!show) {
        return null;
      }

      return ( 
        
          <Dialog id="conditiondetails" scroll="paper" open={true} fullWidth={true} maxWidth="sm" >
            <DialogTitle id="condition-editor-title">
              Condition Editor
            </DialogTitle>
            <DialogContent dividers>
              <ConditionViewer actualdata={prevConditionData} data={conditionData} isElseExist={this.props.elseExist}
                               onCloseConditionEditor={(...args) => this.handleCloseConditionEditor(args[0], args[1])}/>
            </DialogContent>
          </Dialog>
                   
      );      
    }
  }

  function ConditionViewer(props) {  
    const useStyles = makeStyles(theme => ({
                        root: {
                          width: 300, height: 300, overflowX: 'hidden',
                          display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around',
                        },
                        container: {
                          width: '100%',
                          padding: theme.spacing(0),
                          background: theme.palette.background.default
                        },
                        papercondition: {
                          minHeight: 32,                          
                          padding: theme.spacing(0.5),
                          margin: theme.spacing(0.5, 1),
                          border: '2px groove',
                          borderColor: theme.palette.grey[300],
                          display: 'flex',
                          //alignItems: 'center',
                          maxHeight : 48, overflow: 'auto',
                          background: theme.palette.background.default
                        },
                        conditionstring: {
                          //width: '100%',
                          margin: theme.spacing(0, 0.5),      
                        }, 
                        paperconditionlist: {
                          overflow: 'auto',
                          minWidth: 340,
                          minHeight: 250,
                          maxHeight: 360,
                          height: `calc(100% - 80px)`,                      
                          //padding: theme.spacing(1),
                          margin: theme.spacing(0.5, 1),
                          border: '1px solid',
                          borderColor: theme.palette.grey[500],
                        },
                        dialoggrid: {                          
                          padding: theme.spacing(1),
                          flexWrap: 'noWrap',
                        },
                        dialogbutton: {
                          textTransform: 'none',
                          //maxWidth: 64,
                          maxHeight: 32,
                          margin: theme.spacing(0, 0.5),
                          padding: 2,
                        },                        
                        dialogfullbutton: {
                          textTransform: 'none',
                          minWidth: 96,
                          maxHeight: 32,
                          margin: theme.spacing(0, 0.5),
                          padding: 2,
                        },
                        gridspacer: {
                          width: '100%'
                        },
                        dialogfooter: {
                          height: 48,                         
                          padding: theme.spacing(0.5),
                          flexWrap:'nowrap',
                          background: theme.palette.background.default,
                          borderTop : '1px solid',
                          borderTopColor: theme.palette.grey[500],
                        },                  
                                            
                      }));
    const classes = useStyles();
    
    const [conditionData, setConditionData] = React.useState(props.data);
    //console.log(" handleCondition >> ::::: ", conditionData); 
    const [conditionStr, setConditionString] = React.useState(manipulateConditionsString(props.data)); 
    const [disableConditionButtons, setDisableConditionButtons] = React.useState(true);
    const [selectedConditionId, setSelectedConditionId] = React.useState(''); 

    const [openalert, setOpenalert] = React.useState(false);
    const [alertmsg, setAlertMsg] = React.useState('');
    
    function handleConditionSelect(condId) {
      //console.log(conditionData, " **** handleConditionSelect >> ::::: ", condId);
      setDisableConditionButtons(false);
      setSelectedConditionId(condId);
    }

    function handleConditionUpdate(condition) { 
      //console.log(selectedConditionId, " >> ", props.data, conditionData, " >> handleConditionUpdate ::::: ", condition);

      let currentConditions = conditionData;
      if(currentConditions.length === 0) {
        currentConditions.push({cases:[{target:condition['target'], operator:condition['operator'], value:condition['value'], "ORGroupCase":[], condtemp:""}]});
      
      }else {  
        let _conditionId = (selectedConditionId === "") ? condition['id'] : selectedConditionId;        
        let _groupIndex = _conditionId.split('-')[0].replace('group','');
        let _caseIndex = _conditionId.split('-')[1].replace('case','');
        let _selectedGroup = currentConditions[_groupIndex];
        let _selectedGroupCases = _selectedGroup['cases'];
        let _selectedCase = _selectedGroupCases[_caseIndex];

        //console.log(_selectedGroupCases, " :: _selected >> ", _selectedCase);        
        if(_selectedCase) {
          if(_conditionId.indexOf('-or') > -1) {          
            let _orgroupcaseId = _conditionId.substring(_conditionId.lastIndexOf('case')).replace('case','');
            let _orgroupCase = _selectedCase['ORGroupCase'][0]['cases'][_orgroupcaseId];
            _orgroupCase['target'] = condition['target'];
            _orgroupCase['operator'] = condition['operator'];
            _orgroupCase['value'] = condition['value'];
  
          }else {        
            _selectedCase['target'] = condition['target'];
            _selectedCase['operator'] = condition['operator'];
            _selectedCase['value'] = condition['value'];
  
          }
        }
      }

      setConditionData(currentConditions);
      let newConditionStr = manipulateConditionsString(conditionData);
      setConditionString(newConditionStr);
    }

    // Add 'OR' condition with either a Groupcase or a case
    function addGroupCase() {
      let currentConditions = conditionData;
      currentConditions.push({cases:[{target:"", operator:"", value:"", "ORGroupCase":[], condtemp:""}]});
      //console.log(" addGroupCase >> ::::: ", conditionData);

      setConditionData(currentConditions);
      let newConditionStr = manipulateConditionsString(props.data);
      setConditionString(newConditionStr);
    }

    // Add 'AND' condition with a case
    function addCase() {      
      let currentConditions = conditionData;
      let _groupIndex = selectedConditionId.split('-')[0].replace('group','');
      
      let _selectedGroup = currentConditions[_groupIndex];
      let _selectedGroupCases = _selectedGroup['cases'];
      if(selectedConditionId.indexOf('-or') > -1) {
        let _caseIndex = parseInt(selectedConditionId.split('-')[1].replace('case',''));
        let _selectedCase = _selectedGroupCases[_caseIndex];
        _selectedCase['ORGroupCase'][0]['cases'].push({target:"", operator:"", value:"", "ORGroupCase":[], condtemp:""});
      }else {
        _selectedGroupCases.push({target:"", operator:"", value:"", "ORGroupCase":[], condtemp:""});
      }
      //console.log(selectedConditionId, "... addCase >> ::::: ", conditionData);

      setDisableConditionButtons(true);      
    }

    // Add 'OR group case' condition with a case
    function addORGroupCase() {
      if(selectedConditionId.indexOf('-or') > -1) {
        // show alert
        return;
      }
      let _groupIndex = selectedConditionId.split('-')[0].replace('group','');
      let _caseIndex = selectedConditionId.split('-')[1].replace('case','');

      let currentConditions = conditionData;
      if(currentConditions.length > 0) {        
        let _selectedGroup = currentConditions[_groupIndex];
        let _selectedGroupCases = _selectedGroup['cases'];
        let _selectedCase = _selectedGroupCases[_caseIndex];
        let _selectedORGroup = _selectedCase['ORGroupCase'];
        if(_selectedORGroup.length > 0){
          _selectedORGroup[0]['cases'].push({target:"", operator:"", value:"", "ORGroupCase":[], condtemp:""});
        }else {
          _selectedORGroup.push({cases:[{target:"", operator:"", value:"", "ORGroupCase":[], condtemp:""}]});
        }
      }
      //console.log(selectedConditionId, "... addORGroupCase >> ::::: ", conditionData);

      setDisableConditionButtons(true);
    }

    // Delete selected condition case
    function deleteCase() {      
      let currentConditions = conditionData;      
      
      let _groupIndex = selectedConditionId.split('-')[0].replace('group','');
      let _caseIndex = selectedConditionId.split('-')[1].replace('case','');
      
      let _selectedGroup = currentConditions[_groupIndex];
      if(_selectedGroup) {
        let _selectedGroupCases = _selectedGroup['cases'];
        if(selectedConditionId.indexOf('-or') > -1) {
          let _caseIndex = parseInt(selectedConditionId.split('-')[1].replace('case',''));
          let _selectedCase = _selectedGroupCases[_caseIndex];
          let _orgroupcaseId = selectedConditionId.substring(selectedConditionId.lastIndexOf('case')).replace('case','');
          _selectedCase['ORGroupCase'][0]['cases'].splice(_orgroupcaseId,1);
  
        }else {        
          _selectedGroupCases.splice(_caseIndex,1);
        }

        /* if(_selectedGroup['cases'].length === 0) {
          currentConditions.splice(_groupIndex,1);
        } */
        //console.log(selectedConditionId, _selectedGroup, _selectedGroupCases, "... Delete ## Conditions >> ::::: ", currentConditions);
      }
      //console.log(props.data, "... Delete ## Conditions >> ::::: ", currentConditions);
      if(currentConditions.length === 1 && currentConditions[0]['cases'].length === 0) {
        currentConditions = [];
        setConditionData([]);
        setConditionString(manipulateConditionsString([]));

      }else {        
        setConditionData(currentConditions);
        let newConditionStr = manipulateConditionsString(props.data);
        setConditionString(newConditionStr);
      }

      setDisableConditionButtons(true);
    }

    function deleteAllCondition() {
      if(props.isElseExist){
        console.log("isElseExist");
        setAlertMsg("There is action(s) applied in 'Else' case. Either remove those or apply new condition(s) to avoid any unexpected behaviour.");
        setOpenalert(true);
        //return;
      }

      let currentConditions = [];
      setConditionData(currentConditions);
      //let newConditionStr = manipulateConditionsString(props.data);
      setConditionString("");
    }

    ////////////////////// Cancel and Apply conditions //////////////////////

    function closeEditor() {      
      props.data.splice(0);
      for (let index = 0; index < props.actualdata.length; index++) {
        const element = props.actualdata[index];
        props.data.push(element); 
      }
      
      props.onCloseConditionEditor('cancel');
    }

    function applyCondition() {
      const isValidData = validateConditionData(conditionData);
      if(!isValidData) {        
        setAlertMsg('Any condition target or operator cannot be empty');
        setOpenalert(true);
        return;
      } 

      props.onCloseConditionEditor('ok', conditionData);
    }

    function validateConditionData(conditionArr) {
      let _flag = true;
      conditionArr.forEach(element => {
        let _cases = element['cases'];
        _cases.forEach(cond => {
          //console.log(cond);          
          if(cond['target'] === "" || cond['operator'] === "") {
            //console.log(cond['target'], "....", cond['operator'], "....", cond['value'], "*****", cond['ORGroupCase'].length);
            _flag = false;
          }else {
            if(!validateConditionData(cond['ORGroupCase']))   _flag = false;
          }
        });
        
      });
      
      return _flag;
    }

    ////////////////////////////////

    const handleCloseAlert = () => {
      setOpenalert(false);
      setAlertMsg('');
    };


    return (
      <Box className={classes.container}>

        <Paper elevation={0} className={classes.papercondition}>
          <Typography variant="subtitle2" className={classes.conditionstring} >{conditionStr}</Typography>            
        </Paper>     
        <Paper elevation={6} className={classes.paperconditionlist}>
          <ConditionList data={conditionData} onSelectItem={handleConditionSelect} onUpdateItem={handleConditionUpdate}/>
        </Paper>
        <Grid container justify="flex-start" alignItems="center" className={classes.dialoggrid}>
          <Button variant="contained" color="default" className={classes.dialogbutton} onClick={addGroupCase}>+ OR</Button>
          <Button disabled={disableConditionButtons} variant="contained" color="default" className={classes.dialogbutton} onClick={addCase} >+ AND</Button>
          <abbr title="Add OR Group case"><Button disabled={disableConditionButtons} variant="contained" color="default" className={classes.dialogfullbutton} onClick={addORGroupCase} >+ ORGroup</Button></abbr>
          <span className={classes.gridspacer}></span>
          <Button disabled={disableConditionButtons} variant="contained" color="default" className={classes.dialogbutton} onClick={deleteCase} >Delete</Button>
          <Button variant="contained" color="default" className={classes.dialogbutton} style={{'minWidth':72}} onClick={deleteAllCondition} >Delete All</Button>
        </Grid>
        <Grid container justify="flex-start" alignItems="center" className={classes.dialogfooter}>             
          <span className={classes.gridspacer}></span>
          <Button variant="contained" color="default" className={classes.dialogbutton} onClick={closeEditor}>Cancel</Button>
          <Button variant="contained" color="primary" className={classes.dialogbutton} onClick={applyCondition}>Apply</Button>                                  
        </Grid> 
        <Snackbar open={openalert}
                  anchorOrigin={{ vertical: 'bottom',  horizontal: 'center' }} TransitionComponent={SlideTransition}
                  bodystyle={{ backgroundColor: 'teal', color: 'coral' }}
                  autoHideDuration={6000} onClose={handleCloseAlert}   
        >               
                  <SnackbarContent style={{backgroundColor:'#d3d3d3', color:'red'}}
                    message={<span id="client-snackbar">{alertmsg}</span>}
                    action={
                      <React.Fragment>
                        <IconButton size="small" aria-label="close" color="inherit" onClick={handleCloseAlert}>
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </React.Fragment>
                    }
                  />
        </Snackbar>                   
    </Box>        
    );
  }
  function SlideTransition(props) {
    return <Slide {...props} direction="down" />;
  }

  function ConditionList(props) {   
    const useStyles = makeStyles(theme => ({
                        container: {
                          //height: '100%',                         
                          margin: theme.spacing(0.5),
                          marginBottom: 0,
                        },
                        ortext:{
                          color: 'rgb(0,0,255)',
                          //backgroundColor: theme.palette.grey[200],
                        },
                        collapse: {
                          width: '100%',                          
                        },                        
                        groupcaseheader: {
                          maxHeight: 28,
                          display: 'none',//'flex',
                          alignItems: 'center',
                          margin: theme.spacing(0,0.5),
                          backgroundColor: theme.palette.grey[400],
                          fontWeight: 'bold',
                        },
                        listcondition: {
                          borderRadius: 6,
                          margin: theme.spacing(0,0.5),
                          backgroundColor: theme.palette.grey[300],
                        },
                        listitemcondition: {
                          width: `calc(100% - 24px)`,
                          display: 'flex',
                          flexDirection: 'column',
                          borderRadius: 6,
                          margin: theme.spacing(0, 0.5),
                          padding: theme.spacing(0.5, 1),
                          background: theme.palette.background.default
                        },
                        divcases: {
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          flexGrow: 1,
                          //margin: theme.spacing(0,1.25),
                          //width: `calc(100% - 26px)`,                        
                          width: '100%',
                        },
                        andtext:{
                          color: 'rgb(255,0,0)',
                          margin: theme.spacing(0.125, 0),
                        },
                        btncondition: {
                          width: '100%',
                          padding: theme.spacing(0.25, 2.5),
                          backgroundColor: theme.palette.common.white,                          
                        },
                        boxorgroup: {
                          width: `calc(100% - 2px)`,
                          border: '1px solid',
                          borderColor: theme.palette.grey[600],
                          borderRadius: '0px 0px 6px 6px',
                        }
                                            
                      }));
    const classes = useStyles();
    
    const condData = props.data;
    let conditionData = manipulateConditionsData(condData, props.orgroup, props.parentcaseid);
    //console.log(condData, " conditionData >> ::::: ", conditionData);
    //const [selectedCase, setSelectedCase] = React.useState({}); 

    function handleCase(ev) {  
      let conditionId = ev.currentTarget.dataset['id'];
      props.onSelectItem(conditionId);

      /* let _groupIndex = conditionId.split('-')[0].replace('group','');
      let _caseIndex = conditionId.split('-')[1].replace('case','');
      //console.log(conditionId, "handleCase >>>>>>>>", _groupIndex, _caseIndex);
      let _selectedGroup = conditionData[_groupIndex];
      let _selectedGroupCases = _selectedGroup['cases'];
      let _selectedCase = _selectedGroupCases[_caseIndex];
      
      setSelectedCase(_selectedCase); */     
    } 

    function handleUpdateCondition(_case) {
      //console.log(_case, "handleUpdateCondition >>>>>>>>", conditionData);
      //props.onSelectItem(_case['id']);

      props.onUpdateItem(_case);
    }


    return (
      <div className={classes.container} >
        {conditionData.map((item, index) => (
          <Box id="groupcases" key={index} className="vertical-align">
            {item.showor && 
              <ListHeader><ListHeading primary="OR" className={classes.ortext}/></ListHeader>
            }
            <Collapse in={true} timeout="auto" unmountOnExit className={classes.collapse}>
              <List dense={true} disablePadding >            
                <Box className={classes.listitemcondition}>              
                  {item.cases.map((cases, caseindex) => (                  
                    <div id="cases" key={caseindex} className={classes.divcases}>                  
                      {cases.showand &&                       
                        <ListHeading primary="AND" className={classes.andtext}/>
                      }
                      <Button disableRipple className={classes.btncondition} data-id={cases.id} onClick={handleCase}>
                        <ConditionCase data={cases} onUpdateValue={handleUpdateCondition} onClickTarget={handleCase} />                      
                      </Button>
                      {(cases.hasOwnProperty('orgroup') && cases.orgroup.length > 0 && cases.orgroup[0].cases.length > 0) &&
                        <Box className={classes.boxorgroup}>
                          <ConditionList data={cases.orgroup} orgroup={true} parentcaseid={cases.id}
                                         onSelectItem={props.onSelectItem} onUpdateItem={props.onUpdateItem}/>
                        </Box>
                      }
                    </div>
                  ))}
                </Box>
              </List> 
            </Collapse>
          </Box>
        ))}

      </div>

    );
  }

  function ConditionCase(props) {   
    const useStyles = makeStyles(theme => ({                        
                        divcondition: {
                          width: '100%',
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexGrow: 1,
                          padding: theme.spacing(0),                          
                        },
                                                                    
                      }));
    const classes = useStyles();
    
    const cases = props.data;
    const [caseTarget, setCaseTarget] = React.useState(cases['target']);
    React.useEffect(() => {
      setCaseTarget(cases['target']);
    }, [cases])
    const [caseOperator, setCaseOperator] = React.useState(cases['operator']);
    React.useEffect(() => {
      setCaseOperator(cases['operator']);
    }, [cases])
    const [caseValue, setCaseValue] = React.useState(cases['value']);
    React.useEffect(() => {
      setCaseValue(cases['value']);
    }, [cases])

    function handleCaseTarget(ev) {
      //console.log(ev.currentTarget.value, "<<<<<<<< CaseTarget >>>>>>>>", ev.target.value);
      setCaseTarget(ev.target.value);

      cases['target'] = ev.target.value;
      props.onUpdateValue(cases);
    }

    function handleOperatorSelect() {
      //HOTFIX
      let ev = {currentTarget:{}}; 
      ev.currentTarget.dataset = cases;
      props.onClickTarget(ev);
    }

    function handleCaseOperator(ev) {      
      setCaseOperator(ev.target.value);
     
      cases['operator'] = ev.target.value;
      props.onUpdateValue(cases);
    }

    function handleCaseValue(ev) {      
      setCaseValue(ev.target.value);
      
      cases['value'] = ev.target.value;
      props.onUpdateValue(cases);
    }

    return (
      <Box className={classes.divcondition}>
        <TextInput margin="dense" variant="outlined" value={caseTarget} onChange={handleCaseTarget}/>
        <input pattern="[^\\[\\] ~`!@#$%&*()+=]" style={{display:'none'}}/>
        <NativeSelect value={caseOperator} onChange={handleCaseOperator} onMouseDown={handleOperatorSelect}
          input={ <DropDownInput /> }                 
        >
          {setOptions().map((option,id) =>
            <option key={id} value={option.val}>{option.text}</option>
          )}            
        </NativeSelect>                
        <TextInput margin="dense" variant="outlined" value={caseValue} onChange={handleCaseValue} />
      </Box>
    );
  }

  function manipulateConditionsString(arrCondition) {
    if(arrCondition.length === 0){
      return "";
    }

    //console.log("manipulateConditionsString .... arrCondition >>>> ", arrCondition);

    let strCondition = "";
    for (let i = 0; i < arrCondition.length; i++) {
      const groupcase = arrCondition[i];
      if(groupcase['cases'].length === 0) {
        arrCondition.splice(i, 1);
        continue;
      }
      const groupStr = parseGroupCase(groupcase);
      if(groupStr.length !== 0) {
        strCondition += "("+ parseGroupCase(groupcase) +")";
        if(i !== arrCondition.length-1){
          strCondition += " OR ";
        }
      }
      /* strCondition += "("+ parseGroupCase(groupcase) +")";
      if(i !== arrCondition.length-1){
        strCondition += " OR ";
      } */
      
      //console.log(" .... groupcase.....222222...... >>>> ", groupcase);     
      
    }
    return strCondition;
  }
  function parseGroupCase(groupcase){
    const casesGroupcase = groupcase['cases'];

    let strCase = "";
    for (let j = 0; j < casesGroupcase.length; j++) {
      const casecondition = casesGroupcase[j];
      let ORgroupcase = manipulateConditionsString(casecondition['ORGroupCase']);
      //console.log(j, "**** ORgroupcase ****", ORgroupcase);
      ORgroupcase = (ORgroupcase.length > 0) ? " OR " + ORgroupcase : "";

      if(casecondition['value'] === '__BLANK__'){
        strCase += "("+ casecondition['target'] +" "+ getConditionOperator(casecondition['operator']) +" ''"+ ORgroupcase +")";
      }else {
        strCase += "("+ casecondition['target'] +" "+ getConditionOperator(casecondition['operator']) +" "+ casecondition['value'] + ORgroupcase +")";
      }
      
      if(j !== casesGroupcase.length-1){
        strCase += " AND ";
      }      
    }
    return strCase;
  }
  /* function parseGroupCase(groupcase){
    const casesGroupcase = groupcase['cases'];

    let strCase = "";
    for (let i = 0; i < casesGroupcase.length; i++) {
      const casecondition = casesGroupcase[i];
      strCase += parseCase(casecondition);
      if(i > 0){
        strCase += "AND";
      }
      
    }
  } */

  function getConditionOperator(operator)
  {
    let val = "";
    switch(operator)
    {
      case "E" :
        val = "="
        break;
      case "NE" :
        val = "!="
        break;
      case "G" :
        val = ">"
        break;
      case "GE" :
        val = ">="
        break;
      case "L" :
        val = "<"
        break;
      case "LE" :
        val = "<="
        break;
      default :
        val = operator;
    }
    return val;
  }
  function setOptions() {    
    return [{val:"",text:""},
            {val:"E",text:getConditionOperator("E")},
            {val:"NE",text:getConditionOperator("NE")},
            {val:"G",text:getConditionOperator("G")},
            {val:"GE",text:getConditionOperator("GE")},
            {val:"L",text:getConditionOperator("L")},
            {val:"LE",text:getConditionOperator("LE")},
          ];
  }

  function manipulateConditionsData(arrCondition, orgroup, parentid)
  {
    if(arrCondition.length === 0 && !orgroup){
     return [ {id: 'groupcase-0', showor:false, cases:[{id: 'group0-case0', showand:false, target:"", operator:"", value:""}]}];
    }else if(arrCondition.length === 1 && arrCondition[0]['cases'].length === 0) {
     return [ {id: 'groupcase-0', showor:false, cases:[{id: 'group0-case0', showand:false, target:"", operator:"", value:"", orgroup:[]}]}];
    }

    let arrCondObj = [];
    for (let i = 0; i < arrCondition.length; i++) {
      const groupcase = arrCondition[i];
      const casesGroupcase = groupcase['cases'];

      let arrCondCases = [];
      for (let j = 0; j < casesGroupcase.length; j++) {
        const casecondition = casesGroupcase[j];

        //let ORgroupcase = manipulateConditionsData(casecondition['ORGroupCase'], 'ORGroup');
        //console.log(j, "##### ORgroupcase ####", ORgroupcase);

        let condVal = casecondition['value'];
        /* if(condVal === '__BLANK__'){
          condVal = "";
        } */

        let caseid = 'group'+i+'-case'+j;
        let _showand = (j === 0) ? false : true;
        let _orgroup = (casecondition['ORGroupCase'].length > 0) ? casecondition['ORGroupCase'] : [];
        if(orgroup) caseid = parentid +'-or'+ caseid;
        
        arrCondCases.push({id: caseid, showand:_showand, target:casecondition['target'], operator:casecondition['operator'], value:condVal, orgroup:_orgroup });
      }

      let _showor = true;
      if(i === 0 && !orgroup){
        _showor = false;
      }
      arrCondObj.push({id: 'groupcase-'+i, showor:_showor, cases:arrCondCases });
    }

    return arrCondObj;
  }

  


  export default ConditionEditor;
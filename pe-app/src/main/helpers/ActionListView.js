import React from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { IconButton, SvgIcon, Typography, Badge, Button, Checkbox } from '@material-ui/core';
//import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ExpandLessDisabled from '@material-ui/icons/RemoveCircleOutlineRounded';
import ExpandLessEnabled from '@material-ui/icons/RemoveCircleRounded';
import ExpandMoreDisabled from '@material-ui/icons/AddCircleOutlineOutlined';
import ExpandMoreEnabled from '@material-ui/icons/AddCircleOutlined';

import ConditionEditor from '../editors/conditionEditor';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    height: '100%',
    minWidth: 432,
    //maxWidth: 944,
    overflow:'hidden',
    padding: 0, margin: 0,
    display: 'flex', 
    flexDirection: 'column',
    alignItems: 'flex-end', 
  },
  listroot: {
    width: '100%',
    height: '100%',
    //maxHeight:400,
    overflow:'auto',
    padding: 0,
    paddingTop: 2,
    background: theme.palette.background.default,
  },
  resizediv: {
    width: 12, 
    height: 12, 
    background: theme.palette.background.paper,
  },
  halign: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
  hspacer: {
    width: '0px',
  },
  icontype: {
    width: '18px',
    height: '20px',
    paddingRight: theme.spacing(0.5),
  },
  iconempty: {
    width: 24,
    padding: theme.spacing(0),
  },
  iconbtn: {
    padding: theme.spacing(0),
    background: theme.palette.background.default,
  },
  condlabel: {
    position: 'absolute',
    color: theme.palette.common.black,
    paddingLeft: theme.spacing(1),
  },
  subactionitem: {
    //margin: theme.spacing(0,3,0,4),
    marginLeft: theme.spacing(3),
  },
  subactiontext: {
    color: theme.palette.primary.dark,
    margin: theme.spacing(0.25),
    paddingLeft: theme.spacing(1),
    borderRadius: theme.spacing(1),
    minWidth: 40,
  },
  actiontext: {
    margin: 0,
    padding: theme.spacing(0, 1),
    borderRadius: theme.spacing(1),
  },
  badgemargin: {
    margin: theme.spacing(0.25),
  },
  padding: {
    padding: theme.spacing(0, 2),
  },
  collapselist: {
    //borderLeft: '1px solid',
    //marginLeft: 11,
  },
  siblingaction: {
    marginBottom: theme.spacing(0.25),
    minWidth: 300,
  },
  elsetext: {   
    width: '100%',
    padding: theme.spacing(0),
    paddingLeft: theme.spacing(1),
    borderRadius: theme.spacing(1),
    textAlign: 'start',
    display: 'block',
    textTransform: 'none',
    color: theme.palette.primary.dark,
  },

}));


export default function ActionListView(props) {
    const resizeval = 'horizontal';//(props.resizeview && props.resizeview !== "") ? 'horizontal' : 'none';
    const displayval = 'block';//(props.resizeview && props.resizeview !== "") ? 'block' : 'none';
    const data = props.listdata;
    const actionlist = data.list;
    //console.log(data, "------------ ActionList ---------", actionlist);
    const appliedListH = (actionlist.length > 0) ? `calc(100% - 28px)` : '100%';
    
    const expandActions = props.expandstate;  
    
    const isActionFind = props.isActionFind;
    const selectedActionId = (props.isActionFind) ? ((props.selectedActionId) ? props.selectedActionId : "") : "";
    const [selectedAction, setSelectedAction] = React.useState(selectedActionId);
    React.useEffect(() => {
        setSelectedAction(selectedActionId);
        
        const el = document.getElementById('appliedactionlist');
        if(el && isActionFind) {
           const node = document.getElementById(selectedActionId);
            if(node) {
                //console.log(node, "node.scrollTop >>>>>", node.offsetTop, document.body.scrollTop);
                node.scrollIntoView(false);
            }
        }
    }, [selectedActionId, isActionFind])

    function getSelectedAction(_params, _set) {
        //console.log(_params, _set, "------------ getSelectedAction ---------", data);
        props.onNodeSelection(_params, _set);
        setSelectedEvent("");

        setSelectedAction(_set['id']);
    }

    const [selectedEvent, setSelectedEvent] = React.useState("");
    function getSelectedEvent(_level) {
        //console.log(selectedEvent, "------------ getSelectedEvent ---------", _level);
        setSelectedAction("");
        let _elselevel = false;
        if(_level.indexOf(".else") > -1) {
            const elseLI = _level.lastIndexOf(".else");
            //console.log(_level, "------------ getSelectedEvent ---------", elseLI, _level.length);
            if(elseLI === _level.length - 5) {
                _elselevel = true;
            }
        }
        if(!_elselevel) {
            let n = _level.lastIndexOf("_");
            setSelectedEvent(_level.substr(0,n));
        }else {
            setSelectedEvent(_level);
        }
        

        props.onActionEventSelection(_level);
    }

    function closeConditionEditor(condition, actionData) {
        //console.log(actionlist, "------------ closeConditionEditor ---------", condition, actionData);
        //props.onApplyCondition(condition, actionData);
    }

    const [checkedActionIds, setCheckedActionIds] = React.useState(props.allCheckedIds);
    React.useEffect(() => {
        setCheckedActionIds(props.allCheckedIds);
      }, [props.allCheckedIds])
    function handleCheckedAction(checkedAction) {
        const value = checkedAction['id'];
        //console.log(props.allCheckedIds, checkedActionIds, "------------ handleCheckedAction ---------", value);

        const newChecked = [...checkedActionIds];
        const currentIndex = checkedActionIds.indexOf(value);
        if(currentIndex === -1) {
            newChecked.push(value);
        }else {
            newChecked.splice(currentIndex, 1);
        }        
        setCheckedActionIds(newChecked);
        
        props.onCheckAction(newChecked);
    }
    
    const classes = useStyles();
    return (
      <div className={classes.root} style={{resize: resizeval, height: appliedListH}}>
        <List id="appliedactionlist"
            component="nav" dense={true}
            aria-labelledby="nested-list-subheader"
            className={classes.listroot}
        >
            {actionlist.map(item => (
                <ListBranch key={item.id} node={item} expandstate={expandActions} actions={actionlist} selectedAction={selectedAction} selectedEvent={selectedEvent} checkedActionIds={checkedActionIds}
                            onSelection={getSelectedAction} onEventSelect={getSelectedEvent} closeConditionEditor={closeConditionEditor} onCheckMainAction={handleCheckedAction}>
                </ListBranch>
            ))}         
        </List>
        <div className={classes.resizediv} style={{display: displayval}} />
      </div>
    );
}

function ListBranch(props) {  
    
    const _level = props.node.level;    
    const _arrlevel = [];
    for(let i = 0; i < _level; i++) {
        _arrlevel.push(i);
    }
    
    var onElseExist = false;
    var conditionExist = false;
    var onElseActionExist = false;
    const elseText = '<else>';

    const _text = props.node.title;    
    const _id = props.node.id;
    /* if(_id && _id.toString().indexOf('onelse') > -1){
        //onElseExist = true;
        let n = _id.toString().lastIndexOf(".");
        let res = _id.toString().substring(n);
        if(res.indexOf('onelse') > -1){
            onElseExist = true;
        }        
    }
    else{
        const _actionparam = props.node.action['params'];
        if(_actionparam.hasOwnProperty('condition')) {
            const _actioncond = _actionparam['condition'];
            let conditionGroupCase = _actioncond['groupcases'];
            if(conditionGroupCase.length > 0) {
                conditionExist = true;
            }
        }
        const _actionActions = props.node.action['actions'];
        const onElseActions = _actionActions['onElse'];
        if(onElseActions.length > 0)    onElseActionExist = true;
    } */

    if(_id && _id.toString().indexOf('onelse') > -1){
        //onElseExist = true;
        let n = _id.toString().lastIndexOf(".");
        let res = _id.toString().substring(n);
        if(res.indexOf('onelse') > -1){
            onElseExist = true;
        }        
    }

    if(!onElseExist){
        const _actionparam = props.node.action['params'];
        if(_actionparam.hasOwnProperty('condition')) {
            const _actioncond = _actionparam['condition'];
            let conditionGroupCase = _actioncond['groupcases'];
            if(conditionGroupCase && conditionGroupCase.length > 0) {
                const conditionCase = conditionGroupCase[0]['cases'];
                if(conditionCase && conditionCase.length > 0) {
                    conditionExist = true;
                }
            }
        }
        const _actionActions = props.node.action['actions'];
        const onElseActions = _actionActions['onElse'];
        if(onElseActions.length > 0)    onElseActionExist = true;
    }
    //console.log(_id, _text, " ....&&&&.... ", conditionExist, onElseExist, onElseActionExist); 

    const _subactions = props.node.subactions;
    const actionDetail = props.node.action;
    const subActions = actionDetail['actions'];
    //console.log(_id, _text, " ....&&&&.... ", props.node);
    var subactionsDetail = [];
    if(subActions) {        
        var subactionsExist = false;
        for (let i = 0; i < _subactions.length; i++) {
            const element = _subactions[i];
            const subactionData = subActions[element];
            if(subactionData.length > 0){
                subactionsExist = true;            
            }        
            subactionsDetail = setSubactionsDetail2(element, subactionData, subactionsDetail);
        }
        subactionsDetail = [];
        if(props.node.subactionsdata.length > 0) 
        {
            subactionsDetail = setSubactionsDetail(props.node.subactionsdata[0], subactionsDetail);
        }
        //console.log(_id, "&&&&&&&&&&&&", subactionsDetail);
        /* const onElseActions = subActions['onElse'];
        const successActions = subActions['success'];
        const errorActions = subActions['error'];
        console.log('subActions ***', onElseActions, ".......", successActions, ".......", errorActions); */
    }
    
    let conditionData = {};
    let condText = '+';
    const actionParam = actionDetail['params'];
    if(actionParam) {
        //console.log(actionDetail, "....actionParam...", actionParam);
        conditionData = actionParam['condition']['groupcases'];
        //condText = (conditionData.length === 0) ? '+' : 'c';
        condText = (conditionExist) ? 'c' : '+';

    }

    const [elseId, setElseId] = React.useState("");
    function elseEventClick() {
        let elseEventlevel = props.node['id'] + '.else';
        //console.log("..... elseEventlevel ......", elseEventlevel);
        props.onEventSelect(elseEventlevel);

        setElseId(elseEventlevel);
    }

    
    function handleEventClick(actionEventlevel) {
        //console.log("..... actionEventlevel ......", actionEventlevel);
        props.onEventSelect(actionEventlevel);
    }

    function handleSelection(e) {
        let _dataset = e.currentTarget.dataset;
        //console.log(actionParam, _dataset.id + " >> action level is: " + _dataset.level);
        //console.log(_dataset, props.selectedAction," ... handle Action Selection >>  ", props.node.id);
        
        props.onSelection(actionParam, _dataset);
    }    
    
    const expandActions = props.expandstate;
    const [expand, setActionExpand] = React.useState(props.expandstate);
    React.useEffect(() => {
        setActionExpand(props.expandstate);
    }, [props.expandstate])

    function handleActionExpand(e) {
        setActionExpand(!expand);
    }

    //////////////////////////////////////////////
    const [showCond, setShowCondition] = React.useState(false);
    const [conditionId, setConditionId] = React.useState("0");
    const [conditionArr, setConditionArr] = React.useState([]);
    const [actionData, setActionData] = React.useState([]);

    function handleConditionEditorOpen(e) {
        //const prevActionData = JSON.parse(JSON.stringify(props.actions));
        const prevActionData = [];  //Object.assign({}, props.actions);
        setActionData(prevActionData);

        let _dataset = e.currentTarget.dataset;
        //console.log(props.actions, props.node.action, conditionArr, " ...", _dataset.id + " >> condition Id is: " + conditionId);        
        setConditionId(_dataset.id);
        
        //console.log(" ...open ## handleConditionEditor... ", props.node.action, conditionData);
        setShowCondition(true);
    }
    function handleConditionEditorClose(_data) {        
        setShowCondition(false);

        if(_data) {
            conditionData = _data;
            
            if(_data.length > 0) {
                if(props.node.action['params']['condition']['groupcases']) {
                    const _groupCases = props.node.action['params']['condition']['groupcases'];
                    if(_groupCases[0]['cases'] && _groupCases[0]['cases'].length === 0) {
                        _groupCases[0]['cases'] = _data[0]['cases'];
                    }
                };
            }else {
                if(props.node.action['params']['condition']['groupcases']) {
                    props.node.action['params']['condition']['groupcases'] = [];
                }
            }
            
            //console.log(conditionId, conditionArr, " ...close ## handleConditionEditor... ", props.node.action, conditionData);
            setConditionArrData(conditionArr, conditionId, _data, actionData); 
            /* if(isNaN(conditionId)) {
                setCondition_toActualActions(conditionId, conditionData);
            } */
        }
    }
    function setConditionArrData(conditionArr, conditionId, condData, actiondata) {
        let condexist = false;
        const condArr = conditionArr;
        condArr.forEach(condition => {
            if(condition['id'] === conditionId) {
                condexist = true;
                condition['conditions'] = condData;
            }            
        });
        if(!condexist) {
            const condObj = {id: conditionId, conditions: condData};
            condArr.push(condObj);
        }
        setConditionArr(condArr);

        props.closeConditionEditor(condArr, actiondata);
    }

    /* function setCondition_toActualActions(conditionId, conditionData) {
        console.log(conditionId, " ...close ## handleConditionEditor... ", props.actions, props.node); 

        let selectedAction;

        let appliedActionList = props.actions;
        let arrSelectedId = conditionId.split('.');

        let appliedAction;
        for (let index = 0; index < arrSelectedId.length; index++) {
          const elementId = arrSelectedId[index];
          if(!isNaN(parseInt(elementId))) {
            if(elementId.indexOf('onelse') > -1) {  
              const _id = parseInt(elementId); 
              console.log(elementId, _id, "... >> appliedActionList >>>", appliedActionList);
              appliedAction = appliedActionList[_id]['action']['actions']['onElse'][0];
            }else {
              appliedAction = appliedActionList[elementId]['action'];
            } 
          }else {
            let actionEventName = elementId.split('_')[0];
            let actionEventIndex = elementId.split('_')[1];
            console.log(appliedAction, "***********", arrSelectedId, "####", index, actionEventName, actionEventIndex);
            let actionEvent = appliedAction['actions'][actionEventName];
            if(index === arrSelectedId.length-1) {
              if(elementId.indexOf('onelse') > -1) {              
                if(actionEvent[actionEventIndex] && actionEvent[actionEventIndex]['actions']) {
                  selectedAction = actionEvent[actionEventIndex]['action']['actions']['onElse'];
                }
              }else {
                selectedAction =  actionEvent[actionEventIndex];
              }
            }else {
              appliedAction = actionEvent[actionEventIndex];
              if(elementId.indexOf('onelse') > -1) {               
                appliedAction = appliedAction['actions']['onElse'][0];
              } 
            }            
          }          
        }

        if(selectedAction) {
            selectedAction['params']['condition']['groupcases'] = conditionData;
        }

    } */

    function handleCheckMainAction() {
        //console.log("kMainAction >>>>>", props.node);
        const actionSet = {id:props.node['id'], level:'0', name:props.node['name'], type:props.node['type']};
        props.onCheckMainAction(actionSet);
    }


    const classes = useStyles();
    return (
        <div className={classes.siblingaction}>
            <div className={classes.halign} id={props.node.id}>
                {(_level !== undefined && _level > -1) &&
                    <div className={classes.halign}>
                        {!isNaN(props.node.id) && 
                            <Checkbox color="default" style={{padding:0}} disableRipple checked={props.checkedActionIds.indexOf(props.node['id']) !== -1}
                                      onChange={handleCheckMainAction}></Checkbox>
                        }
                        {_arrlevel.map(index => (                                            
                            <div key={index} className={classes.hspacer}/>
                        ))}
                    </div>
                }
                {(onElseExist && _text.length > 0) && 
                    <ListItemText className={classes.subactiontext} primary={'<else>'} />
                }
                {(!onElseExist) &&
                    <div style={{display:'flex', cursor:'pointer'}} onClick={handleConditionEditorOpen}>
                        <IconButton className={classes.iconbtn} data-id={props.node.id}>
                            <SvgIcon>
                                <path d="M0 0h24v24H0z" fill="none"/><polygon points="0 12 12 0 24 12 12 24 0 12" stroke="black" strokeWidth="1"/>
                            </SvgIcon>
                        </IconButton>
                        <Typography className={classes.condlabel}>{condText}</Typography>
                    </div>
                }
                {(_text.length > 0) &&
                    <ActionListItem button data-id={props.node.id} data-level={props.node.level} data-name={props.node.method} data-type={props.node.type} onClick={handleSelection}> 
                        <ListItemText className={classes.actiontext} primary={_text} style={(props.selectedAction === props.node.id +'') ? {backgroundColor:"1ba9f8"} : {backgroundColor:""}}/>
                    </ActionListItem>
                }                
                {(_text.length > 0 && subactionsExist) && 
                    <IconButton className={classes.iconbtn} onClick={handleActionExpand}>
                        {expand ? <ExpandLessEnabled/> : <ExpandMoreEnabled/>}
                    </IconButton>
                }
                {(_text.length > 0 && !subactionsExist) && 
                    <IconButton className={classes.iconbtn} onClick={handleActionExpand}>
                        {expand ? <ExpandLessDisabled/> : <ExpandMoreDisabled/>}
                    </IconButton>
                }
                
            </div>
            {(_level !== undefined && _level > -1) &&
                <Collapse in={expand} timeout="auto" unmountOnExit>
                    <List dense={true} component="div" disablePadding className={classes.collapselist}>
                        {subactionsDetail.map((subaction, index) => (
                            <div id="subactionitem" className={classes.subactionitem} key={index}>
                                <SubactionList subactionsExist={subactionsExist} expandstate={expandActions} nodeid={props.node.id} selectedAction={props.selectedAction} selectedEvent={props.selectedEvent}
                                               detail={subaction} conditionData={conditionData} actions={props.actions}
                                               onEventClick={handleEventClick} onSelection={props.onSelection} closeConditionEditor={props.closeConditionEditor}/>
                            </div>                        
                        ))}
                    </List>
                </Collapse>                                
            }
            {(conditionExist && !onElseActionExist) &&
                <Button className={classes.elsetext} onClick={elseEventClick} style={(elseId !== "" && props.selectedEvent === elseId) ? {backgroundColor:"1ba9f8"} : {backgroundColor:""}} >
                    {elseText}
                </Button>
            }
            {showCond && 
                <ConditionEditor show={showCond} data={conditionData} elseExist={onElseActionExist} onCloseConditionEditor={handleConditionEditorClose} />
            } 
        </div>        
    );
}

function SubactionList(props) {
    
    const expandSubActions = props.expandstate;
    const subaction = props.detail;
    const actiondata = subaction['data'];//(subaction.name === "onElse") ? [subaction.data] : subaction['data'];
    //console.log(props.nodeid, ".....", subaction, " >>>>>SubactionList>>>>>>", actiondata);
    
    let nonelseActions = actiondata.filter(function(item) {
        /* if(item.id.indexOf('onelse') === -1) {
            return true;
        }
        return false; */
        return true;
    });
    const subactionsCount = nonelseActions.length;
    //const subactionsExist = props.subactionsExist;
    
    const selectedEvent = props.selectedEvent;
    function onActionEventClick(e) {
        if(typeof e === 'string') {
            props.onEventClick(e);      //<<-- some kind of HOTFIX, need to debug
        }else {
            let actionEventlevel = props.nodeid +'.'+ subaction.name +'_'+ subactionsCount;
            //console.log(e, typeof e, ".....SubactionList actionEventlevel ......", actionEventlevel);
            props.onEventClick(actionEventlevel);
        }        
    }
    
    function onSubactionSelect(actionParams, actionset) {
        //console.log(actionParams, " >>>>>>>>>SubactionList>>>>>onSubactionSelect>>>>", actionset);  
        props.onSelection(actionParams, actionset);  
    }

    function closeConditionEditor(actionParams, actionData) {
        //console.log(actiondata, "..... >SubactionList >>>>> closeConditionEditor ..........", props.conditionData);  
        props.closeConditionEditor(actionParams, actionData);  
    }

    const [open, setOpen] = React.useState(expandSubActions);
    function onExpandCollapseActions(e) {
        setOpen(!open);
    }
    

    const classes = useStyles();
    return (
        <div>
            <div className={classes.halign} style={{width:'100%'}}>
                <SubactionListItem button onClick={onActionEventClick}>
                    <ListItemText name={props.nodeid +'.'+ subaction.name} className={classes.subactiontext} primary={'<'+getSubActionText(subaction.name)+'>'}
                                  style={(selectedEvent === props.nodeid +'.'+ subaction.name) ? {backgroundColor:"1ba9f8"} : {backgroundColor:""}} />
                </SubactionListItem>                
                <StyledBadge color="primary" invisible={false} badgeContent={subactionsCount} className={classes.badgemargin}>
                    <Typography></Typography>
                </StyledBadge>                
                {(subactionsCount === 0) && 
                    <IconButton className={classes.iconempty} />
                }
                {(subactionsCount > 0) && 
                    <IconButton className={classes.iconbtn} onClick={onExpandCollapseActions}>
                        {open ? <ExpandLessEnabled/> : <ExpandMoreEnabled/>}
                    </IconButton>
                }
            </div>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <List dense={true} component="div" disablePadding>
                    {actiondata.map(child => (                                            
                        <ListBranch id="childitem" key={child.id} node={child} data-item={child} expandstate={expandSubActions} actions={props.actions} selectedAction={props.selectedAction} selectedEvent={props.selectedEvent} 
                                    onSelection={onSubactionSelect} onEventSelect={onActionEventClick} closeConditionEditor={closeConditionEditor}/>
                    ))}                    
                </List>
            </Collapse>
        </div>
        
    );
}

/* function generateActionList(actionlist){
    let actionArray = [];
    for (let index = 0; index < actionlist.length; index++) {        
        const actionObj = actionlist[index];
        console.log("------------ generateActionList ---------", actionObj);
        actionArray.push(actionObj);

        const subAction = actionObj['action']['actions'];
        const onElseAction = subAction['onElse'];
        if(onElseAction.length === 0){
            const onelseDic = onElseAction[0];
            //title:action[0].text, subactions:subactionsList 
            actionArray.push({level:actionObj['level'], id:actionObj['id']+'_onelse', method:onelseDic.method, category:onelseDic.category, type:onelseDic.type, action:onelseDic});
        }
        
    } 

    return actionArray;
} */

function setSubactionsDetail2(subaction, actiondata, subactionArray){
    let actionObj = {name:subaction, data:actiondata};
    subactionArray.push(actionObj);

    return subactionArray;
}

function setSubactionsDetail(subactionData, subactionArray){
    for (const key in subactionData) {
        if (subactionData.hasOwnProperty(key)) {
            let actionObj = {name:key, data:subactionData[key]};
            subactionArray.push(actionObj);
        }
    }    

    return subactionArray;
}

function getSubActionText(eventName) {

    let eventtext = ['success', 'error'];
    switch (eventName) {
        case "success":
            eventtext = "Success";
        break;
        case "error":
            eventtext = "Error";
        break;
        case "detectRecords":
            eventtext = "Detect Records";
        break;
        case "onTapOk":
            eventtext = "On Tap OK";
        break;
        case "onTapCancel":
            eventtext = "On Tap Cancel";
        break;
        case "onClose":
            eventtext = "On Close";
        break;
        default:
            eventtext = eventName;
        break;
    }
    return eventtext;
 }

/* ******************  custom components **************** */

const ActionListItem = withStyles(theme => ({
    root: {
        height: 22,
        maxHeight: 24,
        border: '1px solid',
        borderRadius: theme.spacing(1),
        marginLeft: theme.spacing(0.5),
        padding: theme.spacing(0),
        '&:focus': {
            background: theme.palette.background.hover,
            '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
                color: theme.palette.common.white,
            },
        },
        /* '&:hover': {
            backgroundColor: "#65de45",
            '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
              color: theme.palette.common.white,
            },
        }, */        
    },
    selected: {}
}))(ListItem);

const SubactionListItem = withStyles(theme => ({
    root: {
        width: '100%',//`calc(100% - 64px)`,
        maxHeight: 24,
        //left: 36,
        padding: theme.spacing(0),
        borderRadius: theme.spacing(1),    
        /* '&:focus': {
            backgroundColor: theme.palette.common.white,
            '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
                color: theme.palette.primary.main,
            },
        },
        '&:hover': {
            backgroundColor: theme.palette.common.white,
            '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
              color: theme.palette.primary.main,
            },
        }, */            
    },
    selected: {}
}))(ListItem);

/* const StyledListItemText = withStyles(theme => ({
    root: {
        //border: "1px solid rgb(212, 0, 0)",
        maxHeight: 24,
        paddingLeft: 4,
        '&:focus': {
            backgroundColor: "#65bc45",
            '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
                color: theme.palette.common.white,
            },
        },
        '&:hover': {
            backgroundColor: "#65de45",
            '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
              color: theme.palette.common.white,
            },
        },        
    },
    selected: {}
}))(ListItemText); */

const StyledBadge = withStyles(theme => ({
    badge: {
      top: '50%',
      right: 24,
      // The border color match the background color.
      border: `1px solid ${
        theme.palette.type === 'light' ? theme.palette.common.white : theme.palette.common.black
      }`,
    },
  }))(Badge);
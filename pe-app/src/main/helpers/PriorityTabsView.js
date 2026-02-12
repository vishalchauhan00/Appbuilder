import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Typography, List } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import AlertWindow from '../../components/AlertWindow';

const useStyles = makeStyles(theme => ({
  root: {
    //flexGrow: 1,
  },
  content: {
    background: theme.palette.background.default,
    padding: 0
  },
  editorheading: {
    background: theme.palette.background.paper,
    color: theme.palette.text.primary,
    fontSize: '1rem',
    fontWeight: 'bold',
    padding: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    marginTop: '-20px'  // since 'DialogContent' has padding top as 20 px for first child
  },
  editornote: {
    background: theme.palette.background.default,
    color: theme.palette.text.secondary,
    fontSize: '0.825rem',
    padding: theme.spacing(0.5, 1.5)
  },
  editorbtn: {
    textTransform: 'none',
    margin: theme.spacing(1),
  },
  tablist: {
    maxHeight: 250,
    overflow: 'hidden auto',
    padding: '8px 24px', 
    borderBottom: '1px solid rgba(221,221,221,1)'
  },
  tabnamediv: {
    height: 32,
    display: 'flex',
    alignItems: 'center'
  },
  tabcheck: {
    width: 18,
    height: 18,
    marginRight: 12
  },
  actions: {
    display: 'flex', 
    justifyContent: 'center',
    background: theme.palette.background.paper,
  }

}));

export default function PriorityTabsView(props) {

  const [open, setOpen] = React.useState(true);
  const [alertMsg, setAlertMsg] = React.useState("");
  const [openAlert, setOpenAlert] = React.useState(false);
  const [confirmMsg, setConfirmMsg] = React.useState("");
  const [openConfirm, setOpenConfirm] = React.useState(false);

  const [tabchecked, setTabChecked] = React.useState(props.appdata['priorityTabs']);

  function handleClose() {
    setOpen(false);
    props.onCloseEditor();
  }

  function handleCancelUpdate() {
    setOpen(false);
    props.onCloseEditor();
  }  
  
  function handleTabValueChange(value) {    
    const currentIndex = tabchecked.indexOf(value);
    const newChecked = [...tabchecked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setTabChecked(newChecked);
  }

  function handleSubmitUpdate() {
    if(tabchecked.length > 15){
      setAlertMsg("Maximum 15 modules can be selected.");
      setOpenAlert(true);
      return;
    }

    if(tabchecked.length === 0 ){
      setConfirmMsg("No module set as priority.");
    }else{
      setConfirmMsg("These module(s) will be set as priority.");
    }
    setOpenConfirm(true);
  }

  function confirmOKHandler() {

    props.onUpdatePriorityTabs(tabchecked);

    setOpenConfirm(false); 
    setOpen(false);
  }

  function confirmCloseHandler() {
    setOpenConfirm(false);    
  }

  function alertOKHandler() {
    setAlertMsg("");
    setOpenAlert(false);
  }

  const classes = useStyles();

  return (
    
    <Dialog open={open} fullWidth={true} maxWidth="sm" disableBackdropClick onClose={handleClose} >
      <DialogContent className={classes.content}>
        <Typography component="div" className={classes.editorheading} >Set Modules Priority</Typography>
        <Typography component="div" className={classes.editornote} >Check modules which needed to load on app launch/relaunch.</Typography>
        <Typography component="div" className={classes.editornote} style={{paddingTop:0}} >Note: Maximum 15 modules can be set.</Typography>
        <List component="nav" dense={true} className={classes.tablist} >
          {getTabages(props.pagelist).map((page, index) => (
            <div key={index} className={classes.tabnamediv}>
              <div className="horizontal-align">
                <input id={page.pageid} type='checkbox' className={classes.tabcheck}
                       checked={getCheckedValue(tabchecked,index)}
                       onChange={() => handleTabValueChange((index+1).toString())}/>
                <Typography variant="body1" >{page.Title}</Typography>
              </div>
              <Typography variant="body2" style={{width:72, display:'none'}} >Tab {(index+1)}</Typography>
            </div>
          ))}
        </List>
        <div className={classes.actions}>
          <Button variant="contained" color="default" className={classes.editorbtn} onClick={handleCancelUpdate}>
            Cancel 
          </Button>
          <Button variant="contained" color="primary" className={classes.editorbtn} onClick={handleSubmitUpdate}>
            Submit
          </Button>
        </div>
        {openAlert === true && 
          <AlertWindow open={true} title="" message={alertMsg}
                      ok="OK" okclick={alertOKHandler}
                      cancel="" cancelclick={confirmCloseHandler}
          />
        }
        {openConfirm === true && 
          <AlertWindow open={true} title="" message={confirmMsg}
                      ok="OK" okclick={confirmOKHandler}
                      cancel="No, Cancel" cancelclick={confirmCloseHandler}
          />
        }
      </DialogContent>
    </Dialog>
  );

  function getTabages(pagelist) {
    let tabpageList = pagelist.filter(function(page) {
      return page['parentid'] === 'App';
    });  
    if(tabpageList.length > 0) {
      return tabpageList;
    }
    return [];
  }

  function getCheckedValue(tabchecked, index){
    const ischecked = (tabchecked.indexOf((index+1).toString()) !== -1) ? true : false;
    return ischecked;
  }

}

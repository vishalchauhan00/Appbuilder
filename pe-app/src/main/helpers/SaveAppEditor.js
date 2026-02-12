import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Paper, Typography } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';

const useStyles = makeStyles(theme => ({
  root: {
    //flexGrow: 1,
  },
  freezepaper: {
    width: 400,
    borderRadius: 8,
    textAlign: 'center'
  },
  helptext: {
    textAlign: 'start',
    margin: theme.spacing(0.5),
    padding: theme.spacing(1.5, 1),
    color: theme.palette.common.white,
    backgroundColor: theme.palette.grey[600],
    border: '2px solid rgb(227,227,227)',
    borderRadius: 8,
  },
  msgtext: {
    textAlign: 'start',
    margin: theme.spacing(0.5),
    padding: theme.spacing(1.5, 1),
    color: theme.palette.common.black,
    border: '2px solid rgb(227,0,0)',
    borderRadius: 8,
    whiteSpace: 'pre-wrap',
  },
  btn: {
    textTransform: 'none',
    margin: theme.spacing(1),
  },

}));

export default function SaveAppEditor(props) {
  const [open, setOpen] = React.useState(true);
  const [issaveComplete, saveComplete] = React.useState(false); 
  const [message, setMessage] = React.useState(""); 

  function handleSaveApp() {
    fetchContributorsData().then(
      result => { 
          if(result.response !== "ACK"){
              var _err = {message: result.error};
              console.log("project_contributors NotACK >>", _err);
          }else {
              const _contributors = result['Contributors'];
              if(_contributors) {
                 /*const _ownerName = projectdata['owner'];
                 let contributorObj =  _contributors.filter(function(node) {
                      if(node.contributorName === _ownerName){
                          return node;
                      }
                      return node.contributorName === _ownerName;
                  });
                  if(contributorObj.length > 0) {
                      const contributorPages = contributorObj[0]['selectTabPages'];
                      if(contributorPages.length === 0){
                          const selectedTabModule = props.selectedData['selectedTabs'];
                          if(selectedTabModule && selectedTabModule.length > 0) {
                              if(selectedTabModule[0] !== 'none') {
                                  //setErrorMessage("Contributor's selected pages already released. Thereafter changes will be discarded during merge.");
                                  //setErrorDisplay(true);
                                  projectdata['Contributors'] = result['Contributors'];
                              }
                          }
                      }else{
                          updateContributorsData(result['Contributors']);
                      }
                  }*/
                  updateContributorsData(result['Contributors']);
                  saveAppData();
              }
          }
      }
    );        
  }

  function fetchContributorsData() {
    let _fetchContributorsData = props.appconfig.apiURL+"project_contributors.json?project_id="+props.appconfig.projectid;
    return fetch(_fetchContributorsData)
        .then(res => res.json())
        .then(
            (result) => {                    
                return result;
            },
            (error) => {
                return {"response":"ERROR", "error": error['message']};
            }
        )
  }
  function updateContributorsData(resultData){
    const projectdata = props.data;
    let prjContributors = projectdata['Contributors'];
    for(let i=0; i<prjContributors.length; i++){
        if(prjContributors[i]['contributorName'] === projectdata['owner']){
            continue;
        }
        const resultObj = resultData.find(({ contributorName }) => contributorName === prjContributors[i]['contributorName']);
        if(resultObj){
            prjContributors[i] = resultObj;
        }
    }
  }

  function saveAppData() {
    const projectdata = props.data;
    projectdata.isPreview = "1";
    projectdata.isPublish = "0";
    projectdata['isFreeze'] = "1";

    var formData = new FormData();
    formData.append("command", "projectupdate");
    formData.append("userid", props.appconfig.userid);
    formData.append("sessionid", props.appconfig.sessionid);
    formData.append("projectid", props.appconfig.projectid);

    var prjctData = encodeURIComponent(JSON.stringify(projectdata));
    let text = new File([prjctData], "updateProject.txt", {type: "text/plain"});
    formData.append("file", text);

    fetch(props.appconfig.apiURL+"multipartservice.json", {
        method: 'POST',
        body: formData
    })
    .then((response) => response.json())
    .then((result) => {       
        if(result.response === "NACK"){
            const errormsg = result.error;
            if(typeof(errormsg) === "string" && errormsg.indexOf('Invalid sessionid') > -1) {
              saveComplete(true);
              setMessage(errormsg + "\n\nPlease close this browser tab & re-open it from console again.");
            }
        }
        else{  
          saveComplete(true);
          setMessage("Please close this browser tab & re-open it from console again.");
        }
    })
    .catch((error) => {
        saveComplete(true);
        setMessage("Something went wrong. Please check Server/Internet connection. \n\nPlease close this browser tab & re-open it from console again.");
    });
  }

  function handleClose() {
    setOpen(false);
  }

  const classes = useStyles();

  return (
    
    <Dialog open={open} onClose={handleClose} disableBackdropClick disableEscapeKeyDown >
        <DialogContent style={{padding:0}}>
            {issaveComplete && 
              <Typography variant="body2" gutterBottom className={classes.msgtext}>
                {message}
              </Typography>
            }
            {!issaveComplete && 
              <Paper elevation={3} className={classes.freezepaper} >
                  <Typography variant="body2" gutterBottom className={classes.helptext} >
                    It is recommended to save the app-data further to avoid any un-expected scenarios.
                  </Typography>
                  <Button variant="contained" className={classes.btn} onClick={handleSaveApp}>
                    OK, Do it
                  </Button>
              </Paper>
            }
        </DialogContent>
      </Dialog>
  );
}

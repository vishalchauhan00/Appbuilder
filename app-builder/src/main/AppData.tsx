import React from 'react';
import { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { useAppStore } from '../store/appDataStore';
import { usePageAssets, useUIAssets, useActionAssets } from '../hooks/useAppAssets';
import { Button, Dialog, DialogContent, Paper, Typography } from '@mui/material';
import type { AppConfig, AppCredentials } from '../types/index';

const AppData: React.FC = () => {
  const { credentials, config, projectData } = useAppStore();
  const apiParam = Object.assign({}, credentials, config);

  const [isFreeze, setFreeze] = useState(false);

  if(projectData){
    //console.info('projectData:', projectData);

    useEffect(() => {
      if (projectData['isFreeze'] === "0") {
        setFreeze(true);
      }else{
         setFreeze(false);
      }
    }, [isFreeze]);    
  } 

  if(credentials){
    const lang:string = credentials['locale'] ?? 'en';
    usePageAssets(lang);
    useUIAssets(lang);
    useActionAssets(lang);
  }

  if (isFreeze) {
    return <SaveAppEditor appconfig={apiParam} data={projectData} />
  }

  return (
    <></>
  );

};

interface SaveAppEditorProps {
  appconfig: AppConfig & AppCredentials;
  data: Record<string, any> | null;
}

const SaveAppEditor: React.FC<SaveAppEditorProps> = ({ appconfig, data }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(true);
  const [issaveComplete, saveComplete] = useState(false); 
  const [message, setMessage] = useState(""); 

  const freezepaper: React.CSSProperties = {
    width: 400,
    borderRadius: 8,
    textAlign: 'center'
  };
  const helptext: React.CSSProperties = {
    textAlign: 'start',
    margin: theme.spacing(0.5),
    padding: theme.spacing(1.5, 1),
    color: theme.palette.common.black,
    border: '2px solid rgb(227,227,227)',
    borderRadius: 8,
  };
  const msgtext: React.CSSProperties = {
    textAlign: 'start',
    margin: theme.spacing(0.5),
    padding: theme.spacing(1.5, 1),
    color: theme.palette.common.black,
    border: '2px solid rgb(227,0,0)',
    borderRadius: 8,
    whiteSpace: 'pre-wrap',
  };
  const btn: React.CSSProperties = {
    height: 32,
    textTransform: 'none',
    margin: theme.spacing(1),
  };

  function handleSaveApp() {
    fetchContributorsData().then(
      result => { 
          if(result.response !== "ACK"){
              var _err = {message: result.error};
              console.error("project_contributors NotACK >>", _err);
          }else {
              const _contributors = result['Contributors'];
              if(_contributors) {
                updateContributorsData(result['Contributors']);
                saveAppData();
              }
          }
      }
    );        
  }

  function fetchContributorsData() {
    let _fetchContributorsData = appconfig.apiURL+"project_contributors.json?project_id="+appconfig.projectid;
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
  function updateContributorsData(resultData:any[]){
    const projectdata = data ?? {};
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
    const projectdata = data ?? {};
    projectdata.isPreview = "1";
    projectdata.isPublish = "0";
    projectdata['isFreeze'] = "1";

    var formData = new FormData();
    formData.append("command", "projectupdate");
    formData.append("userid", appconfig.userid);
    formData.append("sessionid", appconfig.sessionid);
    formData.append("projectid", appconfig.projectid);

    var prjctData = encodeURIComponent(JSON.stringify(projectdata));
    let text = new File([prjctData], "updateProject.txt", {type: "text/plain"});
    formData.append("file", text);

    fetch(appconfig.apiURL+"multipartservice.json", {
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
        console.error('Error fetching getProjectData:', error);
        saveComplete(true);
        setMessage("Something went wrong. Please check Server/Internet connection. \n\nPlease close this browser tab & re-open it from console again.");
    });
  }

  function handleClose() {
    setOpen(false);
  }

  return (      
      <Dialog open={open} onClose={handleClose} disableEscapeKeyDown >
        <DialogContent style={{padding:0}}>
            {issaveComplete && 
              <Typography variant="body2" gutterBottom style={msgtext}>
                {message}
              </Typography>
            }
            {!issaveComplete && 
              <Paper elevation={3} style={freezepaper} >
                  <Typography variant="body2" gutterBottom style={helptext} >
                    It is recommended to save the app-data further to avoid any un-expected scenarios.
                  </Typography>
                  <Button variant="contained" style={btn} onClick={handleSaveApp}>
                    OK, Do it
                  </Button>
              </Paper>
            }
        </DialogContent>
      </Dialog>
    );

}

export default AppData;
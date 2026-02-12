import { useEffect, useState } from 'react';
import { useAppStore } from '../store/appDataStore';
import type { AppConfig, AppCredentials, ScreenDic, TableDic, ContributorDic } from '../types/index';

export function useInitConfig() {
  const [isReady, setIsReady] = useState(false);
  const { setError, setConfig, setCredentials } = useAppStore();

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const config = await fetchConfig();
        if (isMounted && config) {
          setConfig(config);
          const creds = getURLCredential();
          if (creds?.projectid) {
            if (!creds.sessionid) {
              const sessionid = await getSessionId(config.apiURL, creds.userid, creds.projectid);
              setCredentials({ ...creds, sessionid });
            } else {
              setCredentials(creds);
            }
            setIsReady(true);
          }
        }
      } catch (err) {
        if (isMounted) setError(err as Error);
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  return { isConfigReady: isReady };
}

async function fetchConfig() {
    const res = await fetch('././config/builder.xml');
    const xml = await res.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, 'text/xml');

    const hostname = xmlDoc.getElementsByTagName('server')[0]?.textContent || '';
    const port = xmlDoc.getElementsByTagName('port')[0]?.textContent || '';
    const version = xmlDoc.getElementsByTagName('version')[0]?.textContent || '';
    const apiURL = `https://${hostname}:${port}/appexe/api/`;

    return { hostname, port, version, apiURL };
}

function getURLCredential() {
    //const strURL = window.location.href;
    const strURL = "https://stagemultideveloper01.mobilous.com/builder/5.0/index.html?userid=stagertdevappexe5&projectid=2590";
    //const strURL = "https://mobiloustesting10.mobilous.com/builder/5.0/index.html?userid=mobiloustester61&projectid=30329&lang=en&newconsole=true";
    const searchString = strURL.split('?')[1];
    
    const assoc: Record<string, string> = {};
    if (searchString) {
        const pairs = searchString.split('&');
        for (const pair of pairs) {
        const [key, val] = pair.split('=');
        assoc[key] = val;
        }
    }

    return {
        userid: assoc['userid'],
        sessionid: assoc['sessionid'],
        projectid: assoc['projectid'],
        locale: assoc['lang'],
    };
}

async function getSessionId(apiURL: string, userid: string, projectid: string): Promise<string> {
  const url = `${apiURL}getUser.json?projectid=${projectid}&userid=${userid}`;
  const res = await fetch(url);
  const data = await res.json();
  console.info("data >>> ", data);

  if (data.response === 'NACK') throw new Error('Invalid user');
  return data.s_id;
}

////////////////////// Project Data Init ////////////////////// 

export function useInitProject(isConfigReady: boolean, config: AppConfig | null, credentials: AppCredentials | null) {
  const { setError, setLoadProject, setProjectData, setContributorTabs } = useAppStore();

  useEffect(() => {
    if (!isConfigReady || !config || !credentials) return;

    const getProjectData = async () => {
      try {
        const projectDic = await fetchProjectDic();
        if (projectDic) {
          const data = await fetchProjectData(projectDic, config, credentials);
          if (data.response === 'NACK'){
            throw new Error('Invalid Project');

          }else{
            
            if (data){
              const project = data['project'];
              if(project && project.hasOwnProperty('owner')) {
                if(project['owner'] !== credentials.userid) {
                  throw new Error('Try loading a project which do not belongs to this user');
                  return;
                }
              }

              let projectData = Object.assign({}, projectDic, project);
              if(projectData['TableDefs'] && projectDic['TableDefs'].length === 0) {
                projectData['TableDefs'] = projectDic['TableDefs'];
              }
              projectData = manageProjectData(projectData);

              if(projectDic.hasOwnProperty("Contributors")) {
                const contributors:ContributorDic[] = projectDic['Contributors'];
                if(contributors.length > 1) {      
                    let contributorObj:ContributorDic[] = contributors.filter(function(node) {
                      if(node['contributorName'] === projectDic['owner'] && node['contributorProjectid'] === projectDic['projectid']){
                        return true;
                      }
                      return false;
                    });  
                    if(contributorObj.length > 0) {
                      const contributorTabs = contributorObj[0]['selectTabPages'];
                      //console.log("...selectTabPages >>>", contributorTabs);
                      const _tabs = [...new Set(contributorTabs)];
                      if(_tabs.length === 0) {
                        setContributorTabs(['none']);
                      }else {
                        let arrTabs = _tabs.filter(function(node) {
                          if(node !== 'none'){
                            return true;
                          }
                          return false;
                        }); 
                        
                        setContributorTabs(arrTabs);
                        contributorObj[0]['selectTabPages'] = arrTabs;
                      }             
                    }
                  }else{
                    if(contributors.length === 0) {
                      contributors.push({"contributorName": "", "contributorProjectid": "", "description": "", "mainProjectid": "", "owner": "", "selectTabPages": [] });
                    }
                  }
              }

              setProjectData(projectData);
              setLoadProject(true);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching getProjectData:', err);
        setError(err as Error);
      }
    };

    getProjectData();
    
  }, [isConfigReady]);
}

async function fetchProjectDic() {
  try {
    const response = await fetch('././config/ProjectDic.json');
    const projectdic = await response.json();

    return projectdic.Project[0];

  } catch (err) {
    console.error('Error fetching projectdic:', err);
  }
}

async function fetchProjectData(_projectDic: any, config: any, credentials: any) {  
  try {
    if (!config || !credentials) return null;

    const projectgetAPI = config.apiURL+"service.json?command=projectget&userid="+credentials.userid+"&sessionid="+credentials.sessionid+"&projectid="+credentials.projectid;
    const response = await fetch(projectgetAPI);
    const projectdata = await response.json();

    return projectdata;

  } catch (err) {
    console.error('Error fetching projectdata:', err);
  }
}

function manageProjectData(projectDic:any) {
    if(projectDic.hasOwnProperty('availableScreens')) {
      manageAvailableScreens(projectDic['availableScreens']);
    }    
    if(projectDic.hasOwnProperty('TableDefs')) {
      manageLocalTableDefs(projectDic['TableDefs']);
    }
    if(projectDic.hasOwnProperty('RemoteTableDefs')) {
      manageRemoteTableDefs(projectDic['RemoteTableDefs']);
      //updateProjectData(propObj, projectDic, "TableDefs,RemoteTableDefs", false);
    }
    if(projectDic.hasOwnProperty('customActions')) {
      const _customActions = projectDic['customActions'];
      if(!_customActions.hasOwnProperty('helper')) {
        projectDic['customActions'] = {"helper":[]};
      }
    }
    
    return projectDic;
  }
  function manageAvailableScreens(screenDefs: ScreenDic[]) {
    screenDefs.forEach((screenDef:ScreenDic) => {
      if(screenDef['orientation'] === "Landscape" && (screenDef.width < screenDef.height)) {
        const screenClone = JSON.parse(JSON.stringify(screenDef));
        screenDef.width = parseInt(screenClone['height']);
        screenDef.height = parseInt(screenClone['width']);
      }
    });
  }
  function manageLocalTableDefs(localTableDefs: TableDic[]) {
    //console.log("...Project Data TableDefs >>>", localTableDefs);
    if(!localTableDefs) {
      localTableDefs = [];
    }

    localTableDefs.forEach((tableDef:TableDic) => {
      tableDef['servicename'] = "";
      if(!tableDef.hasOwnProperty("host"))              tableDef['host'] = '';
      if(!tableDef.hasOwnProperty("dbname"))            tableDef['dbname'] = '';
      if(!tableDef.hasOwnProperty("tableid"))           tableDef['tableid'] = '';
      if(!tableDef.hasOwnProperty("csvfilename"))       tableDef['csvfilename'] = '';
      if(!tableDef.hasOwnProperty("view"))              tableDef['view'] = false;
      if(!tableDef.hasOwnProperty("script"))            tableDef['script'] = '';
      if(!tableDef.hasOwnProperty("trigger"))           tableDef['trigger'] = false;
      if(!tableDef.hasOwnProperty("triggername"))       tableDef['triggername'] = '';
      if(!tableDef.hasOwnProperty("procedure"))         tableDef['procedure'] = false;
      if(!tableDef.hasOwnProperty("procedurename"))     tableDef['procedurename'] = '';
      if(!tableDef.hasOwnProperty("watch_table"))       tableDef['watch_table'] = '';
      if(!tableDef.hasOwnProperty("watch_trigger"))     tableDef['watch_trigger'] = '';
      if(!tableDef.hasOwnProperty("watch_procedure"))   tableDef['watch_procedure'] = '';

      let arrFields = tableDef['fields'];
      if(arrFields) {
        for (let i = 0; i < arrFields.length; i++) {
          const fieldObj:any = arrFields[i];
          if(fieldObj.hasOwnProperty("primary")) {
            if(fieldObj['primary'] === "true") {
              fieldObj['primary'] = true;
            }else if(fieldObj['primary'] === "false") {
              fieldObj['primary'] = false;
            }
          }
          /* else {
            fieldObj['primary'] = false;
          } */  
          
          if(!fieldObj.hasOwnProperty("primary"))         fieldObj['primary'] = false;
          if(!fieldObj.hasOwnProperty("autoinc"))         fieldObj['autoinc'] = false;
          if(!fieldObj.hasOwnProperty("notNull"))         fieldObj['notNull'] = true;
          //if(!fieldObj.hasOwnProperty("index"))         fieldObj['index'] = false;
          if(!fieldObj.hasOwnProperty("fieldname"))       fieldObj['fieldname'] = '';
          if(!fieldObj.hasOwnProperty("dbType"))          fieldObj['dbType'] = 'TEXT';
          if(!fieldObj.hasOwnProperty("description"))     fieldObj['description'] = '';
          if(!fieldObj.hasOwnProperty("defaultValue"))    fieldObj['defaultValue'] = '';
        }
  
        if(!tableDef.hasOwnProperty("fieldsWithBlank")) {
          let _fieldsWithBlank = JSON.parse(JSON.stringify(arrFields));
          const blankObj = {"autoinc": false, "primary": false, "index": false, "dbType": "TEXT", "fieldname": "", "defaultValue": "", "description": "", "createddatetime": "", "updateddatetime": ""};
          _fieldsWithBlank.unshift(blankObj);
  
          tableDef['fieldsWithBlank'] = _fieldsWithBlank;
        }
        if(!tableDef.hasOwnProperty("fieldswithBracket")) {
          const _fields = JSON.parse(JSON.stringify(arrFields));
          let _fieldswithBracket = [];
          _fieldswithBracket.push('[]');
          for (let j = 0; j < _fields.length; j++) {
            const _fieldname = '[' + _fields[j]['fieldname'] + ']';
            _fieldswithBracket.push(_fieldname) ;          
          }
  
          tableDef['fieldswithBracket'] = _fieldswithBracket;
        }
      }else {
        tableDef['fields'] = [];
        tableDef['fieldsWithBlank'] = [];
        tableDef['fieldswithBracket'] = [];
      }
    });

    return localTableDefs;
  }
  function manageRemoteTableDefs(remoteTableDefs: any[]) {
    if(!remoteTableDefs) {
      remoteTableDefs = [];
    }
    
    remoteTableDefs.forEach((tableDef:any) => {
      if(!tableDef.hasOwnProperty("host"))              tableDef['host'] = '';
      if(!tableDef.hasOwnProperty("dbname"))            tableDef['dbname'] = '';
      if(!tableDef.hasOwnProperty("tableid"))           tableDef['tableid'] = '';
      if(!tableDef.hasOwnProperty("csvfilename"))       tableDef['csvfilename'] = '';
      if(!tableDef.hasOwnProperty("view"))              tableDef['view'] = false;
      if(!tableDef.hasOwnProperty("script"))            tableDef['script'] = '';
      if(!tableDef.hasOwnProperty("trigger"))           tableDef['trigger'] = false;
      if(!tableDef.hasOwnProperty("triggername"))       tableDef['triggername'] = '';
      if(!tableDef.hasOwnProperty("procedure"))         tableDef['procedure'] = false;
      if(!tableDef.hasOwnProperty("procedurename"))     tableDef['procedurename'] = '';
      if(!tableDef.hasOwnProperty("watch_table"))       tableDef['watch_table'] = '';
      if(!tableDef.hasOwnProperty("watch_trigger"))     tableDef['watch_trigger'] = '';
      if(!tableDef.hasOwnProperty("watch_procedure"))   tableDef['watch_procedure'] = '';

      let arrFields = tableDef['fields'];
      if(arrFields) {
        for (let i = 0; i < arrFields.length; i++) {
          const fieldObj = arrFields[i];
          /* if(fieldObj.hasOwnProperty('primary')) {
            if(fieldObj['primary'] === "true") {
              fieldObj['primary'] = true;
            }else if(fieldObj['primary'] === "false") {
              fieldObj['primary'] = false;
            }
          } */   
  
          if(!fieldObj.hasOwnProperty("primary"))         fieldObj['primary'] = false;
          if(!fieldObj.hasOwnProperty("autoinc"))         fieldObj['autoinc'] = false;
          if(!fieldObj.hasOwnProperty("notNull"))         fieldObj['notNull'] = true;
          //if(!fieldObj.hasOwnProperty("index"))         fieldObj['index'] = false;
          if(!fieldObj.hasOwnProperty("fieldname"))       fieldObj['fieldname'] = '';
          if(!fieldObj.hasOwnProperty("dbType"))          fieldObj['dbType'] = 'TEXT';
          if(!fieldObj.hasOwnProperty("description"))     fieldObj['description'] = '';
          if(!fieldObj.hasOwnProperty("defaultValue"))    fieldObj['defaultValue'] = '';
        }

        if(!tableDef.hasOwnProperty("fieldsWithBlank")) {
          let _fieldsWithBlank = JSON.parse(JSON.stringify(arrFields));
          const blankObj = {"autoinc": false, "primary": false, "index": false, "dbType": "TEXT", "fieldname": "", "defaultValue": "", "description": "", "createddatetime": "", "updateddatetime": ""};
          _fieldsWithBlank.unshift(blankObj);
  
          tableDef['fieldsWithBlank'] = _fieldsWithBlank;
        }
        if(!tableDef.hasOwnProperty("fieldswithBracket")) {
          const _fields = JSON.parse(JSON.stringify(arrFields));
          let _fieldswithBracket = [];
          _fieldswithBracket.push('[]');
          for (let j = 0; j < _fields.length; j++) {
            const _fieldname = '[' + _fields[j]['fieldname'] + ']';
            _fieldswithBracket.push(_fieldname) ;          
          }
  
          tableDef['fieldswithBracket'] = _fieldswithBracket;
        }
      }

    });

    return remoteTableDefs;
  }

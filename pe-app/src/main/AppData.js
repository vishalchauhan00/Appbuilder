import React from 'react';
import { connect } from 'react-redux';
import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme } from '@material-ui/core/styles';
//import { makeStyles } from '@material-ui/core/styles';
//import { Paper, Typography, TextField} from '@material-ui/core';
import { Snackbar, Button, CircularProgress} from '@material-ui/core';

import AppHeader from './AppHeader';
import AppEditor from './editors/AppEditor';
import LoginWindow from '../components/LoginWindow';
import { setProjectData, setContributorTabs } from './ServiceActions';
import { setPageLocale, setPageContainer, setPageConfig, setUILocale, setUIList, setUIConfig, setActionLocale, setActionList, setActionConfig, setAppCredentials } from './ServiceActions';
import SaveAppEditor from './helpers/SaveAppEditor';

class AppData extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        show: this.props.show,
        themetype: 'light',
        projectdetail: false,

        project: [],
        isLoaded: false,
        error: null,
        openalert: false,
        isFreeze: false,
      };
    }
  
    componentDidMount() {
      this.getSystemTheme();

      //console.log("ProjectData componentDidMount", this.props.show);
      this.getProjectData();
    }
    
    getSystemTheme() {
      if(localStorage.getItem("themetype")){
        this.setState({themetype: localStorage.getItem("themetype")});
      }

      /*const getCurrentTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if(getCurrentTheme){
        this.setState({themetype: 'dark'});
      }else{
        this.setState({themetype: 'light'});
      }
      
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", (event) => {
            const changedTheme = event.matches ? "dark" : "light";
            //console.log("theme>>>>", changedTheme );
            this.setState({themetype: changedTheme});
        });*/
    }
    
    getProjectData() {
      this.fetchProjectDic().then(response => this.fetchProjectData(response).then(response => this.getAppConfigFiles(response)));
    }

    fetchProjectDic(){
      return fetch("././config/ProjectDic.json")
      .then(res => res.json())
      .then(
        (result) => {
          return result.Project[0];
        },        
        (error) => {
          console.log("ProjectDic error >>>", error);
          this.setState({
            error
          });
        }
      )
    }

    fetchProjectData(_projectDic) {       

      let api_projectget = this.props.appconfig.apiURL+"service.json?command=projectget&userid="+this.props.appconfig.userid+"&sessionid="+this.props.appconfig.sessionid+"&projectid="+this.props.appconfig.projectid;
      //let api_options = {method: 'POST', mode:'cors'};
      return fetch(api_projectget, {method: 'GET'})
        .then(res => res.json())      
        .then(
          (result) => {
            // { project: {...}, response: "ACK", count: 1, command: "projectget" }
            
            if(result.response === "NACK"){
              const _err = {message: result.error};
              this.setState({
                isLoaded: true,
                error:_err                   
              });
            }
            else {
              
              var _project = result.project;
              if(_project && _project.hasOwnProperty('owner'))
              {
                if(_project['owner'] !== this.props.appconfig.userid) {
                  console.log("Try loading a project which do not belongs to this user. Refer bug #11407");
                  const _err = {message: "Try loading a project which do not belongs to this user"};                  
                  this.setState({
                    isLoaded: true,
                    error:_err                   
                  });
                  this.setState({openalert: false});
                  return;
                }
              }

              const _projectData = Object.assign({}, _projectDic, result.project);
              //console.log(_projectData, "...Project Data result >>>", result.project);
              if(_projectData['TableDefs'] && _projectData['TableDefs'].length === 0) {
                _projectData['TableDefs'] = _projectDic['TableDefs'];
              }
              manageProjectData(_projectData, this.props);              
              console.log("...Project Data >>>", _projectData);
              this.props.dispatch(setProjectData(_projectData));

              if(_projectData['isFreeze'] === "0"){
                this.setState({ isFreeze: true });
              }

              if(_projectData.hasOwnProperty("Contributors")) {
                const contributors = _projectData['Contributors'];
                if(contributors.length > 1) {
                
                  let contributorObj = contributors.filter(function(node) {
                    if(node['contributorName'] === _projectData['owner'] && node['contributorProjectid'] === _projectData['projectid']){
                      return true;
                    }
                    return false;
                  });  
                  if(contributorObj.length > 0) {
                    const contributorTabs = contributorObj[0]['selectTabPages'];
                    //console.log("...selectTabPages >>>", contributorTabs);
                    const _tabs = [...new Set(contributorTabs)];
                    if(_tabs.length === 0) {
                      this.props.dispatch(setContributorTabs(['none']));
                    }else {
                      let arrTabs = _tabs.filter(function(node) {
                        if(node !== 'none'){
                          return true;
                        }
                        return false;
                      }); 
                      
                      this.props.dispatch(setContributorTabs(arrTabs));
                      contributorObj[0]['selectTabPages'] = arrTabs;
                    }             
                  }
                }else{
                  if(contributors.length === 0) {
                    contributors.push({"contributorName": "", "contributorProjectid": "", "description": "", "mainProjectid": "", "owner": "", "selectTabPages": [] });
                  }
                }
              }

              //this.fetchUpdateProject(this.props, _projectData);

              this.setState({
                isLoaded: true,                  
                project: _projectData
              });
            }
            return result.response;
          },
          // Note: it's important to handle errors here
          // instead of a catch() block so that we don't swallow
          // exceptions from actual bugs in components.
          (error) => {
            this.setState({
              isLoaded: true,
              error
            });
          }
        )
    }

    fetchUpdateProject(propsObj, projectdata) {
      var formData = new FormData();
      formData.append("command", "projectupdate");
      formData.append("userid", propsObj.appconfig.userid);
      formData.append("sessionid", propsObj.appconfig.sessionid);
      formData.append("projectid", propsObj.appconfig.projectid);
    
      var prjctData = encodeURIComponent(JSON.stringify(projectdata));
      let text = new File([prjctData], "updateProject.txt", {type: "text/plain"});
      formData.append("file", text);
    
      fetch(propsObj.appconfig.apiURL+"multipartservice.json", {
          method: 'POST',
          body: formData
      })
      .then((response) => response.json())
      .then((result) => {       
        if(result.response === "NACK"){
          var _err = {message: result.error};
          console.log("projectupdate NACK >>>", _err.message);
        }
        else{
          console.log("projectupdate ACK >>> Success");
        }
      })
      .catch((error) => {
        console.log("projectupdate Error >>> Fail");
      });
    }

    handleCloseAlert() {
      this.setState({ openalert: true });
    }
    
    getAppConfigFiles(resp) {
      if(resp === "ACK"){
        const lang = this.props['apiParam']['locale'];
        this.fetchPageLocale(lang).then(response => this.fetchPageContainer());
        this.fetchPageDic();
        this.fetchUILocale(lang).then(response => this.fetchUIList());
        this.fetchActionLocale(lang).then(response => this.fetchActionList(response));
      }
    }

    fetchPageLocale(lang){
      let localefilePath;
      if(lang === "ja" || lang === "jp"){
        localefilePath = "././locale/ja_JP/pageproperties.json";
      }else{
        localefilePath = "././locale/en_US/pageproperties.json";
      }
      
      return fetch(localefilePath)
        .then(res => res.json())
        .then(
          (result) => {
            let pageLocale = result['PageLocale'];
            this.props.dispatch(setPageLocale(pageLocale)); 
            return;           
          },        
          (error) => {
            console.log("Page-Locale fetching error >>>", error);
            this.setState({
              error
            });
          }
        )
    }
  
    fetchPageContainer(){
      fetch("././config/PageConfig.json")
      .then(res => res.json())
      .then(
        (result) => {          
          let pageContainers = result['container'];
          //this.props.dispatch(setPageContainer(pageContainers));

          pageContainers.forEach(element => {
            if(element.include === "true"){
              this.fetchPageConfig(element['targetClass']);
            }
          });
        },        
        (error) => {
          console.log("config error >>>", error);
          this.setState({
            error
          });
        }
      )
    }

    fetchPageConfig(targetClass) {      
      let _classpath = "././config/container/"+targetClass+".xml";
      //console.log("fetchPageConfig >>>", _classpath);
      fetch(_classpath)
      .then(res => res.text())
      .then(
        (result) => {  
          var XMLParser = require('react-xml-parser');
          var xml = new XMLParser().parseFromString(result);
          var pageitem = xml.getElementsByTagName('item');
          if(pageitem.length > 0){
            var pageproperties = xml.getElementsByTagName('type');
            this.setItemTemplate(pageitem[0], pageproperties, "page");
          }
        },        
        (error) => {
          console.log("Page config error >>>", error);
          this.setState({
            error
          });
        }
      )
    }

    fetchPageDic(){
      fetch("././config/PageViewDic.json")
        .then(res => res.json())
        .then(
          (result) => { 
            const pageView = result['PageView'];
            this.props.dispatch(setPageContainer(pageView));
          },        
          (error) => {
            console.log("Page View dic fetching error >>>", error);
            this.setState({
              error
            });
          }
        )
    }

    fetchUILocale(lang){
      let localefilePath;
      if(lang === "ja" || lang === "jp"){
        localefilePath = "././locale/ja_JP/uiproperties.json";
      }else{
        localefilePath = "././locale/en_US/uiproperties.json";
      }
      return fetch(localefilePath)
        .then(res => res.json())
        .then(
          (result) => {
            let uiLocale = result['UILocale'];
            this.props.dispatch(setUILocale(uiLocale));   
            return;        
          },        
          (error) => {
            console.log("UI-Locale fetching error >>>", error);
            this.setState({
              error
            });
          }
        )
    }
  
    fetchUIList(){
      var self = this;
      let uiconfigFile = (this.props.apiParam["version"] === "5.0") ? "UIConfig5.json" : "UIConfig.json";
      const uiconfigPath = "././config/" + uiconfigFile;
      fetch(uiconfigPath)
        .then(res => res.json())
        .then(
          (result) => {          
            let uiParts = result['UIParts'];            
            uiParts =  uiParts.filter(function(category) {
              if(category.include === "true") {
                let uiItems = category['items'];
                uiItems =  uiItems.filter(function(item) {
                  if(item.visible === "true") {
                    let uiDisplayName = (item['type']) ? item['name']+item['type'] : item['name'];
                    self.fetchUIConfig(uiDisplayName);
                    return item;
                  }
                  return item.visible === "true";
                });
                category['items'] = uiItems;
              }
              return category.include === "true";
            });
            
            this.props.dispatch(setUIList(uiParts));  
            
            /* uiParts.forEach(element => {
              let uiItems = element['items'];
              uiItems.forEach(uipart => {
                let uiDisplayName = (uipart['type']) ? uipart['name']+uipart['type'] : uipart['name'];                
                this.fetchUIConfig(uiDisplayName);
              });
            }); */
          },        
          (error) => {
            console.log("UI-list fetching error >>>", error);
            this.setState({
              error
            });
          }
        )
    }

    fetchUIConfig(uipart) {
      let _classpath = "././config/uipart/"+uipart+".xml";

      let uiTemplate = [];  
      return fetch(_classpath)
        .then(res => res.text())
        .then(
          (result) => {
            //console.log("config >>>", result); 
  
            var XMLParser = require('react-xml-parser');
            var xml = new XMLParser().parseFromString(result);
            var uiitem = xml.getElementsByTagName('item');
            if(uiitem.length > 0){
              var uiproperties = xml.getElementsByTagName('type');
              uiTemplate = this.setItemTemplate(uiitem[0], uiproperties, "uipart");
              return uiTemplate;
            }
          },        
          (error) => {
            console.log("UI config error >>>", error);
          }
        )
    }

    setItemTemplate(item, properties, source) {
      let _itemConfig;
      if(source === "page") {
        _itemConfig = this.props.pageConfig;
      }else if(source === "uipart") {
        _itemConfig = this.props.uiConfig;
      }else {
        _itemConfig = this.props.actionConfig;
      }   
  
      let itemAttr = item.attributes;
      let typeConfig = [];
      properties.forEach(element => {
        let propObj = element.attributes;        
        if(source === "action"){
          if(propObj.name === 'parameters') {
            typeConfig.push({name: propObj.name, properties: this.populateItemConfig(element.children, "action")});
            //typeConfig.push({_itemObj:item, _propObj:element});
          }
        }else {
          typeConfig.push({name: propObj.name, properties: this.populateItemConfig(element.children, source)});
        }
      });
      itemAttr.children = typeConfig;
  
      /* var bars= [];    
      let configChildren = itemAttr.children;
      configChildren.forEach(element => {
        let configname = element.name.toString().toLowerCase();
        if(configname.indexOf('bar') > -1){          
         //bars = bars.concat(element.properties);
          bars.push.apply(bars, element.properties);
        }        
      });    
      console.log("bars >>>>", bars);
      let barsObj = {name:"Page Bars", properties:bars};    
      itemAttr.children.push(barsObj); */
  
      _itemConfig.push(itemAttr);
      if(source === "page") {
        this.props.dispatch(setPageConfig(_itemConfig));
      }else  if(source === "uipart") {
        this.props.dispatch(setUIConfig(_itemConfig));
      }else{
        //this.generateActionConfig(_itemConfig)
        //console.log("setActionConfig >>>>>", _itemConfig);
        this.props.dispatch(setActionConfig(_itemConfig));
      }
    }

    /* generateActionConfig(allconfig, basedata) {
      console.log(allconfig, "... 123456789 >>>", basedata);
      allconfig.forEach(element => {
        const actionname = element['method'];
        const elemChildren = element.children;
        if(elemChildren[0] && elemChildren[0].hasOwnProperty('_itemObj')) {
          let actTemplate = this.setActionTemplate(elemChildren[0]['_itemObj'], [elemChildren[0]['_propObj']], basedata);
          console.log(actionname, elemChildren, "... populateActionConfig >>>", actTemplate);
        }
       });
    }
    setActionTemplate(item, properties, basedata) {
      let _actionConfig = [];
  
      let actionObj = item.attributes;
      let typeConfig = [];
      properties.forEach(element => {
        let propObj = element.attributes;
        if(propObj.name === 'parameters'){
          typeConfig.push({name: propObj.name, properties: this.populateItemConfig(element.children, basedata)});
        }    
      });
      actionObj.children = typeConfig;
  
      _actionConfig.push(actionObj);
      //console.log("_actionConfig >>>>", _actionConfig);
      return _actionConfig;
    } */

    populateItemConfig(properties, source) {
      var _propConfig = [];
      if(properties.length === 0)
        return _propConfig;
      
      properties.forEach(element => {
        let propObj = element.attributes;
        if(element.children !== undefined && element.children.length > 0) {
          let otherObj = this.populatePropertyObjects(element, source);        
          for (let index = 0; index < otherObj.length; index++) {
            const item = otherObj[index];
            propObj[item.name] =  item.items;
            if(item.name === "dataSource") {
              propObj['labelField'] =  (item['labelField']) ? item['labelField'] : "";
              propObj['valueField'] =  (item['valueField']) ? item['valueField'] : "";
            }
          }        
        }
        _propConfig.push(propObj);
      });
  
      return _propConfig;
    }
  
    populatePropertyObjects(propobj, source) {
      let children = propobj.children;     
      var _propObj = [];
      children.forEach(element => {
        let _prop = [];

        if(element.children.length > 0) {
          let isdsObj = false;
          for (let index = 0; index < element.children.length; index++) {
            const item = element.children[index];
            if(element.name === "validations") {
              _prop.push(item.attributes.validator);        
            }
            else if(element.name === "dataSource") {
              //console.log(source, " .... dataSource ....", item.attributes, propobj);
              if(propobj['attributes'] && propobj['attributes'].hasOwnProperty('labelField') && propobj['attributes']['labelField'] !== ""){
                _prop.push(item.attributes);
                isdsObj = true;
              }else{
                if(propobj['attributes'] && propobj['attributes'].hasOwnProperty('dataType') && propobj['attributes']['dataType'] === "Number"){
                  _prop.push(parseInt(item.attributes.name));   
                }else
                  _prop.push(item.attributes.name);                
              }
            }
            else if(element.name === "dependentActions") {
              _prop.push(item);
            }        
          }

          if(isdsObj){
            _propObj.push({name:element.name, items:_prop, labelField: propobj['attributes']['labelField'], valueField: propobj['attributes']['valueField']});
          }else{
            _propObj.push({name:element.name, items:_prop});
          }

        }else {
          if(element.name === "dataSource") {            
            _prop = generateDataSource(this.state.project, source, _prop, element.attributes);
            //console.log(element, " .... dataSource ....", _prop);
            _propObj.push({name:element.name, labelField:element.attributes['labelField'], valueField:element.attributes['valueField'], items:_prop});
          }
        } 
        
      });
      
      return _propObj;
    }

    fetchActionLocale(lang){
      let localefilePath;
      if(lang === "ja" || lang === "jp"){
        localefilePath = "././locale/ja_JP/actionsproperties.json";
      }else{
        localefilePath = "././locale/en_US/actionsproperties.json";
      }

      return fetch(localefilePath)
        .then(res => res.json())
        .then(
          (result) => {
            let actionLocale = result['ActionLocale'];
            //console.log("....Action-Locale fetching success >>>", actionLocale);
            this.props.dispatch(setActionLocale(actionLocale)); 
            return actionLocale;         
          },        
          (error) => {
            console.log("Action-Locale fetching error >>>", error);
            this.setState({
              error
            });
          }
        )
    }

    fetchActionList(actionLocale){
      var self = this;
      return fetch("././config/ActionConfig.json")
        .then(res => res.json())
        .then(
          (result) => {          
            let actions = result['Actions'];
            actions =  actions.filter(function(category) {
              //return category.include === "true";

              if(category.include === "true") {
                let uiItems = category['items'];
                uiItems =  uiItems.filter(function(item) {
                  if(item.visible === "true") {
                    self.fetchActionConfig(item['type'], item['name']);
                    return item;
                  }
                  return item.visible === "true";
                });
                category['items'] = uiItems;
              }
              return category.include === "true";
            });
            
            for (let index = 0; index < actions.length; index++) {
              const category = actions[index];
              let actionItems = category['items'];
              category['items'] = this.setActionListLocale(actionItems, actionLocale);
            }            
            //console.log("....Action-List config >>>", actions);
            this.props.dispatch(setActionList(actions));          
          },        
          (error) => {
            console.log("Action-list fetching error >>>", error);
            this.setState({
              error
            });
          }
        )
    }
    setActionListLocale(actionItems, actionLocale) {      
      actionItems.forEach(action => {
        action = actionLocale.filter(function(item) {
          if(item.method === action.name) {
            action['text'] = item.properties[0]['text'];
            action['toolTip'] = item.properties[0]['toolTip'];
            return true;
          }
          return false;
        });
      });

      return actionItems;
    }

    fetchActionConfig(acttype, actionname) {
      let _name = actionname.charAt(0).toUpperCase() + actionname.substr(1);
      let _classpath = "././config/action/"+this.getSelectedCategory(acttype)+"/"+this.getSelectedAction(_name)+".xml";
      //console.log(acttype, actionname, "...fetchActionConfig >>>", _name, _classpath);

      fetch(_classpath)
        .then(res => res.text())
        .then(
          (result) => {
            //console.log("config >>>", result); 
    
            var XMLParser = require('react-xml-parser');
            var xml = new XMLParser().parseFromString(result);
            //console.log(actionname, ">>>>>>>>", xml);
            var actionitem = xml.getElementsByTagName('item');
            if(actionitem.length > 0){
              var actionproperties = xml.getElementsByTagName('type');
              this.setItemTemplate(actionitem[0], actionproperties, "action");//setActionTemplate(actionitem[0], actionproperties, basedata);
            }
          },        
          (error) => {
            console.log(actionname, " action config error >>>", error);        
          }
        )   
    }
    getSelectedAction(actionName)
    {
      let action = null;
      switch(actionName)
      {
        case "CanSendEmail":
          action="CanSendMail";
          break;
        default :
          action=actionName;
          break;

      }
      return action;
    }
    getSelectedCategory(actionType)
    {
      var category = null;
      switch(actionType)
      {
        case "Page":
          category="PageTransitions";
          break;
        case "MainValue":
        case "CSV":
          category="MainValue"
          break;
        case "Property":
          category="PropertyControl"
          break;
        case "DataBase":
          category="DbAction"
          break;
        case "Media":
        case "Library":
          category="MediaControl"
          break;        
        case "Warning":
          category="WarningControl"
          break;
        case "Comm":
          category="RemoteDBControl"
          break;
        case "Contact":
          category="ContactControl"
          break;
        case "Calendar":
          category="CalendarEventControl"
          break;
          case "GoogleMap":
          case "GoogleChart":
          category="MapControl"
          break;
        case "MapMarker":
          category="MapMarkerControl"
          break;
        case "MapRoute":
          category="MapRouteControl"
          break;
        case "Motion":
          category="GPSControl"
          break;
        case "Sensor":
          category="TimerControl"
          break;
        case "Email":
          category="EmailControl"
          break;
        case "SystemControl":
          category="SystemControl";
          break;
        case "SendPushNotification":
          category="SendPushNotificationControl";
          break;
        case "LogsAnalytics":
          category="LogsAnalyticsControl";
          break;
        case "IoT":
          category="IoTControl";
          break;
        case "Gadget":
          category="GadgetControl";
          break;
        default :
          category="";
          break;

      }
      return category;
    }

    /////////////////////////////////

    handleRelogin(credentialObj) {
      if(credentialObj && credentialObj.hasOwnProperty('status')) {
        if(credentialObj.status === "NACK") {
            const err = {message: credentialObj.result.error};
            this.setState({
              isLoaded: true,
              error: err                   
            });
            this.setState({openalert: false});

        }else{
            let credentials = credentialObj.result;
            this.props.dispatch(setAppCredentials(credentials));

            this.setState({isLoaded: false});
            this.getProjectData();
            this.setState({openalert: false});
            this.setState({error: null});
        }
      }else{
        const _err = {message: "Something went wrong. Please re-login from console."};
        this.setState({
          isLoaded: true,
          error:_err                   
        });
        this.setState({openalert: false});
      }       
    }

    handleUserSession(sessionObj){
      if(sessionObj && sessionObj.hasOwnProperty('status')) {
        if(sessionObj.status === "NACK") {
            var _err = {message: sessionObj.result.error};
            this.setState({
              isLoaded: true,
              error:_err                   
            });
            this.setState({openalert: false});

        }else{
            let credentials = sessionObj.result;
            this.props.dispatch(setAppCredentials(credentials));

            this.setState({isLoaded: false});
            this.getProjectData();
            this.setState({openalert: false});
            this.setState({error: null});
        }
      }
    }

    /////////////////////////////////

    handleCompleteSaveApp(projectData) {
      this.props.dispatch(setProjectData(projectData));
      this.setState({ isFreeze: false });
    }

    handleThemeChange() {      
      if(this.state.themetype === 'light'){
        this.setState({themetype: 'dark'});
        localStorage.setItem("themetype", 'dark');
      }else{
        this.setState({themetype: 'light'});
        localStorage.setItem("themetype", 'light');
      }
    }

  
    render() {
      const {show, error, isLoaded, project, themetype, isFreeze } = this.state;
      const apiParam = {apiURL: this.props.appconfig.apiURL, userid: this.props.appconfig.userid, sessionid: this.props.appconfig.sessionid, projectid: this.props.appconfig.projectid};
      
      const darktheme = createMuiTheme({
        palette: {
          type: themetype,
          common: {
            black: '#000',
            white: '#fff'
          },
          primary: {
            main: '#1976d2',
            // light: will be calculated from palette.primary.main,
            // dark: will be calculated from palette.primary.main,
            // contrastText: will be calculated to contrast with palette.primary.main
          },
          secondary: {
            main: '#0044ff',
            light: '#0066ff',
            // dark: will be calculated from palette.secondary.main,
            contrastText: '#ffcc00',
          },
          background:{
            paper: '#757575',
            default: '#000',
            contrast: '#757575',
            appexe: '#000',
            hover: '#1ba9f8',//'#65de45',
            gradient: {
              main: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
              light: 'linear-gradient(to right, rgba(0,0,0,0.7) 70%, rgba(0,0,0,0.3) 100%)',
              dark: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)', 
            },
          },
          divider: "rgba(0, 0, 0, 0.33)",
        },
      });
      
      const lighttheme = createMuiTheme({
        palette: {
          type: themetype,
          common: {
            black: '#000',
            white: '#fff'
          },
          primary: {
            // light: will be calculated from palette.primary.main,
            main: '#1976d2',
            // dark: will be calculated from palette.primary.main,
            // contrastText: will be calculated to contrast with palette.primary.main
          },
          secondary: {
            light: '#0066ff',
            main: '#0044ff',
            // dark: will be calculated from palette.secondary.main,
            contrastText: '#ffcc00',
          },
          grey: {
            50: '#fafafa',
            100: '#f5f5f5',
            200: '#eeeeee',
            300: '#e0e0e0',
            400: '#bdbdbd',
            500: '#9e9e9e',
            600: '#757575',
            700: '#616161',
            800: '#424242',
            900: '#212121',
            A100: '#f5f5f5',
            A200: '#eeeeee',
            A400: '#bdbdbd',
            A700: '#616161'
          },
          background:{
            paper: '#e0e0e0',
            default: '#f5f5f5',
            contrast: '#000',
            appexe: '#f5f5f5',
            hover: '#65de45',
            gradient: {
              main: 'linear-gradient(135deg,rgb(2,3,129) 0%,rgb(40,116,252) 100%)',
              light: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
              dark: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)', 
            },
          },
          text: {
            primary: 'rgba(0, 0, 0, 0.87)',
            secondary: 'rgba(0, 0, 0, 0.6)',
            disabled: 'rgba(0, 0, 0, 0.38)'
          },
          divider: "rgba(0, 0, 0, 0.33)",
        },
      });

      /*const appexetheme = createMuiTheme({
        palette: {
          type: themetype,
          common: {
            black: '#000',
            white: '#fff'
          },
          primary: {
            main: '#1976d2',
          },
          secondary: {
            light: '#0066ff',
            main: '#0044ff',
            contrastText: '#ffcc00',
          },
          grey: {
            50: '#fafafa',
            100: '#f5f5f5',
            200: '#eeeeee',
            300: '#e0e0e0',
            400: '#bdbdbd',
            500: '#9e9e9e',
            600: '#757575',
            700: '#616161',
            800: '#424242',
            900: '#212121',
            A100: '#f5f5f5',
            A200: '#eeeeee',
            A400: '#bdbdbd',
            A700: '#616161'
          },
          background:{
            paper: '#D3E3FD',
            default: '#EDF2FA',
            contrast: '#000',
            appexe: 'linear-gradient(135deg,#D3E3FD 10%,#1ba9f8 100%)',
            hover: '#1ba9f8',
            gradient: {
              main: 'linear-gradient(135deg,rgb(2,3,129) 0%,rgb(40,116,252) 100%)',
              light: 'linear-gradient(120deg,#1ba9f8 30%,#020381 100%)',
              dark: '#1ba9f8', 
            },
          },
          text: {
            primary: 'rgba(0, 0, 0, 0.87)',
            secondary: 'rgba(0, 0, 0, 0.6)',
            disabled: 'rgba(0, 0, 0, 0.38)'
          },
          divider: "rgba(0, 0, 0, 0.33)",
        },
      });*/

      if(!show) {
        return null;
      }

      if (error) {
        const errmsg = error.message;
        return ( 
          <div className="backdropStyle">
            {this.state.openalert && 
              <LoginWindow loginid={apiParam.userid} onRelogin={(...args) => this.handleRelogin(args[0])} 
                           config={apiParam} onGetSession={(...args) => this.handleUserSession(args[0])} />
            }   
            {!this.state.openalert && 
              <Snackbar open={!this.state.openalert} autoHideDuration={5000} onClose={() => this.handleCloseAlert()}
                        message={errmsg}
                        anchorOrigin={{ vertical: 'bottom',  horizontal: 'center', }}
                        action={
                          <React.Fragment>
                            <Button color="secondary" size="small" onClick={() => this.handleCloseAlert()}> OK </Button>
                          </React.Fragment>
                        }              
              />
            }
          </div>      
          
        );
      } else if (!isLoaded) {
        return <div className="backdropStyle"><CircularProgress style={{marginRight:8}} /> Loading...</div>;
      } else if (isFreeze) {
        return <SaveAppEditor appconfig={apiParam} data={project} onSaveAppComplete={(...args) => this.handleCompleteSaveApp(args[0])}/>
      }else {
        return (
          <ThemeProvider theme={(themetype === 'light') ? lighttheme : darktheme}>
            <div>
              <AppHeader appconfig={apiParam} data={project} onThemeChange={() => this.handleThemeChange()}/>
              <AppEditor />           
            </div>
          </ThemeProvider>
        );
      }
    }
  }

  function generateDataSource(baseData, source, resultArr, attributes) {
    let attrSource = attributes['source'].replace("{","").replace("}","");
    let methodName = attrSource.split(":")[1].split("(")[0];
    //console.log(attributes, " .... dataSource ....", methodName);

    let _data = [];
    switch(methodName) 
    {
      case "getServices":
        _data = getServices(baseData);
        break;
      /* case "getDbTableDicsByServiceName":
        _data = getDbTableDicsByServiceName(baseData);
        break; */
      case "getFontNames":
        _data = getFontNames(baseData);
        break;
        
      default :
      _data = [];
    }

    if(_data.length > 0){
      for (let i = 0; i < _data.length; i++) {
        const element = _data[i];
        resultArr.push(element);        
      }
    }else {
      resultArr = [];
      resultArr.push("func_"+attrSource.slice(attrSource.indexOf(":")+1));
      //console.log(resultArr, " .... dataSource ....", methodName);
    }

    return resultArr;
  }

  function getServices(baseData, dbType="")
  {
    let TableDefs = baseData['TableDefs'];
    let RemoteTableDefs = baseData['RemoteTableDefs'];

    var services = [];
    var uniqServices = [];
    
    if(dbType !== "remote")
    {
      if (TableDefs.length > 0)
        services.push({"label" : "LocalDB", "value": ""});
      
      if(dbType.length > 0)
        return services;
    }
    
    for (var j = 0; j < RemoteTableDefs.length; j++)
    {
      var dbTableDic = RemoteTableDefs[j];
      var key = dbTableDic.servicename;
      if (uniqServices.indexOf(dbTableDic.servicename) < 0)
      {
        uniqServices.push(dbTableDic.servicename);
        var service = {"label" : key, "value" : key};
        services.push(service);
      }
    }
    return services;
  }

  function getFontNames(baseData) {
    let appFonts = ["system"];
    if(baseData && baseData.hasOwnProperty('AppFonts')) {
      for (let i = 0; i < baseData.AppFonts.length; i++) {
        const element = baseData.AppFonts[i];
        let fontFamilyName = element['fontFamilyName'] ? element['fontFamilyName'] : "default";
        fontFamilyName = fontFamilyName.charAt(0).toUpperCase() + fontFamilyName.substr(1);
        appFonts.push(fontFamilyName);
      }
    }else {
      const preDefined_Fonts = ["Amazon Ember", "Roboto", "Noto Sans"];//["Helvetica Neue","Arial","Courier","Courier New","Helvetica","Helvetica Neue","Georgia","Palatino","Times New Roman","Trebuchet MS","Verdana"];
      appFonts = appFonts.concat(preDefined_Fonts);
    }

		return appFonts;
  }

  function manageProjectData(projectDic, propObj) {
    if(projectDic.hasOwnProperty('availableScreens')) {
      manageAvailableScreens(projectDic['availableScreens']);
    }
    if(projectDic.hasOwnProperty('TableDefs')) {

      /*const dbHistory = projectDic['dataBaseHistory'];
      let dbhTables = [];
      let tablesUpdate = [];
      dbHistory.filter(function(dbh) {
        if(dbh['type'] === "AddTable"){
          dbhTables.push({tablename:dbh['tablename'], schema:dbh['schema'], createddatetime:dbh['createddatetime'], tableid:dbh['historyId']});
          return true;
        }
        tablesUpdate.push({tablename:dbh['tablename'], schema:dbh['schema'], createddatetime:dbh['createddatetime'], tableid:dbh['historyId']});
        return false;
      });  

      projectDic['tablesUpdate'] = tablesUpdate;

      let tableDefs = [];
      if(dbhTables.length > 0) {
        console.log("tabels from History **********", dbhTables);

        for (let i = 0; i < dbhTables.length; i++) {
          const table = {};
          table['tablename'] = dbhTables[i]['tablename'];
          table['createddatetime'] = dbhTables[i]['createddatetime'];
          table['updateddatetime'] = dbhTables[i]['createddatetime'];
          table['tableid'] = dbhTables[i]['tableid'];
          table['fields'] = parseSQLToFields(dbhTables[i]['schema'], dbhTables[i]['createddatetime']);

          tableDefs.push(table);
        }
      }
      console.log(tablesUpdate, " ****** tabels recover **********", tableDefs);

      projectDic['TableDefs'] = tableDefs;*/

      manageLocalTableDefs(projectDic['TableDefs']);
    }
    if(projectDic.hasOwnProperty('RemoteTableDefs')) {
      manageRemoteTableDefs(projectDic['RemoteTableDefs']);
      updateProjectData(propObj, projectDic, "TableDefs,RemoteTableDefs", false);
    }
    if(projectDic.hasOwnProperty('customActions')) {
      const _customActions = projectDic['customActions'];
      if(!_customActions.hasOwnProperty('helper')) {
        projectDic['customActions'] = {"helper":[]};
      }
    }
    /*if(projectDic.hasOwnProperty('pages') && projectDic.hasOwnProperty('TabsOrder')) {
      let appPages = JSON.parse(JSON.stringify(projectDic['pages']));

      const idOrderMap = new Map(projectDic['TabsOrder'].map((id, index) => [id, index]));      
      appPages.sort((a, b) => {
        const indexA = idOrderMap.has(Number(a.pageid)) ? idOrderMap.get(Number(a.pageid)) : Infinity;
        const indexB = idOrderMap.has(Number(b.pageid)) ? idOrderMap.get(Number(b.pageid)) : Infinity;
        return indexA - indexB;
      });

      const arrpageids = appPages.map(item => item.pageid);
      const pageids = projectDic['pages'].map(item => item.pageid);
      //console.info(pageids, "****** pages ******", arrpageids);
      const isPageIdsMatch = JSON.stringify(arrpageids) === JSON.stringify(pageids);
      if(!isPageIdsMatch) {
        console.info("****** project:pages > pageid are not same as TabsOrder ******");
        projectDic['pages'] = appPages;
        updateProjectData(propObj, projectDic, "pages", false);
      }
    }*/
    if(projectDic.hasOwnProperty('PageStyle') && projectDic.hasOwnProperty('UIpartStyle')) {
      projectDic['AppStyle'] = {"PageStyle": projectDic['PageStyle'], "UIpartStyle": projectDic['UIpartStyle'], "rememberMe":false};
      delete projectDic['PageStyle'];
      delete projectDic['UIpartStyle'];
    }
    
    return projectDic;
  }
  // Function to parse the SQL string and generate the fields object
  /*function parseSQLToFields(sql, createddatetime) {
    let fieldDefinitions = sql.replace('PRIMARY KEY(','PRIMARY KEY ');
    fieldDefinitions = fieldDefinitions.match(/CREATE TABLE.*\(([^)]+)\)/i)[1];
    fieldDefinitions = fieldDefinitions.split(',');
    fieldDefinitions = fieldDefinitions.map(def => def.trim());
    fieldDefinitions = fieldDefinitions.filter(def => !def.toUpperCase().includes("PRIMARY KEY"));

    const fields = fieldDefinitions.map(def => {
      const [name, type] = def.split(/\s+/); // Split field name and type
      return {
        autoinc: type.toUpperCase() === "SERIAL",
        primary: false,
        notNull: type.toUpperCase() === "SERIAL",
        dbType: type.toUpperCase(),
        fieldname: name,
        defaultValue: "",
        description: "",
        createddatetime: createddatetime,
        updateddatetime: createddatetime
      };
    });
  
    // Mark primary key field(s)
    const primaryKeyMatch = sql.match(/PRIMARY KEY\(([^)]+)\)/i);
    if (primaryKeyMatch) {
      const primaryKeys = primaryKeyMatch[1].split(',').map(pk => pk.trim());
      fields.forEach(field => {
        if (primaryKeys.includes(field.fieldname)) {
          field.primary = true;
        }
      });
    }
  
    return fields;
  }*/
  function manageAvailableScreens(screenDefs) {
    screenDefs.forEach((screenDef, i) => {
      if(screenDef['orientation'] === "Landscape" && (parseInt(screenDef['width']) < parseInt(screenDef['height']))) {
        const screenClone = JSON.parse(JSON.stringify(screenDef));
        screenDef['width'] = parseInt(screenClone['height']);
        screenDef['height'] = parseInt(screenClone['width']);
        //console.log(i, "...Project Available ScreenDefs >>>", screenDef); 
      }
    });
  }
  function manageLocalTableDefs(localTableDefs) {
    //console.log("...Project Data TableDefs >>>", localTableDefs);
    if(!localTableDefs) {
      localTableDefs = [];
    }

    let isspotdetail = false;
    localTableDefs.forEach(tableDef => {
      if(tableDef['tablename'] === "spotdetail") {
        isspotdetail = true;
      }

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
          const fieldObj = arrFields[i];
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

    //console.log(isspotdetail, "...Project Data TableDefs >>>", localTableDefs);
    if(!isspotdetail) {
      const _spotdetailObj = {
        "_uid":"","description":"","tablename":"spotdetail","servicename":"","dbname":"","csvfilename":"","host":"","tableid":"","triggername":"",
        "watch_table":"","script":"","createddatetime":"","watch_trigger":"","procedurename":"","watch_procedure":"","procedure":false,"updateddatetime":"","view":false,"trigger":false,
        "fields":[
          {"description":"internal id","fieldname":"id","createddatetime":"","updateddatetime":"","notNull":true,"dbType":"INTEGER","index":false,"primary":true,"autoinc":true,"defaultValue":"","_uid":""},
          {"description":"marker unique id","fieldname":"markerid","createddatetime":"","updateddatetime":"","notNull":true,"dbType":"TEXT","index":false,"primary":false,"autoinc":false,"defaultValue":"","_uid":""},
          {"description":"marker group name","fieldname":"locname","createddatetime":"","updateddatetime":"","notNull":true,"dbType":"TEXT","index":false,"primary":false,"autoinc":false,"defaultValue":"","_uid":""},
          {"description":"title of annotation","fieldname":"title","createddatetime":"","updateddatetime":"","notNull":true,"dbType":"TEXT","index":false,"primary":false,"autoinc":false,"defaultValue":"","_uid":""},
          {"description":"subtitle of annotation","fieldname":"subtitle","createddatetime":"","updateddatetime":"","notNull":true,"dbType":"TEXT","index":false,"primary":false,"autoinc":false,"defaultValue":"","_uid":""},
          {"description":"image file selected from bundle for left view","fieldname":"leftview","createddatetime":"","updateddatetime":"","notNull":true,"dbType":"TEXT","index":false,"primary":false,"autoinc":false,"defaultValue":"","_uid":""},
          {"description":"action when leftview clicked","fieldname":"leftaction","createddatetime":"","updateddatetime":"","notNull":true,"dbType":"TEXT","index":false,"primary":false,"autoinc":false,"defaultValue":"","_uid":""},
          {"description":"system button name or blank","fieldname":"rightview","createddatetime":"","updateddatetime":"","notNull":true,"dbType":"TEXT","index":false,"primary":false,"autoinc":false,"defaultValue":"","_uid":""},
          {"description":"action when rightview clicked","fieldname":"rightaction","createddatetime":"","updateddatetime":"","notNull":true,"dbType":"TEXT","index":false,"primary":false,"autoinc":false,"defaultValue":"","_uid":""},
          {"description":"latitude of marker","fieldname":"latitude","createddatetime":"","updateddatetime":"","notNull":true,"dbType":"REAL","index":false,"primary":false,"autoinc":false,"defaultValue":"","_uid":""},
          {"description":"longitude of marker","fieldname":"longitude","createddatetime":"","updateddatetime":"","notNull":true,"dbType":"REAL","index":false,"primary":false,"autoinc":false,"defaultValue":"","_uid":""},
          {"description":"zoom limit to be displayed","fieldname":"limitzoom","createddatetime":"","updateddatetime":"","notNull":true,"dbType":"INTEGER","index":false,"primary":false,"autoinc":false,"defaultValue":"","_uid":""},
          {"description":"On: callout, Off: nothing popup","fieldname":"callout","createddatetime":"","updateddatetime":"","notNull":true,"dbType":"BOOLEAN","index":false,"primary":false,"autoinc":false,"defaultValue":"","_uid":""},
          {"description":"visible flag for internal","fieldname":"visible","createddatetime":"","updateddatetime":"","notNull":true,"dbType":"BOOLEAN","index":false,"primary":false,"autoinc":false,"defaultValue":"","_uid":""},
          {"description":"marker-type e.g. Custom","fieldname":"markertype","createddatetime":"","updateddatetime":"","notNull":true,"dbType":"TEXT","index":false,"primary":false,"autoinc":false,"defaultValue":"","_uid":""},
          {"description":"image file selected from bundle","fieldname":"markerfile","createddatetime":"","updateddatetime":"","notNull":true,"dbType":"TEXT","index":false,"primary":false,"autoinc":false,"defaultValue":"","_uid":""},
          {"description":"X-axis distance from top-left corner of marker-file","fieldname":"anchorx","createddatetime":"","updateddatetime":"","notNull":true,"dbType":"INTEGER","index":false,"primary":false,"autoinc":false,"defaultValue":"","_uid":""},
          {"description":"Y-axis distance from top-left corner of marker-file","fieldname":"anchory","createddatetime":"","updateddatetime":"","notNull":true,"dbType":"INTEGER","index":false,"primary":false,"autoinc":false,"defaultValue":"","_uid":""},
          {"description":"","fieldname":"leftviewimage","createddatetime":"","updateddatetime":"","notNull":true,"dbType":"TEXT","index":false,"primary":false,"autoinc":false,"defaultValue":"","_uid":""},
          {"description":"image file selected from bundle for right view","fieldname":"rightviewimage","createddatetime":"","updateddatetime":"","notNull":true,"dbType":"TEXT","index":false,"primary":false,"autoinc":false,"defaultValue":"","_uid":""}
        ],        
        "fieldsWithBlank":[
          {"description":"","fieldname":"","createddatetime":"","updateddatetime":"","notNull":true,"dbType":"TEXT","index":false,"primary":false,"autoinc":false,"defaultValue":"","_uid":"C8EDB6B9-93CC-B757-2ABF-944EF15F8105"},{"description":"internal id","fieldname":"id","createddatetime":"","updateddatetime":"","notNull":true,"dbType":"INTEGER","index":false,"primary":true,"autoinc":true,"defaultValue":"","_uid":""},{"description":"marker unique id","fieldname":"markerid","createddatetime":"","updateddatetime":"","notNull":true,"dbType":"TEXT","index":false,"primary":false,"autoinc":false,"defaultValue":"","_uid":""},{"description":"marker group name","fieldname":"locname","createddatetime":"","updateddatetime":"","notNull":true,"dbType":"TEXT","index":false,"primary":false,"autoinc":false,"defaultValue":"","_uid":""},{"description":"title of annotation","fieldname":"title","createddatetime":"","updateddatetime":"","notNull":true,"dbType":"TEXT","index":false,"primary":false,"autoinc":false,"defaultValue":"","_uid":""},{"description":"subtitle of annotation","fieldname":"subtitle","createddatetime":"","updateddatetime":"","notNull":true,"dbType":"TEXT","index":false,"primary":false,"autoinc":false,"defaultValue":"","_uid":""},{"description":"image file selected from bundle for left view","fieldname":"leftview","createddatetime":"","updateddatetime":"","notNull":true,"dbType":"TEXT","index":false,"primary":false,"autoinc":false,"defaultValue":"","_uid":""},{"description":"action when leftview clicked","fieldname":"leftaction","createddatetime":"","updateddatetime":"","notNull":true,"dbType":"TEXT","index":false,"primary":false,"autoinc":false,"defaultValue":"","_uid":""},{"description":"system button name or blank","fieldname":"rightview","createddatetime":"","updateddatetime":"","notNull":true,"dbType":"TEXT","index":false,"primary":false,"autoinc":false,"defaultValue":"","_uid":""},{"description":"action when rightview clicked","fieldname":"rightaction","createddatetime":"","updateddatetime":"","notNull":true,"dbType":"TEXT","index":false,"primary":false,"autoinc":false,"defaultValue":"","_uid":""},{"description":"latitude of marker","fieldname":"latitude","createddatetime":"","updateddatetime":"","notNull":true,"dbType":"REAL","index":false,"primary":false,"autoinc":false,"defaultValue":"","_uid":""},{"description":"longitude of marker","fieldname":"longitude","createddatetime":"","updateddatetime":"","notNull":true,"dbType":"REAL","index":false,"primary":false,"autoinc":false,"defaultValue":"","_uid":""},{"description":"zoom limit to be displayed","fieldname":"limitzoom","createddatetime":"","updateddatetime":"","notNull":true,"dbType":"INTEGER","index":false,"primary":false,"autoinc":false,"defaultValue":"","_uid":""},{"description":"On: callout, Off: nothing popup","fieldname":"callout","createddatetime":"","updateddatetime":"","notNull":true,"dbType":"BOOLEAN","index":false,"primary":false,"autoinc":false,"defaultValue":"","_uid":""},{"description":"visible flag for internal","fieldname":"visible","createddatetime":"","updateddatetime":"","notNull":true,"dbType":"BOOLEAN","index":false,"primary":false,"autoinc":false,"defaultValue":"","_uid":""},{"description":"marker-type e.g. Custom","fieldname":"markertype","createddatetime":"","updateddatetime":"","notNull":true,"dbType":"TEXT","index":false,"primary":false,"autoinc":false,"defaultValue":"","_uid":""},{"description":"image file selected from bundle","fieldname":"markerfile","createddatetime":"","updateddatetime":"","notNull":true,"dbType":"TEXT","index":false,"primary":false,"autoinc":false,"defaultValue":"","_uid":""},{"description":"X-axis distance from top-left corner of marker-file","fieldname":"anchorx","createddatetime":"","updateddatetime":"","notNull":true,"dbType":"INTEGER","index":false,"primary":false,"autoinc":false,"defaultValue":"","_uid":""},{"description":"Y-axis distance from top-left corner of marker-file","fieldname":"anchory","createddatetime":"","updateddatetime":"","notNull":true,"dbType":"INTEGER","index":false,"primary":false,"autoinc":false,"defaultValue":"","_uid":""},{"description":"","fieldname":"leftviewimage","createddatetime":"","updateddatetime":"","notNull":true,"dbType":"TEXT","index":false,"primary":false,"autoinc":false,"defaultValue":"","_uid":""},{"description":"image file selected from bundle for right view","fieldname":"rightviewimage","createddatetime":"","updateddatetime":"","notNull":true,"dbType":"TEXT","index":false,"primary":false,"autoinc":false,"defaultValue":"","_uid":""}
        ],
        "fieldswithBracket":[
          "[]","[id]","[markerid]","[locname]","[title]","[subtitle]","[leftview]","[leftaction]","[rightview]","[rightaction]","[latitude]","[longitude]","[limitzoom]","[callout]","[visible]","[markertype]","[markerfile]","[anchorx]","[anchory]","[leftviewimage]","[rightviewimage]"
        ]
      };
      
      localTableDefs.unshift(_spotdetailObj);
    }
    return localTableDefs;
  }
  function manageRemoteTableDefs(remoteTableDefs) {
    if(!remoteTableDefs) {
      remoteTableDefs = [];
    }
    
    remoteTableDefs.forEach(tableDef => {
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

  function updateProjectData(propObj, projectdata, keytoupdate, isStringType) {
    let apiurl = propObj.appconfig.apiURL;

    var formData = new FormData();
    if(isStringType){
      const updatedval = projectdata[keytoupdate];
      apiurl = apiurl+"service.json";

      formData.append("command", "projectkeyupdate");
      formData.append("projectid", propObj.appconfig['projectid']);
      formData.append("userid", propObj.appconfig['userid']);
      formData.append("sessionid", propObj.appconfig['sessionid']);
      formData.append("key", keytoupdate);
      formData.append("value", updatedval);
    }else{
      apiurl = apiurl+"multipartservice.json";

      formData.append("command", "projectupdate");
      formData.append("projectid", propObj.appconfig['projectid']);
      formData.append("userid", propObj.appconfig['userid']);
      formData.append("sessionid", propObj.appconfig['sessionid']);
    
      var keyObj = {};
      var arrKeys = keytoupdate.split(",");
      for (let index = 0; index < arrKeys.length; index++) {
        const elemKey = arrKeys[index];
        keyObj[elemKey] = projectdata[elemKey];    
      }  

      //let text = new File([JSON.stringify(keyObj)], "updateProject.txt", {type: "text/plain"});
      let keyData = encodeURIComponent(JSON.stringify(keyObj));
      let text = new File([keyData], "updateProject.txt", {type: "text/plain"});
      formData.append("file", text);
    }

    return fetch(apiurl, {
      method: 'POST',
      body: formData
    })
    .then((response) => response.json())
    .then(
      (result) => {
        if(result.response === "NACK"){
          var _err = {message: result.error};
          console.log("projectkeyupdate NACK >>>", _err.message);
        }
        else{
          console.log("projectkeyupdate ACK >>> Success");
        }
        return result.response;
      },
      (error) => {
        console.log("projectkeyupdate Error >>> Fail");
      }
    )
  }


  //////////////

  function mapStateToProps(state) {   
    //console.log("AppData mapStateToProps >>>>>", state); 
    return {
      apiParam: state.appParam.params,
      pageConfig: state.appParam.pageconfig,
      uiConfig: state.appParam.uiconfig,
      actionConfig: state.appParam.actionconfig,
    };
  }
  export default connect(mapStateToProps)(AppData);
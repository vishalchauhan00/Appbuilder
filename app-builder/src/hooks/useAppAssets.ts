import { useEffect } from 'react';
import { useAssetStore } from '../store/appAssetsStore';
import type { ActionConfig, PageConfig, UIConfig } from '../types';
import { fetchAndParseXML } from '../utils/xmlUtils';


////////////// Page Assets ///////////////

export function usePageAssets(lang:string='en') {
  const { setPageLocale, setPageList, setPageConfig } = useAssetStore();

  useEffect(() => {
    const init = async () => {
      try {
        const _pagelocale = await fetchPageLocale(lang);
        setPageLocale(_pagelocale);
        
        const _pagedef = await fetchPageDic();
        setPageList(_pagedef);

        const _pageconfig = await fetchPageConfig();
        setPageConfig(_pageconfig);
        //console.info("pageconfig >>>", _pageconfig);

      } catch (err) {
        console.error(err);
      }
    };

    init();

  }, []);
}

async function fetchPageLocale(lang:string) {
  let localefilePath;
  if(lang === "ja" || lang === "jp"){
    localefilePath = "././locale/ja_JP/pageproperties.json";
  }else{
    localefilePath = "././locale/en_US/pageproperties.json";
  }

  const res = await fetch(localefilePath);
  const result = await res.json();
  let pageLocale = result['PageLocale'];
  return pageLocale;
}

async function fetchPageDic(){
  const res = await fetch("././config/PageViewDic.json");
  const result = await res.json();
  let pageDef = result['PageView'];
  return pageDef;
}

async function fetchPageConfig(): Promise<PageConfig[]> {
  const res = await fetch("././config/PageConfig.json");
  const result = await res.json();

  let configs: PageConfig[] = [];

  let pageContainers = result['container'];
  for (const element of pageContainers) {
    if (element.include === "true") {
      const pageconfig = await fetchPageContainer(element['targetClass']);
      if (pageconfig) {
        configs.push(pageconfig[0]);
      }
    }
  }
  return configs;
}
async function fetchPageContainer(targetClass: string): Promise<PageConfig[] | null> {
  try {    
    const _classpath = "././config/container/"+targetClass+".xml";
    const parsedXML = await fetchAndParseXML(_classpath);

    if (!parsedXML?.item) return null;

    var pageitem = parsedXML.item;
    if(pageitem.properties){
      const pageproperties = pageitem.properties;
      const pageconfig:PageConfig[] = setPageTemplate(pageitem, pageproperties.type);
      return pageconfig;
    }
  } catch (e) {
    console.error('Error in fetchPageContainer:', e);
  }

  return null;
}

function setPageTemplate(item:any, properties:any[]) {
  let _itemConfig: PageConfig[] = [];

  delete item.properties;
  let itemAttr: PageConfig = item;

  let typeConfig: any[] = [];
  properties.forEach((element:any) => {    
    typeConfig.push({name: element.name, properties: element.property});
  });
  itemAttr.children = typeConfig;

  let safeConfig = _itemConfig ?? [];
  safeConfig.push(itemAttr);
  return safeConfig;
}

////////////// UI-parts Assets ///////////////

export function useUIAssets(lang:string='en') {
  const { setUILocale, setUIList, setUIPartDic, setUIConfig } = useAssetStore();

  useEffect(() => {
    const init = async () => {
      try {
        const _uilocale = await fetchUILocale(lang);
        setUILocale(_uilocale);

        const _uilist = await fetchUIList();
        setUIList(_uilist);
        
        const _uipartdic = await fetchUIPartDic();
        setUIPartDic(_uipartdic);

        const _uiconfig = await fetchUIConfig(_uilist);
        setUIConfig(_uiconfig);
        //console.info("uiconfig >>>", _uiconfig);

      } catch (err) {
        console.error(err);
      }
    };

    init();
  }, []);
}

async function fetchUILocale(lang:string) {
  let localefilePath;
  if(lang === "ja" || lang === "jp"){
    localefilePath = "././locale/ja_JP/uiproperties.json";
  }else{
    localefilePath = "././locale/en_US/uiproperties.json";
  }

  const res = await fetch(localefilePath);
  const result = await res.json();
  let uiLocale = result['UILocale'];
  return uiLocale;
}

async function fetchUIList(){
  const res = await fetch("././config/UIConfig.json");
  const result = await res.json();

  let uiParts = result['UIParts'];            
  uiParts = uiParts.filter(function(category:any) {
    if(category.include === "true") {
      let uiItems = category['items'];
      uiItems =  uiItems.filter(async function(item:any) {
        if(item.visible === "true") {
          return item;
        }
        return item.visible === "true";
      });
      category['items'] = uiItems;
    }
    return category.include === "true";
  });

  return uiParts;
}

async function fetchUIPartDic(){
  const res = await fetch("././config/UIPartDic.json");
  const result = await res.json();
  return result;
}

async function fetchUIConfig(uiList:any[]): Promise<UIConfig[]> {
  let configs: UIConfig[] = [];

  for (let index = 0; index < uiList.length; index++) {
    const items = uiList[index]['items'];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const uiDisplayName = (item['type']) ? item['name']+item['type'] : item['name'];
      const uiconfig = await fetchUIContainer(uiDisplayName);
      if (uiconfig) {
        configs.push(uiconfig[0]);
      }
    }    
  }
  return configs;
}
async function fetchUIContainer(uipart: string): Promise<UIConfig[] | null> {
  try {    
    const _classpath = "././config/uipart/"+uipart+".xml";
    const parsedXML = await fetchAndParseXML(_classpath);

    if (!parsedXML?.item) return null;

    var uiitem = parsedXML.item;
    if(uiitem.properties){
      const uiproperties = uiitem.properties;
      const uiTemplate:UIConfig[] = setUITemplate(uiitem, uiproperties.type);
      return uiTemplate;
    }
  } catch (e) {
    console.error('Error in fetchUIConfig:', e);
  }
  return null;  
}
function setUITemplate(item:any, properties:any[]) {
  let _itemConfig: UIConfig[] = [];

  delete item.properties;
  let itemAttr:UIConfig = item;

  let typeConfig:any[] = [];
  properties.forEach((element:any) => {
    typeConfig.push({name: element.name, properties: element.property});
  });
  itemAttr.children = typeConfig;

  let safeConfig = _itemConfig ?? [];
  safeConfig.push(itemAttr);
  return safeConfig;
}

////////////// Actions Assets ///////////////

export function useActionAssets(lang:string='en') {
  const { setActionLocale, setActionList, setActionConfig } = useAssetStore();

  useEffect(() => {
    const init = async () => {
      try {
        const _actionlocale = await fetchActionLocale(lang);
        setActionLocale(_actionlocale);

        const _actionlist = await fetchActionList();
        setActionList(_actionlist);

        const _actionconfig = await fetchActionConfig(_actionlist);
        setActionConfig(_actionconfig);
        //console.info("actionconfig >>>", _actionconfig);

      } catch (err) {
        console.error(err);
      }
    };

    init();
  }, []);
}

async function fetchActionLocale(lang:string) {
  let localefilePath;
  if(lang === "ja" || lang === "jp"){
    localefilePath = "././locale/ja_JP/actionsproperties.json";
  }else{
    localefilePath = "././locale/en_US/actionsproperties.json";
  }

  const res = await fetch(localefilePath);
  const result = await res.json();
  let actionlocale = result['ActionLocale'];
  return actionlocale;
}

async function fetchActionList(){
  const res = await fetch("././config/ActionConfig.json");
  const result = await res.json();

  let actions = result['Actions'];
  actions =  actions.filter(function(category:any) {
    if(category.include === "true") {
      let uiItems = category['items'];
      uiItems =  uiItems.filter(function(item:any) {
        if(item.visible === "true") {
          return item;
        }
        return item.visible === "true";
      });
      category['items'] = uiItems;
    }
    return category.include === "true";
  });
  
  /*for (let index = 0; index < actions.length; index++) {
    const category = actions[index];
    let actionItems = category['items'];
    category['items'] = setActionListLocale(actionItems, actionLocale);
  }*/
  
  return actions;
}
/*function fetchActionConfig(acttype:string, actionname:string) {
  let actionTemplate = [];  

  let _name = actionname.charAt(0).toUpperCase() + actionname.substr(1);
  let _classpath = "././config/action/"+getSelectedCategory(acttype)+"/"+getSelectedAction(_name)+".xml";

  fetch(_classpath)
    .then(res => res.text())
    .then(
      (result) => {
        var XMLParser = require('react-xml-parser');
        var xml = new XMLParser().parseFromString(result);
        //console.log(actionname, ">>>>>>>>", xml);
        var actionitem = xml.getElementsByTagName('item');
        if(actionitem.length > 0){
          var actionproperties = xml.getElementsByTagName('type');
          actionTemplate = setActionTemplate(actionitem[0], actionproperties);
          return actionTemplate;
        }
      },        
      (error) => {
        console.error(actionname, " action config error >>>", error);        
      }
    )   
}*/
async function fetchActionConfig(actList:any[]): Promise<ActionConfig[]> {
  let configs: ActionConfig[] = [];

  for (let index = 0; index < actList.length; index++) {
    const items = actList[index]['items'];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const actconfig = await fetchActionContainer(item['type'], item['name']);
      if (actconfig) {
        configs.push(actconfig[0]);
      }
    }    
  }
  return configs;
}
async function fetchActionContainer(acttype:string, actionname:string): Promise<ActionConfig[] | null> {
  try {    
    const _name = actionname.charAt(0).toUpperCase() + actionname.substr(1);
    const _classpath = "././config/action/"+getSelectedCategory(acttype)+"/"+getSelectedAction(_name)+".xml";
    const parsedXML = await fetchAndParseXML(_classpath);

    if (!parsedXML?.item) return null;

    var actionitem = parsedXML.item;
    if(actionitem.properties){
      var actionproperties = actionitem.properties;
      const actionTemplate:ActionConfig[] = setActionTemplate(actionitem, actionproperties.type);
      return actionTemplate;
    }

  } catch (e) {
    console.error('Error in fetchActionContainer:', e);
  }
  return null;  
}
function getSelectedAction(actionName:string){
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
function getSelectedCategory(actionType:string)
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

function setActionTemplate(item:any, properties:any[]) {
  let _itemConfig: ActionConfig[] = [];

  delete item.properties;
  let itemAttr:ActionConfig = item;
  //console.info(itemAttr.category, itemAttr.method, "**********", properties);

  let typeConfig:any[] = [];
  properties.forEach((element:any) => {    
    if(element.name === 'parameters') {
      typeConfig.push({name: element.name, properties: element.property});
    }
  });
  itemAttr.children = typeConfig;

  let safeConfig = _itemConfig ?? [];
  safeConfig.push(itemAttr);
  return safeConfig;
}

///////////////////////////////////////////

/*function populateItemConfig(properties:any) {
  var _propConfig:any[] = [];
  if(properties.length === 0)
    return _propConfig;
  
  properties.forEach((element:any) => {
    let propObj = element.attributes;
    if(element.children !== undefined && element.children.length > 0) {
      let otherObj = populatePropertyObjects(element);        
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

function populatePropertyObjects(propobj:any) {
  var _propObj:any[] = [];

  let children = propobj.children;     
  children.forEach((element:any) => {
    let _prop:any[] = [];

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
        _prop = generateDataSource(state.project, source, _prop, element.attributes);
        _propObj.push({name:element.name, labelField:element.attributes['labelField'], valueField:element.attributes['valueField'], items:_prop});
      }
    }
    
  });
  
  return _propObj;
}*/

/*function generateDataSource(baseData, source, resultArr, attributes) {
    let attrSource = attributes['source'].replace("{","").replace("}","");
    let methodName = attrSource.split(":")[1].split("(")[0];
    //console.log(attributes, " .... dataSource ....", methodName);

    let _data = [];
    switch(methodName) 
    {
      case "getServices":
        _data = getServices(baseData);
        break;
      case "getFontNames":
        _data = getFontNames();
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

  function getFontNames()
  {
    let preDefined_Fonts = ["Amazon Ember", "Roboto", "Noto Sans"];//["Helvetica Neue","Arial","Courier","Courier New","Helvetica","Helvetica Neue","Georgia","Palatino","Times New Roman","Trebuchet MS","Verdana"];
		preDefined_Fonts.unshift("system");
			
		return preDefined_Fonts;
  }*/

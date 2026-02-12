import React from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import { Button, Paper, RadioGroup, Radio, FormControlLabel, Typography, Box, Grid, MobileStepper, IconButton, Checkbox, Snackbar, Popover, CircularProgress, ListItemIcon, SvgIcon, Fab, LinearProgress, Select, MenuItem } from '@material-ui/core';
import { List, ListItem, ListItemText, ListItemSecondaryAction, TextField } from '@material-ui/core';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import HelpIcon from '@material-ui/icons/Help';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import DownloadIcon from '@material-ui/icons/GetApp';
import EditIcon from '@material-ui/icons/Edit';
import DoneIcon from '@material-ui/icons/Done';
import ImageViewer from '../../components/ImageViewer';

const useStyles = makeStyles(theme => ({
  root: {
    //flexGrow: 1,
  },
  paper: {
    height: '50vh',
    padding: 16,
    borderRadius: 8,
    textAlign: 'center',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent:'space-between',
    alignItems: 'center',
    //paddingBottom: 0
  },
  group: {
    width: '100%',
    height: '100%',
    padding: 8,
    //border: '1px solid #ced4da',
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'column',
    justifyContent:'space-between'
  },
  optiondiv: {
    height: '100%',
    textAlign: 'start',
    margin: theme.spacing(0.5),
    padding: theme.spacing(1),
    color: theme.palette.common.black,
    border: '2px solid rgb(0,0,0)',
    borderRadius: 8,
    whiteSpace: 'pre-wrap',
    display: 'flex',
    flexDirection: 'column',
    justifyContent:'space-between',
    background: theme.palette.background.default
  },
  optionlabel: {
    height: '100%', 
    display: 'flex',
    color: theme.palette.text.primary
  },
  formtext: {
    width: 150,
    color: theme.palette.text.primary
  },
  btnok: {
    width: 120,
    textTransform: 'none',
    margin: theme.spacing(1),
    position: 'relative',
    left: `calc(50% - 60px)`,
  },
  btn: {
    width: 120,
    textTransform: 'none',
    margin: theme.spacing(1),
  },
  paperview: {
    height: '72vh',
    padding: 24,
    borderRadius: 8,
    textAlign: 'center',
    overflow: 'hidden',
    //display: 'flex',
    flexDirection: 'column',
    alignItems: 'start',
    justifyContent:'space-between',
    background: theme.palette.background.paper
  },
  boxview: {
    width: '100%',
    height: `calc(100% - 48px)`,
    padding: 8,
    display: 'flex',
    justifyContent:'space-around',
    alignItems: 'center',
    border: '1px solid #ced4da',
    borderRadius: 8,
  }, 
  paperlist: {
    minWidth: 320, 
    height: '100%',
    background: theme.palette.background.default
  },
  paperimg: {
    width: '100%', 
    minWidth: 320, 
    height: '100%', 
    margin: 8,
    marginRight: 0,
    background: theme.palette.background.default,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnback: {
    minWidth: 40,
    height: 40,
    borderRadius: '50%',
    textTransform: 'none',
    margin: theme.spacing(0),
    padding: theme.spacing(0),
    backgroundColor: theme.palette.grey[700],
    color: theme.palette.common.white,
  },
  boxheader: {
    //width: '100%',
    height: 24,
    padding: 8,
    backgroundColor: theme.palette.grey[700],
    color: theme.palette.common.white,
    display: 'flex',
    justifyContent:'space-between'
  },  
  boxoptions: {
    display: 'flex',
    justifyContent:'space-between',
    height: 24,
    padding: 8,
    background: theme.palette.background.default,
    borderBottom: '1px solid #888',
    borderRadius: 4,
    boxShadow: '2px 1px #888888',
    marginRight: 2
  },
  selectall: {
    //width: '100%',
    maxHeight: 32,
    paddingLeft: 8,
    marginLeft: 0,
    background: theme.palette.background.default,
    color: "rgb(0,0,255)"
  },
  figmaIdlist: {
    overflow: 'hidden auto', 
    padding: '0px 8px',
    height: 'calc(100% - 88px)',
    background: theme.palette.background.default
  },
  selectedcount:{
    height: 24,
    background: theme.palette.background.default,
    display: 'none',//'flex',
    justifyContent: 'end',
    alignItems: 'center',
    padding: '0px 8px',
    borderTop: '1px solid #888',
    borderRadius: 4,
    boxShadow: '-2px -1px #888888'
  },
  figmaIdcheck: {
    minWidth: 32,
    width: 40,
    height: 40,
    background: theme.palette.background.default,
    justifyContent: 'end',
    border: '2px solid #88888899',
    borderRadius: '50%'
  },
  figmauilist: {
    display: 'block',
    justifyContent: 'center',
    maxWidth: 460, 
    width: '100%', 
    height: 'inherit', 
    overflow: 'hidden',
    padding: '0px',
    background: theme.palette.background.default 
  },
  helptext: {
    textAlign: 'start',
    margin: theme.spacing(0),
    padding: theme.spacing(0.5),
    color: theme.palette.common.white,
    backgroundColor: theme.palette.grey[600],
    border: '2px solid rgb(227,227,227)',
    borderRadius: 8,
  },
  iconbtn: {
    position: 'absolute',
    right: 32,
    padding: 2
  },  
  btnhelp: {
    padding: 12,
  },
  btnclose: {
    position: 'absolute',
    right: 16,
    width: 24, 
    height: 24, minHeight: 24,
    margin: '2px 6px',
    fill: '#3f51b5',
    backgroundColor: 'transparent',
    borderRadius: '4px',
    boxShadow: 'none'
  },
  buttonview: {
    width: '100%',
    height: 40,
    padding: 8,
    display: 'flex',
    justifyContent:'center',
    alignItems: 'center',
    border: 0
  },
  newtabicon: {
    position: 'absolute',
    right: 24, top: 48,
    backgroundColor: theme.palette.grey[400],
    color: theme.palette.common.white,
    borderRadius: 2,
    padding: 4,
    margin: 2,
  },
  mobilefit: {
    width: 'auto',
    height: `calc(100% - 12px)`, 
    marginTop:8
  },
  desktopfit: {
    width: '100%',
    height: 'auto',
  },
  stepper: {
    width: '100%',
    backgroundColor: theme.palette.grey[400],
    padding: 0,//'0px 8px'
    borderRadius: 4
  },
  resourcebox: {
    display: 'flex', 
    flexDirection: 'column',
    padding: 8,
    background: theme.palette.background.default
  },
  listbox:{
    minWidth: 660,
    minHeight: 480, 
    overflow:'hidden',
    display: 'flex', flexDirection: 'row',
    border: '2px solid rgb(227,227,227)',
    borderRadius: 8,
    margin: 8,
    background: theme.palette.background.default
  },
  paperresources: {
    minWidth: 400,
    height: 464,
    margin: '8px 0px',
    background: theme.palette.background.default
  },
  filelist: {
    minWidth: 380,
    overflow:'hidden auto', 
    padding:'0px 8px',
    background: theme.palette.background.default
  },
  filenamebtn:{
    width: 24,
    height: 24,
    background: 'blue',
    color: 'white',
    marginRight: '-8px',
    position: 'absolute',
    right: 0, top: 2
  },
  resourcenamediv: {
    display:'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    minWidth: 240,
    height: 28,
    padding: '0px 4px', 
    backgroundColor: 'rgba(189,189,189,1)',
    borderRadius: 6,
  },
  resourcenameinput: {
    width: '100%',
    borderRadius: 2
  },
  fileitem: {
    height: 28,
  },
  fileviewer: {
    width: '100%',
    margin: 8,
    borderLeft: '1px solid rgb(227,227,227)',
    display: 'flex', justifyContent: 'center', alignItems:'center',
    background: theme.palette.background.default
  },
  aspect: {
    width:'100%', 
    maxHeight: 360,
    objectFit:'scale-down',
  },
  progressbox: {
    display: 'flex', 
    flexDirection: 'column',
    justifyContent: 'center', 
    alignItems:'center',
    margin: 12,
    padding: 12,
    border: '2px solid #666666',
    borderRadius: 4
  },
  progressbar: {
    width: '75%',
    margin: '6px 24px 12px'
  }
}));

const StyledListItem = withStyles(theme => ({
  root: {
      maxHeight: 28,
      paddingLeft: 4,
      margin: '6px 0px',
      border: '1px solid',
      borderColor: theme.palette.common.white,
      borderRadius: 8,
      boxShadow: '2px 0px 5px 1px #888888',
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
      "&.Mui-selected": {
        background: theme.palette.background.hover,
          color: theme.palette.common.white,
      }        
  },
  selected: {}
}))(ListItem);

export default function AppTemplateEditor(props) {

  const classes = useStyles();

  const groupname= "template";
  const [value, setValue] = React.useState(props.gridOption);

  const [open, setOpen] = React.useState(true);
  const [view, setView] = React.useState('init');

  const arrEnterprisePages = [
    {'title':'Launch',          'name':'Launch',           'required':true,    'include':true},
    {'title':'Login',           'name':'Login',            'required':true,    'include':true},
    {'title':'Register',        'name':'Register',         'required':true,    'include':true},
    {'title':'Forgot_Password', 'name':'Forgot Password',  'required':true,    'include':true},
    {'title':'Change_Password', 'name':'Change Password',  'required':true,    'include':true},
    {'title':'User_Dashboard',  'name':'User Dashboard',   'required':true,    'include':true},
    {'title':'User_Profile',    'name':'User Profile',     'required':true,    'include':true},
    {'title':'Admin_Dashboard', 'name':'Admin Dashboard',  'required':false,   'include':false},
    {'title':'Admin_Profile',   'name':'Admin Profile',    'required':false,   'include':false},
    {'title':'Session_Out',     'name':'Session Out',      'required':false,   'include':false}
  ];  


  const [pageDic, setPageDic] = React.useState([]);
  const [uilist, setUIList] = React.useState([]);
  const [uipartDic, setUIpartDic] = React.useState([]);
  const [expSidebarDic, setExpSidebarDic] = React.useState({});
  React.useEffect(() => {
    fetchPageDic().then(result => setPageDic(result));
    fetchUIList().then(result => setUIList(result));
    fetchUIpartDic().then(result => setUIpartDic(result));

    fetch("././config/exp_sidebar.json")
        .then(res => res.json())
        .then(
          (result) => {          
            setExpSidebarDic(result);
          },        
          (error) => {
            console.log("setExpSidebarDic error >>>", error);
          }
        )

  }, []);

  function fetchPageDic(){
    return fetch("././config/PageViewDic.json")
      .then(res => res.json())
      .then(
        (result) => {          
          //console.log("Page View dic fetching result >>>", result);
          let pageView = result['PageView'];
          return pageView;          
        },        
        (error) => {
          console.error("Page View dic fetching error >>>", error);
        }
      )
  }

  function fetchUIList(){
    return fetch("././config/UIConfig5.json")
      .then(res => res.json())
      .then(
        (result) => {
          let uiParts = result['UIParts'];          
          
          let resultList = [];
          for (let index = 0; index < uiParts.length; index++) {
            const category = uiParts[index];
            if(category.include === "true"){
              let uiItems = category['items'];
              let filteredUIItems = uiItems.filter(item => item.visible === "true")
                  .map(item => ({ name: (item.type) ? item.name + item.type : item.name }));

              resultList = resultList.concat(filteredUIItems);
            }            
          }
          resultList.unshift({name:''});
          //console.info("........resultList >>>", resultList);
          return resultList;          
        },        
        (error) => {
          console.error("UIConfig fetching error >>>", error);
        }
      )
  }

  function fetchUIpartDic(){
    return fetch("././config/UIPartDic.json")
      .then(res => res.json())
      .then(
        (result) => {          
          //console.log("UIParts dic fetching result >>>", result);
          let uiParts = result['UIParts'];
          return uiParts;          
        },        
        (error) => {
          console.error("UIParts dic fetching error >>>", error);
        }
      )
  }

  function handleClose() {
    setOpen(false);
  }

  function handleChangeValue(event) {
    let val = event.currentTarget.value;
    setValue(val);
  }

  function handleCloseFigma() {
    setView('init');
    setOpen(false);
    props.onCloseTemplateEditor();
    //props.onPageSave(pagelistdata);
  }

  function handleOKclick() {    
    if(value === 'blank'){
      setView('init');
      setOpen(false);
      props.onSelectTemplate(value);

    }else if(value === 'enterprise'){
      setView('enterpriseview');

    }
    else if(value === 'figma'){
      handleFigmaImport();        
    }
  }

  function handleBack() {
    setView('init');
  }

  ///////////////////// Enterprise ////////////////

  const handleIncludePage = (updatedValue, index) => () => {
    console.log(arrEnterprisePages, "..handleIncludePage >>>>>", index, updatedValue);
  }

  function handleEnterpriseOK() {
    let scrWidth = props['projectdata']['availableScreens'][0]['width'];
    let scrHeight = props['projectdata']['availableScreens'][0]['height'];

    //console.log("pageDic >>>>", pageDic);
    let pageDicArray = pageDic;

    let basePagedic = pageDicArray[0].dic;    
    basePagedic.Children = []; 
    
    let scrollBasedic = pageDicArray.filter(function(pagedic) {
      return pagedic.name === 'ScrollBaseView';
    });
    //basePagedic = Object.assign({}, basePagedic, scrollBasedic[0].dic);
    basePagedic.Children.push(scrollBasedic[0].dic);

    let draggedPagedic = pageDicArray.filter(function(pagedic) {
      return pagedic.name === "ScrollView";
    });

    let objPageDic = Object.assign({}, basePagedic, draggedPagedic[0].dic);
    //console.log(props, "objPageDic >>>", objPageDic);    

    let pagelistdata = [];
    for (let i = 0; i < arrEnterprisePages.length; i++) {
      const element = arrEnterprisePages[i];
      if(element['include']){

        let pageDic = JSON.parse(JSON.stringify(objPageDic));
        pageDic['parentid'] = 'App';
        pageDic['Title'] = element['title'];
        pageDic['moduleName'] = element['name'];
        pageDic['frame']['width'] = scrWidth;
        pageDic['frame']['height'] = scrHeight;
        pageDic.Children[0]['frame']['width'] = pageDic['Children'][0]['_frames'][0]['width'] = scrWidth;
        pageDic.Children[0]['frame']['height'] = pageDic['Children'][0]['_frames'][0]['height'] = scrHeight;
        pageDic['Document'] = setDocument_forPage();
        pageDic['NavigationBarHidden'] = true;
        pageDic['_toolBarTop'][0]['frame']['width']= scrWidth;
        pageDic['_toolBarBottom'][0]['frame']['width']= scrWidth;
        pageDic['_toolBarLeft'][0]['frame']['width']= Math.floor(scrWidth * 0.75);
        pageDic['_toolBarLeft'][0]['frame']['height']= scrHeight;
        pageDic['_toolBarRight'][0]['frame']['width']= Math.floor(scrWidth * 0.75);
        pageDic['_toolBarRight'][0]['frame']['height']= scrHeight;
        
        pagelistdata.push(pageDic);
      }      
    }

    console.log(arrEnterprisePages, ".. Pages >>>>>", pagelistdata);
    savePageData(pagelistdata, 0);
  }

  function setDocument_forPage() {
    const nowDate = new Date();
    let strDate = nowDate.getFullYear() +'-'+ parseInt(nowDate.getMonth()+1) +'-'+ nowDate.getDate()  +' '+ nowDate.getHours()  +':'+ nowDate.getMinutes()  +':'+ nowDate.getSeconds();
    const i = nowDate.toString().indexOf("GMT");
    strDate = strDate +" GMT"+ nowDate.toString().substring(i+3, i+8);
  
    let _document = [];
    let createdObj = {"key": "createddatetime", "value": strDate};
    _document.push(createdObj);
    let lastupdateObj = {"key": "lastupdatedatetime", "value": strDate};
    _document.push(lastupdateObj);
  
   return _document;
  }

  
  ///////////////////// Figma ////////////////   

  const [anchorHelp, setAnchorHelp] = React.useState(null);
  const openHelp = Boolean(anchorHelp);
  const [showHelp, setShowHelp] = React.useState(false);
  const handleHelpText = (event) => {     
    setShowHelp(!showHelp);
    setAnchorHelp(event.currentTarget);
  }

  let _fileId = "";                       //izg8hhKzEIrXlGoiUYgbyw/Figma-Test       //BoMUAY8LN4DLpXYT0clBLO/JSPL
  let _scrWid = 0;                        //390
  let _scrHei = 0;                        //825
  if(props.projectdata && props.projectdata['figmaData']){
    _fileId = props.projectdata['figmaData']['fileId'];

    if(props.projectdata['availableScreens'] && props.projectdata['availableScreens'].length > 0){
      _scrWid = props.projectdata['availableScreens'][0]['width'];
      _scrHei = props.projectdata['availableScreens'][0]['height'];
    }
  }

  const [fileId, setFileId] = React.useState(_fileId);
  const [scrWid, setScrWid] = React.useState(_scrWid);
  const [scrHei, setScrHei] = React.useState(_scrHei);
  const [showFileIdError, setFileIdError] = React.useState(false);
  const [showScrWidError, setScrWidError] = React.useState(false);
  const [showScrHeiError, setScrHeiError] = React.useState(false);
  
  const [showFigmaImageZoom, setFigmaImageZoom] = React.useState(false);
  const [showResultImageZoom, setResultImageZoom] = React.useState(false);

  const [checkedAllFigmaIds, setCheckedAllFigmaIds] = React.useState(true);
  const [checkedFigmaIds, setCheckedFigmaIds] = React.useState([]);
  const [figmaIds, setFigmaIds] = React.useState([]);
  const [selectedFigmaId, setSelectedFigmaId] = React.useState(0);
  const [figmaPages, setFigmaPages] = React.useState([]);
  
  const [showWait, setShowWait] = React.useState(false);
  const [waitMsg, setWaitMsg] = React.useState('Please Wait ....');
  const [showLoading, setLoadingMore] = React.useState(false);
  
  const [pagedata, setPageData] = React.useState([]);

  const [showTitleError, setTitleError] = React.useState(false);
  const [showMessage, setShowMessage] = React.useState(false);
  const [msgContent, setMsgContent] = React.useState('');

  const [resourcesRef, setResourcesRef] = React.useState([]);

  const [isFigmaFB, setFigmaFB] = React.useState(false);
  const [existFBdata, setExistFBdata] = React.useState({});
  const [figmaFBdata, setFigmaFBdata] = React.useState({});

  const isEYHI = false;//(_fileId.indexOf("5RQwqkwGdfAoYBezQDfn0f") === 0) ? true : false;

  function updateFigmaSessionData(keyName) {
    let figmaKeys = sessionStorage.getItem("figmaProjectKeys");
    figmaKeys = figmaKeys ? figmaKeys + "," + keyName : keyName;
    sessionStorage.setItem("figmaProjectKeys", figmaKeys);
  }
  
  function handleFigmaImport() {
    if(fileId.length === 0){
        setFileIdError(true);
        return;
    }
    if(isNaN(scrWid) || scrWid === 0){
        setScrWidError(true);
        return;
    }
    if(isNaN(scrHei) || scrHei === 0){
        setScrHeiError(true);
        return;
    }
    setFileIdError(false);
    setScrWidError(false);
    setScrHeiError(false);

    sessionStorage.setItem("figmaProjectKeys", "");
    fetchFigmaFileIds();

    fetchFeedbackData();
  }

  function handleSetFigmaId(e) {
    let _fileid = e.target.value;
    /*if(_fileid.length > 0) {
      const allowedChars = /\w/g;
      let allowedTitle = _fileid.match(allowedChars);
      if(!allowedTitle) {
        console.log("Error in ID...");
        return;
      }
      if(allowedTitle && (_fileid.length !== allowedTitle.length)) {
        console.log("Error in ID...");
        return;
      }
    }*/
    setFileIdError(false);
    setFileId(_fileid);    
  }

  function handleSetMobileDimension(e, type) {
    let _dval = parseInt(e.target.value);
    if(_dval.length > 0) {
      const allowedChars = /\d/;
      let allowedValue = _dval.match(allowedChars);
      if(!allowedValue) {
        console.log("Error in value...");
        return;
      }
    }
    
    if(type === 'width'){
        setScrWidError(false);
        setScrWid(_dval);
    }else{
        setScrHeiError(false);
        setScrHei(_dval);
    }
  }

  function fetchFigmaFileIds(){
    setShowWait(true);
    setWaitMsg('Importing Figma data ..');

    const consoleUrl = (props.appconfig.console && props.appconfig.console.length > 0) ? props.appconfig.console : "developmentconsole.mobilous.com";
    let api_figmadata = "https://" + consoleUrl + "/FigmaUIDetection/getfileid";
    const headerVal = new Headers();
    headerVal.append("Content-Type", "text/plain");
    const rawbody = JSON.stringify({
      "url": "https://www.figma.com/design/"+fileId,
      "mobile_sizes": [[scrWid,scrHei]]
    })
    
    fetch(api_figmadata, {method:'POST', body:rawbody, headers:headerVal, redirect:"follow"})
        .then(res => res.json())      
        .then(
          (result) => {
            if(result.hasOwnProperty('error')){
              setMsgContent(result['message']);
              setShowMessage(true);

            }else{
              const _figmaIds = manipulateFileIds(result);
              if(_figmaIds.length > 0){
                setFigmaIds(_figmaIds);
                setView('figma-ids');
              }else{
                setMsgContent('No further pages available.')
                setShowMessage(true);
              }
            }
            
            setShowWait(false);
          },
          (error) => {
            console.error("Unable to fetch data:", error);
            
            setShowWait(false);
            setMsgContent('Something went wrong. Please try again.')
            setShowMessage(true);
          }
        )
  }
  function manipulateFileIds(data) {
    let _addedPages = [];
    //_addedPages = props.projectdata['figmaData']['addedPages'];

    if(props.projectdata['figmaData'] && props.projectdata['figmaData']['addedPages']){
      let appFigmaPages = props.projectdata['figmaData']['addedPages'];
      if(appFigmaPages && appFigmaPages.length > 0){
        const filteredPages = appFigmaPages.filter(val => val.hasOwnProperty('pageid'));
        if(filteredPages && filteredPages.length > 0){
          if(filteredPages.length < appFigmaPages.length){
            props.projectdata['figmaData']['addedPages'] = filteredPages;
            updateFigmaSessionData("figmaData");
          }
        }

        _addedPages = filteredPages.map(item => item.uid);
      }
    }

    let figmaIds = [];
    data.forEach((figmapage,i) => {
      if(_addedPages.length > 0){
        if(!_addedPages.includes(figmapage['file_id'])){
          figmaIds.push({name:'page'+(i+1), fileId:figmapage['file_id'], 'imageUrl':figmapage['original_image_url'], 'include':true});
        }
      }else{
        figmaIds.push({name:'page'+(i+1), fileId:figmapage['file_id'], 'imageUrl':figmapage['original_image_url'], 'include':true});
      }             
    });
    console.log("manipulateFileIds >>>>", figmaIds);

    const _figmaIds = setAllFigmaIds(figmaIds, true);
    setCheckedFigmaIds(_figmaIds);

    return figmaIds;
  }  
  function handleSelectAllFigmaIds(event) {
    let updatedValue = Boolean(event.currentTarget.checked);
    setCheckedAllFigmaIds(updatedValue);    
    if(updatedValue) {
      const _figmaIds = setAllFigmaIds();
      setCheckedFigmaIds(_figmaIds);
    }else {
      setCheckedFigmaIds([]);
    }
  }
  function setAllFigmaIds(figmaRef, ref) {
    let abc = (ref) ? figmaRef : figmaIds;
    let arrFigmaIds = [];
    for (let i = 0; i < abc.length; i++) {
      const _page = abc[i];
      arrFigmaIds.push(_page.fileId);      
    }
    return arrFigmaIds;
  }
  function handleSelectFigmaIds(e) {
    let _dataset = e.currentTarget.dataset;
    //setSelectedFigmaId(_dataset.id);

    const value = _dataset['fileid'];
    const currentIndex = checkedFigmaIds.indexOf(value);
    const newChecked = [...checkedFigmaIds];

    if (currentIndex === -1) {
      newChecked.push(value);
    }else {
      newChecked.splice(currentIndex, 1);         
    }
    //console.log(value, currentIndex, "handleSelectPageIds>>>>", newChecked);
    setCheckedFigmaIds(newChecked);
    if(newChecked.length === figmaIds.length) {
      setCheckedAllFigmaIds(true);
    }else{
      setCheckedAllFigmaIds(false);
    }
  }
  function handleSelectedItem(e){
    let _dataset = e.currentTarget.dataset;
    setSelectedFigmaId(_dataset.id);
  }
  function handleOpenFigmaFile(){
    window.open(figmaIds[selectedFigmaId]['imageUrl']);
  }
  function handleZoomInFigmaFile(){
    setFigmaImageZoom(!showFigmaImageZoom);
  }

  function handleBackFigmaIds(){
    setView('figma-ids');
  }
  function handleFigmaIdsOK(){
    console.log(checkedFigmaIds, "*****************************", figmaPages);

    if(checkedFigmaIds.length === 0){
      setMsgContent('Select atleast 1 file.')
      setShowMessage(true);
    }else{

      if(figmaPages.length > 0){
        let fetchedPageIds = [];

        let filteredPages = figmaPages.filter(function(page) {
          if(checkedFigmaIds.includes(page['pageuid'])){
            fetchedPageIds.push(page['pageuid']);
            return true;
          }
          return false;
        });

        setFigmaPages(filteredPages);
        
        const newFigmaIds = checkedFigmaIds.filter((e) => !fetchedPageIds.includes(e));
        //console.log(fetchedPageIds, newFigmaIds, "**********&&&&&&&&*********", filteredPages);
        if(newFigmaIds.length > 0){
          fetchFigmaFiles(newFigmaIds, filteredPages);
        }else{
          setView('figmaview');
        }
      }else{

        const arrFigmaIds = JSON.parse(JSON.stringify(checkedFigmaIds));
        fetchFigmaFiles(arrFigmaIds);
      }
    }
  }

  function fetchFigmaFiles(arrFigmaIds, arrPages) {
    setShowWait(true);
    setWaitMsg('Fetching selected file data ..');

    const consoleUrl = (props.appconfig.console && props.appconfig.console.length > 0) ? props.appconfig.console : "developmentconsole.mobilous.com";
    let api_figmadata = "https://" + consoleUrl + "/FigmaUIDetection/getfileres";
    const headerVal = new Headers();
    headerVal.append("Content-Type", "text/plain");
    const rawbody = JSON.stringify({
      "url": "https://www.figma.com/design/"+fileId,
      "page-id": arrFigmaIds.splice(0,4)
    })

    fetch(api_figmadata, {method:'POST', body:rawbody, headers:headerVal, redirect:"follow"})
        .then(res => res.json())      
        .then(
          (result) => {
            let isResult = false;

            if(!arrPages) arrPages = figmaPages;
            let figmapagedata = JSON.parse(JSON.stringify(arrPages));
            if(Array.isArray(result)){
                isResult = true;
                let _figmaPages = figmapagedata.concat(result);
                setFigmaPages(manipulateData(_figmaPages));
                
                if(arrFigmaIds.length > 0){
                  fetchFigmaFiles(arrFigmaIds, _figmaPages);
                  setLoadingMore(true);
                }else{
                  setLoadingMore(false);
                }                
            }else{
                if(result.hasOwnProperty('message') && result['results'].length > 0){
                    isResult = true;
                    if(result['message'] === "All images have been processed."){
                        let _figmaPages = figmapagedata.concat(result['results']);
                        setFigmaPages(manipulateData(_figmaPages));
                    }
                    setLoadingMore(false);
                }
            }
            if(!isResult){
                setMsgContent('Something went wrong. Please try again.')
                setShowMessage(true);
                setShowWait(false);
            }else{
                setView('figmaview');
                setShowWait(false);
            }
          },
          (error) => {
            console.error("Unable to fetch data:", error);
            
            setShowWait(false);
            setMsgContent('Something went wrong. Please try again.')
            setShowMessage(true);
          }
        )
  }
  function manipulateData(figmaData) {
    figmaData.forEach(figmapage => {
      if(!figmapage.hasOwnProperty('name')){
        figmapage['name'] = getDefaultName(figmapage['pageuid']);
        figmapage['title'] = figmapage['name'];
      }
      if(!figmapage.hasOwnProperty('include')){
        figmapage['include'] = true;
      }

      if(figmapage.hasOwnProperty('page_absoluteBoundingBox')){
        figmapage['dimensions'] = {};
        figmapage['dimensions']['width'] = figmapage['page_absoluteBoundingBox']['width'];
        figmapage['dimensions']['height'] = figmapage['page_absoluteBoundingBox']['height'];
        delete figmapage['page_absoluteBoundingBox'];
        if(figmapage['dimensions']['width'] === 0 || figmapage['dimensions']['height'] === 0){
          figmapage['dimensions']['width'] = scrWid;
          figmapage['dimensions']['height'] = scrHei;
        }
      }
      if(figmapage.hasOwnProperty('page_backgroundColor')){
        figmapage['backgroundColor'] = {};
        figmapage['backgroundColor']['alpha'] = figmapage['page_backgroundColor']['alpha'];
        figmapage['backgroundColor']['red'] = figmapage['page_backgroundColor']['red'];
        figmapage['backgroundColor']['green'] = figmapage['page_backgroundColor']['green'];
        figmapage['backgroundColor']['blue'] = figmapage['page_backgroundColor']['blue'];
        delete figmapage['page_backgroundColor'];
      }
      if(figmapage.hasOwnProperty('page_name')){
        figmapage['moduleName'] = figmapage['page_name'];
        delete figmapage['page_name'];
      }

      figmapage['UIParts'] = filteredUIParts(figmapage['UIParts']);
      let arrUIs = figmapage['UIParts'];
      arrUIs.forEach(uielem => {
        if(uielem['dic'].hasOwnProperty('pagetransitionID')){
            console.log(figmapage['pageuid'],"....pagetransitionID >>>>", uielem['dic']['pagetransitionID']);
        }
      });        
    });
    console.info(figmaIds, "manipulateData >>>>", figmaData);
    return figmaData;
  }
  function getDefaultName(puid){
    let page = figmaIds.filter(function(pages) {
      return pages.fileId === puid;
    });

    if(page.length > 0){
      return page[0].name;
    }
    return "";
  }
  function filteredUIParts(arrUIparts){
    /*const isSameFrame = (a, b) => (
      a.x === b.x &&
      a.y === b.y &&
      a.width === b.width &&
      a.height === b.height
    );*/

    const filtered = arrUIparts.filter((elem, index, arr) => {
      if (elem.name === 'SwipeableView') return false;

      // check earlier objects
      /*for (let i = 0; i < index; i++) {
        if (isSameFrame(elem['dic'].frame, arr[i]['dic'].frame)) {
          return false;
        }
      }*/

      return true;
    });

    return filtered;
  }

  const maxSteps = checkedFigmaIds.length;
  const [activeStep, setActiveStep] = React.useState(0);

  const handleNextStep = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBackStep = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleOpeninNewTab = () => {
    window.open(figmaPages[activeStep]['result_image_url']);
  }
  const handleZoomInResultFile = () => {
    setResultImageZoom(!showResultImageZoom);
  }
  
  const handleSetPageTitle = (e) => {
    let _title = e.target.value;
    if(_title.length > 0) {
      const allowedChars = /\w/g;
      let allowedTitle = _title.match(allowedChars);
      if(!allowedTitle) {
        setTitleError(true);
        return;
      }
      if(allowedTitle && (_title.length !== allowedTitle.length)) {
        setTitleError(true);
        return;
      }

      if(isTitleExist(_title, true)){
        setMsgContent('Page Title cannot be same');
        setShowMessage(true);
        //return;
      }else{
        setMsgContent('');
        setShowMessage(false);
      }
    }
    setTitleError(false);    

    let figmapagedata = JSON.parse(JSON.stringify(figmaPages));
    figmapagedata[activeStep]['title'] = _title;
    setFigmaPages(figmapagedata);
  }  

  function isTitleExist(title, ontherun){
    let existTitle = figmaPages.filter(function(pages) {
        return pages.title === title;
    });
    if(ontherun){
        if(existTitle.length > 0)
            return true;
    }else{
        if(existTitle.length > 1)
            return true;
    }

    return false;
  }

  const handleIncludeFigmaPage = (e) => {
    let figmapagedata = JSON.parse(JSON.stringify(figmaPages));
    figmapagedata[activeStep]['include'] = e.target.checked;
    setFigmaPages(figmapagedata);
  }

  const handleAcceptFigmaUI = (index) => (e) => {
    let figmapagedata = JSON.parse(JSON.stringify(figmaPages));
    let uiObj = figmapagedata[activeStep]['UIParts'][index];
    if(uiObj){
        uiObj['accept'] = e.target.checked;
        if(e.target.checked){
          delete uiObj['replacedUI'];
        }
    }
    setFigmaPages(figmapagedata);
  }

  const handleChangeFigmaUI = (item) => (e) => {
    let figmapagedata = JSON.parse(JSON.stringify(figmaPages));
    const uiArr = figmapagedata[activeStep]['UIParts'];
    const findItem = (element) => element['id'] === item['id'];
    const itemIndex = uiArr.findIndex(findItem);
    let uiObj = uiArr[itemIndex];
    uiObj['replacedUI'] = e['target']['value'];

    setFigmaPages(figmapagedata);
    //console.info(uiObj, "*** handleChangeFigmaUI **", figmapagedata);
  }
  
  let toolbarChildren = [];
  let sideBox = '{"_uid":"Label_100_md8qrf8n","viewType":"Label","name":"Label_sb","value":"","_enabledOnScreen":true,"hidden":false,"enabled":true,"userInteractionEnabled":true,"displayOrderOnScreen":0,"taborder":163,"tag":0,"contentMode":"Top","backgroundColor":{"alpha":0.1,"red":0,"green":0.7058823529411765,"blue":0.7568627450980392,"colorName":""},"backgroundGradient":"","backgroundColorRef":"","frame":{"x":10,"y":10,"width":252,"height":1110,"rotation":0},"Document":[{"key":"createddatetime","value":"2025-7-18 17:4:19 GMT+0530"},{"key":"lastupdatedatetime","value":"2025-7-18 17:4:19 GMT+0530"}],"Children":[],"parent":"container1","stylename":"custom","_lockedUI":false,"text":"","showTooltip":false,"item":0,"fieldname":"","fieldtype":"","displayFormat":"","dateFormat":"","dateDataType":"","customDateFormat":"","numberFormat":"","_numberFormat":{},"numberDataType":"","numDisplayFormat":"","textFormat":"","variant":"singleline","borderColor":{"alpha":1,"red":0,"green":0,"blue":0,"colorName":""},"borderWeight":0,"cornerRadius":8,"boxShadow":false,"boxShadowWidth":2,"boxShadowColor":{"alpha":1,"red":0.870588,"green":0.870588,"blue":0.870588,"colorName":""},"font":{"fontName":"system","fontSize":14,"fontWeightNum":400,"fontWeight":false,"fontStyle":false,"textAlignment":"left","textColor":{"red":0,"blue":0,"green":0,"alpha":1,"colorName":""},"lineBreakMode":"WordWrap"},"textColorRef":"","verticalAlignment":"middle","trim":true,"underline":false,"strikeout":false,"textShadow":false,"padding":{"top":2,"right":2,"bottom":2,"left":2}}';
  function handleFigmaOK() {
    let scrWidth = scrWid;//props['projectdata']['availableScreens'][0]['width'];
    let scrHeight = scrHei;//props['projectdata']['availableScreens'][0]['height'];

    props['projectdata']['availableScreens'][0]['width'] = scrWidth;
    props['projectdata']['availableScreens'][0]['height'] = scrHeight;

    updateFigmaSessionData("availableScreens");

    let pageDicArray = pageDic;

    let basePagedic = pageDicArray[0].dic;    
    basePagedic.Children = []; 
    
    let scrollBasedic = pageDicArray.filter(function(pagedic) {
      return pagedic.name === 'ScrollBaseView';
    });
    //basePagedic = Object.assign({}, basePagedic, scrollBasedic[0].dic);
    basePagedic.Children.push(scrollBasedic[0].dic);

    let draggedPagedic = pageDicArray.filter(function(pagedic) {
      return pagedic.name === "ScrollView";
    });

    let objPageDic = Object.assign({}, basePagedic, draggedPagedic[0].dic);
    //console.log(props, "objPageDic >>>", objPageDic);   
    
    let feedbackdata = [];

    let pagelistdata = [];
    for (let i = 0; i < figmaPages.length; i++) {
      const element = figmaPages[i];
      if(!element['include']){
        continue;
      }
      if(element['title'].length === 0){
        setActiveStep(i);
        setMsgContent('Page Title not set for index: '+(i+1))
        setShowMessage(true);
        return;
      }else{
        if(isTitleExist(element['title'], false)){
            setMsgContent('Page Title should be unique.');
            setShowMessage(true);
            return;
        }
      }

      let titleVal = element['title'].replaceAll(" ","").replaceAll("-","_").replaceAll("/","_");

      let pageDic = JSON.parse(JSON.stringify(objPageDic));
      pageDic['_uid'] = element.hasOwnProperty('pageuid') ? element['pageuid'] : "";

      pageDic['parentid'] = 'App';
      pageDic['Title'] = titleVal;
      pageDic['frame']['width'] = scrWidth;
      pageDic['frame']['height'] = scrHeight;      
      pageDic['Document'] = setDocument_forPage();
      pageDic['NavigationBarHidden'] = true;
      pageDic['_toolBarTop'][0]['frame']['width']= scrWidth;
      pageDic['_toolBarTop'][0]['hidden']= true;
      pageDic['_toolBarBottom'][0]['frame']['width']= scrWidth;
      pageDic['_toolBarLeft'][0]['frame']['width']= Math.floor(scrWidth * 0.75);
      pageDic['_toolBarLeft'][0]['frame']['height']= scrHeight;
      pageDic['_toolBarRight'][0]['frame']['width']= Math.floor(scrWidth * 0.75);
      pageDic['_toolBarRight'][0]['frame']['height']= scrHeight;
      if(element['backgroundColor']){
        pageDic['Children'][0]['backgroundColor'] = element['backgroundColor'];
      }
      pageDic.Children[0]['frame']['width'] = pageDic['Children'][0]['_frames'][0]['width'] = (element['dimensions'] && element['dimensions']['width']) ? element['dimensions']['width'] : scrWidth;
      pageDic.Children[0]['frame']['height'] = pageDic['Children'][0]['_frames'][0]['height'] = (element['dimensions'] && element['dimensions']['height']) ? element['dimensions']['height'] : scrHeight;
      if(element['moduleName']){
        pageDic['moduleName'] = element['moduleName'];
      }

      pageDic.Children[0]['Children'] = manipulateChildDef(element['UIParts'], pageDic);

      if(toolbarChildren.length > 0){
        let sideExpData = {viewType: 'ExpansionPanel', uiParts:[]};
        sideExpData.uiParts.push(expSidebarDic);
        pageDic.Children[0]['Children'].unshift(sideExpData);
        
        let sideboxData = {viewType: 'Label', uiParts:[]};
        sideboxData.uiParts.push(JSON.parse(sideBox));
        pageDic.Children[0]['Children'].unshift(sideboxData);
  
        console.info(toolbarChildren, "**** Children ****",pageDic.Children[0]['Children']);

        let toolbarTopChildren = toolbarChildren.filter(function(child) {
          return child.parent === "toolbarTop";
        });
        if(toolbarTopChildren.length > 0) {
          pageDic['_toolBarTop'][0]['Children'] = toolbarTopChildren;
  
          pageDic['_toolBarTop'][0]['frame']['height']= 68;
          pageDic['_toolBarTop'][0].hidden = false;
          pageDic['_toolBarTop'][0].backgroundGradient = 'linear-gradient(95.25deg, #00B4C1 0%, #0A245C 100%)';
          pageDic.Children[0]['frame']['height'] = pageDic['Children'][0]['_frames'][0]['height'] = pageDic.Children[0]['frame']['height'] - pageDic['_toolBarTop'][0]['frame']['height'];
        }
      }
      
      pagelistdata.push(pageDic);

      feedbackdata = setFeedbackData(element, feedbackdata);
    }

    const pid = props.projectdata['projectid'];
    const figmafileId = (pid) ? fileId + "_" + pid : fileId;
    const feedbackDef = {"figmaId": fileId, "fileId": figmafileId, "screens": feedbackdata};
    setFigmaFBdata(feedbackDef);

    console.log(resourcesRef, ".. Pages >>>>>", pagelistdata);
    //savePageData(pagelistdata, 0);
    setPageData(pagelistdata);

    handleResourcesData();
  }

  function manipulateChildDef(childArr, pageData) {
    let childDataArr = [];
    for (let index = 0; index < childArr.length; index++) {
      const element = childArr[index];
      if(!element['accept'] && !element.hasOwnProperty('replacedUI')){
        continue;
      }

      if(element.hasOwnProperty('dic')){

        if(element.hasOwnProperty('replacedUI')){
          const replacedUI = element['replacedUI'];
          console.info(element, "<<< replacedUI >>>", replacedUI);
          let replacedUIdata = uipartDic.filter(function(uidic) {
            return uidic.name === replacedUI;
          });
          if(replacedUIdata.length > 0) {
            const replacedUIdic = replacedUIdata[0]['dic']; 
            const _viewType = getUIViewtype(replacedUIdic);
            const replacedObj = JSON.parse(JSON.stringify(element));
            replacedObj['dic']['viewType'] = _viewType;
            let uidata = createUIData(replacedObj, index, true);
            if(uidata.hasOwnProperty('viewType')){
              childDataArr.push(uidata);
            }
          }
  
        }else {
          let uidata = createUIData(element, index);
          //console.info("%%%%%%%%%%%%%%%%%%%%", uidata)

          if(uidata.hasOwnProperty('parent') && uidata.parent.indexOf("toolbar") > -1){
              toolbarChildren.push(uidata);
          }else{
            if(uidata.hasOwnProperty('viewType') && uidata.uiParts.length > 0){
                childDataArr.push(uidata);
            }else{

              const elementDic = element['dic'];
              const elementType = getUIViewtype(elementDic);
              if(elementType.indexOf("Bar") > -1){
                manipulatePageBars(elementType, elementDic, pageData)            
              }
            }
          }          

        }
      }
    }
    //console.log(childArr, ".. childArr >>>>>", childDataArr);
    return childDataArr;
  }

  function manipulatePageBars(barType, barData, pageDic) {
    console.log(barType, ".... manipulate PageBar >>>", barData, pageDic);
    /*switch (barType) {
      case "TopToolBar":
        pageDic['_toolBarTop'][0]['Children'] = manipulateChildDef(barData.dataarray[0]['Fields'], pageDic);

        pageDic['_toolBarTop'][0]['frame']['height']= barData.frame['height'];
        pageDic['_toolBarTop'][0].hidden = false;
        pageDic['_toolBarTop'][0].backgroundColor = barData['backgroundColor'];
        pageDic['Children'][0]['_frames'][0]['height'] = pageDic.Children[0]['frame']['height'] - pageDic['_toolBarTop'][0]['frame']['height'];
        
        break;
      case "BottomToolBar":
        pageDic['_toolBarBottom'][0]['Children'] = manipulateChildDef(barData.dataarray[0]['Fields'], pageDic);
  
        pageDic['_toolBarBottom'][0]['frame']['height']= barData.frame['height'];
        pageDic['_toolBarBottom'][0].hidden = false;
        pageDic['_toolBarBottom'][0].backgroundColor = barData['backgroundColor'];        
        
        break;
      case "LeftSideBar":
        pageDic['_toolBarLeft'][0]['Children'] = manipulateChildDef(barData.dataarray[0]['Fields'], pageDic);
  
        pageDic['_toolBarLeft'][0]['frame']['width']= barData.frame['width'];
        pageDic['_toolBarLeft'][0].hidden = false;
        pageDic['_toolBarLeft'][0].backgroundColor = barData['backgroundColor'];    
        if(pageDic.Children[0]['frame']['width'] > 768){
          pageDic['_toolBarLeft'][0].fixed = true;
          pageDic['Children'][0]['_frames'][0]['width'] = pageDic.Children[0]['frame']['width'] - pageDic['_toolBarLeft'][0]['frame']['width'];
        }
        
        break;
      case "RightSideBar":
        pageDic['_toolBarRight'][0]['Children'] = manipulateChildDef(barData.dataarray[0]['Fields'], pageDic);
  
        pageDic['_toolBarRight'][0]['frame']['width']= barData.frame['width'];
        pageDic['_toolBarRight'][0].hidden = false;
        pageDic['_toolBarRight'][0].backgroundColor = barData['backgroundColor'];
        
        break;
    
      default:
        break;
    }*/
  }

  function createUIData(UIObj, index, isReplaced) {
    const UIDic = UIObj['dic'];
    if(!isReplaced){
      if(UIDic['viewType'] === "Button")  UIDic['viewType'] = "TextButton";
    }
    //if(UIDic['viewType'] === "ImageView")  UIDic['viewType'] = "Image";
    let uiContainer = {viewType:UIDic['viewType'], uiParts:[]};
    
    const uiParts = uipartDic;
    if(uiParts.length > 0) {

      const baseUIdic = uiParts[0].dic;
      let droppedUIdic = uiParts.filter(function(uidic) {
        return uidic.name === UIDic['viewType'];
      });
      if(droppedUIdic.length === 0) return {};

      if(UIDic['viewType'] === "SwipeableView") return {};

      let uipartDic = Object.assign({}, baseUIdic, droppedUIdic[0].dic);
      uipartDic.name = UIDic['viewType'] +"_"+ index;
      uipartDic.displayOrderOnScreen = parseInt(index) + 1; 
      if(uipartDic['taborder']) {
        uipartDic.taborder = index;
      }    

      if(UIDic.hasOwnProperty('frame')){
          uipartDic.frame.x = (UIDic.frame.x < 0) ? 0 : parseInt(UIDic.frame.x);
          uipartDic.frame.y = (UIDic.frame.y < 0) ? 0 : parseInt(UIDic.frame.y);
          uipartDic.frame.width = parseInt(UIDic.frame.width);
          uipartDic.frame.height = parseInt(UIDic.frame.height);

          if(uipartDic.frame.x < 0) uipartDic.frame.x = 0;
          if(uipartDic.frame.y < 0) uipartDic.frame.y = 0;
          if(uipartDic.frame.x > scrWid){
            uipartDic.frame.x = scrWid - uipartDic.frame.width;
          }
          /*if(uipartDic.frame.y > scrHei){
            uipartDic.frame.y = scrHei - uipartDic.frame.height;
          }*/
      }

      if(UIDic.hasOwnProperty('text')){
        if(uipartDic.hasOwnProperty('text')){
          uipartDic['text'] = UIDic['text'];
        }else if(uipartDic.hasOwnProperty('title')){
          uipartDic['title'] = UIDic['text'];
        }
      }
      if(UIDic.hasOwnProperty('title')){
        if(uipartDic.hasOwnProperty('title')){
          uipartDic['title'] = UIDic['title'];
        }
      }
      if(UIDic['viewType'] === "Label") {
        uipartDic['variant'] = "multiline";

      } else if(UIDic['viewType'] === "Image") {
        if(UIDic.hasOwnProperty('imageref')){
            /*let imgrefVal = "img_"+ UIDic['imageref'];

            let _resources = resourcesRef;
            const existItem = _resources.find(item => item.ref === imgrefVal);
            if(existItem){
                existItem['url'] = UIDic['image']['url'];
            }else{
                _resources.push({ref:UIDic['imageref'], name:imgrefVal, url:UIDic['image']['url']});
            }
            //console.log("imageref >>>", UIDic);
            setResourcesRef(_resources);

            uipartDic['image']['filename'] = imgrefVal;
            uipartDic['image']['fileext'] = "png";
            uipartDic['image']['url'] = "";*/            
            
            updateImageRef(UIDic['imageref'], UIDic['image'], uipartDic['image']);
            uipartDic['borderWeight'] = 0;  //if image set, then no need border
        }
      }else if(UIDic['viewType'] === "TextButton") {
        if(UIDic.hasOwnProperty('imageref')){
            updateImageRef(UIDic['imageref'], UIDic['image'], uipartDic['normalBackgroundImage']);
            uipartDic['selectedBackgroundImage'] = JSON.parse(JSON.stringify(uipartDic['normalBackgroundImage']));
            uipartDic['borderWeight'] = 0;

        }else{
          if(UIDic.hasOwnProperty('iconImage')){
              let imgrefName = UIDic['iconImage']['filename'];
              const imgrefExt = UIDic['iconImage']['fileext'];
              if(imgrefName.indexOf(".") > 0 && imgrefName.indexOf(imgrefExt) > 1){
                imgrefName = imgrefName.substring(0, imgrefName.indexOf("."));
              }
              
              //updateImageRef(imgrefName, UIDic['iconImage'], uipartDic['normalBackgroundImage']);
              updateImageRef(imgrefName, UIDic['iconImage'], UIDic['iconImage']);
              uipartDic['normalBackgroundImage'] = uipartDic['selectedBackgroundImage'] = JSON.parse(JSON.stringify(uipartDic['iconImage']));
          }
        }
      
      }else if(UIDic['viewType'] === "IconButton") {
        if(UIDic.hasOwnProperty('imageref')){
            updateImageRef(UIDic['imageref'], UIDic['iconImage'], uipartDic['iconImage']);
            uipartDic['iconSelectedImage'] = JSON.parse(JSON.stringify(uipartDic['iconImage']));
            uipartDic['borderWeight'] = 0;

        }else{
          if(UIObj.hasOwnProperty('icon_image_url')){
              let imgURL = UIObj['icon_image_url'];
  
              uipartDic['iconImage']['srcLocation'] = uipartDic['iconSelectedImage']['srcLocation'] = "url";
              uipartDic['iconImage']['filename'] = uipartDic['iconSelectedImage']['filename'] = "";
              uipartDic['iconImage']['fileext'] = uipartDic['iconSelectedImage']['filename'] = "";
              uipartDic['iconImage']['url'] = uipartDic['iconSelectedImage']['url'] = imgURL;            
              
              uipartDic['iconSelectedImage'] = JSON.parse(JSON.stringify(uipartDic['iconImage']));
              uipartDic['borderWeight'] = 0;
          }
        }
        if(uipartDic.frame.width <= 24) {
          uipartDic.frame.width = uipartDic.frame.height = 24;          
          uipartDic['iconSize'] = "small";
        }else if(uipartDic.frame.width > 24 && uipartDic.frame.width <= 32) {
          uipartDic.frame.width = uipartDic.frame.height = 32;
          uipartDic['iconSize'] = "medium";
        }else if(uipartDic.frame.width > 32 && uipartDic.frame.width <= 48) {
          uipartDic.frame.width = uipartDic.frame.height = 48;
          uipartDic['iconSize'] = "large";
        }else if(uipartDic.frame.width > 48) {
          uipartDic.frame.width = uipartDic.frame.height = 64;
          uipartDic['iconSize'] = "xlarge";
        }

      }else if(UIDic['viewType'] === "DataGrid") {
        //console.info(UIDic, "**** DG ****", uipartDic);

        const dgHeight =  parseInt(uipartDic.frame.height);
        const rowsHeight = dgHeight - parseInt(uipartDic['headerheight']);
        let rowcount = Math.ceil(rowsHeight / parseInt(uipartDic['rowheight']));
        uipartDic['rowcount'] = rowcount;

        const dgWidth =  uipartDic.frame.width;
        const columnwidth = uipartDic['dataCols'][0]['width'];
        let columncount = Math.ceil(dgWidth / columnwidth);
        for (let index = 1; index < columncount; index++) {
          const dgObj = {
                    "id":index,
                    "fieldname": "",
                    "heading": "",
                    "width": 100,
                    "isSearchable": false,
                    "isSortable": false,
                    "isCollapsible": false,
                    "isCustom": false,
                    "Fields": [],
                    "isCustomHeader": false,
                    "headerFields": [],
                    "isInclude": true              
                  };

          uipartDic['dataCols'].push(dgObj);          
        }
      }else if(UIDic['viewType'] === "Tabs"){
        uipartDic = {...uipartDic, ...UIDic};
      }
      
      if(UIDic.hasOwnProperty('font')){
        //const preDefined_Fonts = ["Amazon Ember", "Roboto", "Noto Sans"]
        //const figmaFontName = UIDic['font']['fontName'];
        const isFontExist = true;//preDefined_Fonts.find(font => font === figmaFontName);
        if(uipartDic.hasOwnProperty('font')){
          if(UIDic['font']['fontName'])   uipartDic['font']['fontName'] = (!isFontExist) ? "system" : UIDic['font']['fontName'];
          if(UIDic['font']['fontSize'])   uipartDic['font']['fontSize'] = parseInt(UIDic['font']['fontSize']);
          if(UIDic['font']['textAlignment']){
            uipartDic['font']['textAlignment'] = UIDic['font']['textAlignment'].toLowerCase();
          }
          if(UIDic['font']['textColor'])  uipartDic['font']['textColor'] = UIDic['font']['textColor'];

        }else if(uipartDic.hasOwnProperty('normalFont')){
          if(UIDic['font']['fontName'])   uipartDic['normalFont']['fontName'] = (!isFontExist) ? "system" : UIDic['font']['fontName'];
          if(UIDic['font']['fontSize'])   uipartDic['normalFont']['fontSize'] = parseInt(UIDic['font']['fontSize']);
          if(UIDic['font']['textAlignment']){
            uipartDic['normalFont']['textAlignment'] = UIDic['font']['textAlignment'].toLowerCase();
          }
          if(UIDic['font']['textColor'])  uipartDic['normalFont']['textColor'] = UIDic['font']['textColor'];
        }
      }
      if(UIDic.hasOwnProperty('normalFont')){
        if(uipartDic.hasOwnProperty('normalFont')){
          if(UIDic['normalFont']['fontName'])   uipartDic['normalFont']['fontName'] = UIDic['normalFont']['fontName'];
          if(UIDic['normalFont']['fontSize'])   uipartDic['normalFont']['fontSize'] = parseInt(UIDic['normalFont']['fontSize']);
          if(UIDic['normalFont']['textAlignment']){
            uipartDic['normalFont']['textAlignment'] = UIDic['normalFont']['textAlignment'].toLowerCase();
          }
          if(UIDic['normalFont']['textColor'])  uipartDic['normalFont']['textColor'] = UIDic['normalFont']['textColor'];
        }
      }

      if(UIDic['verticalAlignment']){
          uipartDic['verticalAlignment'] = (UIDic['verticalAlignment'] === 'CENTER') ? 'middle' : UIDic['verticalAlignment'].toLowerCase();
      }

      if(UIDic.hasOwnProperty('backgroundColor')){
        if(!UIDic['backgroundColor'].hasOwnProperty('alpha')){
          UIDic['backgroundColor']['alpha'] = 1;
        }
        uipartDic['backgroundColor'] = UIDic['backgroundColor'];
        if(UIDic['viewType'] === "TextButton"){
          uipartDic['backgroundGradient'] = getColorValue(UIDic['backgroundColor']);
          uipartDic['mouseoverTintColor'] = UIDic['backgroundColor'];
          uipartDic['mouseoverTextColor'] = uipartDic['normalFont']['textColor']
        }
      }
      if(UIDic.hasOwnProperty('borderColor') && uipartDic.hasOwnProperty('borderColor') ){
        if(!UIDic['borderColor'].hasOwnProperty('alpha')){
          UIDic['borderColor']['alpha'] = 1;
        }
        uipartDic['borderColor'] = UIDic['borderColor'];
      }
      if(UIDic.hasOwnProperty('borderWeight') && uipartDic.hasOwnProperty('borderWeight') ){
        uipartDic['borderWeight'] = UIDic['borderWeight'];
      }
      if(UIDic.hasOwnProperty('cornerRadius') && uipartDic.hasOwnProperty('cornerRadius') ){
        uipartDic['cornerRadius'] = UIDic['cornerRadius'];
      }
      if(UIDic.hasOwnProperty('placeholder') && uipartDic.hasOwnProperty('placeholder')){
        uipartDic['placeholder'] = UIDic['placeholder'];
      }

      //console.info(index, UIDic['viewType'], "********", UIDic);
      if(UIDic.hasOwnProperty('pagetransitionID')){
        console.info("... pagetransitionID ********", UIDic['pagetransitionID']);
      }

      if(isEYHI){
        if(uipartDic.frame.x + uipartDic.frame.width < 300 && uipartDic.frame.y > 180){
          uiContainer['parent'] = 'toolbarLeft';
        }
        else if(uipartDic.frame.y + uipartDic.frame.height < 70){
          uiContainer['parent'] = 'toolbarTop';
        }
        else{
          if(uipartDic.frame.y + uipartDic.frame.height >= 70){
            uipartDic.frame.y = uipartDic.frame.y - 70;
          }
        }
      }
        
      uiContainer.uiParts.push(JSON.parse(JSON.stringify(uipartDic)));
    }

    return uiContainer;
  }

  function updateImageRef(imgref, imageObj, uipartImage) {
    let imgrefVal = "img_"+ imgref;

    let _resources = resourcesRef;
    const existItem = _resources.find(item => item.ref === imgrefVal);
    if(existItem){
        existItem['url'] = imageObj['url'];
    }else{
        _resources.push({ref:imgref, name:imgrefVal, url:imageObj['url']});
    }
    //console.log("imageref >>>", UIDic);
    setResourcesRef(_resources);

    uipartImage['filename'] = imgrefVal;
    uipartImage['fileext'] = "png";
    uipartImage['url'] = "";
  }

  function getColorValue(colorObj) {
    let _red = parseInt(colorObj.red * 255);
    let _green = parseInt(colorObj.green * 255);
    let _blue = parseInt(colorObj.blue * 255);

    return 'rgba('+_red+','+_green+','+_blue+','+colorObj.alpha+')';
  }
  function getUIViewtype(uichild) {
    let uitype = uichild['viewType'];
    if(uitype === 'Button'){
      if(uichild.type === "System"){
        uitype = "SystemButton";
      }else if(uichild.type === "CheckBox"){
        uitype = "CheckBox";
      }else {
        uitype = getButtontype(uichild.buttonType) + 'Button';
      }
    }
    return uitype;
  }
  function getButtontype(btnType) {
    return btnType.charAt(0).toUpperCase() + btnType.substr(1).toLowerCase();
  }

  function handleResourcesData() {
    function removeDuplicates(arr) {
        //return [...new Set(arr)];

        const jsonObject = arr.map(JSON.stringify);
        const uniqueSet = new Set(jsonObject);
        const uniqueArray = Array.from(uniqueSet).map(JSON.parse);
        return uniqueArray;
    }
    
    let _resorcesArr = removeDuplicates(resourcesRef);
    setResourcesRef(_resorcesArr);

    if(_resorcesArr.length > 0){
      const fileObj = {name:_resorcesArr[0].name, ref:_resorcesArr[0].ref, source:_resorcesArr[0].url};
      setSelectedFile(fileObj);

      const _resourceIds = setAllResources(_resorcesArr, true);
      setCheckedResources(_resourceIds);
    }
    setView('figmaresources');
  }

  //////////////////////// Figma Resources Upload /////////////////////////

  const [selectedFile, setSelectedFile] = React.useState({name:'', source:''});
  const [checkedAllResources, setCheckedAllResources] = React.useState(true);
  const [checkedResources, setCheckedResources] = React.useState([]);
  const [editingIndex, setEditingIndex] = React.useState(null);
  const [editResourceName, setEditName] = React.useState(false);
  const [resourceName, setResourceName] = React.useState('');

  const [progress, setProgress] = React.useState(0);
  const [progressmsg, setProgressMsg] = React.useState('');

  function handleFileSelect(event) {
    let filedata = event.currentTarget.dataset;
    let fileObj = {name:filedata.name, source:filedata.source};
    setSelectedFile(fileObj);
  }

  function handleSelectAllResources(event) {
    let updatedValue = Boolean(event.currentTarget.checked);
    setCheckedAllResources(updatedValue);    
    if(updatedValue) {
      const _resourceIds = setAllResources();
      setCheckedResources(_resourceIds);
    }else {
      setCheckedResources([]);
    }
  }
  function setAllResources(figmaRef, ref) {
    let abc = (ref) ? figmaRef : resourcesRef;
    let arrResources = [];
    for (let i = 0; i < abc.length; i++) {
      const _resource = abc[i];
      arrResources.push(_resource.ref);      
    }
    return arrResources;
  }
  function handleSelectResources(e) {
    let _dataset = e.currentTarget.dataset;
    //setSelectedFigmaId(_dataset.id);

    const value = _dataset['name'];
    const currentIndex = checkedResources.indexOf(value);
    const newChecked = [...checkedResources];

    if (currentIndex === -1) {
      newChecked.push(value);
    }else {
      newChecked.splice(currentIndex, 1);         
    }
    
    setCheckedResources(newChecked);
    if(newChecked.length === resourcesRef.length) {
      setCheckedAllResources(true);
    }else{
      setCheckedAllResources(false);
    }
  }

  const handleEditResourceName = (index, fileObj) => {
    setEditingIndex(index);
    //console.log(index, fileObj);
    setEditName(true);
  }
  function handleSetResourceName(evt){
    const filename = evt.target.value;
    // ..validation
    if(filename.length > 0){
      const invalidNameRegExp = /^[a-z]+[a-zA-Z0-9_]*$/;
      if(!filename.match(invalidNameRegExp)) {
        setMsgContent("File name not valid : "+ filename);
        setShowMessage(true);
        return;
      }else{
        setResourceName(filename);
      }
    }
  }
  function handleDoneResourceName(index){
    // ..validation
    
    // ..update related data
    if(resourceName.length > 0){
      const updatedItems = [...resourcesRef];
      updatedItems[index]['name'] = resourceName;
      setResourcesRef(updatedItems);
    }
    setEditingIndex(null);
    setResourceName('');

    setEditName(false);
  }

  function handleDownloadResource() {
    const fileurl = selectedFile.source;
    let filename = selectedFile.name;
    if(!filename){
        setMsgContent('Select an image first to download.');
        setShowMessage(true);
        return;
    }
    filename = filename.split(".")[0] + ".png";

    fetch(fileurl)
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    })
    .catch(() => {
        setMsgContent('Something went wrong. Could not download the file.');
        setShowMessage(true);
    });
  }

  function handleBackFigmaView(){
    setView('figmaview');
  }

  function handleUploadAll(){
    if(checkedResources.length === 0){
      setMsgContent('Select atleast 1 file.')
      setShowMessage(true);

    }else{
      setView('figmaprocess');

      if(resourcesRef.length > 0){
        let filteredResources = resourcesRef.filter(function(resource) {
          if(checkedResources.includes(resource['ref'])){
            return true;
          }
          return false;
        });     
        
        uploadResources(filteredResources, 0);
      }
    }    
  }

  function uploadResources(resourceFiles, filecounter) {
    const _val = filecounter/resourceFiles.length;
    setProgress(Math.ceil(_val*100));
    const _msg = filecounter +' of '+ resourceFiles.length +' files uploaded';
    setProgressMsg(_msg);

    if(filecounter < resourceFiles.length){
      let fileObj = resourceFiles[filecounter];
      fetchUploadFiles(fileObj)
          .then(response => {
            setUploadFileResponseHandler(response, filecounter, resourceFiles);
          })
          .catch((error) => {
              console.log("Something went wrong. Please check Server/Internet connection.");
          });
    }else{

      savePageData(pagedata, 0);
    }
  }

  async function fetchUploadFiles(fileObj) {
    const filename = fileObj['name'];
    const downloadUrl = fileObj['url'];
    const uploadUrl = props.appconfig.apiURL+"upload.json";

    try {
      // Step 1: Download the file content from the URL
      const response = await fetch(downloadUrl);
      if (!response.ok) {
          throw new Error('Failed to fetch the file.');
      }
      const fileBlob = await response.blob();

      // Step 2: Prepare the file for upload using FormData
      const formData = new FormData();
      formData.append("userid", props.appconfig.userid);
      formData.append("sessionid", props.appconfig.sessionid);
      formData.append("projectid", props.appconfig.projectid);
      formData.append("resourcetype", "image");
      formData.append("filename", filename+".png");
      formData.append("file", fileBlob);      

      // Step 3: Upload the file without saving it locally
      return fetch(uploadUrl, {method: 'POST', body: formData})
      .then((response) => response.text())
      .then((resultTxt) => {

        let result = JSON.parse(resultTxt);
        if(result.response === "NACK"){
          var _err = {message: result.error};
          console.error('Upload Resource Error:', _err);

        } else{
          //{"filename":"iconcomment.png","resourceid":"4","response":"ACK","count":1,"command":"uploadresource"}
          console.log(":: uploadresource >> ", result.response, result.resourceid);
          const _resourceObj = {"filename":result.filename, "resourceid":result.resourceid};
          props.projectdata.images.push(_resourceObj);

          updateFigmaSessionData("images");
        }
        return result;
      })
      .catch((error) => {
          console.error('Error:', error);
      });
    
    } catch (error) {
      console.error('Error:', error);
      return error;
    }
  }
  
  function setUploadFileResponseHandler(response, savedfilecounter, resourceFiles) {        
    if(response['response'] === "ACK") {
        const fileobj = response['page'];
        resourceFiles[savedfilecounter] = fileobj;

        savedfilecounter = savedfilecounter +1;
        uploadResources(resourceFiles, savedfilecounter);
                    
    }else {
        const errormsg = response.error;
        console.log("...errormsg....", errormsg);
    }
  }

  function handleSkipUpload(){
    setView('figmaprocess');

    handleFigmaDone();
  }
  
  ///////////////////////// Page & Project data saving /////////////////////
  
  function handleFigmaDone(){
    savePageData(pagedata, 0);
  }

  function savePageData(pagelistdata, pagecounter) {
    const _val = pagecounter/pagelistdata.length;
    setProgress(Math.ceil(_val*100));
    const _msg = pagecounter +' of '+ pagelistdata.length +' pages added.';
    setProgressMsg(_msg);

    if(pagecounter < pagelistdata.length){
      let pageObj = pagelistdata[pagecounter];
      fetchSavePageData(pageObj, props.appconfig)
          .then(response => setPageSaveResponseHandler(response, pagecounter, pagelistdata))
          .catch((error) => {
              console.log("Something went wrong. Please check Server/Internet connection.");
          });
    }else{
        fetchUpdateProject(props.projectdata, props.appconfig);
        
        setView('init');
        setOpen(false);
        props.onPageSave(pagelistdata);
        props.onSelectTemplate("");

        setFigmaFeedbackData();
    }
  }

  async function fetchSavePageData(newpagedata, appConfig) {
    var formData = new FormData();
    formData.append("command", "pagenew");
    formData.append("userid", appConfig.userid);
    formData.append("sessionid", appConfig.sessionid);
    formData.append("projectid", appConfig.projectid);

    var pageData = encodeURIComponent(JSON.stringify(newpagedata));
    pageData = updateReference(pageData);
    let text = new File([pageData], "newpage.txt", {type: "text/plain"});
    formData.append("file", text);

    return fetch(appConfig.apiURL+"multipartservice.json", {
        method: 'POST',
        body: formData
    })
    .then((response) => response.json())
    .then((result) => {
        //result = {"response":"ACK","count":1,"page":{....},"command":"pagenew"} 

        if(result.response === "NACK"){
          setMsgContent(result.error);
          setShowMessage(true);

        }else{
          const projectdata = props.projectdata;
          if(!projectdata.hasOwnProperty('CreatedPageData')){
            projectdata['TabsOrder'] = [];
            projectdata['CreatedPageData'] = [];
          }
          const pageobj = result['page'];
          const ts = (pageobj['Document'][0]['key'] === "createddatetime") ? pageobj['Document'][0]['value'] : "";
          let cpageObj = {pageid:pageobj.pageid, pagename:pageobj['Title'], timestamp:ts};
          projectdata['CreatedPageData'].push(cpageObj);
  
          projectdata['TabsOrder'].push(Number(pageobj.pageid));
  
          if(!projectdata.hasOwnProperty('figmaData')){
            projectdata['figmaData'] = {"fileId":fileId, addedPages:[]};
          }
          let addedFigmaPages = projectdata['figmaData']['addedPages'];
          addedFigmaPages.push({"uid":pageobj['_uid'], "pageid":pageobj['pageid']});
  
          updateFigmaSessionData("CreatedPageData,TabsOrder,figmaData");
        }
        return result;
    })
    .catch((error) => {
        console.error('Error:', error);
    });
  }
  
  function setPageSaveResponseHandler(response, savedpagecounter, pagelistdata) {        
    if(response['response'] === "ACK") {
        const pageobj = response['page'];
        pagelistdata[savedpagecounter] = pageobj;

        savedpagecounter = savedpagecounter +1;
        savePageData(pagelistdata, savedpagecounter);
                    
    }else {
        const errormsg = response.error;
        console.log("...errormsg....", errormsg);
    }
  }

  function fetchUpdateProject(projectdata, appConfig) {
    var formData = new FormData();
    formData.append("command", "projectupdate");
    formData.append("userid", appConfig.userid);
    formData.append("sessionid", appConfig.sessionid);
    formData.append("projectid", appConfig.projectid);

    let keytoupdate = sessionStorage.getItem("figmaProjectKeys");
    if(!keytoupdate || keytoupdate.length === 0){
      var prjctData = encodeURIComponent(JSON.stringify(projectdata));
      let text = new File([prjctData], "updateProject.txt", {type: "text/plain"});
      formData.append("file", text);

    }else {
      var keyObj = {};
      var arrKeys = keytoupdate.split(",");
      for (let index = 0; index < arrKeys.length; index++) {
        const elemKey = arrKeys[index];
        keyObj[elemKey] = projectdata[elemKey];    
      }  
  
      let keyData = encodeURIComponent(JSON.stringify(keyObj));
      let keyTxt = new File([keyData], "updateProject.txt", {type: "text/plain"});
      formData.append("file", keyTxt);
    }
  
    fetch(appConfig.apiURL+"multipartservice.json", {
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

  function updateReference(strData){
    for (let index = 0; index < resourcesRef.length; index++) {
      const resource = resourcesRef[index];
      if(resource['name'] !== "img_"+resource['ref']){
        strData = strData.replaceAll("img_"+resource['ref'], resource['name']);
      }      
    }
    return strData;
  }

  ///////////////////////////////////////////

  function handleCloseMessage() {
    setShowMessage(false);
    setMsgContent('');
  }

  ///////////////// Feedback APIs ////////////////

  function fetchFeedbackData() {
    const pid = props.projectdata['projectid'];
    const figmafileId = (pid) ? fileId + "_" + pid : fileId;

    const aidbUrl = "aidbinstance.mobilous.com";
    let api_fetchfeedback = "https://" + aidbUrl + "/appexeai/figma_feedback.json";
    api_fetchfeedback = api_fetchfeedback +"?command=download&fileId="+figmafileId;
    
    fetch(api_fetchfeedback)
        .then(res => res.json())      
        .then(
          (response) => {
            if(response.hasOwnProperty('error')){
              setMsgContent(response['message']);
              setShowMessage(true);

            }else{
              console.info("fetchfeedback >>", response);
              if(response['ret'] === "ACK" && response['retdic']["result"]){
                setFigmaFB(true);
                setExistFBdata(response['retdic']["result"]);
              }else{
                setFigmaFB(false);
              }              
            }
          },
          (error) => {
            console.error("Unable to fetch data:", error);
            
            setShowWait(false);
            setMsgContent('Something went wrong. Please try again.')
            setShowMessage(true);
          }
        )

  }

  const setFeedbackData = (element, feedbackdata) => {
    let elemFeedback = [];
    let elemUIs = element['UIParts'];
    for (let i = 0; i < elemUIs.length; i++) {
      const uiItem = elemUIs[i];
      if(uiItem.hasOwnProperty('accept') && !uiItem['accept']) {
        const rejectedUI = {
          id: uiItem['id'],
          name: uiItem['name'],
          confidence: uiItem.hasOwnProperty('confidence') ? uiItem['confidence'] : 0,
          replacedUI: uiItem.hasOwnProperty('replacedUI') ? uiItem['replacedUI'] : ''
        };
        elemFeedback.push(rejectedUI);      
      }
    }

    feedbackdata.push({
      pageuid: element['pageuid'],
      dimensions: element['dimensions'],
      result_image_path: element['result_image_path'],
      UIParts: elemFeedback
    });

    return feedbackdata;
  };

  function setFigmaFeedbackData() {
    //console.info(existFBdata, "....feedbackdata >>>", figmaFBdata);

    uploadFigmFeedbackImage(JSON.parse(JSON.stringify(figmaFBdata)));

    const aidbUrl = "aidbinstance.mobilous.com";
    const apiFigmafeedback = "https://" + aidbUrl + "/appexeai/figma_feedback.json";
    
    if(isFigmaFB){
      //update
      const existFBscreens = existFBdata['screens'];
      if(existFBscreens.length > 0){
        let totalscreens = existFBscreens.concat(figmaFBdata.screens);
        figmaFBdata.screens = totalscreens;
      }
      
      const pid = props.projectdata['projectid'];
      const figmafileId = (pid) ? fileId + "_" + pid : fileId;
      const fbupdatedata = {"command":"update", "fileId":figmafileId, "figma_feedback":figmaFBdata};

      fetch(apiFigmafeedback, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fbupdatedata)
      })
      .then((response) => response.json())
      .then(
        (result) => {
          if(result.response === "NACK"){
            var _err = {message: result.error};
            console.info("figma_feedback update NACK >>>", _err.message);
          }
          else{
            console.info("figma_feedback update ACK >>> ", result.retdic['result']);
          }
        },
        (error) => {
          console.info("figma_feedback update Error >>>", error);
        }
      )

    }else{
      //insert
      const fbinsertata = {"command":"insert","figma_feedback": figmaFBdata};

      fetch(apiFigmafeedback, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fbinsertata)
      })
      .then((response) => response.json())
      .then(
        (result) => {
          if(result.response === "NACK"){
            var _err = {message: result.error};
            console.info("figma_feedback insert NACK >>>", _err.message);
          }
          else{
            console.info("figma_feedback insert ACK >>> ", result.retdic['result']);
          }
        },
        (error) => {
          console.info("figma_feedback insert Error >>>", error);
        }
      )
    }
  }

  async function uploadFigmFeedbackImage(fbdata){
    const uploadUrl = 'https://aidbinstance.mobilous.com/appexeai/upload_image.json';

    if(fbdata && fbdata['screens']){
      for (let index = 0; index < fbdata['screens'].length; index++) {
        const scrObj = fbdata['screens'][index];
        const imagePath = scrObj['result_image_path'];
        const filename = imagePath.substring(imagePath.lastIndexOf('/') + 1);

        const imageUrl = 'https://stagemultiuser.mobilous.com/FigmaUIDetection/'+imagePath;

        try {      
          const response = await fetch(imageUrl);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const blob = await response.blob();

          //const blob = new Blob([response.data], { type: 'image/png' });
          
          const file = new File([blob], filename, { type: 'image/png' });
          const formData = new FormData();
          formData.append('file', file);
          fetch(uploadUrl, {
              method: 'POST',
              body: formData
          })
          .then((response) => response.json())
          .then((result) => {       
            if(result.ret === "NACK"){
              var _err = {message: result.error};
              console.log("upload_image NACK >>>", _err.message);
            }
            else{
              console.log("upload_image ACK >>> Success");
            }
          })

        } catch (error) {
          console.error('Error during upload_image:', error.message);
        }
        
      }
    }    
  };


  //////////////////////////////////

  return (
    
    <Dialog open={open} onClose={handleClose} disableBackdropClick disableEscapeKeyDown fullWidth={true} maxWidth="md" >
        <DialogContent style={{padding:0, overflow:'hidden auto'}}>
          {props.showclose && 
            <Fab edge="end" size="small" className={classes.btnclose} onClick={handleCloseFigma} >
              <svg focusable="false" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
              </svg>
            </Fab>
          }
          {view === 'init' && 
            <Paper elevation={3} className={classes.paper} style={{height:'100%'}} >
              <RadioGroup name={groupname} value={value} className={classes.group}
                          onChange={handleChangeValue}
              >
              <Grid container spacing={1} style={{justifyContent:'content'}} >
                {props.includeAll && 
                  <Grid item xs={12} md={12} style={{height:'100%'}}>
                    <div className={classes.optiondiv}>
                      <FormControlLabel value="blank" label="Blank Application" control={<Radio id="blank" color='primary' />} 
                                        className={classes.optionlabel}/>
                      <Typography variant='body2'style={{color:'grey'}}>No pages will be added in the project.</Typography>
                      <Button variant='contained' color='primary' className={classes.btnok} style={{visibility: (value === 'blank') ? 'visible' : 'hidden'}} onClick={handleOKclick}> Proceed </Button>
                    </div>
                  </Grid>
                }
                {props.includeAll && 
                  <Grid item xs={12} md={12} style={{height:'100%', display:'none'}}>
                    <div className={classes.optiondiv}>
                      <FormControlLabel value="enterprise" label="Enterprise Template" control={<Radio id="enterprise" color='primary' />} 
                                        className={classes.optionlabel}/>
                      <Typography variant='body2'style={{color:'grey'}}>Few predefined pages will be added.</Typography>
                      <Button variant='contained' color='primary' className={classes.btnok} style={{visibility: (value === 'enterprise') ? 'visible' : 'hidden'}} onClick={handleOKclick}> OK</Button>
                    </div>
                  </Grid>
                }
                <Grid item xs={12} md={12} style={{height:'100%'}}>
                  <div className={classes.optiondiv}>
                    <FormControlLabel value="figma" label="Import Figma" control={<Radio id="figma" color='primary' />} 
                                      className={classes.optionlabel}/>
                    {showHelp && 
                        <Popover id="help-popover" style={{overflow:'hidden'}}
                            open={openHelp} anchorEl={anchorHelp} onClose={handleHelpText}
                            anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
                            transformOrigin={{vertical: 'top', horizontal: 'right'}}
                        >
                            <Typography variant="body2" gutterBottom className={classes.helptext}>
                                All pages will be set as 'Tab' pages.
                                <br/>All pages will be set as 'ScrollView' type page.
                            </Typography>
                        </Popover>                      
                    }
                    <Box className={classes.iconbtn}>
                      <IconButton edge="end" color="inherit" className={classes.btnhelp} onClick={handleHelpText}>
                        <HelpIcon />                  
                      </IconButton>
                    </Box>
                    <Typography variant='body2'style={{color:'grey'}}>Provide Figma design file id and set screen size(s) given in design. It will import that design as much as possible.</Typography>
                    <Box className={classes.boxview} style={{width:'inherit', marginTop:16, flexDirection:'column'}}>
                      <div className="horizontal-align" style={{pointerEvents: (props.includeAll) ? 'auto' : 'none'}}>
                        <Typography variant="subtitle2" className={classes.formtext} >File ID :</Typography>
                        <TextField id="figmaid" name="figmaid" required autoFocus={false}                                       
                                margin="dense" variant="standard" style={{width:500}}
                                value={fileId} error={showFileIdError} onChange={handleSetFigmaId}/>
                      </div>
                      <div className="horizontal-align" style={{pointerEvents: (props.includeAll) ? 'auto' : 'none'}}>
                        <Typography variant="subtitle2" className={classes.formtext} >Screen Dimensions :</Typography>
                        <TextField id="mscrwid" name="mscrwid" required autoFocus={false} type="number"                                      
                                margin="dense" variant="outlined" style={{minWidth:80}}
                                label="Width" value={scrWid} error={showScrWidError} onChange={(e) => handleSetMobileDimension(e, 'width')}/>
                        <TextField id="mscrhie" name="mscrhei" required autoFocus={false} type="number"                                      
                                margin="dense" variant="outlined" style={{minWidth:80, marginLeft:24}}
                                label="Height" value={scrHei} error={showScrHeiError} onChange={(e) => handleSetMobileDimension(e, 'height')}/>        
                      </div>
                      <Button variant='contained' color='primary' className={classes.btn} style={{minWidth:200, visibility: (value === 'figma') ? 'visible' : 'hidden'}} 
                              onClick={handleOKclick}> Import Figma File </Button>                      
                    </Box>
                  </div>
                </Grid>
              </Grid>
              </RadioGroup>              
            </Paper>
          }            
          {view === 'enterpriseview' && 
            <Paper elevation={3} className={classes.paperview} >
              <Box className={classes.boxview}>                              
                <Paper elevation={6} style={{minWidth:400, height:'100%'}}>
                  <Box className={classes.boxheader}>
                    <Typography>Page Title</Typography>
                    <Typography>Include it?</Typography>
                  </Box>
                  <List component="nav" style={{overflow:'auto', width:'100%'}} >
                    {arrEnterprisePages.map((item, index) => (
                      <StyledListItem button key={index} style={{height:32}}>
                        <ListItemText primary={item.name} style={{minWidth:180}} />
                        <ListItemSecondaryAction >
                          {!item.required && 
                            <Checkbox color="primary" defaultChecked={item.include} onChange={handleIncludePage(item.include, index)} />           
                          }
                        </ListItemSecondaryAction>
                      </StyledListItem>
                    ))}                
                  </List>
                </Paper>
                <Paper elevation={6} style={{maxWidth:400, width:'100%', height:'100%'}}>
                  
                </Paper>
              </Box>
              <Box className={classes.buttonview} >
                <Button variant='contained' className={classes.btn} onClick={handleBack}> Cancel </Button>
                <Button variant='contained' color='primary' className={classes.btn} onClick={handleEnterpriseOK}> OK</Button>
              </Box>
            </Paper>
          }
          {view === 'figma-ids' && 
            <Paper elevation={3} className={classes.paperview} >
              <Box className={classes.boxview}>                              
                <Paper elevation={6} className={classes.paperlist} >
                  <Box className={classes.boxoptions}>
                    <FormControlLabel label="Select All" className={classes.selectall}
                                      control={<Checkbox color="primary" edge="start" disableRipple checked={checkedAllFigmaIds} 
                                                onChange={handleSelectAllFigmaIds} />}
                    />
                    <Typography variant='caption' style={{alignContent:'center'}}>(Selected {checkedFigmaIds.length} of {figmaIds.length})</Typography>
                  </Box>
                  <List component="nav" className={classes.figmaIdlist} >
                    {figmaIds.map((item, index) => (
                      <StyledListItem button style={{margin:'18px 0px', paddingLeft:0}} key={index} selected={selectedFigmaId === index} >
                        <ListItemIcon className={classes.figmaIdcheck} 
                                      data-id={index} data-fileid={item['fileId']} onClick={handleSelectFigmaIds}>
                          <Checkbox color="primary" edge="start" tabIndex={-1} checked={checkedFigmaIds.indexOf(item['fileId']) !== -1} />
                        </ListItemIcon>
                        <ListItemText primary={item.name} style={{minWidth:180, paddingLeft:8}} data-id={index} onClick={handleSelectedItem} />
                      </StyledListItem>
                    ))}                
                  </List>                  
                  <Typography variant='caption' style={{color:'blue',lineHeight:1}}>To ensure optimal performance, it is recommended to import 5–6 pages at once</Typography>
                </Paper>
                <Paper elevation={3} className={classes.paperimg}>
                    <IconButton aria-label="Open" className={classes.newtabicon} onClick={handleOpenFigmaFile}>
                        <OpenInNewIcon />
                    </IconButton>
                    <IconButton aria-label="Zoom" className={classes.newtabicon} style={{marginRight:36}} onClick={handleZoomInFigmaFile}>
                      {!showFigmaImageZoom &&
                        <SvgIcon>
                          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/><path fill="none" d="M0 0h24v24H0V0z"/><path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z"/>
                        </SvgIcon>
                      }
                      {showFigmaImageZoom &&
                        <SvgIcon >
                          <path fill="none" d="M0 0h24v24H0V0z"/><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM7 9h5v1H7z"/>
                        </SvgIcon>
                      }
                    </IconButton>
                    <img src={figmaIds[selectedFigmaId]['imageUrl']} alt="original_image" className={(scrWid > scrHei) ? classes.desktopfit : classes.mobilefit} style={{display:(!showFigmaImageZoom)?'':'none'}}></img>
                    <ImageViewer source={figmaIds[selectedFigmaId]['imageUrl']} alt="original_image" show={showFigmaImageZoom} widthValue={(scrWid > scrHei) ? '100%' : 'auto'}/>
                </Paper>
              </Box>
              <Box className={classes.buttonview} >
                <Button variant='contained' className={classes.btn} onClick={handleBack}> Cancel </Button>
                <Button variant='contained' color='primary' className={classes.btn} onClick={handleFigmaIdsOK}> Next </Button>
              </Box>
            </Paper>
          }
          {view === 'figmaview' && 
            <Paper elevation={3} className={classes.paperview} >
              <Box className={classes.boxview} style={{flexDirection:'column'}}>                  
                <div className="horizontal-align" style={{height:'calc(100% - 34px)', marginBottom:4}}>                    
                  <Paper elevation={6} className={classes.paperlist}>
                    <div className="vertical-align" style={{height:64, width:'auto', margin:2, border:'1px solid #d3d3d3', borderRadius:4}}>
                        <div className="horizontal-align" style={{paddingLeft:8, margin:'2px 0px'}}>
                            <Typography variant="body2" style={{width:100, textAlign:'start'}} >Page Title :</Typography>
                            <TextField id="pagetitle" name="page-title" required autoFocus={true} autoComplete="off"                         
                                    margin="dense" variant="standard" style={{width:'100%', margin:'4px'}}
                                    value={figmaPages[activeStep]['title']} placeholder={figmaPages[activeStep]['name']} error={showTitleError}
                                    onChange={handleSetPageTitle}/>
                        </div>
                        <FormControlLabel style={{height:24}} value="end" labelPlacement="end"
                                        label={<Typography variant='body2'>Include this page</Typography>}
                                        control={<Checkbox color="primary" style={{width:18, height:18}}
                                                checked={figmaPages[activeStep]['include']} 
                                                onChange={handleIncludeFigmaPage} />
                                        }
                        />
                    </div>
                    <div className="horizontal-align" style={{backgroundColor:'#d3d3d3', height:32, width:'auto', margin:'0px 4px', display:'none'}}>
                        <Typography variant="subtitle2" style={{width:'100%', textAlign:'start', paddingLeft:8}} >UI Type</Typography>
                        <Typography variant="subtitle2" style={{width:'100%', textAlign:'end', paddingRight:8}} >Accepted ?</Typography>
                    </div>
                    <List component="nav" style={{overflow:'hidden auto', height:'calc(100% - 104px)', padding:'0px 8px'}} >
                        {figmaPages[activeStep]['UIParts'].map((item, index) => {
                          const itemName = item.name;
                          const isItemBar = itemName.indexOf('Bar') > -1 ? true : false;
                          if (isItemBar) return null;

                          const itemConfidence = item.confidence ? Number(item.confidence).toFixed(2) : 'N. A.';

                          return (                        
                            <StyledListItem button key={index} dense>
                              <ListItemIcon style={{minWidth:40}}>
                                <Checkbox color="primary" edge="end" checked={item.accept} onChange={handleAcceptFigmaUI(index)} />
                              </ListItemIcon>
                              <ListItemText primary={(item.id+": "+item.name)} style={{minWidth:150, textDecoration:(item.accept) ? 'none':'line-through'}} />
                              <ListItemSecondaryAction >
                                <Select value={(item.replacedUI) ? item.replacedUI : ""} 
                                        style={{
                                          display:(item.accept) ? 'none':'block', 
                                          minWidth:100, 
                                          fontSize:'0.875rem',
                                          textAlign:'start',
                                          paddingLeft:8, marginBottom:4
                                        }}
                                        onChange={handleChangeFigmaUI(item)}
                                >                                    
                                  {uilist.map((uipart,id) =>
                                    <MenuItem style={{fontSize:12}} key={id} value={uipart.name}>{uipart.name}</MenuItem>
                                  )}
                                </Select>
                                {item.accept && <Typography style={{fontSize:12}}>confidence: {itemConfidence}</Typography> }
                              </ListItemSecondaryAction>
                            </StyledListItem>
                          );
                        })}                
                    </List>                        
                  </Paper>                   
                  <Paper elevation={3} className={classes.paperimg}>
                    <IconButton aria-label="Open" className={classes.newtabicon} onClick={handleOpeninNewTab}>
                        <OpenInNewIcon />
                    </IconButton>
                    <IconButton aria-label="Zoom" className={classes.newtabicon} style={{marginRight:36}} onClick={handleZoomInResultFile}>
                      {!showResultImageZoom &&
                        <SvgIcon>
                          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/><path fill="none" d="M0 0h24v24H0V0z"/><path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z"/>
                        </SvgIcon>
                      }
                      {showResultImageZoom &&
                        <SvgIcon >
                          <path fill="none" d="M0 0h24v24H0V0z"/><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM7 9h5v1H7z"/>
                        </SvgIcon>
                      }
                    </IconButton>
                    <img src={figmaPages[activeStep]['result_image_url']} alt="result_image" className={(scrWid > scrHei) ? classes.desktopfit : classes.mobilefit} style={{display:(!showResultImageZoom)?'':'none'}}></img>
                    <ImageViewer source={figmaPages[activeStep]['result_image_url']} alt="result_image" show={showResultImageZoom} widthValue={(scrWid > scrHei) ? '100%' : 'auto'} />
                  </Paper>
                  <Paper elevation={3} className={classes.paperimg} style={{display:'none'}}>
                    <img src={figmaPages[activeStep]['original_image_url']} alt="original_image" style={{width:'100%',height:'100%'}}></img>
                  </Paper>
                </div>                    
                <MobileStepper position="static" variant="text" steps={maxSteps} activeStep={activeStep}
                    className={classes.stepper}
                    nextButton={
                        <Button size="small" onClick={handleNextStep} disabled={activeStep === maxSteps - 1}>
                            Next
                            <KeyboardArrowRight />
                        </Button>
                    }
                    backButton={
                        <Button size="small" onClick={handleBackStep} disabled={activeStep === 0}>
                            <KeyboardArrowLeft />
                            Back
                        </Button>
                    }
                />                
              </Box>
              {!showLoading && 
                <Box className={classes.buttonview}>
                  <Button variant='contained' className={classes.btn} onClick={handleBackFigmaIds}> Back </Button>
                  <Button variant='contained' color='primary' className={classes.btn} onClick={handleFigmaOK}> OK </Button>                    
                </Box>
              }
              {showLoading && 
                <Box className={classes.buttonview}>
                    <Typography variant="h6" color="textPrimary" className="waitlabel" style={{width:200, height:40, fontSize:'1rem'}}>            
                        <CircularProgress style={{width:28, height:28, marginRight:8}} />Loading more ....
                    </Typography>                
                </Box>
              }
            </Paper>
          }
          {view === 'figmaresources' && 
            <Paper className={classes.resourcebox}>
              <Typography variant='caption' style={{padding:'0px 16px'}}>1. These images taken from 'Figma' repository.</Typography>
              <Typography variant='caption' style={{padding:'0px 16px'}}>2. If files renamed then those must be renamed in corresponding ui-parts.</Typography>
              <Typography variant='caption' style={{padding:'0px 16px'}}>3. On click 'Upload All', all selected image(s) will be uploaded in app resources.</Typography>
              <Box className={classes.listbox}>
                <Paper elevation={6} className={classes.paperresources} >                  
                  <Box className={classes.boxoptions}>
                    <FormControlLabel label="Select All" className={classes.selectall}
                                      control={<Checkbox color="primary" edge="start" disableRipple checked={checkedAllResources} 
                                                onChange={handleSelectAllResources} />}
                    />
                  </Box>
                  <List id="resourceList" component="nav" dense={true} className={classes.filelist} >
                    {resourcesRef.map((item,index) => (
                      <StyledListItem button key={index} selected={item.name === selectedFile.name}
                                  style={{maxHeight:32,paddingLeft:8}} data-name={item.name} data-source={item.url}
                                  onClick={handleFileSelect} >                    
                        {!editResourceName && 
                          <ListItemIcon style={{minWidth:32, height:32}} data-id={index} data-name={item.ref} onClick={handleSelectResources}>
                            <Checkbox color="primary" edge="start" tabIndex={-1} checked={checkedResources.indexOf(item['ref']) !== -1} />
                          </ListItemIcon>
                        }
                        <ListItemText primary={item.name} style={{overflow:'hidden', textOverflow:'ellipsis'}} />
                        <ListItemSecondaryAction style={{width:'calc(100% - 24px)', height:28}}>
                          {!editResourceName && 
                            <IconButton color="default" size="small" aria-label="Add Custom" className={classes.filenamebtn} 
                                        onClick={() => handleEditResourceName(index, item)}>
                              <EditIcon style={{width:'0.925rem'}}/>
                            </IconButton>
                          }
                          {(editingIndex === index) && 
                            <div className={classes.resourcenamediv}>
                              <input className={classes.resourcenameinput} name="custom-name" type="text" required autoFocus
                                     value={resourceName} onChange={handleSetResourceName} />
                              <IconButton color="default" size="small" aria-label="name done" style={{padding:2}} 
                                          onClick={() => handleDoneResourceName(index)}>
                                <DoneIcon/>
                              </IconButton>                         
                            </div>                      
                          }
                        </ListItemSecondaryAction>     
                      </StyledListItem>
                    ))}                
                  </List>
                </Paper>
                <Paper elevation={3} className={classes.fileviewer}>                      
                  <img id="imageviewer" src={selectedFile.source} alt={selectedFile.name} loading='lazy' className={classes.aspect}/>
                  <IconButton aria-label="Download" style={{position:'absolute', top:80, right:20}} onClick={handleDownloadResource}>
                    <DownloadIcon/>
                  </IconButton>
                </Paper>
              </Box>
              <Box className={classes.buttonview}>
                <Button variant='contained' className={classes.btn} onClick={handleBackFigmaView}> Back </Button>
                <Button variant='contained' color='primary' className={classes.btn} onClick={handleUploadAll}> Upload All </Button>
                <Button variant='contained' className={classes.btn} onClick={handleSkipUpload}> Skip </Button>                   
              </Box>
            </Paper>
          }
          {view === 'figmaprocess' && 
            <>
              <Box className={classes.progressbox}>
                <Typography color='primary' variant='h6'>{progress} %</Typography>
                <LinearProgress className={classes.progressbar} variant="determinate" value={progress} />
                <Typography variant='body2'>{progressmsg}</Typography>
              </Box>
              <Button variant='contained' color='primary' className={classes.btn} style={{left:'calc(50% - 60px)', display:'none'}} onClick={handleFigmaDone}> Done </Button>
            </>
          }
          {showWait && 
            <Box className="backdropStyle" style={{zIndex:9999}}>
                <Typography variant="h6" color="secondary" className="waitlabel" style={{width:'inherit', height:40, fontSize:'1rem'}}>
                    <CircularProgress style={{marginRight:12}} />
                    {waitMsg}
                </Typography>                
            </Box>
          }
          {showMessage && 
              <Snackbar open={showMessage} autoHideDuration={5000} onClose={handleCloseMessage}
                        message={msgContent}
                        anchorOrigin={{ vertical: 'bottom',  horizontal: 'center', }}
                        action={
                          <React.Fragment>
                            <Button color="secondary" size="small" onClick={handleCloseMessage}> OK </Button>
                          </React.Fragment>
                        }              
              />
            }  
        </DialogContent>
      </Dialog>
  );

}

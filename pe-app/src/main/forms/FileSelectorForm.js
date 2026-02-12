import React from 'react';
import { connect } from 'react-redux';
import { fade, withStyles, makeStyles } from '@material-ui/core/styles';
import { FormGroup, InputBase, Button } from '@material-ui/core';
import { Dialog, IconButton, Typography, DialogContent, DialogActions, Box, List, ListItem, ListItemText } from '@material-ui/core';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import CloseIcon from '@material-ui/icons/Close';
import InfoIcon from '@material-ui/icons/Info';

const TextInput = withStyles(theme => ({
  root: {},
  input: {
    position: 'relative',
    width: 100,
    height: 22,
    fontSize: 14,
    padding: '0px 8px',
    background: theme.palette.background.default,
    border: '1px solid #ced4da',
    borderRadius: 4,
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

const styles = theme => ({
  root: {
    padding: theme.spacing(0.5),
    marginLeft: theme.spacing(2),
    background: theme.palette.background.paper
  },
  closeButton: {
    position: 'absolute',
    top: theme.spacing(0.5),
    padding: theme.spacing(0.5),
    right: theme.spacing(1),
    color: theme.palette.text.contrast
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

const StyledListItem = withStyles(theme => ({
  root: {
      paddingLeft: 4,
      '&:focus': {
          backgroundColor: theme.palette.background.hover,
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
}))(ListItem);

class FileSelectorForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
        value: getFileValue(this.props.value, this.props.init),

        showlist: false,
        resourcedata: getFileList(this.props.type, this.props.appData, this.props.apiParam['apiURL']),
        selectedFile: -1,

        isfocused: false,
    };

    this.handleChangeValue = this.handleChangeValue.bind(this);
  }

  componentDidUpdate(prevProps,prevState) {      
    if(prevProps.value !== this.props.value)
    {
      this.setState({ value: getFileValue(this.props.value, this.props.init) });
    }   
  }
  
  handleClick = (event) => {
    if(this.props.source === "uipart") {
      this.setState({ isfocused: false });
    }
  }
  handleKeypress = (event) => {
    if(this.props.source === "uipart" && !this.state.isfocused){
      let _val = "!" + this.state.input;
      this.setState({ value: _val });
      this.setState({ isfocused: true });
    }
  }
  
  handleChangeValue = (event) => {
    let _val = event.currentTarget.value;
    _val = _val.replace("!","");

    this.setState({ value: _val });
    console.log(this.props.value, "ApplyFile >>>>", this.state.value, _val);
    let changedValue = setUpdatedPropValue(this.props.value, _val);
    this.props.onValueChange(changedValue);
  };

  //// file-list ////

  handleFilelist = (event) => {
    let _resourcedata = getFileList(this.props.type, this.props.appData, this.props.apiParam['apiURL']);  //this.state.resourcedata
    //console.log(this.props.appData, "**** handleFilelist ****",  _resourcedata);
    if(_resourcedata.length > 0) {
      const filename = this.state.value;
      const fileArr = _resourcedata[0].data;
      let _file =  fileArr.filter(function(file) {
        return file.name === filename;
      });
      
      if(_file.length > 0) {
        this.setState({selectedFile: _file[0]});
      }else {
        this.setState({selectedFile: {}});
      }
    }

    this.setState({showlist: true});
  }

  handleCloseFilelist() {
    this.setState({selectedFile: {}});
    this.setState({showlist: false});
  }

  handleFileSelect(fileObj) {    
    this.setState({selectedFile: fileObj});
  }

  handleApplyFile() {
    this.setState({showlist: false});
    //if(this.state.selectedFile && this.state.selectedFile['name']) {
    if(this.state.selectedFile && this.state.selectedFile.hasOwnProperty('name')) {
      this.setState({value: this.state.selectedFile['name']});
      
      //console.log(this.state.selectedFile, "ApplyFile >>>>", this.state.value, this.props.value);
      let updatedValue = setUpdatedPropValue(this.props.value, this.state.selectedFile['name']);
      this.props.onValueChange(updatedValue);
    }
  }

  render() {
    const {value, showlist} = this.state;
    let resourcedata = getFileList(this.props.type, this.props.appData, this.props.apiParam['apiURL']);
    //console.log(this.props.init, this.props.source, this.props.type, ".. FileSelectorForm images >>>>>", resourcedata); 
    
    return (
      <div>
        <FormGroup style={{height:32, flexDirection:'row', alignItems:'center' }}>          
          <TextInput value={value}              
                    margin="dense" variant="outlined"
                    onChange={this.handleChangeValue}
          />
          <Button variant="contained" size="small" color="default" style={{minWidth:24, height:22, padding:0,}}
                  onClick={this.handleFilelist.bind(this)}>+
          </Button>
        </FormGroup>
        {showlist &&
          <Dialog open={showlist} style={{overflow:'hidden'}} maxWidth="lg">
            <DialogTitle id="customized-dialog-title" onClose={this.handleCloseFilelist.bind(this)}>
              Apply {resourcedata[0]['title']} 
            </DialogTitle>
            <DialogContent dividers>
              <div className="horizontal-align" style={{'alignItems':'flex-start', 'justifyContent':'flex-end'}}>
                {resourcedata.length > 0 && 
                  <FileList file={this.state.selectedFile} filetype={resourcedata[0]['title']} filedata={resourcedata[0]['data']}
                            onFileSelect={this.handleFileSelect.bind(this)} />
                }
              </div>
            </DialogContent>
            <DialogActions>
              <Button variant="contained" size="small" color="default" style={{ height:22, padding:0, textTransform:'none'}}
                      onClick={this.handleCloseFilelist.bind(this)}>Close
              </Button>
              <Button variant="contained" size="small" color="primary" style={{ height:22, padding:0, textTransform:'none'}}
                      onClick={this.handleApplyFile.bind(this)}>Apply
              </Button>
            </DialogActions>
          </Dialog>
        }
      </div>
    );
  }
}



function getFileValue(fileObj, initVal) {
  //if(initVal) return initVal;

  let _fileval = '';
  if(fileObj) {
    if(fileObj.srcLocation === 'bundle'){
      if(fileObj.fileext !== '')
        _fileval = fileObj.filename +'.'+ fileObj.fileext;
      else
        _fileval = fileObj.filename;
    }
  }
  if(initVal) {
    //console.log(fileObj, "<<<< getFileValue >>>>", initVal, _fileval);
    if(_fileval === "")   return initVal;
  }
  return _fileval;
}

function getFileList(filetype, appData, apiURL) { 
  let files = [];
  let type = "Image";
  let path = "image";
  
  if(!filetype) {
    files = appData['images'];
    type = "Image";
    path = "image";
  }else {
    if(filetype.indexOf('Sound') > -1 || filetype === 'bgm'){
      files = appData['bgms'];
      type = "Audio";
      path = "bgm";
    }else if(filetype.indexOf('Video') > -1 || filetype === 'video'){
      files = appData['videos'];
      type = "Video";
      path = "video";
    }else {
      files = appData['images'];
      type = "Image";
      path = "image";
    }
  }

  let _resources = [];

  let _arrFiles = [];
  files.forEach(file => {
      let _filesrc = apiURL + "download/" + path + "/" + appData.projectid +"/" + file.filename;
      let fileObj = {id:file.resourceid, name:file.filename, source:_filesrc};       
      _arrFiles.push(fileObj);
  });    
  _resources.push({title:type, data:_arrFiles});

  return _resources;
}

function setUpdatedPropValue(prevValue, fileName) {
  if(prevValue['srcLocation'] === "bundle") {
    prevValue['filename'] = fileName.split(".")[0];
    prevValue['fileext'] = (fileName.split(".")[1]) ? fileName.split(".")[1] : "";
  }

  return prevValue;
}

function FileList(props) {   
  const useStyles = makeStyles(theme => ({
                      root: {
                        width: 450, height: 450, overflowX: 'hidden',
                        display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around',
                      },
                      listbox:{
                        width: 660,
                        height: 400, 
                        overflow:'hidden',
                        display: 'flex', flexDirection: 'row',
                        border: '2px solid rgb(227,227,227)',
                        borderRadius: 8,
                        background: theme.palette.background.default
                      },
                      filelist: {
                        width: 224,
                        //height: '100%',
                        padding: 8,
                        overflow: 'auto',
                      },
                      clearitem: {
                        height: 28,
                        border: '1px solid rgb(227,227,227)',
                        borderRadius: 4,
                      },
                      fileitem: {
                        height: 28,
                      },
                      fileviewer: {
                        width: 400,
                        //height: '100%',
                        //maxWidth: 300,
                        padding: 8,
                        borderLeft: '1px solid rgb(227,227,227)',
                        backgroundColor: 'rgba(227,227,227,0.2)',
                        display: 'flex', justifyContent: 'center', alignItems:'center'
                      },
                      aspect: {
                        height:'100%', 
                        maxWidth: 360,
                        objectFit:'scale-down',
                      },                     
                      icon: {
                        color: 'rgba(255, 255, 255, 0.54)',
                      },
                      imagediv: {
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                      },
                      infobox: {
                        position: 'absolute',
                        top: 60,
                        width: 400,//'100%',
                        //height: 40,
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'start',
                      },
                      infotext: {
                        textAlign: 'start',
                        margin: theme.spacing(0, 1),
                        padding: theme.spacing(0.5),
                        color: theme.palette.common.white,
                        backgroundColor: theme.palette.grey[600],
                        border: '2px solid rgb(227,227,227)',
                        borderRadius: 8,
                      },
                      iconbtn: {
                        padding: theme.spacing(0.5),
                      },
                    }));
  const classes = useStyles();

  const filetype = props.filetype;
  //console.log(filetype, " .... FileList ....", props.filedata);

  const [selectedIndex, setSelectedIndex] = React.useState(props.file['id']);
  const [selectedFile, setSelectedFile] = React.useState(props.file);

  function handleFileClear(event) {
    setSelectedIndex(0);
    let clearObj = {id:0, name:"", source:""};
    setSelectedFile(clearObj);

    props.onFileSelect(clearObj);
  }

  
  function handleFileSelect(event) {
    let filedata = event.currentTarget.dataset;
    setSelectedIndex(filedata.id);
    let fileObj = {id:filedata.id, name:filedata.name, source:filedata.source};
    setSelectedFile(fileObj);   

    props.onFileSelect(fileObj);
    setShowInfo(false);
  }

  const [showInfo, setShowInfo] = React.useState(false);
  const [filedimensions, setFileDimensions] = React.useState("");
  const [filesize, setFileSize] = React.useState("");  
  function handleInfoText() {
    if(props.filetype === "Image"){
      const imgV = document.getElementById('imageviewer');
      //console.log("imageviewer>>>", imgV);
      const wid = (imgV) ? imgV.naturalWidth : 0;
      const hei = (imgV) ? imgV.naturalHeight : 0;
      setFileDimensions("Image dimensions: "+  wid +' x '+ hei +' px');
      setFileSize("");

      setShowInfo(!showInfo);
    }
  }

  return (
    <div className="vertical-align">
      <Box className={classes.listbox}>
        <List id="resourceList" component="nav" dense={true} className={classes.filelist} >
          <StyledListItem button className={classes.clearitem} onClick={handleFileClear} >                    
              <ListItemText primary="Clear" />                      
          </StyledListItem>
          {props.filedata.map(item => (
            <StyledListItem button key={item.id}
                      className={classes.fileitem} selected={selectedIndex === item.id}
                      data-id={item.id} data-name={item.name} data-source={item.source}
                      onClick={handleFileSelect} >                    
              <ListItemText primary={item.name} />                      
            </StyledListItem>
          ))}                
        </List>
        <div id="fileViewer" className={classes.fileviewer}>
          {filetype === "Image" && 
            <div className={classes.imagediv}>
              <img id="imageviewer" src={selectedFile.source} alt={selectedFile.name} className={classes.aspect}/>
              <Box className={classes.infobox}>
                {showInfo && 
                  <Typography variant="body2" gutterBottom className={classes.infotext}>{filedimensions}<br/>{filesize}</Typography>
                }                   
                <IconButton edge="end" color="inherit" className={classes.iconbtn} onClick={handleInfoText}>
                  <InfoIcon />                  
                </IconButton>
              </Box>
            </div>
          }
          {filetype === "Audio" && 
            <audio id="audioviewer" controls autoPlay>
              <source src={selectedFile.source} type="audio/mpeg"/>
              Your browser does not support the audio element.
            </audio>
          }
          {filetype === "Video" && 
            <video id="videoviewer" width="400" height="400" controls>
              <source src={selectedFile.source} type="video/mp4"/>
              Your browser does not support HTML5 video.
            </video>
          }
        </div>
      </Box>
    </div>
  );
}

//export default FileSelectorForm;

function mapStateToProps(state) {  
  return {
    apiParam: state.appParam.params,
    appData: state.appData.data,
  };
}
export default connect(mapStateToProps)(FileSelectorForm);
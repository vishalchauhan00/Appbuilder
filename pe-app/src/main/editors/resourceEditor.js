import React from 'react';
import { connect } from 'react-redux';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { Fab, GridList, GridListTile, GridListTileBar, IconButton, Typography, Box, List, ListItem, ListItemText, ListItemSecondaryAction, Button, Popover, Snackbar, SvgIcon, Input, Paper, Slide } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import CloseIcon from '@material-ui/icons/Close';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';

function PaperComponent(props){
  const useStyles = makeStyles(theme => ({
    root: {
      margin: 8,
      background: theme.palette.background.default,
      border: '2px double darkgrey',
    },    
  }));
  const classes = useStyles();
  return (   
      <Paper {...props} square className={classes.root} />  
  );
}
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const StyledListItem = withStyles(theme => ({
  root: {
      paddingLeft: 4,
      '&:focus': {
        background: theme.palette.background.hover,
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

const styles = theme => ({
  root: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: theme.spacing(1),
    background: theme.palette.background.paper
  },
  closeButton: {
    padding: theme.spacing(0.5),
    color: theme.palette.text.contrast
  },
});
const DialogTitle = withStyles(styles)(props => {
  const { children, classes, onClose } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton aria-label="Close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});
const DialogContent = withStyles(theme => ({
  root: {
    textAlign: 'center',
  },
}))(MuiDialogContent);


class ResourceEditor extends React.Component {
    constructor(props) {
      super(props);
      
      this.state = {
        resourcetype: this.props.type,
        resourcedata: this.props.data,
        fileid:'',
        filename:'',
        filedata: null,
        
        open: false,
        add: false,
        anchorEl: null,
        fileObj: null,

        disableUpdate: this.props.isProjectRoleOwner,
        showMessage: false,
        messageText: '',

        showFinder: false,
        originaldata: this.props.data,
      };      
      
      this.handleViewResource = this.handleViewResource.bind(this);
      this.handleViewImage = this.handleViewImage.bind(this);
      
      this.handleAddResource = this.handleAddResource.bind(this);
      this.handleSelectResource = this.handleSelectResource.bind(this);
      this.handleUploadResource = this.handleUploadResource.bind(this);

      this.handleDeleteResource = this.handleDeleteResource.bind(this);      
      //this.handleDeleteImage = this.handleDeleteImage.bind(this); 
      this.handleDeleteFile = this.handleDeleteFile.bind(this);      

      this.handleClose = this.handleClose.bind(this);
    }
  
    componentDidMount() {      
      //this.fetchResourceList();
    }

    componentDidUpdate(prevProps,prevState) {
      if(prevProps.resourcedata !== this.props.resourcedata)
      {
        console.log(".............ResourceEditor componentDidUpdate ............");        
      }
      if(prevProps.isProjectRoleOwner !== this.props.isProjectRoleOwner)
      {
        this.setState({ disableUpdate: this.props.isProjectRoleOwner });
      }   
    }

    fetchResourceList() {
      fetch(this.props.appconfig.apiURL+"service.json?command=resourcelist&resourcetype="+this.props.type+
            "&userid="+this.props.appconfig.userid+
            "&sessionid="+this.props.appconfig.sessionid+
            "&projectid="+this.props.appconfig.projectid)
        .then(res => res.json())
        .then(
          (result) => {
            // { response: "ACK",  command: "resourcelist",  count: 0, resources: [..]  }
            if(result.response === "NACK"){
              var _err = {message: result.error};
              this.setState({
                error:_err                   
              });
            }
            else{
              console.log(this.props.type, ":: resourcelist >>", result.count, " >>", result.resources);
            }
                
          },
          // Note: it's important to handle errors here
          // instead of a catch() block so that we don't swallow
          // exceptions from actual bugs in components.
          (error) => {
            this.setState({
              error
            });
          }
        )
    }

    //////////////////////
    // View Resource
    //////////////////////

    handleViewResource(event) {       
      console.log("handleViewResource >>", this.state.resourcedata);      
      //this.setState({open:true});      

      if(this.props.type === "Image") {
        this.handleViewImage(event);
      }else {
        this.handleViewFile(event);
      }
    }
    
    handleViewImage(event) { 
      this.setState({anchorEl: event.currentTarget});
      this.setState({fileObj: event.currentTarget.dataset});
    }

    handleViewFile(event) { 
      this.setState({anchorEl: event.currentTarget});
      this.setState({fileObj: event.currentTarget.dataset});
    }
    
    
    //////////////////////
    // Add Resource
    //////////////////////
    
    handleAddResource() {
      // now commented wrt 21179.
      /*if(!this.props.isProjectRoleOwner) {
        if(this.state.resourcetype === "Image") {
          this.setState({add:true});
        }else {
          this.setState({showMessage:true});
          this.setState({messageText:"For contibutor, add '" + this.state.resourcetype + "' not allowed."});
        }
        return;
      }*/      
      this.setState({add:true});
    }

    handleSelectResource(event, filename, filedata) {      
      /* var reader  = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.addEventListener("load", function () {  
        console.log("reader load >>", reader.result);        
      }, false); */
      
      this.setState({filename: filename});
      this.setState({filedata: filedata});      
    }

    handleUploadResource(event) {
      //console.log("handleUploadResource >>", this.state.filedata);
      if(this.state.filedata !== null){
        if(this.props.type === "Image"){
          this.addResource('image', this.state.filename, this.state.filedata);
        }else if(this.props.type === "Video"){
          this.addResource('video', this.state.filename, this.state.filedata);
        }else if(this.props.type === "Audio"){
          this.addResource('bgm', this.state.filename, this.state.filedata);  
        }else if(this.props.type === "Audio Recording"){
          this.addResource('soundeffect', this.state.filename, this.state.filedata);
        }else{
          this.addResource('others', this.state.filename, this.state.filedata);
        }
        

        /* let _resourceData = this.state.resourcedata;
        _resourceData.push({id:46123, name:this.state.filename});
        this.setState({resourcedata: _resourceData}); */
      }
      else
        console.log("handleUploadResource >> filedata is null");
    }

    addResource(type, name, file) {
      //console.log("addResource >>", type, name, file);

      var formData = new FormData();
      formData.append("userid", this.props.appconfig.userid);
      formData.append("sessionid", this.props.appconfig.sessionid);
      formData.append("projectid", this.props.appconfig.projectid);
      formData.append("resourcetype", type);
      formData.append("filename", name);
      formData.append("file", file);      

      var request = new XMLHttpRequest();
      var self = this;
      request.onreadystatechange = function() {//Call a function when the state changes.
        if(request.readyState === 4 && request.status === 200) {
          
          let result = JSON.parse(request.responseText);
          //console.log(request.responseText, " << upload request >> ", result);
          if(result.response === "NACK"){
            var _err = {message: result.error};
            console.log(":: uploadresource >>", _err);
          }
          else{
              //{"filename":"iconcomment.png","resourceid":"4","response":"ACK","count":1,"command":"uploadresource"}
              console.log(type, ":: uploadresource >> ", result.response, result.resourceid);
              self.setState({add:false});

              let _resourceData = self.props.data;//self.state.resourcedata;
              if(type === 'image') {
                let _imgsrc = self.props.appconfig.apiURL+"download/image/" + self.props.appconfig.projectid +"/" + result.filename;
                _resourceData.push({id:result.resourceid, name:result.filename, source:_imgsrc});
              }else if(type === 'video') {
                let _vidsrc = self.props.appconfig.apiURL+"download/video/" + self.props.appconfig.projectid +"/" + result.filename;
                _resourceData.push({id:result.resourceid, name:result.filename, source:_vidsrc});
              }else if(type === "bgm"){
                let _audsrc = self.props.appconfig.apiURL+"download/bgm/" + self.props.appconfig.projectid +"/" + result.filename;
                _resourceData.push({id:result.resourceid, name:result.filename, source:_audsrc});
              }else if(type === "soundeffect"){
                let _sesrc = self.props.appconfig.apiURL+"download/soundeffect/" + self.props.appconfig.projectid +"/" + result.filename;
                _resourceData.push({id:result.resourceid, name:result.filename, source:_sesrc});
              }else{
                let _othersrc = self.props.appconfig.apiURL+"download/others/" + self.props.appconfig.projectid +"/" + result.filename;
                _resourceData.push({id:result.resourceid, name:result.filename, source:_othersrc});
              }

              self.setState({resourcedata: _resourceData});
              self.setState({originaldata: _resourceData});
              self.setState({showFinder: false});
              self.props.updateResourceData("add", type, {"filename":result.filename,"resourceid":result.resourceid}, _resourceData);
            }
        }
      }
      request.open("POST", this.props.appconfig.apiURL+"upload.json");
      request.send(formData);

    }

    //////////////////////
    // Delete Resource
    //////////////////////

    handleDeleteResource(event) {
      //let _resourceid = event.currentTarget.dataset.resourceid;
      //console.log(_resourceid, " handleDeleteResource >>", this.props.type);
      
      // now commented wrt 21527.
      /*if(!this.props.isProjectRoleOwner) {
        if(this.props.type === "Image") {
          this.handleDeleteFile(event);
        }else {
          this.setState({showMessage:true});
          this.setState({messageText:"For contibutor, delete any '" + this.props.type + "' not allowed"});
        }
        return;
      }*/

      this.handleDeleteFile(event);
    }

    handleDeleteFile(event) {
      let _filename = event.currentTarget.dataset.resourcename;
      let _type = 'others';

      if(this.props.type === "Image") {
        _type = 'image';
      }else if(this.props.type === "Video"){
        _type = "video";
      }else if(this.props.type === "Audio"){
        _type = "bgm";
      }else if(this.props.type === "Audio Recording"){
        _type = "soundeffect";
      }
      
      this.removeResource(_type, _filename);
    }

    removeResource(type, name) {
      fetch(this.props.appconfig.apiURL+'removeresource.json?command=removeresource'
              +'&userid='+this.props.appconfig.userid
              +'&project_id='+this.props.appconfig.projectid
              +'&resource_type='+type
              +'&filename='+name, 
              { method: 'POST', }
      )
      .then(res => res.json())
      .then(
        (result) => {
          // { response: "ACK", count: 1, command: "removeresource" }
          if(result.response === "NACK"){
            var _err = {message: result.error};
            console.log(this.props.type, ":: removeResource >>", _err);
          }
          else{
            console.log(this.props.type, ":: removeResource >>", result);
            if(result.count === 1){
              let _imgname = name;
              let _resourceData = this.props.data;//this.state.resourcedata;
              _resourceData.forEach((image,index) => {
                if(image.name === _imgname)
                  _resourceData.splice(index,1);
              });              
              this.setState({resourcedata: _resourceData});
              this.setState({originaldata: _resourceData});
              this.setState({showFinder: false});

              this.props.updateResourceData("remove", type, {"filename":name,"resourceid":""}, _resourceData);
            }
          }              
        },        
        (error) => {
          this.setState({
            error
          });
        }
      )
    }

    //////////////////////

    handleClose(event) {   
      this.setState({open:false});
      this.setState({mode:'view'});
      this.setState({add:false});
      this.setState({anchorEl:null});
    }

    //////////////////////

    handleOpeninTab(url) {
      window.open(url);
    }

    handleOpenFinder() {
      this.setState({showFinder: !this.state.showFinder});      
      this.setState({originaldata: this.state.resourcedata});
      //this.setState({resourcedata: this.props.data});
    }
    handleCloseFinder() {
      this.setState({showFinder: false});
      this.setState({resourcedata: this.state.originaldata});
      //this.setState({resourcedata: this.props.data});
    }

    handleResourceFinder(resourcelist) {
      //console.log(this.state.resourcedata, ">>>>>>", resourcelist);
      this.setState({resourcedata: resourcelist});
    }

    handleSnackbarClose() {
      this.setState({showMessage:false});
      this.setState({messageText:""});
    }
    
    
    render() {
      const { resourcedata, anchorEl, fileObj, add } = this.state;
      const openEl = Boolean(anchorEl);
      const id = openEl ? 'simple-popper' : undefined;
      //const displayUpdate = (this.state.disableUpdate) ? 'flex' : 'none';
      
      return ( 
        <div className="vertical-align">
          {this.state.showFinder && 
            <ResourceFinder type={this.state.resourcetype} data={JSON.parse(JSON.stringify(resourcedata))} originalData={this.state.originaldata} 
                            onFilterResource={this.handleResourceFinder.bind(this)} onClose={this.handleCloseFinder.bind(this)}/>
          }
          <div className="horizontal-align" style={{'alignItems':'flex-start', 'justifyContent':'flex-end'}}>          
            <div className="vertical-align">
              <Box id="resourceList" className="box" style={{minHeight:30, maxHeight:250, overflow:'hidden'}}>
                {resourcedata.length > 0 && 
                  <List component="nav" dense={true} 
                      aria-labelledby="nested-list-subheader"
                      style={{maxWidth:350, overflow:'hidden auto'}}                      
                  >
                    {resourcedata.map(item => (
                      <StyledListItem button key={item.id} aria-describedby={id} 
                                data-id={item.id} data-name={item.name} data-source={item.source}
                                onClick={this.handleViewResource} >                    
                        <ListItemText primary={item.name} style={{overflow:'hidden', textOverflow:'ellipsis'}} />                        
                        <ListItemSecondaryAction>
                          {/* <IconButton edge="end" aria-label="View" style={{marginRight:4}}
                                      data-id={item.id} data-name={item.name} data-source={item.source}
                                      onClick={this.handleViewResource} >
                            <SvgIcon>
                              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                            </SvgIcon>
                          </IconButton> */}
                          <IconButton edge="end" aria-label="Delete"
                                      data-resourceid={item.id} data-resourcename={item.name}
                                      onClick={this.handleDeleteResource} >
                            <DeleteIcon/>
                          </IconButton>           
                        </ListItemSecondaryAction>                        
                      </StyledListItem>
                    ))}                
                  </List>
                }                         
              </Box>                            
              <Popover 
                    anchorReference="anchorPosition" id={id} open={openEl} onClose={this.handleClose}
                    anchorPosition={{ top: 400, left: 500 }}
                    anchorOrigin={{ vertical: 'center', horizontal: 'center', }}
                    transformOrigin={{ vertical: 'center', horizontal: 'left', }}
              >
                {this.state.resourcetype === "Image" && <ImageViewer selectedImage={fileObj} onOpenNewTab={this.handleOpeninTab.bind(this)} onCloseViewer={this.handleClose} />  } 
                {this.state.resourcetype === "Video" && <VideoViewer selectedVideo={fileObj} onCloseViewer={this.handleClose} />  }
                {this.state.resourcetype === "Audio" && <AudioViewer selectedAudio={fileObj} onCloseViewer={this.handleClose} />  }  
                {this.state.resourcetype === "Audio Recording" && <AudioViewer selectedAudio={fileObj} onCloseViewer={this.handleClose} />  }              
              </Popover>
            </div>
            <div className="vertical-align" style={{maxWidth:60}}>
              {(resourcedata.length > 0 && !this.state.showFinder) && 
                <Fab color="default" size="small" aria-label="Find" style={{width:32, height:32, minHeight:32, marginBottom:8}} onClick={this.handleOpenFinder.bind(this)}>
                  <SvgIcon>
                    <path d="M0 0h24v24H0z" fill="none"/><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                  </SvgIcon>
                </Fab>
              }
              <Fab color="default" size="small" aria-label="Add" style={{width:32, height:32, minHeight:32}}>
                <AddIcon onClick={this.handleAddResource}/>
              </Fab>
              {add && 
                <Dialog aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description"
                        PaperComponent={PaperComponent} TransitionComponent={Transition}
                        open={add} fullWidth={true} maxWidth="sm" style={{overflow:'hidden', border: '2px solid grey'}} 
                        onClose={this.handleClose} disableBackdropClick disableEscapeKeyDown                    
                >
                  <DialogTitle id="customized-dialog-title" onClose={this.handleClose}>
                    {this.state.resourcetype}
                  </DialogTitle>
                  <DialogContent dividers>
                    {this.state.resourcetype === "Image" && 
                      <ImageUploader type={this.state.resourcetype} data={resourcedata} onSelect={this.handleSelectResource} onUpload={this.handleUploadResource}/>
                    }
                    {this.state.resourcetype !== "Image" && 
                      <ResourceUploader type={this.state.resourcetype} data={resourcedata} onSelect={this.handleSelectResource} onUpload={this.handleUploadResource}/>
                    }                    
                  </DialogContent>
                  <DialogActions style={{flexDirection:'column', alignItems:'start', borderTop:'1px solid darkgrey'}}>
                    <Typography variant="subtitle1">Note: </Typography>
                    <Typography variant="subtitle2">1) Name of file(s) should consists of alphanumeric and '_' characters only.</Typography>
                    <Typography variant="subtitle2">2) It should start with lower-case alphabet. No space(s) allowed.</Typography>
                  </DialogActions>
                </Dialog>
              }                          
            </div>
            <Snackbar
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right'}}
                    open={this.state.showMessage} onClose={this.handleSnackbarClose.bind(this)}
                    autoHideDuration={5000}
                    ContentProps={{
                        'aria-describedby': 'message-id',
                    }}
                    message={<span id="message-id">{this.state.messageText}</span>}                            
            />
          </div>  
        </div>             
      );      
    }
  }

  function ImageViewer(props) {   
    const useStyles = makeStyles(theme => ({
                        root: {
                          width: '50vw', height: '100%', overflow: 'hidden',
                          display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around',
                        },
                        gridList:{
                          flexWrap: 'nowrap',
                        },
                        fullwidth: {
                          width:'100%',
                          backgroundColor: 'rgba(227,227,227,0.2)',
                        },
                        aspect: {
                          height:'100%', width:'100%', objectFit:'scale-down',
                        },
                        titlebar: {
                          display: 'none',
                          height: 48,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                        },
                        icon: {
                          color: 'rgba(255, 255, 255, 0.54)',
                        },
                        contentheader: {
                          width: '100%',
                          height: 40,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          padding: theme.spacing(0, 1),
                          //backgroundColor: "#8e8e8e",
                          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                        },
                        titleheader: {
                          width: '100%',
                          color: theme.palette.common.white,
                          padding: theme.spacing(0, 1),
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis'
                        },
                        iconheader: {
                          color: theme.palette.common.white, 
                          //backgroundColor: theme.palette.common.black,
                          padding: theme.spacing(0.75),
                        }
                      }));
    const classes = useStyles();
    
    const selectedFile = props.selectedImage;
    const imgsrc = selectedFile.source + '?ts=' + new Date().getTime();     //to avoid cache
    
    function handleOpeninNewTab() {
      //console.log("ImageViewer >>>", selectedFile.source);
      props.onOpenNewTab(selectedFile.source);
    }

    return (
        <div className={classes.root}>    
          <div className={classes.contentheader}>
            <Typography className={classes.titleheader}>{selectedFile.name}</Typography>
            <IconButton aria-label="Open" className={classes.iconheader} onClick={handleOpeninNewTab}>
              <OpenInNewIcon />
            </IconButton>
            <IconButton aria-label="Close" className={classes.iconheader} onClick={props.onCloseViewer}>
              <CloseIcon />
            </IconButton>
          </div>     
          <GridList cellHeight={450} cols={1} className={classes.fullwidth}>            
            <GridListTile key={selectedFile.id} className={classes.fullwidth}>
              <img src={imgsrc} alt={selectedFile.name} className={classes.aspect}/>                
              <GridListTileBar                    
                title={selectedFile.name}
                titlePosition="bottom"
                classes={{
                  root: classes.titlebar,
                  title: classes.fullwidth,
                }}
                actionIcon={                  
                  <IconButton aria-label="Open" className={classes.icon} onClick={handleOpeninNewTab}>
                    <OpenInNewIcon />
                  </IconButton>
                }
              />                    
            </GridListTile>                         
          </GridList>
        </div>
    );
  }

  function VideoViewer(props) {   
    const useStyles = makeStyles(theme => ({
                        root: {
                          width: 450, height: 450, overflowX: 'hidden',
                          display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', alignItems: 'flex-end',
                        },                        
                        titlebar: {
                          height:48, width:'100%',
                          padding: theme.spacing(0, 1),
                          margin: theme.spacing(0, 0.25),
                          display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center',
                          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                        },
                        title: {
                          color: theme.palette.common.white,
                        },
                        icon: {
                          color: 'rgba(255, 255, 255, 0.54)',
                        },
                      }));
    const classes = useStyles();
    
    const selectedVideo = props.selectedVideo;
    const vidsrc = selectedVideo.source + '?ts=' + new Date().getTime();

    return (
        <div className={classes.root}>
          <Box className={classes.titlebar}>
            <Typography variant="body1" className={classes.title}>{selectedVideo.name}</Typography>          
            <IconButton aria-label="Close" className={classes.icon} onClick={props.onCloseViewer}>
              <CloseIcon />
            </IconButton>
          </Box>
          <video id="videoviewer" width="400" height="400" controls>
            <source src={vidsrc} type="video/mp4"/>
            Your browser does not support HTML5 video.
          </video>
        </div>
    );
  }


  function AudioViewer(props) {   
    const useStyles = makeStyles(theme => ({
                        root: {
                          width: 400, height: 250, overflowX: 'hidden',
                          display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around',
                        },                        
                        titlebar: {
                          height:48, width:'100%',
                          padding: theme.spacing(0, 1),
                          margin: theme.spacing(0, 0.25),
                          display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center',
                          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                        },
                        title: {
                          color: theme.palette.common.white,
                        },
                        icon: {
                          color: 'rgba(255, 255, 255, 0.54)',
                        },
                      }));
    const classes = useStyles();
    
    const selectedAudio = props.selectedAudio;
    console.log("audioview >>", selectedAudio);
    const audsrc = selectedAudio.source + '?ts=' + new Date().getTime();

    return (
        <div className={classes.root}>
          <Box className={classes.titlebar}>
            <Typography variant="body1" className={classes.title}>{selectedAudio.name}</Typography>          
            <IconButton aria-label="Close" className={classes.icon} onClick={props.onCloseViewer}>
              <CloseIcon />
            </IconButton>
          </Box>
          <audio id="audioviewer" controls>
            <source src={audsrc} type="audio/mpeg"/>
            Your browser does not support the audio element.
          </audio>
        </div>
    );
  }

  function ImageUploader(props) {    
    const useStyles = makeStyles(theme => ({
                        root: {
                          maxHeight:360, width: 300, overflowX: 'hidden',
                          display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around',
                        },
                        input: {
                          margin: theme.spacing(1),
                        },                        
                        button: {
                          marginBottom: theme.spacing(0.5),
                        },
                        leftIcon: {
                          marginRight: theme.spacing(1),
                          marginLeft: theme.spacing(1),
                        },
                        aspect: {
                          objectFit:'scale-down',
                          width:'100%', height:'100%', 
                          minWidth:200, minHeight:150,
                          maxWidth:400, maxHeight:300,
                          padding: 8, margin: 8,
                          border: '1px solid rgb(227,227,227)',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(227,227,227,0.2)', 
                        },
                        selectfilewrapper: {
                          position: 'relative',
                          overflow: 'hidden',
                          display: 'inline-block',
                          margin: theme.spacing(1, 1, 2),
                        },                        
                        selectfilebtn: {
                          fontSize: 16,
                          fontWeight: 'bold',
                          color: 'rgb(128,128,128)',
                          backgroundColor: theme.palette.common.white,
                          border: '2px solid rgb(128,128,128)',
                          borderRadius: '8px',
                          padding: theme.spacing(1, 3),
                        },
                        fileinput: {
                          position: 'absolute',
                          //fontSize: 40,
                          height: 40, width: '100%', 
                          top: 0, left: 0, bottom: 0,
                          opacity: 0.01,                          
                        },
                      }));
    const classes = useStyles(); 

    const [uploadDisable, setUploadDisable] = React.useState(true);
    const [imageError, setImageError] = React.useState('');
    const [imageName, setImageName] = React.useState('');
    const [imageData, setImageData] = React.useState({});

    function handleChange(event) {
      if(event.target.files.length === 0){
        console.log(" ---------- selection cancel ---------- ");
        return;
      }

      let image = event.target.files[0];

      setUploadDisable(true);
      setImageName('');
      let _imgName = image.name;
      let existImage = checkFileExist(_imgName, props.data);
      if(existImage.length > 0) {
        setImageError(existImage);
        return;
      }
      let validImage = validateFile(_imgName, image.type, props.type);
      if(validImage.length > 0) {
        setImageError(validImage);
        return;
      }

      setUploadDisable(false);
      setImageError('');
      setImageName(_imgName);
      let _fileData = URL.createObjectURL(event.target.files[0]);
      setImageData(_fileData);

      /* var photo = document.getElementById("imagefile");
      var file = photo.files[0];
      console.log("File name: " + file.name);
      console.log("File size: " + file.size);
      console.log("File type: " + file.type);
      console.log("Binary content: " + file.getAsBinary());
      console.log("Text content: " + file.getAsText(""));
      console.log("Data URL: " + file.getAsDataURL()); */
      //var preview = document.getElementById("preview");
      //preview.src = file.getAsDataURL();

      props.onSelect(event, _imgName, event.target.files[0]);
    }

    return (
      <div className="vertical-align">
        <div className={classes.selectfilewrapper}>
          <button className={classes.selectfilebtn}>Select Image</button>
          <input id="imagefile" className={classes.fileinput} 
               type="file" accept=".jpeg,.jpg,.png,.webp,.avif" onChange={handleChange} />
        </div>
        {imageError.length > 0 &&
          <Typography variant="subtitle1" color="error">{imageError}</Typography>
        }
        {(imageError.length === 0 && imageName.length > 0) &&
          <Typography variant="subtitle1" color="primary">{imageName}</Typography>
        }          
        {imageName.length > 0 &&
          <img id="preview" className={classes.aspect} alt="imagepreview" src={imageData} />
        }
        {(!uploadDisable) && 
          <label htmlFor="imagefile">
            <Button variant="contained" color="default" className={classes.button} disabled={uploadDisable}
                    onClick={props.onUpload}>
              <CloudUploadIcon className={classes.leftIcon} />
              Upload
            </Button>
          </label>        
        }
      </div>
    );
  }

  function ResourceUploader(props) {    
    const useStyles = makeStyles(theme => ({
                        root: {
                          maxHeight:360, width: 300, overflowX: 'hidden',
                          display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around',
                        },
                        input: {
                          margin: theme.spacing(1),
                        },                        
                        button: {
                          marginBottom: theme.spacing(0.5),
                        },
                        leftIcon: {
                          marginRight: theme.spacing(1),
                          marginLeft: theme.spacing(1),
                        },
                        aspectvideo: {
                          height:'100%',
                          minWidth:200, minHeight:150,
                          maxWidth:400, maxHeight:300,
                          padding: 8, margin: 8,
                        },
                        aspectaudio: {                          
                          padding: 8, margin: 8,
                        },
                        selectfilewrapper: {
                          position: 'relative',
                          overflow: 'hidden',
                          display: 'inline-block',
                          margin: theme.spacing(1, 1, 2),
                        },                        
                        selectfilebtn: {
                          fontSize: 16,
                          fontWeight: 'bold',
                          color: 'rgb(128,128,128)',
                          backgroundColor: theme.palette.common.white,
                          border: '2px solid rgb(128,128,128)',
                          borderRadius: '8px',
                          padding: theme.spacing(1, 3),
                        },
                        fileinput: {
                          position: 'absolute',
                          //fontSize: 40,
                          height: 40, width: '100%', 
                          top: 0, left: 0, bottom: 0,
                          opacity: 0.01,                          
                        },
                      }));
    const classes = useStyles(); 

    const [uploadDisable, setUploadDisable] = React.useState(true);
    const [fileError, setFileError] = React.useState('');
    const [fileName, setFileName] = React.useState('');
    const [fileData, setFileData] = React.useState({});

    function handleChange(event) {
      if(event.target.files.length === 0){
        console.log(" ---------- selection cancel ---------- ");
        return;
      }

      var resource = event.target;
      var file = resource.files[0];
      /* console.log("File name: " + file.name);
      console.log("File size: " + file.size);
      console.log("File type: " + file.type); */

      setUploadDisable(true);
      setFileName('');
      let _fileName = event.target.files[0].name;
      let existFile = checkFileExist(_fileName, props.data);
      if(existFile.length > 0) {
        setFileError(existFile);
        return;
      }
      let type = (props.type === 'Audio Recording') ? 'Audio' : props.type;
      let validFile = validateFile(_fileName, file.type, type);
      if(validFile.length > 0) {
        setFileError(validFile);
        return;
      }

      setUploadDisable(false);
      setFileError('');     
      setFileName(_fileName);
      let _fileData = URL.createObjectURL(event.target.files[0]);
      setFileData(_fileData);      

      props.onSelect(event, _fileName, event.target.files[0]);
    }

    return (
      <div className="vertical-align">                           
        <div className={classes.selectfilewrapper}>
          <button className={classes.selectfilebtn}>Select File</button>
          {props.type === 'Video' && 
            <input id="videofile" className={classes.fileinput} 
                type="file" accept=".mp4" onChange={handleChange} />
          }
          {props.type.indexOf('Audio') > -1  && 
            <input id="audiofile" className={classes.fileinput} 
                type="file" accept=".mp3" onChange={handleChange} />
          }          
        </div>
        {fileError.length > 0 &&
          <Typography variant="subtitle1" color="error">{fileError}</Typography>
        }
        {(fileError.length === 0 && fileName.length > 0) &&
          <Typography variant="subtitle1" color="primary">{fileName}</Typography>
        }   
        {(fileName.length > 0 && props.type === 'Video') && 
          <video id="vidpreview" width="400" height="300" controls className={classes.aspectvideo}>
            <source src={fileData} type="video/mp4"/>
            Your browser does not support HTML5 video.
          </video>
        }
        {(fileName.length > 0 && props.type.indexOf('Audio') > -1) && 
          <audio id="audpreview" width="400" height="100" controls className={classes.aspectaudio}>
            <source src={fileData} type="audio/mpeg"/>
            Your browser does not support HTML5 video.
          </audio>
        }
        {(!uploadDisable) &&
          <label htmlFor="resourcefile">
            <Button variant="contained" color="default" className={classes.button} disabled={uploadDisable}
                    onClick={props.onUpload}>
              <CloudUploadIcon className={classes.leftIcon} />
              Upload
            </Button>
          </label>        
        }
      </div>
    );
  }

  function ResourceFinder(props) {    
    const useStyles = makeStyles(theme => ({
                        root: {
                          maxHeight:360, width: 300, overflowX: 'hidden',
                          display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around',
                        },
                        input: {
                          margin: theme.spacing(1),
                        },                        
                        resourcefinderdiv: {
                          width: '100%',
                          height: 36,
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          margin: theme.spacing(0.5,0),
                          padding: theme.spacing(0.5,0),
                          background: theme.palette.background.default,
                          border: '2px solid rgb(227,227,227)',
                          borderRadius: 8
                        },
                        searchinput: {
                          width: '100%',
                          height: `calc(100% - 2px)`,
                          padding: theme.spacing(0, 0.5),
                          margin: theme.spacing(0, 0.5),
                          fontSize: '0.875rem',
                        },
                        searchbtn: {
                          maxWidth: 32, minHeight: 32, maxHeight: 32,
                          //margin: theme.spacing(0, 0.5),
                        },
                        finderitemdiv: {
                          width: 80,
                          height: '100%',
                          display: 'flex',
                          justifyContent: 'space-around',
                          alignItems: 'center',
                          textAlign: 'center',
                          borderLeft: '1px solid',
                        },
                        finderitem: {
                          width: 32,
                          height: 32,
                          minHeight: 32,
                        },
                      }));
    const classes = useStyles(); 

    const [searchvalue, setSearchValue] = React.useState('');
    const [searcherror, setSearchError] = React.useState(false);
    
    function handleCloseResourceFinder() {
      setSearchValue('');
      setSearchError(false);
      props.onClose();
    }

    function handleSearchInput(event) {
      const val = event.target.value;
      if(val.length > 0) {
        const allowedChars = /\w/g;
        let allowedTitle = val.match(allowedChars);
        if(!allowedTitle) {
          setSearchError(true);
          return;
        }
        if(allowedTitle && (val.length !== allowedTitle.length)) {
          setSearchError(true);
          return;
        }
      }      
      setSearchValue(val);
      handleFindResource(val);
    }

    function handleFindResource(strsearch) {
      const resourceData = JSON.parse(JSON.stringify(props['originalData']));
      //console.log(resourceData, "... handleFindResource >>>", searchvalue, strsearch);
      setSearchError(false);
      if(strsearch.length === 0) {
        //setSearchError(true);
        props.onFilterResource(props.originalData);
      }else {
        let resourceList = resourceData.filter(function(item) {
          const resourceName = item.name.toLowerCase();
          const resourceText = (resourceName.indexOf('.') > 0) ? resourceName.split('.')[0] : resourceName;
          return (resourceText.indexOf(strsearch.toLowerCase()) > -1);
        });

        if(resourceList.length === 0){
          setSearchError(true);
        }
        console.log(props.originalData, "---->", strsearch, "******", resourceList);
        
        props.onFilterResource(resourceList);
      }
    }

    return (
      <div className={classes.resourcefinderdiv} >
        <IconButton color="inherit" aria-label="Find Resource" className={classes.searchbtn}>          
          <SvgIcon>
            <path d="M0 0h24v24H0z" fill="none"/><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </SvgIcon>
        </IconButton>
        <Input aria-label="Search Input" className={classes.searchinput} autoFocus type="text" required placeholder="Search by name"
               value={searchvalue} onChange={handleSearchInput} error={searcherror}/>
        <div className={classes.finderitemdiv}>
          <Fab color="default" size="small" aria-label="Close Finder" className={classes.finderitem} >
            <CloseIcon onClick={handleCloseResourceFinder} />
          </Fab>
        </div>                
      </div>
    );
  }

  function checkFileExist(filename, resourcedata) {
    let _file =  resourcedata.filter(function(file) {
      return file.name === filename;
    });

    if(_file.length > 0){
      return "File already exist.";
    }
    
    return "";
  }
  function validateFile(filename, filetype, resourcetype) {
    const invalidNameRegExp = /^[a-z]+[a-zA-Z0-9_]+.[a-z0-9]+$/;
    if(!filename.match(invalidNameRegExp)) {
      return "File name not valid : "+ filename;
    }

    //console.log(resourcetype, ".... validateFile ....", filename, filetype);
    if(filetype.indexOf(resourcetype.toLowerCase()) === -1) {
      return  "'"+ filename +"' is not valid file type.";
    }	

    const reservedName = ['icon','default'];
    filename = filename.toLowerCase().split(".")[0];
    for (let i = 0; i < reservedName.length; i++) 
    {
      if(filename.toLowerCase() === reservedName[i]) 
        return  "'"+ filename +"' is a reserved name. Please change name of the " + resourcetype + ".";
    }
    
    return "";
  }


  //export default ResourceEditor;
  function mapStateToProps(state) {
    return {
      apiParam: state.appParam.params,
      appData: state.appData.data,
      openedPages: state.selectedData.pages,
      currentPage: state.selectedData.pagedata,
      currentUI: state.selectedData.uidata,
    };
  }
  export default connect(mapStateToProps)(ResourceEditor);
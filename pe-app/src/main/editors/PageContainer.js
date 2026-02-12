import React from 'react';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';
import TableView from './mockups/TableView';
import SplitView from './mockups/SplitView';
import PageScrollView from './mockups/PageScrollView';
import UIContainer from './UIContainer';

class PageContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      children: this.props.data,
      type: this.props.viewtype,
    };
  }

  componentDidUpdate(prevProps,prevState) {
    if(prevProps.data !== this.props.data)
    {
      //console.log(this.props.viewtype, ".... PageContainer componentDidUpdate ....", this.props.data);
      this.setState({ children: this.props.data });
      this.setState({ type: this.props.viewtype });
    }   
  }
  
  handleContainerClick() {
    if(this.state.type.indexOf('NestedList') === -1){
      this.props.onLayoutSelect("page");
    }
  }
 

  render() {    
    const type = this.state.type;
    const pagedata = this.state.children;
    const appConfig = this.props.appconfig;
    const scrIndex = this.props.screenData['screenId'];
    const scrObj = this.props.screenData['screenObj'];

    const _frame = JSON.parse(JSON.stringify(pagedata.frame));
    _frame['width'] = scrObj['width'];
    _frame['height'] = scrObj['height'];
    //console.log(scrIndex, scrObj, " ##.... containerFrame >> ", pagedata.frame, _frame);

    return (
      <div style={{width:'inherit', height:'inherit'}} onClick={() => this.handleContainerClick()}>
        {type === 'BaseView' && 
          <div id="basview" style={{width:'100%', height:'100%',overflow:'hidden'}}>          
            <UIContainer appconfig={appConfig} pagedata={pagedata} data={pagedata.Children} source="page" screenIndex={scrIndex} containerFrame={_frame}/>          
          </div>
        }
        {type === 'ScrollView' &&
          <ScrollView show={true} appconfig={appConfig} pagedata={pagedata} data={pagedata.Children[0]} screenIndex={scrIndex} />
        }
        {type === 'SplitView' &&
          <SplitView show={true} appconfig={appConfig} pagelist={this.props.pageList} data={pagedata} screenIndex={scrIndex} screenObj={scrObj} />
        }
        {type === 'PageScrollView' &&
          <PageScrollView show={true} appconfig={appConfig} appData={this.props.appData} pagelist={this.props.pageList} data={pagedata} screenIndex={scrIndex} screenObj={scrObj} />
        }
        {(type.indexOf('TableView') > -1) &&
          <TableView appconfig={appConfig} pagedata={pagedata} data={pagedata.Children[0]} viewtype={type} screenIndex={scrIndex} screenObj={scrObj}
                     currentPage={this.props.currentPage} editorState={this.props.editorState} />
        }
      </div>
    );
  }
}

function ScrollView(props) {

  const appConfig = props.appconfig;
  const uichildren = props.data.Children; 
  const scrIndex = (props.screenIndex) ? props.screenIndex : 0;
  let frame = props.data._frames[scrIndex];   //frame;  

  const useStyles = makeStyles(theme => ({
    root: {        
      width : frame.width +'px',
      height: frame.height +'px',
      marginLeft: frame.x + 'px',
      marginTop: frame.y + 'px',
      //backgroundColor: getColorValue(props.data.backgroundColor),
      position: 'relative',
    },
    
  }));  
  const classes = useStyles();   
  
  if(!props.show) {
    return null;
  }
  return ( 
    <Box id="scrollview" className={classes.root} >
      <UIContainer appconfig={appConfig} pagedata={props.pagedata} data={uichildren} source="page" screenIndex={scrIndex} containerFrame={frame} />      
    </Box>   
  );  
}


/* function getColorValue(colorObj) {
  let _red = parseInt(colorObj.red * 255);
  let _green = parseInt(colorObj.green * 255);
  let _blue = parseInt(colorObj.blue * 255);
  
  return 'rgba('+_red+','+_green+','+_blue+','+colorObj.alpha+')';  
} */

function mapStateToProps(state) { 
  return {
    pageList: state.appData.pagelist,
    currentPage: state.selectedData.pagedata,
    currentUI: state.selectedData.uidata,
    editorState: state.selectedData.editorState,
  };
}
export default connect(mapStateToProps)(PageContainer);
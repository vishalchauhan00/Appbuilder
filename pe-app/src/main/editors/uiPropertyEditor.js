import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { List, ListItem, ListItemText, Collapse, } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';

import PropertyValueForm from '../forms/PropertyValueForm';


const ListHeader = withStyles(theme => ({
  root: {
    maxHeight: 32,
    borderBottom: '1px solid rgba(0, 0, 0, .825)', 
    backgroundColor: theme.palette.grey[300],
    padding: theme.spacing(0, 0.5),
  },    
}))(ListItem);
const ListHeading = withStyles(theme => ({
  root: {},
  primary: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightBold,
  }, 
}))(ListItemText);

const DenseListItem = withStyles(theme => ({
  root: {
    //maxHeight: 32,
    height:'100%',
    padding: theme.spacing(0, 1.5),
  },    
}))(ListItem);


class UIPropertyEditor extends React.Component {
    constructor(props) {
      super(props);
      
      this.state = {
        show: this.props.show,
        uiData: this.props.uipart,
        uiType: this.props.viewType,
        uiConfig: this.props.config,        
        uiLocale: this.props.locale,
        
        //openProps: true,
        collapseProps: "",
      };
      
      this.handleExpandCollapse = this.handleExpandCollapse.bind(this);
      this.handleUpdateValue = this.handleUpdateValue.bind(this);        
    }
  
    componentDidMount() {
      //this.fetchUILocale('en');
    }    

    componentDidUpdate(prevProps,prevState) {      
      if(prevProps.uipart !== this.props.uipart)
      {
        //console.log("............. componentDidUpdate ............");
        this.setState({ uiData: this.props.uipart });
      }   
    }    
   
    handleExpandCollapse(event) {
      let _name = event.currentTarget.dataset.name;

      let strOpen = this.state.collapseProps;      
      strOpen = setCollapseCategory(strOpen, _name);
      //console.log(_name, "............. handleExpandCollapse ............", strOpen);
      this.setState({collapseProps: strOpen});
    }

    //////////////////////

    handleUpdateValue = (key, value) => {  
      //console.log(key, "..... handleUpdateValue >>>> ", value);
      //console.log("..... uidata >>>> ", this.state.uiData[key]);
      this.props.onPropertyEdit(key, value);
    };

  

    //////////////////////

    
    render() {
      const { show, uiData, uiType, collapseProps, uiConfig, uiLocale } = this.state;      
      console.log(uiType, "..... uidata >>>> ", uiData);

      if(!show) {
        return null;
      }
      
      return ( 
        <div id="uipropertyeditor" className="vertical-align" style={{overflow:'auto'}}>
          <List component="nav" dense={true} 
                  style={{width:'100%', padding:0, marginBottom:2}}      
                  aria-labelledby="nested-list-subheader"                
          >
            {getUIconfigByUIType(uiConfig, uiType).map((category, index) => (
              <div key={index} id={category.name} style={{border: '1px solid', marginBottom: 4,}}>
                <ListHeader button data-name={category.name} 
                          onClick={this.handleExpandCollapse}>
                  {isCategoryCollapse(collapseProps, category.name) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  <ListHeading primary={getPropertyCategoryTitle(category.name,uiLocale)}></ListHeading>
                </ListHeader>
                <Collapse in={isCategoryCollapse(collapseProps, category.name)} timeout="auto" unmountOnExit style={{paddingBottom:4, backgroundColor:'#fff'}}>
                  <List component="div" dense={true} disablePadding>
                    {category.properties.map((property, indexprop) => (
                      <DenseListItem key={indexprop}>
                        <PropertyValueForm data={uiData} property={property} locale={uiLocale} onUpdateValue={this.handleUpdateValue}/>
                      </DenseListItem>
                    ))}
                  </List>
                </Collapse>
              </div>
            ))}
          </List>
        </div>       
      );
      
    }
  }

  function getPropertyCategoryTitle(categoryName, uilocale) {
    let categoryTitle;
    if(uilocale.length > 0) {
      categoryTitle = uilocale[0][categoryName];
    }
    if(categoryTitle === undefined) return categoryName;
    
    return categoryName;
  }  

  function getUIconfigByUIType(config, type) {
    let _nodePages =  config.filter(function(node) {
      return node.targetClass === type;
    });

    if(_nodePages.length === 0) {
      return [];
    }
    return _nodePages[0].children;

  }


  function setCollapseCategory(strCategory, name){
    let _name = name +",";
    if(strCategory.indexOf(name) > -1){
      strCategory = strCategory.replace(_name , "");
    }else{
      strCategory += _name;
    }

    return strCategory;
  }

  function isCategoryCollapse(strCategory, name){    
    if(strCategory.toString().indexOf(name) > -1){
      return false;
    }else{
      return true;
    }
  }

  UIPropertyEditor.propTypes = {
    //onClose: PropTypes.func.isRequired,
    show: PropTypes.bool,
    children: PropTypes.node
  };

  export default UIPropertyEditor;
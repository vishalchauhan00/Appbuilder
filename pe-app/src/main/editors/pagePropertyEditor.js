import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { List, ListItem, ListItemText, Collapse, } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';

import PropertyValueForm from '../forms/PropertyValueForm';

class PagePropertyEditor extends React.Component {
    constructor(props) {
      super(props);
      
      this.state = {
        show: this.props.show,
        pageData: this.props.page,
        pageType: this.props.viewType,
        pageConfig: this.props.config,
        pageLocale: this.props.locale,

        //openProps: true,
        collapseProps: "",
      };
      
      this.handleExpandCollapse = this.handleExpandCollapse.bind(this);
      this.handleUpdateValue = this.handleUpdateValue.bind(this);        
    }
  
    componentDidMount() {
      //console.log("............. componentDidMount ............");
    }

    componentDidUpdate(prevProps,prevState) {      
      if(prevProps.page !== this.props.page)
      {
        //console.log("............. componentDidUpdate ............");
        this.setState({ pageData: this.props.page });
      }   
    }

    /* handleExpandCollapse(event) {
      this.setState({openProps: !(this.state.collapseProps)});
    } */
   
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
      //console.log("..... pagedata >>>> ", this.state.pageData[key]);
      this.props.onPropertyEdit(key, value);
    };

  

    //////////////////////

    
    render() {
      const { show, pageData, collapseProps, pageConfig, pageLocale } = this.state;
      
      if(!show) {
        return null;
      }
      
      return ( 
        <div id="pagepropertyeditor" className="vertical-align" style={{overflow:'auto'}}> 
          <List component="nav" dense={true} 
                style={{width:'100%', padding:0, marginBottom:2}}      
                aria-labelledby="nested-list-subheader"                
          >
            {getPageconfigByPageType(pageConfig, pageData.viewType).map((category, index) => (
              <div key={index} id={category.name} style={{border: '1px solid', marginBottom: 4,}}>
                <ListHeader button data-name={category.name} 
                          onClick={this.handleExpandCollapse}>
                  {isCategoryCollapse(collapseProps, category.name) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  <ListHeading primary={getPropertyCategoryTitle(category.name,pageLocale)}></ListHeading>
                </ListHeader>
                <Collapse in={isCategoryCollapse(collapseProps, category.name)} timeout="auto" unmountOnExit style={{paddingBottom:4, backgroundColor:'#fff'}}>
                  <List component="div" dense={true} disablePadding>
                    {category.properties.map((property, indexprop) => (
                      <DenseListItem key={indexprop}>
                        <PropertyValueForm data={pageData} property={property} locale={pageLocale} onUpdateValue={this.handleUpdateValue}/>
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

  function getPropertyCategoryTitle(categoryName, pagelocale) {
    let categoryTitle;
    if(pagelocale.length > 0) {
      categoryTitle = pagelocale[0][categoryName];
    }
    if(categoryTitle === undefined) return categoryName;
    
    return categoryName;
  }

  const ListHeader = withStyles(theme => ({
    root: {
      maxHeight: 32,
      borderBottom: '1px solid rgba(0, 0, 0, .825)', 
      backgroundColor: theme.palette.grey[300],
      padding: '0px 4px',
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
      maxHeight: 32,
      padding: theme.spacing(0, 1.5),
    },    
  }))(ListItem);
 

  PagePropertyEditor.propTypes = {
    //onClose: PropTypes.func.isRequired,
    show: PropTypes.bool,
    children: PropTypes.node
  };

  function getPageconfigByPageType(config, type) {
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

  export default PagePropertyEditor;
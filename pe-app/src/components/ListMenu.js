import React from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import PopupPageList from '../main/editors/popupPageList';

const useStyles = makeStyles(theme => ({
  root: {
    height: '100%',   maxheight: 48,
    width: '100%',    maxWidth: 80,
    backgroundColor: theme.palette.primary.default,
  },
}));

const StyledMenu = withStyles({
  paper: {
    border: '1px solid #d3d4d5',
  },
})(props => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'center',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'center',
    }}
    {...props}
  />
));

const StyledMenuItem = withStyles(theme => ({
  root: {
    '&:focus': {
      backgroundColor: "#65bc45",
      '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
        color: theme.palette.common.white,
      },
    },
    '&:hover': {
      backgroundColor: "#65de45",
      '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
        color: theme.palette.common.white,
      },
    },
  },
}))(MenuItem);

export default function ListMenu(props){
  //console.log("ListMenu", props.appconfig);
  const apiParam = {apiURL: props.appconfig.apiURL, userid: props.appconfig.userid, sessionid: props.appconfig.sessionid, projectid: props.appconfig.projectid};
  const title = props.menutitle;
  const options = props.menuoptions;

  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const [selectedItem, setSelectedItem] = React.useState('menu');


  function handleClickListItem(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }
  
  function handleMenuItemClick(event, index) {
    setSelectedIndex(index);
    setAnchorEl(null);

    console.log(options[index]);
    var menuVal = options[index].value;
    if(menuVal === 'new')
      setSelectedItem('pagelist-new');
  }

  function handleWindowState() {
    setSelectedItem('menu');
  }

  return (
    <div className={classes.root}>
      <List component="nav" aria-label="Device settings">
        <ListItem button
          aria-haspopup="true"
          aria-controls="app-menu"
          aria-label="App Menu"
          onClick={handleClickListItem}
        >
          <ListItemText primary={title} />
        </ListItem>
      </List>
      <StyledMenu
        id="app-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {options.map((option, index) => (
          <StyledMenuItem
            key={option.text}
            disabled={index === -1}
            selected={index === -1}
            onClick={event => handleMenuItemClick(event, index)}
          >
             <ListItemText primary={option.text} />
          </StyledMenuItem>
        ))}
      </StyledMenu>      
      {(selectedItem.indexOf('pagelist') > -1) && 
        <PopupPageList appconfig={apiParam}
                       title={options[selectedIndex].text}
                       popupstate={selectedItem}
                       oncloseWindow={handleWindowState}/>
                       
      }
    </div>
  );
}
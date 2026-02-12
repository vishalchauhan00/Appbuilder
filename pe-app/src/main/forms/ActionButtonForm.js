import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { FormGroup, Chip } from '@material-ui/core';
import Badge from '@material-ui/core/Badge';

import ActionEditor from '../editors/actionEditor';


class ActionButtonForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
        actions: this.props.value,
        label: 'Edit',
        popup: false,
    };

    this.openActionEditor = this.openActionEditor.bind(this);
    this.closeActionEditor = this.closeActionEditor.bind(this);
  }

  componentDidUpdate(prevProps,prevState) {      
    if(prevProps.value !== this.props.value)
    {
      this.setState({ actions: this.props.value });
    }   
  }
  
  openActionEditor() {
    //let actionData = this.state.actions;
    //console.log(this.props.source, this.props.config, "******* actions *********", actionData);
    this.setState({ popup: true });
  }

  updateActionValue(_key, _val) {
    console.log(".... updateActionValue >>>>", _key, _val);
    this.props.onValueChange(_val);
  }

  closeActionEditor(param, actions) {
    let actionData = this.state.actions;
    //console.log(param, this.props.source, this.props.config, "******* close actions *********", actionData, actions);
    if(param && param === "ok"){
      /* if(actions) {
        let _actiondata = [];
        actions['list'].forEach(element => {
          if(element['id'].toString().indexOf('onelse') === -1) {
            _actiondata.push(element['action']);
          }
        });
        //console.log(" ** CloseActionEditor **", actions, " :: >>>", _actiondata);
        this.setState({ actions : _actiondata});
      } */
      this.props.onActionApply(this.props.source, this.props.config, actionData);
    }

    this.setState({ popup: false });
  }

  render() {
    const {actions, label, popup} = this.state;
    const actionLen = (actions) ? actions.length : 0;
    const widval = (this.props.btnsize && this.props.btnsize === "small") ? 64 : 143;
    const justify = (this.props.btnsize && this.props.btnsize === "small") ? 'space-between' : 'center';

    return (
      <div id="actioneditor" style={{width:143}}>
        <FormGroup>
          <StyledBadge color="primary"
                  invisible={false} badgeContent={actionLen}>            
            <Chip clickable color="default" size="small" style={{width:widval, justifyContent:justify}}
                  label={label}
                  onClick={this.openActionEditor}
            />
          </StyledBadge>
        </FormGroup>
        {popup && 
          <ActionEditor show={popup} data={actions} editorSource={this.props.config['path']} currentScreenIndex={this.props.currentScreenIndex} 
                        onActionUpdate={this.updateActionValue.bind(this)} onCloseEditor={this.closeActionEditor} />
        }
        
      </div>
    );
  }
}

const StyledBadge = withStyles(theme => ({
  badge: {
    top: '50%',    
    right: 16,
    zIndex: 0,  
    // The border color match the background color.
    border: `1px solid ${
      theme.palette.type === 'light' ? theme.palette.grey[200] : theme.palette.grey[900]
    }`,
  },
}))(Badge);

export default ActionButtonForm;
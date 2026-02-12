import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography } from '@material-ui/core';
import { Map, GoogleApiWrapper, Marker } from 'google-maps-react';


class UIMapView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      
    };    
  }

  render() {    

    return (       
      <GoogleMapView google={this.props.google} mapKey={this.props.mapKey} data={this.props.data} />                 
    );      
  }
}

function GoogleMapView(props) {
  console.log("GoogleMap >>>>", props);

  const uiData = props.data;
  const zoomlvl = parseInt(uiData.zoom);
  const initpos = uiData.initialPosition;

  const borderWeight = 1;  

  if(uiData.actions && !uiData.actions.onMarkerDragEnd){
    uiData.actions.onMarkerDragEnd = [];
  }

  const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
    },
    uilayout: {     
      width: '100%',
      height: '100%',
      borderWidth : `calc(${borderWeight}px)`,
      borderStyle: 'solid',
      borderColor: 'rgba(0, 0, 0, 1)',    
    },
    
  }));

  const classes = useStyles();
  const mapStyles = {
    width: '100%',
    height: '100%',
  };
  const containerStyle = {
    position: 'inherit',  
    width: '100%',
    height: '100%'
  }

  return (
    <Box id="mapview" className={classes.uilayout} >
      <Typography style={{display:'none'}}>{initpos}</Typography>
      <Map
          google={props.google}
          zoom={zoomlvl} initialCenter={{ lat: 20.5937, lng: 78.9629 }}
          style={mapStyles} containerStyle={containerStyle}          
        >
          <Marker position={{ lat: 20.5937, lng: 78.9629 }} />
        </Map>
    </Box>
  );

}

export default GoogleApiWrapper(
  (props) => ({
    apiKey: props.apiKey
  }
))(UIMapView);


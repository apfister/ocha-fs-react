// React
import React, { Component } from 'react';

// Redux
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actions as mapActions } from '../redux/reducers/map';

// Components
import SceneView from './esri/map/SceneView';
//import MapView from './esri/map/MapView';
import LoadScreen from './LoadScreen';

// Styled Components
import styled from 'styled-components';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    position: absolute;
    width: 100%;
    height: 100%;
    text-align: center;
`;

const MapWrap = styled.div`
    display: flex;
    flex: 1;
    flex-direction: column;
    position: relative;
    z-index: 0;
    overflow: hidden;
`;

// Class //
class Main extends Component {
    render() {
        return (
            <Container>
                <LoadScreen isLoading={this.props.mapLoaded} />

                <MapWrap>
                    <SceneView
                        mapConfig={this.props.appConfig.sceneConfig}
                        mapState={this.props.map}
                        user={this.props.auth.user}
                        onMapLoaded={this.props.mapLoaded}
                        updateExtent={this.props.updateExtent}
                        features={this.props.features}
                    />
                    {/* <MapView
                        mapConfig={this.props.appConfig.mapConfig}
                        mapState={this.props.map}
                        user={this.props.auth.user}
                        onMapLoaded={this.props.mapLoaded}
                        updateExtent={this.props.updateExtent}
                        features={this.props.appConfig.featureURLs}
                    /> */}
                </MapWrap>
            </Container>
        )
    }
}

const mapStateToProps = state => ({
    map: state.map,
    auth: state.auth,
    appConfig: state.config,
    config: state.config
})

const mapDispatchToProps = function (dispatch) {
    return bindActionCreators({
    ...mapActions,
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Main)

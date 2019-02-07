// React
import React, { Component } from 'react';

// Redux
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actions as mapActions } from '../redux/reducers/map';
import { actions as authActions } from '../redux/reducers/auth';

// Components
import TopNav from 'calcite-react/TopNav';
import TopNavBrand from 'calcite-react/TopNav/TopNavBrand';
import TopNavTitle from 'calcite-react/TopNav/TopNavTitle';
import TopNavList from 'calcite-react/TopNav/TopNavList';
import TopNavLink from 'calcite-react/TopNav/TopNavLink';
import Button from 'calcite-react/Button';
import SceneView from './esri/map/SceneView';
//import MapView from './esri/map/MapView';
import LoadScreen from './LoadScreen';
import UserAccount from './UserAccount';
import logo from '../styles/images/Esri-React-Logo.svg';

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

const Logo = styled(TopNavBrand)`
  padding: 0.3em;
  margin: 0 1.5em;
  background: rgba(138, 138, 138, 0.5);
  border-radius: 100%;
`;

const Nav = styled(TopNav)`
  background-color: ${props => props.theme.palette.offWhite};
`;

const NavList = styled(TopNavList)`
  text-align: left;
`;

// Class //
class Main extends Component {
  signIn = () => {
    console.log('Sign In Triggered...', window.authManager);
    this.props.checkAuth('https://www.arcgis.com');
  }

  signOut = () => {
    console.log('Sign In Triggered...', window.authManager);
    this.props.logout();
  }

  render() {
    return (
      <Container>
        <LoadScreen isLoading={this.props.mapLoaded} />

        <Nav>
          <Logo href="#" src={logo} />
          <TopNavTitle href="#">ArcGIS JS API + React Boot</TopNavTitle>
          <NavList>
            <TopNavLink href="#">Github</TopNavLink>
            <TopNavLink href="#">Docs</TopNavLink>
            <TopNavLink href="#">Calcite-React</TopNavLink>
          </NavList>
          <UserAccount
            user={this.props.auth.user}
            portal={this.props.auth.user ? this.props.auth.user.portal : null}
            loggedIn={this.props.auth.loggedIn}
            signIn={this.signIn}
            signOut={this.signOut}
          />
        </Nav>

        <MapWrap>
          <SceneView
            mapConfig={this.props.appConfig.sceneConfig}
            mapState={this.props.map}
            user={this.props.auth.user}
            onMapLoaded={this.props.mapLoaded}
            updateExtent={this.props.updateExtent}
            features={this.props.features}
          />
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
    ...authActions,
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Main)

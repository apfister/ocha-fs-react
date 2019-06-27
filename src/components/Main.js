// Copyright 2019 Esri
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//     http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.​

// React
import React, { Component } from 'react';
import { Redirect, NavLink, Route } from 'react-router-dom';
import Home from './Home';
import Create from './Create';

// Redux
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actions as mapActions } from '../redux/reducers/map';
import { actions as authActions } from '../redux/reducers/auth';

import { Formik, Field } from 'formik';

// Components
import Toaster from 'calcite-react/Toaster';
import Form from 'calcite-react/Form';
import TopNav from 'calcite-react/TopNav';
import TopNavBrand from 'calcite-react/TopNav/TopNavBrand';
import TopNavTitle from 'calcite-react/TopNav/TopNavTitle';
import TopNavList from 'calcite-react/TopNav/TopNavList';
import TopNavLink from 'calcite-react/TopNav/TopNavLink';
import Panel, { PanelTitle } from 'calcite-react/Panel';
import List, { ListItem, ListItemTitle } from 'calcite-react/List';
import Label from 'calcite-react/Label';
import Slider from 'calcite-react/Slider';
import SideNav, { SideNavTitle, SideNavLink } from 'calcite-react/SideNav';
import { CalciteP, CalciteA, CalciteH6 } from 'calcite-react/Elements';
import TextField from 'calcite-react/TextField';
import Button from 'calcite-react/Button';
// import LayerPointsIcon from 'calcite-ui-icons-react/LayerPointsIcon';
import PlusCircleIcon from 'calcite-ui-icons-react/PlusCircleIcon';
import MinusCircleIcon from 'calcite-ui-icons-react/MinusCircleIcon';

import LoadScreen from './LoadScreen';
import UserAccount from './UserAccount';
import CalciteGridContainer from './CalciteGridContainer';
import CalciteGridColumn from './CalciteGridColumn';
import ochaTemplates from '../json/ocha-templates';
import { createService } from '../services/agoService';

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

const BodyWrapper = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
  height: 100%;
  flex-direction: column;
  position: relative;
  z-index: 0;
`;
const Logo = styled(TopNavBrand)`
  justify-content: center;
  & img {
    height: 55px;
  }
`;

const Nav = styled(TopNav)`
  background-color: ${props => props.theme.palette.offWhite};
  z-index: 5;
`;

const NavList = styled(TopNavList)`
  text-align: left;
`;

// Class
class Main extends Component {
  signIn = () => {
    this.props.checkAuth('https://www.arcgis.com');
  };

  signOut = () => {
    this.props.logout();
  };

  render() {
    const isLoggedIn = this.props.auth.loggedIn;

    return (
      <Container>
        <LoadScreen isLoading={this.props.mapLoaded} />

        <Nav>
          <Logo href="#" src={logo} />
          <TopNavTitle href="#">Create Feature Service from OCHA Symbology</TopNavTitle>
          <NavList>
            {/* <TopNavLink href="https://github.com/Esri/esri-react-boot">Github</TopNavLink>
            <TopNavLink href="https://github.com/Esri/esri-react-boot/wiki">Docs</TopNavLink>
            <TopNavLink href="https://calcite-react.netlify.com/">Calcite-React</TopNavLink> */}
          </NavList>
          <UserAccount
            user={this.props.auth.user}
            portal={this.props.auth.user ? this.props.auth.user.portal : null}
            loggedIn={this.props.auth.loggedIn}
            signIn={this.signIn}
            signOut={this.signOut}
          />
        </Nav>

        <BodyWrapper>
          <Route exact path="/" render={() => <Redirect to="/home" />} />
          <Route
            path="/create"
            render={props =>
              isLoggedIn ? (
                <Create {...props} />
              ) : (
                <Redirect to={{ pathname: '/home', state: { from: props.location } }} />
              )
            }
          />
          <Route
            path="/home"
            render={props =>
              isLoggedIn ? (
                <Redirect to={{ pathname: '/create', state: { from: props.location } }} />
              ) : (
                <Home {...props} />
              )
            }
          />
        </BodyWrapper>
      </Container>
    );
  }
}

const mapStateToProps = state => ({
  map: state.map,
  auth: state.auth,
  config: state.config,
  groupedOcha: state.groupedOcha
});

const mapDispatchToProps = function(dispatch) {
  return bindActionCreators(
    {
      ...mapActions,
      ...authActions
    },
    dispatch
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Main);

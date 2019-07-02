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

import Modal, { ModalActions } from 'calcite-react/Modal';

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
import Loader from 'calcite-react/Loader';
import SideNav, { SideNavTitle, SideNavLink } from 'calcite-react/SideNav';
import { CalciteP, CalciteA, CalciteH6, CalciteH2, CalciteUl, CalciteLi } from 'calcite-react/Elements';
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
  constructor(props) {
    super(props);
    this.state = {
      currentMessage: '',
      isHelpModalOpen: false,
      isResultsModalOpen: false,
      resultsLog: [],
      modalMessage: '',
      isProcessing: false
    };
  }

  closeModal = () => {
    this.setState({ isHelpModalOpen: false, isResultsModalOpen: false });
  };

  receiveStatusUpdate = data => {
    if (data.shouldOpenModal) {
      this.setState({ currentMessage: '', isHelpModalOpen: true, isProcessing: true });
    }

    if (data.status === 'processing') {
      this.setState({ isProcessing: true });
    } else {
      this.setState({ isProcessing: false });
    }

    this.setState({
      currentMessage: data.message
    });

    if (data.status === 'completed') {
      this.setState({
        resultsLog: [...this.state.resultsLog, data],
        newServiceEditUrl: data.newServiceEditUrl,
        newServiceUrl: data.newServiceUrl
      });
    }
  };

  showResultsModal = e => {
    this.setState({ isResultsModalOpen: true });
  };

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
            <TopNavLink href="#" onClick={() => this.setState({ isHelpModalOpen: !this.state.isHelpModalOpen })}>
              Quick Guide
            </TopNavLink>
            <TopNavLink target="_blank" href="https://github.com/apfister/ocha-fs-react">
              Project Home
            </TopNavLink>
            <TopNavLink target="_blank" href="https://github.com/apfister/ocha-fs-react/issues">
              Report an Issue
            </TopNavLink>
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
                <Create {...props} sendStatusUpdate={this.receiveStatusUpdate} showLogsModal={this.showResultsModal} />
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

          <Modal
            shouldCloseOnEsc={false}
            shouldCloseOnOverlayClick={false}
            onRequestClose={this.closeModal}
            open={this.state.isHelpModalOpen}
            appElement={document.body}>
            <CalciteH2 className="text-center">
              Publishing Service to ArcGIS Online
              {this.state.isProcessing ? <Loader className="leader-1"></Loader> : null}
            </CalciteH2>
            <CalciteP>{this.state.currentMessage}</CalciteP>
            {this.state.isProcessing ? null : (
              <div>
                <CalciteA href={this.state.newServiceUrl} target="_blank">
                  View Item in Your ArcGIS Online
                </CalciteA>
                <br />
                <CalciteA href={this.state.newServiceEditUrl} target="_blank">
                  Start Editing in the ArcGIS Online Map Viewer
                </CalciteA>
              </div>
            )}
            <ModalActions>
              <Button disabled={this.state.isProcessing} onClick={this.closeModal} clear>
                Close
              </Button>
            </ModalActions>
          </Modal>

          <Modal
            shouldCloseOnEsc={true}
            shouldCloseOnOverlayClick={true}
            onRequestClose={this.closeModal}
            open={this.state.isResultsModalOpen}
            appElement={document.body}
            dialogStyle={{ maxHeight: '600px', minWidth: '80vw' }}>
            <CalciteH2>Previous Results</CalciteH2>
            {this.state.resultsLog.map((result, ind) => (
              <div key={`result_${ind}`} className="trailer-1">
                {result.serviceName}
                <CalciteUl key={`ul_${ind}}`}>
                  <CalciteLi key={`limessage_${ind}`}>{result.message}</CalciteLi>
                  <CalciteLi key={`li_vi_${ind}`}>
                    <CalciteA href={result.newServiceUrl} target="_blank">
                      View Item in Your ArcGIS Online
                    </CalciteA>
                  </CalciteLi>
                  <CalciteLi key={`li_ve_${ind}`}>
                    <CalciteA href={result.newServiceEditUrl} target="_blank">
                      Start Editing in the ArcGIS Online Map Viewer
                    </CalciteA>
                  </CalciteLi>
                </CalciteUl>
              </div>
            ))}
            <ModalActions>
              <Button onClick={this.closeModal} clear>
                Close
              </Button>
            </ModalActions>
          </Modal>
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

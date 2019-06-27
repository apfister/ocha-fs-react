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

// Redux
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actions as mapActions } from '../redux/reducers/map';
import { actions as authActions } from '../redux/reducers/auth';

import { Formik, Field } from 'formik';

// Components
import Toaster from 'calcite-react/Toaster';
import Form from 'calcite-react/Form';
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

import CalciteGridContainer from './CalciteGridContainer';
import CalciteGridColumn from './CalciteGridColumn';
import ochaTemplates from '../json/ocha-templates';
import { createService } from '../services/agoService';

// Styled Components
import styled from 'styled-components';

const ListItemStyled = styled(ListItem)`
  border-bottom: none;
  border-width: 1px 1px 0 1px;
  border-style: solid;
  border-color: #efefef;
`;

const ListStyled = styled(List)`
  max-width: 280px;
  border-bottom: none;
`;

const CalciteGridColumnLastChildBorder = styled(CalciteGridColumn)`
  & aside:last-child {
    border-bottom: 1px solid #efefef;
  }
`;

const HRSeparator = styled.hr`
  width: 80%;
  opacity: 0.75;
`;

const groupBy = key => array =>
  array.reduce((objectsByKeyValue, obj) => {
    const value = obj[key];
    objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
    return objectsByKeyValue;
  }, {});

// Class
class Create extends Component {
  constructor(props) {
    super(props);
    const groupedOcha = groupBy('category')(ochaTemplates);
    this.state = {
      currentCategory: '',
      toasterOpen: false,
      fsName: '',
      groupedOcha,
      activeIcons: [],
      activeCategory: 'Disasters/Hazards and Crises'
    };
  }

  signIn = () => {
    this.props.checkAuth('https://www.arcgis.com');
  };

  signOut = () => {
    this.props.logout();
  };

  hideToaster = () => {
    this.setState({ toasterOpen: false });
  };

  getSideNav = () => {
    const oKeys = Object.keys(this.state.groupedOcha);
    return (
      <div className="text-left">
        <SideNavTitle>Categories</SideNavTitle>
        <nav>
          {oKeys.map(category => (
            <SideNavLink
              className={this.state.activeCategory === category ? 'selected-side-nav' : null}
              disabled={this.state.activeCategory === category ? true : false}
              onClick={() => this.onCategoryClick(category)}
              key={category}>
              {category}
            </SideNavLink>
          ))}
        </nav>
      </div>
    );
  };

  chunkIcons(icons) {
    return icons.reduce((resultArray, item, index) => {
      const chunkIndex = Math.floor(index / 12);
      if (!resultArray[chunkIndex]) {
        resultArray[chunkIndex] = [];
      }
      resultArray[chunkIndex].push(item);
      return resultArray;
    }, []);
  }

  getActiveIcons = () => {
    const category = this.state.activeCategory;
    const icons = this.state.groupedOcha[category];
    const chunkedIcons = this.chunkIcons(icons);
    return (
      <CalciteGridContainer>
        {chunkedIcons.map((chunk, i) => (
          <CalciteGridColumnLastChildBorder key={`chunk_${i}`} column="6" className="iconGridColumn">
            {chunk.map(icon => (
              <ListStyled selectable key={`check_${icon.name}`}>
                <ListItemStyled
                  onClick={() => this.onItemClick(icon)}
                  active={this.state.activeIcons.find(existing => existing.name === icon.name) ? true : false}
                  leftNode={<img key={icon.name} alt={icon.name} src={`data:image/png;base64,${icon.base64}`} />}>
                  <ListItemTitle>{icon.name}</ListItemTitle>
                </ListItemStyled>
              </ListStyled>
            ))}
          </CalciteGridColumnLastChildBorder>
        ))}
      </CalciteGridContainer>
    );
  };

  onItemClick = icon => {
    const found = this.state.activeIcons.find(existing => existing.name === icon.name);
    if (found) {
      const newActiveIcons = this.state.activeIcons.filter(existing => existing.name !== icon.name);
      this.setState({ activeIcons: newActiveIcons });
    } else {
      this.setState({
        activeIcons: [...this.state.activeIcons, icon]
      });
    }
  };

  isItemActive = name => {
    return this.state.activeIcons.includes(name);
  };

  onCategoryClick = category => {
    this.setState({ activeCategory: category });
  };

  getDisabledState = category => {
    return this.state.activeCategory === category ? true : false;
  };

  onRemoveItem = icon => {
    const newActiveIcons = this.state.activeIcons.filter(existing => existing.name !== icon.name);
    this.setState({ activeIcons: newActiveIcons });
  };

  publishService = async (values, actions) => {
    const activeIcons = this.state.activeIcons;

    if (activeIcons.length === 0) {
      console.log('no icons selected!');
      return;
    }

    const user = this.props.auth.user.username;
    const portalUrl = this.props.auth.user.portal.restUrl;
    const token = this.props.auth.user.portal.credential.token;

    const userContentUrl = `${portalUrl}/content/users/${user}`;

    const params = {
      activeIcons,
      userContentUrl,
      token,
      name: values.fsName,
      iconSize: values.iconSize
    };

    let response = null;
    try {
      response = await createService(params);

      const itemId = response.itemId;
      const urlKey = this.props.auth.user.portal.urlKey;
      const baseUrl = this.props.auth.user.portal.url.replace('www', `${urlKey}.maps`);
      const newServiceUrl = `${baseUrl}/home/item.html?id=${itemId}`;
      this.setState({ newServiceUrl: newServiceUrl, toasterOpen: true });

      console.log('done!');
    } catch (error) {
      console.log(error);
    }

    actions.setSubmitting(false);
  };

  selectAllIconsFromCategory = () => {
    const activeCategory = this.state.activeCategory;
    const currentIconsToSelect = this.state.groupedOcha[activeCategory];
    let iconsToAdd = this.state.activeIcons.slice(0);

    currentIconsToSelect.forEach(icon => {
      if (!iconsToAdd.find(existing => existing.name === icon.name)) {
        iconsToAdd.push(icon);
      }
    });

    this.setState({ activeIcons: iconsToAdd });
  };

  clearAllIconsFromCategory = () => {
    const activeCategory = this.state.activeCategory;

    let currentIcons = this.state.activeIcons.slice(0);
    const filteredIcons = currentIcons.filter(existing => existing.category !== activeCategory);

    this.setState({ activeIcons: filteredIcons });
  };

  render() {
    return (
      <div>
        <CalciteGridContainer className="leader-1">
          <Panel>
            <PanelTitle className="text-left">Select Icons</PanelTitle>
            <CalciteGridContainer>
              <CalciteGridColumn column="5">
                <SideNav>{this.getSideNav()}</SideNav>
              </CalciteGridColumn>
              <CalciteGridColumn column="18">
                <div className="text-left trailer-1">
                  <Button
                    small
                    clear
                    onClick={this.selectAllIconsFromCategory}
                    icon={<PlusCircleIcon size={16} />}
                    iconPosition="before">
                    Select all from Category
                  </Button>
                  <Button
                    small
                    clear
                    className="margin-left-1"
                    onClick={this.clearAllIconsFromCategory}
                    icon={<MinusCircleIcon size={16} />}
                    iconPosition="before">
                    Clear all from Category
                  </Button>
                </div>
                {this.getActiveIcons()}
              </CalciteGridColumn>
            </CalciteGridContainer>
            <HRSeparator className="center-column leader-half trailer-half" />
            {this.state.activeIcons.length > 0 ? (
              <Label
                red
                className="margin-right-quarter active-icons-clear"
                key="label_clearall"
                onClick={() => {
                  this.setState({ activeIcons: [] });
                }}>
                <div>
                  <CalciteP className="active-icon-label">x</CalciteP> Clear All Selected
                </div>
              </Label>
            ) : null}
            <CalciteGridContainer className="leader-1 text-center">
              <CalciteGridColumn column="23">
                {this.state.activeIcons.length === 0 ? (
                  <Label>no icons selected</Label>
                ) : (
                  this.state.activeIcons.map(icon => (
                    <Label
                      blue
                      className="margin-right-quarter active-icons"
                      key={`label_${icon.name}`}
                      onClick={() => {
                        this.onRemoveItem(icon);
                      }}>
                      <div>
                        <CalciteP className="active-icon-label">x</CalciteP> {icon.name}
                      </div>
                    </Label>
                  ))
                )}
              </CalciteGridColumn>
            </CalciteGridContainer>
          </Panel>
        </CalciteGridContainer>

        <Formik initialValues={{ fsName: '', iconSize: 20 }} onSubmit={this.publishService}>
          {({ values, handleSubmit, isSubmitting }) => (
            <Form onSubmit={handleSubmit}>
              <CalciteGridContainer className="leader-1 trailer-1">
                <Panel className="text-left">
                  <PanelTitle>Icon Size</PanelTitle>
                  <CalciteGridColumn column="8">
                    <Field disabled={isSubmitting} component={Slider} min={18} max={50} type="text" name="iconSize" />
                  </CalciteGridColumn>
                  <CalciteGridColumn column="2" className="leader-quarter">
                    <CalciteH6>{values.iconSize} px</CalciteH6>
                  </CalciteGridColumn>
                  <CalciteGridColumn column="8">
                    <img
                      alt="example"
                      width={values.iconSize}
                      src={`data:image/png;base64,${ochaTemplates[0].base64}`}
                    />
                  </CalciteGridColumn>
                </Panel>
              </CalciteGridContainer>
              <CalciteGridContainer className="leader-1 trailer-1">
                <Panel className="text-left">
                  <PanelTitle>Name your Feature Service</PanelTitle>
                  <CalciteGridColumn column="8">
                    <Field fullWidth disabled={isSubmitting} component={TextField} type="text" name="fsName" />
                  </CalciteGridColumn>
                  <CalciteGridColumn column="5">
                    <Button extraLarge disabled={isSubmitting} type="submit">
                      {isSubmitting ? 'Publishing ...' : 'Publish'}
                    </Button>
                  </CalciteGridColumn>
                </Panel>
              </CalciteGridContainer>
            </Form>
          )}
        </Formik>

        <Toaster open={this.state.toasterOpen} onClose={this.hideToaster} autoClose={false} position="bottom-right">
          {/* <LayerPointsIcon color="blue" /> */}
          <CalciteP>
            Successfully Created Feature Service!
            <br />
            <CalciteA color="white" href={this.state.newServiceUrl} target="_blank">
              Click Here to view it.
            </CalciteA>
          </CalciteP>
        </Toaster>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  map: state.map,
  auth: state.auth,
  config: state.config
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
)(Create);

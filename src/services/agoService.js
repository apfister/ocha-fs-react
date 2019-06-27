import axios from 'axios';
import FormData from 'form-data';
import fsTemplate from '../json/feature-service-template.json';
import fsLayersTemplate from '../json/feature-layers-template.json';
import fsUniqueValuesTemplate from '../json/feature-layers-unique-values-template';

export async function createService(params) {
  const userContentUrl = params.userContentUrl;
  const token = params.token;
  const name = params.name;
  const iconSize = params.iconSize || 20;

  const createResponse = await createFeatureService(userContentUrl, token, name);

  const layerUrl = await addToDefinition(createResponse.adminUrl, token);

  const activeIcons = params.activeIcons;
  const updateResponse = await updateDefinition(activeIcons, layerUrl, token, iconSize);

  return { itemId: createResponse.itemId };
}

async function createFeatureService(url, token, name) {
  let bodyFormData = new FormData();
  bodyFormData.set('f', 'json');
  bodyFormData.set('token', token);

  fsTemplate.name = name;
  bodyFormData.set('createParameters', JSON.stringify(fsTemplate));

  const options = {
    url: `${url}/createService`,
    method: 'post',
    responseType: 'json',
    data: bodyFormData,
    config: { headers: { 'Content-Type': 'multipart/form-data' } }
  };

  const response = await axios(options);

  return { itemId: response.data.serviceItemId, adminUrl: response.data.serviceurl.replace('/rest', '/rest/admin') };
}

async function addToDefinition(serviceUrl, token) {
  let bodyFormData = new FormData();
  bodyFormData.set('f', 'json');
  bodyFormData.set('token', token);

  const flTemplate = Object.assign({}, fsLayersTemplate);
  bodyFormData.set('addToDefinition', JSON.stringify(flTemplate));

  const options = {
    url: `${serviceUrl}/addToDefinition`,
    method: 'post',
    responseType: 'json',
    data: bodyFormData,
    config: { headers: { 'Content-Type': 'multipart/form-data' } }
  };

  const response = await axios(options);

  return `${serviceUrl}/0`;
}

async function updateDefinition(activeIcons, serviceUrl, token, iconSize) {
  let bodyFormData = new FormData();
  bodyFormData.set('f', 'json');
  bodyFormData.set('token', token);

  let uvTemplate = Object.assign({}, fsUniqueValuesTemplate);
  activeIcons.forEach(icon => {
    let uvi = {
      value: icon.name,
      label: icon.name,
      symbol: {
        type: 'esriPMS',
        imageData: icon.base64,
        contentType: 'image/png',
        width: iconSize,
        height: iconSize,
        angle: 0,
        xoffset: 0,
        yoffset: 0
      }
    };

    let type = {
      id: icon.name,
      name: icon.name,
      domains: {},
      templates: [
        {
          name: icon.name,
          description: '',
          drawingTool: 'esriFeatureEditToolPoint',
          prototype: {
            attributes: {
              OCHA_NAME: icon.name,
              OCHA_CATEGORY: icon.category
            }
          }
        }
      ]
    };

    uvTemplate.drawingInfo.renderer.uniqueValueInfos.push(uvi);

    uvTemplate.types.push(type);
  });

  bodyFormData.set('updateDefinition', JSON.stringify(uvTemplate));

  const options = {
    url: `${serviceUrl}/updateDefinition`,
    method: 'post',
    responseType: 'json',
    data: bodyFormData,
    config: { headers: { 'Content-Type': 'multipart/form-data' } }
  };

  return axios(options);
}

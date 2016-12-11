import { takeLatest } from 'redux-saga';
import { take, call, put, fork, cancel, select } from 'redux-saga/effects';
import { LOCATION_CHANGE } from 'react-router-redux';
import { incidentsLoaded, getCitiesSuccess, getPrecintsSuccess } from './actions';
import { SHORT_INCIDENTS, GET_CITIES, SUBMIT_FORM, GET_PRECINTS } from './constants';
import { countyId, getImage, cityId, getDescription, getToken, getIncidentId, getName, getPrenume, getPrecintId } from './selectors';
import request from 'utils/request';

export function* getIncidents() {
  const requestURL = 'http://portal-votanti-uat.azurewebsites.net/api/incidents';

  try {
    const incidentsResponse = yield call(request, requestURL);
    yield put(incidentsLoaded(incidentsResponse));
  } catch (err) {
    // to do when failed
  }
}

export function* getIncidentsWatcher() {
  yield fork(takeLatest, SHORT_INCIDENTS, getIncidents);
}

export function* shortIncidents() {
  const watcher = yield fork(getIncidentsWatcher);

  yield take(LOCATION_CHANGE);
  yield cancel(watcher);
}

export function* getAllCitiesPerCountry() {
  const countyIdValue = yield select(countyId());
  const requestURL = `http://portal-votanti-uat.azurewebsites.net/api/counties/${countyIdValue}/cities`;
  const citiesData = yield call(request, requestURL);
  if (citiesData.data) {
    yield put(getCitiesSuccess(citiesData.data));
  } else {
    // yield call(() => browserHistory.push('/notfound'));
  }
}

export function* citiesWatcher() {
  yield fork(takeLatest, GET_CITIES, getAllCitiesPerCountry);
}

export function* cities() {
  const watcher = yield fork(citiesWatcher);

  yield take(LOCATION_CHANGE);
  yield cancel(watcher);
}

export function* getPrecintsPerCity() {
  const cityIdValue = yield select(cityId());
  const requestURL = `http://portal-votanti-uat.azurewebsites.net/api/${cityIdValue}/precincts`;
  const precintsData = yield call(request, requestURL);
  if (precintsData.data) {
    yield put(getPrecintsSuccess(precintsData.data));
  } else {
    // yield call(() => browserHistory.push('/notfound'));
  }
}

export function* precintsWatcher() {
  yield fork(takeLatest, GET_PRECINTS, getPrecintsPerCity);
}

export function* precints() {
  const watcher = yield fork(precintsWatcher);

  yield take(LOCATION_CHANGE);
  yield cancel(watcher);
}

export function* submitForm() {
  const countyIdValue = yield select(countyId());
  const image = yield select(getImage());
  const cityIdValue = yield select(cityId());
  const getDescriptionValue = yield select(getDescription());
  const token = yield select(getToken());
  const firstName = yield select(getName());
  const lastName = yield select(getPrenume());
  const incidentId = yield select(getIncidentId());
  const precintId = yield select(getPrecintId());

  const formData = new FormData();
  formData.set('firstName', firstName);
  formData.set('lastName', lastName);
  formData.set('incidentType', incidentId);
  formData.set('description', getDescriptionValue);
  formData.set('county_id', countyIdValue);
  formData.set('city', cityIdValue);
  formData.set('stationNumber', precintId);
  formData.set('fromStation', true);
  formData.set('recaptchaResponse', token);
  formData.set('file', image, image);

  const requestURL = 'http://portal-votanti-uat.azurewebsites.net/api/incidents';

  const xhr = new XMLHttpRequest();
  xhr.open('POST', requestURL, true);
  xhr.onload = function () {
    browserHistory.push('/multumim');
  };
  xhr.send(formData);

  /*
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    body: data,
  };

  const submitFormRequest = yield call(request, requestURL, options);
  if (submitFormRequest) {
    // yield put(getCitiesSuccess(citiesData.data));
  } else {
    // yield call(() => browserHistory.push('/notfound'));
  }*/
}

export function* submitFormWatcher() {
  yield fork(takeLatest, SUBMIT_FORM, submitForm);
}

export function* form() {
  const watcher = yield fork(submitFormWatcher);

  yield take(LOCATION_CHANGE);
  yield cancel(watcher);
}

export default [
  shortIncidents,
  cities,
  precints,
  form,
];

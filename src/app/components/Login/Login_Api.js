import axios from 'axios';
import jwt_decode from 'jwt-decode';
import store from '../../Redux_Store/store';
import API from '../../Redux_Store/newConfig';
import setAuthToken from '../../utils/setAuthToken';

import {
  setCurrentUser,
  showEmailVerification,
  setError,
  hideEmailVerification,
  resetPasswordFrom,
} from './LoginDispatchFunction';

class LoginAPI {
  constructor() {
    if (localStorage.getItem('token')) {
      axios.defaults.headers.common[
        // eslint-disable-next-line dot-notation
        'Authorization'
      ] = `Bearer ${localStorage.getItem('token')}`;
    }
  }

  // function for user login process
  loginUser = async (userData) => {
    try {
      const value = await API.post('/users/sign_in', userData);
      const {
        jwt,
        email,
        first_name,
        last_name,
        email_confirmed,
        enabled_2fa,
      } = value.data;

      if (email_confirmed && jwt) {
        localStorage.setItem('token', jwt);
        setAuthToken(jwt);
        const decoded = jwt_decode(jwt);

        // dispatch method for response  for set current user
        store.dispatch(setCurrentUser(decoded, email, first_name, last_name));
      } else {
        store.dispatch(showEmailVerification());
      }
    } catch (er) {
      console.log('error', er);
      store.dispatch(setError(er.response.data));
    }
  };

  // function for user email verification

  verifyEmail = async (token, email) => {
    try {
      const value = await API.get('/users/confirm', {params: {email, token}});

      const {jwt, email, first_name, last_name} = value.data;
      localStorage.setItem('token', jwt);
      setAuthToken(jwt);
      const decoded = jwt_decode(jwt);

      // dispatch method for response  for set current user
      store.dispatch(setCurrentUser(decoded, email, first_name, last_name));
    } catch (er) {
      if (er.response.data) store.dispatch(setError(er));
    }
  };

  hideEmailVerification = () => {
    store.dispatch(hideEmailVerification());
  };
}

export const loginAPI = new LoginAPI();

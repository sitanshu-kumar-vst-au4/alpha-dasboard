import React, {Component} from 'react';
import {connect} from 'react-redux';
import {getCurrentProfile} from '../../../../redux/actions/profileActions';
import QRCode from 'qrcode.react';
import {compose} from 'redux';
import {responseMsg} from './chnage-2fa_Dispatcher';
import store from '../../../../Redux_Store/store';
import {change2faApi} from './change_2fa_API';
import {withAlert} from 'react-alert';
import './change-2fa.css';

class Change2FA extends Component {
  state = {
    showQR: false,
    secret_key_2fa: '',
    mfa_for_enabling: '',
    copied: false,
    error: '',
  };

  componentDidMount = () => {};

  componentWillReceiveProps = (nextProps) => {
    console.log('nextProps', nextProps);
    if (nextProps.faState.secret_key_response_msg)
      this.setState({showQR: false});
    /*console.log('nextProps', nextProps);
    const {secret_key_response_msg} = this.props.faState;
    if (
      nextProps.faState.secret_key_response_msg !==
      this.props.faState.secret_key_response_msg
    )
      this.props.alert.show(nextProps.faState.secret_key_response_msg);*/
  };

  getSecretKeyFor2FA = () => {
    change2faApi.getSecretKeyFor2FA();
  };

  handleMFACode = (e) => {
    let val = e.target.value;
    this.setState({mfa_for_enabling: val, error: ''});
  };

  copyText = () => {
    this.copyRef.current.select();
    document.execCommand('copy');
    this.copyRef.current.focus();
    this.setState({copied: true});
    setTimeout(() => {
      this.setState({copied: false});
    }, 3000);
  };
  hanldleEnable = () => {
    this.setState({showQR: true});
    change2faApi.getSecretKeyFor2FA();
  };
  changeMFAStatus = (bool) => {
    let token_2fa = this.state.mfa_for_enabling;
    if (token_2fa.length < 6)
      this.setState({error: 'Token must be greater than 6 digits'});
    else {
      const data = {token_2fa, enabled_2fa: bool};
      change2faApi.changeMFAStatus(data);
    }
  };

  copyRef = React.createRef();

  render() {
    const Profile = this.props.heading;
    let link = '';
    const {enabled_2fa, email} = this.props.profile.profile;
    if (this.props.faState.secret_key_2fa) {
      link = `otpauth://totp/Alpha5(${email})/?secret=${this.props.faState.secret_key_2fa}`;
    }

    return (
      <>
        <div className="main">
          <div className="main-header">
            <h3>Account & Preferences</h3>
            <div className="main-sub-header">
              Change 2FA
              <hr />
            </div>
          </div>
          <div className="main-body">
            <div className="notice mw-50">
              <h2>Multi Factor Authentication</h2>
              <p>
                Two Factor Authentication adds extra security to your account.
                Once activated it will require you to enter a unique
                verification code generated by the app on your device or sent
                via SMS text message, in addition to your username and password.
              </p>
            </div>
            <div className="balance-ga-notice mt-5 mb-5 d-flex w-80">
              <img src={'db-assets/google-authenticator-2 1.svg'} />
              <p>
                <span style={{color: 'var(--gold-pop)'}}>
                  Google Authenticator
                </span>
                to verify your account every time you sign in
              </p>
              {!enabled_2fa ? (
                <button
                  onClick={this.hanldleEnable}
                  className="form-btn yellow"
                >
                  ENABLE
                </button>
              ) : (
                <button
                  onClick={() => this.setState({showQR: true})}
                  className="form-btn yellow"
                >
                  DISABLE
                </button>
              )}
            </div>
            {this.state.showQR &&
            this.props.faState.secret_key_2fa &&
            !enabled_2fa ? (
              <div className="qr-container ga-secure-code ml-auto mr-auto d-flex">
                <QRCode includeMargin={true} size={200} value={link} />
                <div className="qr-result">
                  <div className="input-with-copy">
                    <input
                      value={this.props.faState.secret_key_2fa}
                      type="text"
                      readOnly
                      ref={this.copyRef}
                    />
                    <img
                      onClick={this.copyText}
                      src={'db-assets/copy-icon.svg'}
                    />
                    {this.state.copied ? (
                      <span className="text-success">Copied !!</span>
                    ) : (
                      <></>
                    )}
                  </div>
                  <p>
                    If you are unable to scan this QR Code, please insert this
                    key into the app manually.
                  </p>
                </div>
              </div>
            ) : (
              <></>
            )}
            {this.state.showQR ? (
              <div className="d-flex flex-column align-items-center w-40 ml-auto mr-auto">
                <div className="a5-login-field w-80">
                  <input
                    onInput={this.handleMFACode}
                    placeholder="Enter 2FA code"
                    type="text"
                  />
                  <span className="a5-login-error">{this.state.error}</span>
                </div>
                <div className="form-btn-holder">
                  {!enabled_2fa ? (
                    <>
                      <button
                        onClick={() => this.changeMFAStatus(true)}
                        className="form-btn yellow"
                      >
                        Enable 2FA
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => this.changeMFAStatus(false)}
                        className="form-btn yellow"
                      >
                        Disable 2FA
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  errors: state.errors,
  profile: state.profile,
  faState: state.faReducer,
});

export default compose(withAlert(), connect(mapStateToProps, {}))(Change2FA);

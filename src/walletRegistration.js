import { setRegisteredWalletAddress } from './msuApi.js';

const isRegistrationPage = window.location.pathname.replace(/\/$/, '') === '/WalletRegistration';
if (isRegistrationPage) {
  const dashboard = document.querySelector('.app-shell');
  const registration = document.querySelector('#wallet-registration');
  const form = document.querySelector('#wallet-registration-form');
  const input = document.querySelector('#wallet-address');
  const error = document.querySelector('#wallet-registration-error');

  dashboard.hidden = true;
  registration.hidden = false;
  input.focus();

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const saved = setRegisteredWalletAddress(input.value);
    if (!saved) {
      error.textContent = 'ウォレットアドレスを入力してください。';
      error.hidden = false;
      input.focus();
      return;
    }

    window.location.assign('/');
  });
}
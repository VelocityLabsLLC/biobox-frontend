class Auth {
  constructor() {
    this.authenticated = false;
  }

  login() {
    this.authenticated = true;
    // cb();
    return 'success-login'
  }
  logout() {
    this.authenticated = false;
    // cb();
    return 'success-logout'
  }

  isAuthenticated() {
    return this.authenticated;
  }
}

export default new Auth();

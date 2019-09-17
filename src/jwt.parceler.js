const jwtDecode = require('jwt-decode');

class IllegalJwtToken extends Error {
  constructor(value) {
    super();
    this.message = value;
  }
}

class JwtToken {
  constructor(value) {
    this.raw = value;
    this.parsePayload();
  }

  parsePayload() {
    try {
      this.payload = jwtDecode(this.raw);
    } catch (error) {
      throw new IllegalJwtToken('The payload is not valid JWT payload and cannot be parsed.');
    }
  }

  toString() {
    return this.raw;
  }
}

export default function jwtParcelerProvider() {
  function setToken(key, value) {
    if (window.localStorage) {
      localStorage.setItem(key, value);
    } else {
      const date = new Date();
      date.setTime(date.getTime() + 7 * 24 * 60 * 60 * 1000);
      document.cookie = `${key}=${value}; expires=${date.toUTCString()}; path=/`;
    }
  }

  function getToken(key) {
    if (window.localStorage) {
      return localStorage.getItem(key);
    }

    const name = `${key}=`;
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i += 1) {
      let cookie = cookies[i];
      while (cookie.charAt(0) === ' ') cookie = cookie.substring(1);
      if (cookie.indexOf(name) === 0) return cookie.substring(name.length, cookie.length);
    }

    return '';
  }

  function getAccessToken(key) {
    const raw = getToken(key);
    let token;
    try {
      token = new JwtToken(raw);
    } catch (error) {
      if (!(error instanceof IllegalJwtToken)) {
        throw error;
      }
    }

    return token;
  }

  function getRefreshToken(key) {
    return getToken(key);
  }

  this.$get = [function () {
    return {
      setToken,
      getAccessToken,
      getRefreshToken,
    };
  }];
}
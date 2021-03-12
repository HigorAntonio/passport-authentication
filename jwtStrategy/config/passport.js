require('dotenv/config');
const axios = require('axios');
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy;

const db = require('./db');

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_SECRET = process.env.TWITCH_SECRET;
const CALLBACK_URL = 'http://localhost:3000/auth/twitch/callback';  // You can run locally with - http://localhost:3000/auth/twitch/callback

OAuth2Strategy.prototype.userProfile = function(accessToken, done) {
  var options = {
    url: 'https://api.twitch.tv/helix/users',
    method: 'GET',
    headers: {
      'Client-ID': TWITCH_CLIENT_ID,
      'Accept': 'application/vnd.twitchtv.v5+json',
      'Authorization': 'Bearer ' + accessToken
    }
  };

  axios(options)
    .then(response => {
      const [data] = response.data.data;
      done(null, data);
    })
    .catch(error => {
      if (error.response) {
        done(error.response.data);
      } else if (error.request) {
        done(error.request);
      } else {
        done(error.message);
      }
    });
}

module.exports = (passport) => {
  passport.use('twitch',new OAuth2Strategy({
      authorizationURL: 'https://id.twitch.tv/oauth2/authorize',
      tokenURL: 'https://id.twitch.tv/oauth2/token',
      clientID: TWITCH_CLIENT_ID,
      clientSecret: TWITCH_SECRET,
      callbackURL: CALLBACK_URL,
      state: false
    },
    function(accessToken, refreshToken, profile, done) {
      profile.accessToken = accessToken;
      profile.refreshToken = refreshToken;

      // Securely store user profile in your DB
      //User.findOrCreate(..., function(err, user) {
      //  done(err, user);
      //});
      try {
        const user = db.users.find(user => user.id === profile.id);
        if(!user) {
          db.users.push({ ...profile, accessToken, refreshToken });
          done(null, profile);
          return;
        }
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  ));
}
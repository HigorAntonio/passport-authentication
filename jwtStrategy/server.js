require('dotenv/config');
const { json } = require('express');
const express = require('express');
const passport = require('passport')
const axios = require('axios');

const db = require('./config/db');

const passportConfig = require('./config/passport');

const PORT = process.env.PORT || 3000;

const app = express();

passportConfig(passport);

app.get('/', (req, res) => {
  res.json({ home: true });
});

app.get('/auth/twitch', passport.authenticate('twitch', { scope: 'user_read', session: false }));

app.get('/auth/twitch/callback', passport.authenticate('twitch', 
  { successRedirect: '/', failureRedirect: '/', session: false }
));

app.get('/users', (req, res) => {
  return res.json(db.users);
});

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
app.get('/twitch/user', (req, res) => {
  var options = {
    url: 'https://api.twitch.tv/helix/users',
    method: 'GET',
    headers: {
      'Client-ID': TWITCH_CLIENT_ID,
      'Accept': 'application/vnd.twitchtv.v5+json',
      'Authorization': 'Bearer ' + '3y07h31myusgcgtusj2291qwncwjwb'
    }
  };

  axios(options)
    .then(response => {
      const [data] = response.data.data;
      res.json(data);
    })
    .catch(error => {
      if (error.response) {
        res.send(error.response.data);
      } else if (error.request) {
        res.send(error.request);
      } else {
        res.send(error.message);
      }
    });
});

app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});
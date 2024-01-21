'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  SERVER_URL: '"http://localhost:8080"',

  GOOGLE_WEB_ID: '"973428460281-p0ei044cjjulfptp592b1s8fv16ah1pn.apps.googleusercontent.com"',
  GOOGLE_WEB_SECRET: '"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"',
  GOOGLE_CALLBACK: '"http://localhost:8081/google"',
  GOOGLE_CALLBACK_AUTH: '"http://localhost:8081/gmail"',

  MICROSOFT_CLIENT_ID:'"704230ec-5e6f-4d82-a838-1e19df3db37a"',
  MICROSOFT_CALLBACK_AUTH: '"http://localhost:8081/outlook"',
  MICROSOFT_CALLBACK: '"http://localhost:8081/microsoft"',


  GITHUB_CLIENT_ID:'"5002761fc39391c9b7e3"',
  GITHUB_SECRET_ID:'"6a21becf6934b5e3184d52a295d90e30f8899c57"',
  GITHUB_CALLBACK: "'http://localhost:8081/github'",

  GITLAB_CLIENT_ID:'"1acff6cbf57dd4c250d5edc46d7d524af8c4a4bf27ec5d20d99a0767dc42de4b"',
  GITLAB_SECRET_ID:'"gloas-e94ce76732cfd7bfb60ddf45cc4a414b4d21655d428d905cdcb485f58c113994"',
  GITLAB_CALLBACK: '"http://localhost:8081/gitlab	"',

  NOTION_CLIENT_SECRET:'"secret_sTbhCBRrBhwzRuhYaprtmk8GwljXqLFsENm7jjfgaBl"',
  NOTION_CLIENT_ID:'"4a7bbdc3-eb6c-495d-be84-4445ecec6553"',
  NOTION_AUTH_URL:'"https://api.notion.com/v1/oauth/authorize?client_id=4a7bbdc3-eb6c-495d-be84-4445ecec6553&response_type=code&owner=user&redirect_uri=http://localhost:8081/notion"',

  SPOTIFY_CLIENT_ID:'"3a095222f4684e34a0e34758d06c83f8"',
  SPOTIFY_CLIENT_SECRET:'"7754862456ac488685810017db895ded"',
  SPOTIFY_OAUTH_TOKEN:'"https://accounts.spotify.com/api/token"',
  SPOTIFY_AUTH_URL:'"https://accounts.spotify.com/authorize"',

  DISCORD_CLIENT_ID:'"1194701009461710969"',
  DISCORD_CLIENT_SECRET:'"ATAlRGHB7pef7lJsVIINS_kl3y6PhIgy"',
  DISCORD_AUTH_URL:'"https://discord.com/api/oauth2/authorize?client_id=1194701009461710969&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A8081%2Fdiscord&scope=identify+email"'
})

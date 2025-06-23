'use strict'

import 'server-only' // 限制只能在伺服器端使用

import jwt from 'jsonwebtoken'
import secure_compare from 'secure-compare'
import crypto from 'crypto'
import { getSession, setSession, deleteSession } from './iron-session'
import { isDev } from './utils'

const api_version = 'v2.1'

/**
@class
*/
class LineLogin {
  /**
    @constructor
    @param {Object} options
    @param {String} options.channel_id - LINE Channel Id
    @param {String} options.channel_secret - LINE Channel secret
    @param {String} options.callback_url - LINE Callback URL
    @param {String} [options.scope="profile openid"] - Permission to ask user to approve. Supported values are "profile", "openid" and "email". To specify email, you need to request approval to LINE.
    @param {String} [options.prompt] - Used to force the consent screen to be displayed even if the user has already granted all requested permissions. Supported value is "concent".
    @param {String} [options.bot_prompt="normal"] - Displays an option to add a bot as a friend during login. Set value to either normal or aggressive. Supported values are "normal" and "aggressive".
    @param {Boolean} [options.verify_id_token=true] - Used to verify id token in token response. Default is true.
    @param {String} [options.endpoint="line.me"] - Test purpose only. Change API endpoint hostname.
    */
  constructor(options) {
    const required_params = ['channel_id', 'channel_secret', 'callback_url']
    const optional_params = [
      'scope',
      'prompt',
      'bot_prompt',
      'session_options',
      'verify_id_token',
      'endpoint',
    ]

    // Check if required parameters are all set.
    required_params.map((param) => {
      if (!options[param]) {
        throw new Error(`Required parameter ${param} is missing.`)
      }
    })

    // Check if configured parameters are all valid.
    Object.keys(options).map((param) => {
      if (
        !required_params.includes(param) &&
        !optional_params.includes(param)
      ) {
        throw new Error(`${param} is not a valid parameter.`)
      }
    })

    this.channel_id = options.channel_id
    this.channel_secret = options.channel_secret
    this.callback_url = options.callback_url
    this.scope = options.scope || 'profile openid'
    this.prompt = options.prompt
    this.bot_prompt = options.bot_prompt || 'normal'
    if (typeof options.verify_id_token === 'undefined') {
      this.verify_id_token = true
    } else {
      this.verify_id_token = options.verify_id_token
    }
    this.endpoint = options.endpoint || 'line.me'
  }

  // 用fetch來post一般表單資料(非json或FormData)
  fetchPost = async (url, form, hasResponseData = true) => {
    const formBody = Object.keys(form)
      .map(
        (key) => encodeURIComponent(key) + '=' + encodeURIComponent(form[key])
      )
      .join('&')

    if (isDev) console.log(url, formBody)

    return await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: formBody,
    }).then((res) => {
      // 除錯用
      if (isDev) console.log('res.status =', res.status)
      // some API may not return json but return 200 status
      if (!hasResponseData && res.status === 200) return
      if (hasResponseData) return res.json()
    })
  }

  fetchGet = async (url, headers) => {
    return await fetch(url, {
      method: 'GET',
      headers: headers,
    }).then((res) => res.json())
  }
  /**
    Middlware to initiate OAuth2 flow by redirecting user to LINE authorization endpoint.
    Mount this middleware to the path you like to initiate authorization.
    @method
    @return {Function}
    */
  getAuthUrl = async () => {
    // 產生隨機state和nonce
    const state = LineLogin._random()
    const nonce = LineLogin._random()
    // 產生line登入網址
    const url = this.makeAuthUrl(state, nonce)
    // 記錄到session中 (use iron-session)
    await setSession('LINE_LOGIN', 'line_login_state', state)
    await setSession('LINE_LOGIN', 'line_login_nonce', nonce)

    // 除錯用
    if (isDev) {
      const session = await getSession('LINE_LOGIN')
      console.log(session)
      console.log(url)
    }

    // 回傳line登入網址
    return url
  }

  /**
    Middleware to handle callback after authorization.
    Mount this middleware to the path corresponding to the value of Callback URL in LINE Developers Console.
    */
  callback = async (code, state) => {
    // 得到session中的state和nonce，驗証用
    const session = await getSession('LINE_LOGIN')

    if (!secure_compare(session.line_login_state, state)) {
      throw new Error('Authorization failed. State does not match.')
    }

    const token_response = await this.issueAccessToken(code)

    if (this.verify_id_token && token_response.id_token) {
      let decoded_id_token
      try {
        decoded_id_token = jwt.verify(
          token_response.id_token,
          this.channel_secret,
          {
            audience: this.channel_id,
            issuer: 'https://access.line.me',
            algorithms: ['HS256'],
          }
        )

        if (!secure_compare(decoded_id_token.nonce, session.line_login_nonce)) {
          throw new Error('Nonce does not match.')
        }

        console.log('id token verification succeeded.')
        token_response.id_token = decoded_id_token
        // eslint-disable-next-line no-unused-vars
      } catch (exception) {
        console.log('id token verification failed.')
        Promise.reject(new Error('Verification of id token failed.'))
      }
    }
    // delete session
    await deleteSession('LINE_LOGIN')

    console.log(token_response)
    return token_response
  }

  /**
    Method to make authorization URL, ref:
    https://developers.line.biz/en/docs/line-login/integrate-line-login/#making-an-authorization-request
    @method
    @param {String} [nonce] - A string used to prevent replay attacks. This value is returned in an ID token.
    @return {String}
    */
  makeAuthUrl(state, nonce) {
    const client_id = encodeURIComponent(this.channel_id)
    const redirect_uri = encodeURIComponent(this.callback_url)
    const scope = encodeURIComponent(this.scope)
    // eslint-disable-next-line no-unused-vars
    const prompt = encodeURIComponent(this.prompt)
    const bot_prompt = encodeURIComponent(this.bot_prompt)

    let url = `https://access.${this.endpoint}/oauth2/${api_version}/authorize?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope}&bot_prompt=${bot_prompt}&state=${state}`

    if (this.prompt) url += `&prompt=${encodeURIComponent(this.prompt)}`
    if (nonce) url += `&nonce=${encodeURIComponent(nonce)}`

    return url
  }

  /**
    Method to retrieve access token using authorization code.
    https://developers.line.biz/en/reference/line-login/#issue-access-token
    @method
    @param {String} code - Authorization code
    @return {Object}
    */
  issueAccessToken = async (code) => {
    const url = `https://api.${this.endpoint}/oauth2/${api_version}/token`
    const form = {
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: this.callback_url,
      client_id: this.channel_id,
      client_secret: this.channel_secret,
    }

    return await this.fetchPost(url, form)
  }

  /**
    Method to verify the access token.
    @method
    @param {String} access_token - Access token
    @return {Object}
    */
  verifyAccessToken = async (access_token) => {
    const url = `https://api.${
      this.endpoint
    }/oauth2/${api_version}/verify?access_token=${encodeURIComponent(
      access_token
    )}`

    // use fetch to get form data
    return await fetch(url).then((res) => res.json())
  }

  /**
    Method to get a new access token using a refresh token.
    @method
    @param {String} refresh_token - Refresh token.
    @return {Object}
    */
  refreshAccessToken = async (refresh_token) => {
    const url = `https://api.${this.endpoint}/oauth2/${api_version}/token`
    const form = {
      grant_type: 'refresh_token',
      refresh_token: refresh_token,
      client_id: this.channel_id,
      client_secret: this.channel_secret,
    }

    return await this.fetchPost(url, form)
  }

  /**
    Method to invalidate the access token.
    @method
    @param {String} access_token - Access token.
    @return {Null}
    */
  revokeAccessToken = async (access_token) => {
    const url = `https://api.${this.endpoint}/oauth2/${api_version}/revoke`
    const form = {
      access_token: access_token,
      client_id: this.channel_id,
      client_secret: this.channel_secret,
    }
    // use fetch to post form data and no response
    return await this.fetchPost(url, form, false)
  }

  /**
    Method to get user's display name, profile image, and status message.
    @method
    @param {String} access_token - Access token.
    @return {Object}
    */
  getUserProfile = async (access_token) => {
    const url = `https://api.${this.endpoint}/v2/profile`
    const headers = {
      Authorization: 'Bearer ' + access_token,
    }
    return await fetch(url, {
      method: 'GET',
      headers: headers,
    }).then((res) => res.json())
  }

  /**
    Method to get the friendship status of the user and the bot linked to your LNIE Login channel.
    @method
    @param {String} access_token - Access token.
    @return {Object}
    */
  getFriendshipStatus = async (access_token) => {
    const url = `https://api.${this.endpoint}/friendship/v1/status`
    const headers = {
      Authorization: 'Bearer ' + access_token,
    }
    return await fetch(url, {
      method: 'GET',
      headers: headers,
    }).then((res) => res.json())
  }

  /**
    Method to generate random string.
    @method
    @return {Number}
    */
  static _random() {
    return crypto.randomBytes(20).toString('hex')
  }
}

export default LineLogin

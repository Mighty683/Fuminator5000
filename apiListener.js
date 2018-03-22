const request = require('request')
const async = require('async')
const EventEmitter = require('events').EventEmitter;
const util = require('util');
function ApiListener(config) {
  this.config = config
  this.state = {
    response: undefined
  }

  this.startSubscribe = function (interval) {
    setInterval(function () {
      this.startRequest()
      console.log('Request start')
    }.bind(this), interval)
  }

  this.saveResponse = function (err, response) {
    if (!err && response && this.parseResponse(response)) {
      this.state.response = this.parseResponse(response)
      this.emit('response:received', this.state.response)
    }
  }

  this.startRequest = function () {
    if (!this.config.method) {
      return
    }
    var options = {
      url: this.config.url,
      method: this.config.method,
      json: true,
      form: this.config.form
    }
    request(options, function (err, res, body) {
      this.saveResponse(err, body)
  }.bind(this))
  }

  this.getValueFromResponse = function (location) {
    return this.getValue(this.state.response, location) || ''
  }

  this.parseResponse = function (response) {
    if (!(response instanceof Object)) {
      response = JSON.parse(
        response.substring(
          response.indexOf('(') + 1,
          response.lastIndexOf(')')
        )
      )
    }
    return response
  }

  this.getValue = function (response, location) {
    var locationArray = location.split('.')
    for (let i = 0; i < locationArray.length; i++) {
        if (response[locationArray[i]]) {
            response = response[locationArray[i]]
        } else {
            return response
        }
    }
    return response
  }
}

util.inherits(ApiListener, EventEmitter);
module.exports = ApiListener
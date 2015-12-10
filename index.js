var str2tmp = require('string-template')
var css2jss = require('jss-cli/lib/cssToJss')
var jss     = require('jss')
var cC      = require('camelcase')

var sheetnames = {}

module.exports = style

function style (name, theme) {
  if (sheetnames[name]) {
    if (sheetnames[name].theme === JSON.stringify(theme)) {
      return sheetnames[name].s
    }
  }
  var _css = str2tmp(document.querySelector(name).innerHTML, theme)
  var _jss1 = css2jss(_css)
  var _jss2 = {}
  var regex = /^\.(.*)/
  Object.keys(_jss1).forEach(function(key) {
    var r = key.match(regex)
    if (!r) {
      throw new Error(key + ' is not a class selector')
    }
    _jss2[r[1]] = _jss1[key]
  })
  var sheet  = jss.create().createStyleSheet(_jss2, {
    named: true,
    link: true
  }).attach()
  function s () {
    return [].slice.call(arguments).map(function (cssclass) {
      var r = cssclass.match(regex)
    if (!r) {
      throw new Error('css selector "' + cssclass + '" is not defined')
    }
      return sheet.classes[r[1]]
    }).join(' ')
  }
  s.css = function (selector, prop, val) {
    if (!selector || !prop) {
      throw new Error('s.css(selector,prop,val) requires at least "selector" and "prop" to be defined')
    }
      var r = selector.match(regex)
    if (!r) {
      throw new Error('css selector "' + selector + '" is not defined')
    }
    if (val) {
      sheet.getRule(r[1]).prop(cC(prop), val)
    } else {
      return sheet.getRule(r[1]).prop(cC(prop))
    }
  }
  // var color = sheet.getRule('.header').prop('background-color')
  // var color = sheet.getRule('.header').prop('background-color', 'green')
  sheetnames[name] = {
    sheet: sheet,
    s: s,
    theme: JSON.stringify(theme)
  }
  return s
}

var Horseman = require('node-horseman');
var chai = require('chai')
  , chaiColors = require('chai-colors');

chai.use(chaiColors);

var expect = chai.expect
var horseman = new Horseman();

horseman
  .open('http://localhost:3000/uptime-checks')
  .click('div#5898b671d0322f07e8e65779 a.js-config-assumption-details')
  .waitForSelector('div#uc-config-assumption-details div')
  .count('div#uc-config-assumption-details div > div')
  .then( function( divs )
  {
    var answer = 10;
    expect(answer).to.equal(3);
  })
  .close();

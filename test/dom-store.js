var Dom = require('simplest-dom');
global.document = new Dom();
const assert = require('chai').assert;
global.DocumentFragment = document.DocumentFragment;
global.Element = DocumentFragment.prototype.constructor
require('../DOM.js')
const Observable = global.Observable = require('../Observer');

const Store = require('../Store.js')
var D = window.NS.D

describe('DOM with Store', function(){
  it( 'should create simple div with reactive value', function(){
    var val = new Store.Value.String('c');
    var div = D.div({}, val);
    assert.equal(div.outerHTML, '<div data-hooked="yep">c</div>');
    val.set('d');
    assert.equal(div.outerHTML, '<div data-hooked="yep">d</div>');
  } );

  it( 'should set reactive cls', function(){
    var val = new Store.Value.String('c'),
        bool = new Store.Value.Boolean(false);
    var div = D.div({cls: [{a: val, b: bool}]}, val);
    assert.equal(div.outerHTML, '<div class="a" data-hooked="yep">c</div>');
    bool.set(true);
    assert.equal(div.outerHTML, '<div class="a b" data-hooked="yep">c</div>');
    bool.set(false);
    assert.equal(div.outerHTML, '<div class="a" data-hooked="yep">c</div>');
  } );

  it( 'should extend reactive cls', function(){
    var div = D.div( { cls: 'abc' }, 'in' );
    assert.equal(div.outerHTML, '<div class="abc">in</div>');
    D.ext(div, {cls: ['2']})
    assert.equal(div.outerHTML, '<div class="abc 2">in</div>');

    var bool = new Store.Value.Boolean(true);
    D.ext(div, {cls: [{x: bool}]})
    assert.equal(div.outerHTML, '<div class="abc 2 x">in</div>');

    bool.set(false);
    assert.equal(div.outerHTML, '<div class="abc 2">in</div>');
  });

});
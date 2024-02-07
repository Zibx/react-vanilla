var Dom = require('simplest-dom');
global.document = new Dom();
global.DocumentFragment = document.DocumentFragment;
require('../DOM.js')

var delay = async function(delay = 100){
    await new Promise(function(resolve, reject){
      setTimeout(resolve, delay)
    });
};

var D = window.NS.D
const assert = require('chai').assert;

describe('DOM lib', function(){
  it( 'should create simple div', function(){
    var div = D.div({cls: '1'});
    assert.equal(div.outerHTML, '<div class="1"></div>');
  } );

  it( 'should create simple div with child', function(){
    var div = D.div({cls: 'a b'}, 'c');
    var result = div.outerHTML;
    assert.equal(result, '<div class="a b">c</div>');
  } );

  it( 'should create simple div with attributes', function(){
    var div = D.div({'data-test': '123'});
    assert.equal(div.outerHTML, '<div data-test="123"></div>');
  } );

  it( 'should create nested divs', function(){
    var div = D.div({cls: 'a'},
      D.div({cls: 'b'}),
      D.div({cls: 'c'}, D.div({cls: 'd'}))
    );
    assert.equal(div.outerHTML, '<div class="a"><div class="b"></div><div class="c"><div class="d"></div></div></div>');
  } );

  it( 'should work with async', async function(){

      var div = D.div({
          cls: async () => ((await delay(100)), 1) },
          async () => ((await delay(100)), 10)
      );
      await delay(200);

      if(div.outerHTML !== '<div data-hooked="yep" class="1">10</div>')
        throw new Error(div.outerHTML);
      else
        return true;


  } );

  it( 'events', function(){
    var clicked = 0
    var div = D.div({onclick: ()=>clicked++});
    div.click();

    assert.equal(clicked, 1);
  } );
});
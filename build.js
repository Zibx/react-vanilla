const {minify} = require("terser"),
    fs = require('fs'),
    path = require( 'path'),

    DOM = ['DOM.js'],
    rDOM = DOM.concat('Observer.js', 'Store.js', 'Transform.js'),
    dir = 'build',
    header = `/* Vanilla.js Reactivity by Ivan Kubota. 
* ©Form.dev 2012—${(new Date()).getFullYear()}
* License: MPL-2.0 for not commercial use and all projects that involves me 
*/
`;
    build = {
      DOM,
      rDOM
    },

    hash = {};

Object
  .values(build)
  .forEach(files =>
    files.forEach(fileName =>
      hash[fileName] = hash[fileName] || fs.readFileSync(fileName).toString('utf-8')
    )
  );

(async function(){


  for( let outFileName in build ){
    let
      dest = path.join( dir, outFileName ),
      source = header +
        (await minify(
          build[ outFileName ].map( fileName => hash[ fileName ] ).join( ';' )
        )).code;
    fs.writeFileSync( dest, source );
    console.log( `Build ${dest} ${( source.length / 1024 ).toFixed( 2 )}K` )
  }


})();
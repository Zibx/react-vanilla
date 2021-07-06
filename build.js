const {minify} = require("terser"),
    fs = require('fs'),
    path = require( 'path'),

    DOM = ['DOM.js'],
    rDOM = DOM.concat('Observer.js', 'Store.js', 'Transform.js', 'Ajax.js'),
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

    hash = {},

    {execSync} = require('child_process'),
    commit = execSync( 'git rev-list --count HEAD' ).toString().trim()-0,

    bigVersion = 1,
    version = [bigVersion, commit/17|0, commit % 17];

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
      dest = path.join( dir, outFileName )+'_'+version.join('.')+'.js',
      latest = path.join( dir, outFileName )+'_latest.js',
      source =
        (await minify(
          build[ outFileName ].map( fileName => hash[ fileName ] ).join( ';' ),
          {
            sourceMap: true,
            format: {
              preamble: header
            },
            ie8: false,
            compress: {
              passes: 2
            }
          }
        )),
      code = source.code,
      map = source.map;

    fs.writeFileSync( dest, code );
    fs.writeFileSync( dest+'.map', map );
    fs.writeFileSync( latest, code );
    fs.writeFileSync( latest+'.map', map );
    console.log( `Build ${dest} ${( code.length / 1024 ).toFixed( 2 )}K` )
  }
  fs.writeFileSync( 'index.html', fs.readFileSync('list.html', 'utf-8')
    .replace('$LIST$', `
      ${fs.readdirSync(dir).filter(a=>a[0]!=='.').map(a=>`<li><a href="build/${a}">${a}</a></li>`).join('\n')}
    `)
  );
})();
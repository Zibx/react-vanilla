;(function(){
	const clearEmpty = function(obj) {
		for(var k in obj){
			if(obj[k] === void 0 || obj[k] === null)
				delete obj[k];
		}
		return obj;
	};
	const transformCfg = function( cfg ){
		return Object.assign( {}, cfg, {
			headers: clearEmpty(Object.assign(
				{
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				},
				cfg && cfg.headers || {} ))
		} );
	};
	let refreshing = false, refreshed = false;
	const xhrProceed = function( method, xhr, cfg, _cb ){
    var cb = function(err, data){
      var pointer = 0;
      var done = function(){
        if(arguments.length === 2){
          err = arguments[0];
          data = arguments[1];
        }
        var fn = Ajax._responseHandlerQueue[pointer++]
        if(fn){
          fn(err, data, done);
        }else{
          _cb(err, data);
        }
      };
    };

		xhr.open( method, cfg.url, true );
		for( let key in cfg.headers ){
			xhr.setRequestHeader( key, cfg.headers[ key ] );
		}

		xhr.onreadystatechange = function(){
			if( xhr.readyState === 4 && xhr.status === 204 ){
				cb && cb( false, { error: false } );
				return;
			}else if( xhr.readyState === 4 && xhr.status >= 200 && xhr.status < 300 ){
				let json, error = false;
				if( cfg.bonus && cfg.bonus.raw )
					return cb && cb( false, xhr );
				try{
					json = JSON.parse( xhr.responseText );
				}catch( e ){
					error = true;
					json = e;
					console.error( 'AJAX:' + method + ' Incorrect Response ← ' + cfg.url, xhr.responseText, e );
				}

				cb && cb( error, json );
			}else if( xhr.status === 404 ){
				cb && cb( true );
			}else if( xhr.status === 503 ){
        // updating
			}else if( xhr.status === 401 ){
				//debugger
				//Пользователь не авторизован
				if( window.location.pathname !== "/login" ){
					if( !refreshed && !refreshing ){
						refreshing = true;
						ACTION.REFRESH_TOKEN.execute( function( err ){
							refreshing = false;
							refreshed = !!err;
						} );
					}else if( !refreshing ){
						window.location.pathname = "/login";
					}
				}
				return;
			}else if( xhr.status === 403 ){
				// no access
				window.location.href = "/";
				return;
			}else if( xhr.status >= 400 ){
				/*HeaderModel.statusNotification.statuses.push({type: 'error'});
				setTimeout(function () {
					HeaderModel.statusNotification.statuses.length = 0;
				}, 3000);*/
				cb && cb( true, { "status": "error" } );
				return;
			}
		};
	};
	const Ajax = {
		post( url, data, cb, cfg, method ){
			method = method || 'POST';
			let stringData = '';
			try{

				if(data instanceof FormData){
					cfg = cfg || {};
					cfg.headers || (cfg.headers = {});
					cfg.headers['Content-Type'] = void 0;
					stringData = data;
				}else{
					stringData = JSON.stringify( data );
				}

				cfg = transformCfg( cfg || {} );
				cfg.url = url;

				const xhr = new XMLHttpRequest();
				xhrProceed( method.toUpperCase(), xhr, cfg, cb );
				xhr.send( stringData );
			}catch( e ){
				/* HeaderModel.statusNotification.statuses.push({type: 'error'});
				 setTimeout(function () {
					 HeaderModel.statusNotification.statuses.length = 0;
				 }, 3000);*/
				console.error( 'AJAX:' + method.toUpperCase() + ' → ' + url, e );
				cb && cb( true, e );
			}
		},
		put( url, data, cb, cfg ){
			Ajax.post( url, data, cb, cfg, 'PUT' );
		},
		[ 'delete' ]( url, data, cb, cfg ){
			Ajax.post( url, data, cb, cfg, 'DELETE' );
		},

		get( url, cb, cfg ){
			try{
				cfg = transformCfg( cfg || {} );
				cfg.url = url;
				const xhr = new XMLHttpRequest();
				xhrProceed( "GET", xhr, cfg, cb );
				xhr.send( cfg.data || null );
			}catch( e ){
				/*HeaderModel.statusNotification.statuses.push({type: 'error'});
				setTimeout(function () {
					HeaderModel.statusNotification.statuses.length = 0;
				}, 3000);*/
				console.error( 'AJAX:GET → ' + url, e );
				cb && cb( true, e );
			}
		}
	};
	const AsyncAjax = Ajax.async = {};

	['get', 'post', 'put', 'delete'].forEach(function(name) {
		AsyncAjax[name] = function( url, data, cfg ){
			return new Promise( function( resolve, reject ){
				var handle = function( err, data ){
					Ajax.lastResponse = data;
					if( err ){
						reject( data );
					}else{
						if(data.error){
							reject( data.data );
						}else if(data.error === false){
							resolve( data.data );
						}else{
							resolve( data );
						}
					}
				};

				if(name === 'get')
					Ajax[name]( url, handle, cfg );
				else
					Ajax[name]( url, data, handle, cfg );
			} );
		};
	});
  Ajax._proceedResponse = function(err, data){

  };
  Ajax._responseHandlerQueue = [];
  Ajax.registerResponseHandler = function(fn){
    Ajax._responseHandlerQueue.push(fn);
    var un = function(){
      var index = Ajax._responseHandlerQueue.indexOf(fn);
      index > -1 && Ajax._responseHandlerQueue.splice(index, 1);
    };

    if(typeof D === 'function' && typeof D.Unsubscribe === 'function')
      return D.Unsubscribe(un);

    return {un: un};
  };
	(typeof module === 'object') && (module.exports = Ajax);
	(typeof window === 'object') && (window.Ajax = Ajax);
})();
;(function(){
	const transformCfg = function( cfg ){
		return Object.assign( {}, cfg, {
			headers: Object.assign(
				{
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				},
				cfg && cfg.headers || {}
			)
		} );
	};
	let refreshing = false, refreshed = false;
	const xhrProceed = function( method, xhr, cfg, cb ){
		xhr.open( method, cfg.url, true );
		for( let key in cfg.headers ){
			xhr.setRequestHeader( key, cfg.headers[ key ] );
		}

		xhr.onreadystatechange = function(){
			if( xhr.readyState === 4 && xhr.status === 204 ){
				cb && cb( false, { error: false } );
				return;
			}else if( xhr.readyState === 4 && xhr.status >= 200 && xhr.status < 300 ){
				let json;
				if( cfg.bonus && cfg.bonus.raw )
					return cb && cb( false, xhr );
				try{
					json = JSON.parse( xhr.responseText );
					cb && cb( false, json );
				}catch( e ){
					console.error( 'AJAX:' + method + ' Incorrect Response ← ' + cfg.url, xhr.responseText, e );
					cb && cb( true, e );
				}
			}else if( xhr.status === 404 ){
				cb && cb( true );
			}else if( xhr.status === 503 ){
				// Server is busy
				/*
				{
						"message": "Идет обновление..."
				}
				 */
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
				//Нет доступа к ассистенту
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
				stringData = JSON.stringify( data );
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
					if( err ){
						reject( data );
					}else{
						if(data.error){
							reject( data.data );
						}else{
							resolve( data.data );
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

	(typeof module === 'object') && (module.exports = Ajax);
	(typeof window === 'object') && (window.Ajax = Ajax);
})();
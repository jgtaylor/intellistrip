var http = require( "http" ),
	options = {
		hostname: 'automation.local',
		port: 8086,
		path: '/write?db=environ',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		}
	},
	req = function () {
		return http.request( options, function ( res ) {
			//            console.log('Status: ' + res.statusCode);
			//            console.log('Headers: ' + JSON.stringify(res.headers));
			res.setEncoding( 'utf8' );
			res.on( 'data', function ( body ) {
				console.log( 'Body: ' + body );
			} );
		} );
	};

var msg = 'fan,uuid=nice_fan,zone=bloom_tent value=' + fspd;
var hReq = req();
hReq.on( 'error', function ( e ) {
	console.log( e )
} );
hReq.write( msg );
hReq.end();

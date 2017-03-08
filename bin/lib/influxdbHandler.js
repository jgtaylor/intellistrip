module.exports = (msg, opt) => {
	let http = require( "http" );
	if (!opt) {
		options = {
			hostname: 'automation.local',
			port: 8086,
			path: '/write?db=environ',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		};
	}
	let req = function () {
			return http.request( options, function ( res ) {
				res.setEncoding( 'utf8' );
				res.on( 'data', function ( body ) {
					console.log( 'Body: ' + body );
				} );
			} );
		};

	var hReq = req();
	hReq.on( 'error', function ( e ) {
		console.log( e )
	} );
	hReq.write( msg );
	hReq.end();
}

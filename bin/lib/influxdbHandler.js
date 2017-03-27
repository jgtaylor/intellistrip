module.exports = (msg, opt) => {
	let http = require( "http" );
	if (!opt) {
		var options = {
			hostname: "localhost",
			port: 8086,
			path: "/write?db=environ",
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			}
		};
	}
	let req = function () {
		return http.request( options, function ( res ) {
			res.setEncoding( "utf8" );
			res.on("statusCode", (msg) => {
				console.log(`Status: ${msg}`);
			} );
			res.on( "data", function ( body ) {
				console.log( "Body: " + body );
			} );
		} );
	};

	var hReq = req();
	hReq.on( "error", function ( e ) {
		console.log( e );
	} );
	hReq.write( msg );
	hReq.end();
};

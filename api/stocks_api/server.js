//server.js
const express = require('express'),
      server = express(),
      status = require('./status');
const cors = require('cors');
server.use(cors());
//setting the port.
server.set('port', process.env.PORT || 8100);

//Adding routes
server.get('/',(request,response)=>{
 response.sendFile(__dirname + '/index.html');
});

server.get('/status',(request,response)=>{
	console.log(request);
 response.json(status);
});

//Binding to localhost://3000
server.listen(8100,()=>{
 console.log('Express server started at port 8100');
});

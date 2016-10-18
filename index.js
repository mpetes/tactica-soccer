var express = require('express');
var app = express();
var pg = require('pg');
var session = require('express-session');
var bodyParser = require('body-parser');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname));
app.use(session({secret: 'secretKey', resave: false, saveUninitialized: false}));
app.use(bodyParser.json());

/* Setup postgres DB. */
/*"postgres://ecaquzpyxjipiu:bTQuXAggmVo5-PEFUDQrP_W2i-@ec2-23-21-148-9.compute-1.amazonaws.com:5432/daiqg6aldfa9u7"*/
pg.defaults.ssl = true;

app.get('/', function(request, response) {
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

app.post('/login', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
  	var username = request.body.username;
  	var password = request.body.password;
    client.query("SELECT * FROM Users WHERE username='" + username + "' and password='" + password + "'", function(err, result) {
      done();
      if (err) { 
      	console.error(err); response.send("Error " + err); 
      } else { 
      	if (result.rows.length === 1) {
      		request.session.loggedIn = true;
      		request.session.username = username;
      		request.session.name = result.rows[0].name;
      		request.session.email = result.rows[0].email;
      		response.send(result.rows[0]); 
      	}
    	}
    });
  });
});

app.get('/session', function (request, response) {
    response.end(JSON.stringify(request.session));
});




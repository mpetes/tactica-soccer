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
pg.defaults.ssl = true;

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

app.post('/login', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
  	var email = request.body.email;
  	var password = request.body.password;
    client.query("SELECT * FROM Users WHERE email='" + email + "' and password='" + password + "'", function(err, result) {
	    done();
	    if (err) { 
	      	response.status(500).send(JSON.stringify(err)); 
	    } else { 
	      	if (result.rows.length === 1) {
	      		request.session.loggedIn = true;
	      		request.session.name = result.rows[0].name;
	      		request.session.email = result.rows[0].email;
	      		response.send(result.rows[0]); 
	      	} else {
	      		response.status(500).send("Error: Incorrect username or password.");
	      	}
	    }
    });
  });
});

app.get('/session', function (request, response) {
    response.send(JSON.stringify(request.session));
});

app.get('/logout', function (request, response) {

    /* Reject attempted logouts with no one logged in. */
    if (request.session.loggedIn !== true) {
        response.status(400).send("Permission denied. No one logged in.");
        return;
    }

    function doneCallback(err) {
        if (err) {
            response.status(400).send(JSON.stringify(err));
            return;
        }
    }

    /* End session. */
    request.session.loggedIn = false;
    request.session.destroy(function(err) { 
        if (err) {
            response.status(400).send("Failed to destroy session.");
            return;
        }
    });

    response.send("Success");
});

app.post('/register', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    var password = request.body.password1;
    var name = request.body.name;
    var email = request.body.email;
    client.query("INSERT into Users(email, password, name) VALUES(" + email + ", " + password + ", " + name + ")", function(err, result) {
        done();
        if (err) { 
            response.status(500).send(JSON.stringify(err)); 
        } else { 
            response.send("Success");
        }
    });
  });
});




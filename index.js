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

/* Attemps to login a user given an email and password. */
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

/* Returns the information stored in the current session. */
app.get('/session', function (request, response) {
    response.send(JSON.stringify(request.session));
});

/* Ends the current session. */
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

/* Registers a new user. Request must include an email, name, and password. */
app.post('/register', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    var password = request.body.password;
    var name = request.body.name;
    var email = request.body.email;
    var ownedPlays = [];
    var canAccessPlays = [];
    var plays = {owned: ownedPlays, access: canAccessPlays};
    client.query("INSERT into Users(email, password, name, plays) VALUES('" + email + "', '" + password + "', '" + name + "', '" + JSON.stringify(plays) + "')", function(err, result) {
        done();
        if (err) { 
            response.status(500).send(JSON.stringify(err)); 
        } else { 
            response.send("Success");
        }
    });
  });
});

/* Creates a new play by determining an id for a new play, placing ownership of the id to the given
email, and storing the play data. */
app.post('/create-new-play', function (request, response) {
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        /* Reject attempted logouts with no one logged in. */
        if (request.session.loggedIn !== true) {
            response.status(400).send("Permission denied. No one logged in.");
            return;
        }
        if (request.session.email !== email) {
            response.status(400).send("Permission denied. Logged in user does not match storing email.");
        }

        var email = request.body.email;
        var players = request.body.players;
        var ball = request.body.ball;
        client.query("SELECT MAX(id) from Plays", function(err1, playResult) {
            if (err) {
                done();
                response.status(500).send(JSON.stringify(err1));
                return; 
            } else {
                var newId;
                console.log(playResult.rows);
                if (playResult.rows[0].max === null) {
                    newId = 0;
                } else {
                    newId = playResult.rows[0].id + 1;
                }
                client.query("SELECT * from Users where email='" + email + "'", function(err2, userResult) {
                    if (err2 || userResult.rows.length === 0) { 
                        done();
                        response.status(500).send(JSON.stringify(err2)); 
                        return;
                    } else {
                        var plays = JSON.parse(userResult.rows[0].plays);
                        plays.owned.push(newId);
                        client.query("UPDATE Users SET plays='" + JSON.stringify(plays) + "'", function(err3, updateResult) {
                            if (err3) {
                                done();
                                response.status(500).send(JSON.stringify(err3)); 
                                return;
                            } else {
                                var players = [];
                                var ball = {};
                                client.query("INSERT into Plays(id, players, ball) VALUES('" + newId.toString() +"', '" + JSON.stringify(players) + "', '" + JSON.stringify(ball) + "')", function(err4, insertResult) {
                                    done();
                                    if (err4) {
                                        response.status(500).send(JSON.stringify(err4));
                                        return; 
                                    } else {
                                        response.send("Success");
                                    }
                                })
                            }
                        });
                    }
                });
            }
        });
    });
});




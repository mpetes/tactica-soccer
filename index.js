var express = require('express');
var app = express();
var pg = require('pg');
var session = require('express-session');
var bodyParser = require('body-parser');
var async = require('async');


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

app.post('/update-play', function(request, response) {
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        var id = parseInt(request.body.id);
        var email = request.body.userEmail;
        var players = request.body.userPlayers;
        var ball = request.body.userBall;

         /* Reject attempted logouts with no one logged in. */
        if (request.session.loggedIn !== true) {
            response.status(400).send("Permission denied. No one logged in.");
            return;
        }
        if (request.session.email !== email) {
            response.status(400).send("Permission denied. Logged in user does not match storing email.");
            return;
        }

        client.query("SELECT * from Users where email='" + email + "'", function(err1, userResult) {
            if (err1 || userResult.rows[0] === undefined) {
                done();
                console.log("Error finding user.");
                response.status(500).send(JSON.stringify(err1));
                return;
            }
            var user = userResult.rows[0];
            var ownedPlays = JSON.parse(user.plays).owned;
            if (ownedPlays.indexOf(id) === -1) {
                done();
                console.log("User is not owner of this play.");
                response.status(404).send(JSON.stringify(err1));
                return;
            }
            client.query("UPDATE Plays SET players='" + JSON.stringify(players) + "', ball='" + JSON.stringify(ball) + "' WHERE id='" + id + "'", function (err2, playResult) {
                done();
                if (err2) {
                    console.log("Error updating play.");
                    response.status(500).send(JSON.stringify(err1));
                    return;
                } else {
                    response.send("Success!");
                }
            });
        }); 
    });
});

/* Creates a new play by determining an id for a new play, placing ownership of the id to the given
email, and storing the play data. */
app.post('/create-new-play', function (request, response) {
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {

        var email = request.body.userEmail;
        var players = request.body.userPlayers;
        var ball = request.body.userBall;

        /* Reject attempted logouts with no one logged in. */
        if (request.session.loggedIn !== true) {
            response.status(400).send("Permission denied. No one logged in.");
            return;
        }
        if (request.session.email !== email) {
            response.status(400).send("Permission denied. Logged in user does not match storing email.");
            return;
        }

        client.query("SELECT MAX(id) from Plays", function(err1, playResult) {
            if (err) {
                done();
                console.log("Error finding max.");
                response.status(500).send(JSON.stringify(err1));
                return; 
            } else {
                var newId;
                if (playResult.rows[0].max === null) {
                    newId = 0;
                } else {
                    newId = parseInt(playResult.rows[0].max) + 1;
                }
                client.query("SELECT * from Users where email='" + email + "'", function(err2, userResult) {
                    if (err2 || userResult.rows.length === 0) { 
                        done();
                        console.log("Error finding user with email.");
                        response.status(500).send(JSON.stringify(err2)); 
                        return;
                    } else {
                        var plays = JSON.parse(userResult.rows[0].plays);
                        plays.owned.push(newId);
                        client.query("UPDATE Users SET plays='" + JSON.stringify(plays) + "' where email='" + email + "'", function(err3, updateResult) {
                            if (err3) {
                                done();
                                console.log("Error setting user.");
                                response.status(500).send(JSON.stringify(err3)); 
                                return;
                            } else {
                                client.query("INSERT into Plays(id, players, ball) VALUES('" + newId.toString() +"', '" + JSON.stringify(players) + "', '" + JSON.stringify(ball) + "')", function(err4, insertResult) {
                                    done();
                                    if (err4) {
                                        console.log("Error inserting to plays.");
                                        response.status(500).send(JSON.stringify(err4));
                                        return; 
                                    } else {
                                        response.send({id: newId});
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });
});

/* Returns ids of user-owned plays. */
app.get('/user-plays', function (request, response) {

    /* Reject attempted logouts with no one logged in. */
    if (request.session.loggedIn !== true) {
        response.status(400).send("Permission denied. No one logged in.");
        return;
    }
    if (request.session.email !== email) {
        response.status(400).send("Permission denied. Logged in user does not match storing email.");
        return;
    }

    var email = request.query.email;
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        client.query("SELECT plays from Users where email='" + email + "'", function(err, result) {
            done();
            if (err) {
                console.log("Error fetching plays.");
                response.status(500).send(JSON.stringify(err));
            } else {
                response.send(result.rows[0]);
            }
        });
    });
});

app.get('/load-play', function (request, response) {
     /* Reject attempted logouts with no one logged in. */
    if (request.session.loggedIn !== true) {
        response.status(400).send("Permission denied. No one logged in.");
        return;
    }
    if (request.session.email !== email) {
        response.status(400).send("Permission denied. Logged in user does not match storing email.");
        return;
    }

    var email = request.query.email;
    var id = request.query.id;
    var owned = request.query.owned;

    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        client.query("SELECT plays from Users where email='" + email + "'", function(err1, userResult) {
            if (err1) {
                done();
                response.status(500).send(JSON.stringify(err1));
                return;
            }
            var plays = JSON.parse(userResult.rows[0].plays);
            if ((plays.owned.indexOf(parseInt(id)) === -1 && plays.access.indexOf(parseInt(id)) === -1) || (owned && plays.owned.indexOf(parseInt(id)) === -1)) {
                done();
                console.log("Play not found in user's registry.");
                response.status(404).send("Not allowed to see this play.");
                return;
            }
            client.query("SELECT * from Plays where id='" + id + "'", function(err2, playResult) {
                done();
                if (err2 || playResult.rows[0] === undefined) {
                    response.status(500).send(JSON.stringify(err2));
                } else {
                    response.send(playResult.rows[0]);
                }
            });
        });
    });
});

/* Shares a play with another user. */
app.post('/share-play', function (request, response) {
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        if (request.session.loggedIn !== true) {
            response.status(400).send("Permission denied. No one logged in.");
            return;
        }
        if (request.session.email !== email) {
            response.status(400).send("Permission denied. Logged in user does not match storing email.");
            return;
        }

        var email = request.body.email;
        var emailToShare = request.body.emailToShare;
        var playId = request.body.playId;

        client.query("SELECT plays from Users where email='" + email + "'", function(err1, userResult) {
            if (err1) {
                done();
                response.status(500).send(JSON.stringify(err1));
                return;
            }
            var plays = JSON.parse(userResult.rows[0].plays);
            if (plays.owned.indexOf(parseInt(playId)) === -1) {
                done();
                console.log("You do not have permission to share this play.");
                response.status(404).send("Not allowed to share this play.");
                return;
            }
            client.query("SELECT plays from Users where email='" + emailToShare + "'", function(err2, shareResult) {
                if (err2) {
                    done();
                    response.status(500).send("User with email " + emailToShare + " does not exist!");
                    return;
                }
                var sharePlays = JSON.parse(shareResult.rows[0].plays);
                if(sharePlays.indexOf(parseInt(playId)) === -1) sharePlays.owned.push(parseInt(playId));
                client.query("UPDATE Users SET plays='" + JSON.stringify(sharePlays) + "' where email='" + emailToShare + "'", function(err3, updateResult) {        
                    done();
                    if (err3) {
                        response.status(500).send(JSON.stringify(err3));
                    } else {
                        response.send("Success!");
                    }
                });
            });
        });
    });
});





var express = require('express');
var app = express();
var pg = require('pg');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname));

/* Setup postgres DB. */
/*"postgres://ecaquzpyxjipiu:bTQuXAggmVo5-PEFUDQrP_W2i-@ec2-23-21-148-9.compute-1.amazonaws.com:5432/daiqg6aldfa9u7"*/
pg.defaults.ssl = true;

app.get('/', function(request, response) {
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

app.get('/db', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM test_table', function(err, result) {
      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       { response.send(result.rows); }
    });
  });
});



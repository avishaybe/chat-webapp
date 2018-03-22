let express = require('express');
let app = express();
let path = require('path');

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname,"public",'/chat.html'));
});

app.use(express.static('public'))

app.listen(8082);
const express = require('express');
const app = express();
const port = process.env.PORT || 8070;
const dotenv = require('dotenv');
const cors = require('cors')
require('./Database')
const { setupSocket } = require('./socket');




const http = require('http');
const server = http.createServer(app);
setupSocket(server);


dotenv.config();
app.use(express.json());
app.use(cors());

app.use('/uploads', express.static(__dirname + '/uploads'));

//routes
app.use('/api/user', require('./routes/UserRoutes'));
app.use('/api/message', require('./routes/MessageRoutes'));
app.use('/api/profile', require('./routes/Profile'));



server.listen(port, () => {
  console.log(`The Server is Running on http://localhost:${port}`);
});

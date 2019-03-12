require('dotenv').config();
require('./js-extend');
import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import initializeDb from './db';
import middleware from './middleware';
import Authenticate from './middleware/Authenticate';
import api from './api';
import config from './config.json';

let app = express();
app.server = http.createServer(app);

// logger
app.use(morgan('dev'));

// 3rd party middleware
app.use(cors({
	exposedHeaders: config.corsHeaders
}));

app.use(bodyParser.json({
	limit : config.bodyLimit
}));

// connect to db
initializeDb( db => {

	// internal middleware
	app.use(middleware({ config, db }));

	// api router
	app.use('/api/v0.1', Authenticate.setUser, api({ config, db }));
	app.use('/file', express.static("user_files"));
	app.all('/stats', function (req, res, next) {
    res.send({success: true, message: 'server running'});
  });
	app.server.listen(process.env.HTTP_PORT || config.port, () => {
		console.log(`Started on port ${app.server.address().port}`);
	});
});

export default app;

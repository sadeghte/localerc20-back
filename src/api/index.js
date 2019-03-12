import { version } from '../../package.json';
import { Router } from 'express';
import {forceAuthorized} from '../middleware/Authenticate';
import authRoutes from './auth';
import userRoutes from './user';
import resourceRoutes from './resources';
import seedRoutes from './seed';
import facets from './facets';

export default ({ config, db }) => {
	let api = Router();
	// mount the facets resource
	api.use('/facets', facets({ config, db }));
	api.use('/auth', authRoutes);
	api.use('/user', forceAuthorized, userRoutes);
	api.use('/resource', resourceRoutes);
	api.use('/seed', seedRoutes);
	// perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		res.json({ version });
	});

	return api;
}

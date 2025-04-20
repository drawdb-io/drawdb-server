import express from 'express';
import { create, del, get, update } from '../controllers/gist-controller';

const gistRouter = express.Router();

gistRouter.post('/', create);
gistRouter.get('/:id', get);
gistRouter.delete('/:id', del);
gistRouter.patch('/:id', update);

export { gistRouter };

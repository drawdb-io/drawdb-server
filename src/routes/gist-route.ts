import express from 'express';
import {
  create,
  del,
  get,
  getCommits,
  update,
  getRevision,
  getRevisionsForFile,
  compare,
} from '../controllers/gist-controller';

const gistRouter = express.Router();

gistRouter.post('/', create);
gistRouter.get('/:id', get);
gistRouter.delete('/:id', del);
gistRouter.patch('/:id', update);
gistRouter.get('/:id/commits', getCommits);
gistRouter.get('/:id/:sha', getRevision);
gistRouter.get('/:id/file-versions/:file', getRevisionsForFile);
gistRouter.get('/:id/file/:file/compare/:versionA/:versionB', compare);

export { gistRouter };

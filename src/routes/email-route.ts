import express from 'express';
import { send } from '../controllers/email-controller';

const emailRouter = express.Router();

emailRouter.post('/send', send);

export { emailRouter };

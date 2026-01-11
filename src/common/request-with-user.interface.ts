import { LoggedUser } from './auth-user.interface';
import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: LoggedUser;
}

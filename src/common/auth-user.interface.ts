import { UserRole } from '../users/enums/roles.status';

export interface LoggedUser {
  userId: string;
  email: string;
  role: UserRole;
}

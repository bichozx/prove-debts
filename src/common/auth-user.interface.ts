import { UserRole } from '../users/enums/roles.status';

export interface LogginUser {
  userId: string;
  email: string;
  role: UserRole;
}

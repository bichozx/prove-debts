import { UserRole } from '../users/entities/user.entity';

export interface LogginUser {
  userId: string;
  email: string;
  role: UserRole;
}

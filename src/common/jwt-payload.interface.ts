import { UserRole } from '../users/enums/roles.status';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

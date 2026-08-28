import { Role } from '@prisma/client';

/** JwtStrategy.validate() çıktısı — request.user'a yerleşir. */
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
}

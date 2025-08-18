import { UserRole } from "../enums/user";

export interface AuthenticatedUser {
  id: number;
  entityId: number;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

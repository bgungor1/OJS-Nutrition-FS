import { Injectable } from '@nestjs/common';

/**
 * Faz 1 — BACKEND_PLAN §5.2:
 *  - getMyAccount(userId): AccountProfile
 *  - updateMyAccount(userId, dto): AccountProfile
 * passwordHash asla serialize edilmez (select ile dışlanır).
 */
@Injectable()
export class UsersService {}

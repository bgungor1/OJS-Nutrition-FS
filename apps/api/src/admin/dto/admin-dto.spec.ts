import { Role } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ADMIN_PAGINATION } from '../admin.constants';
import { AdminUsersQueryDto } from './admin-users-query.dto';
import { UpdateUserRoleDto } from './update-user-role.dto';

describe('Admin DTO Validation', () => {
  describe('AdminUsersQueryDto', () => {
    it('should use default pagination values and pass validation with empty query', async () => {
      const dto = plainToInstance(AdminUsersQueryDto, {});
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.limit).toBe(ADMIN_PAGINATION.DEFAULT_LIMIT);
      expect(dto.offset).toBe(ADMIN_PAGINATION.DEFAULT_OFFSET);
      expect(dto.search).toBeUndefined();
      expect(dto.role).toBeUndefined();
    });

    it('should accept valid limit, offset, search, and role parameters', async () => {
      const input = {
        limit: '50',
        offset: '10',
        search: '  Berk  ',
        role: Role.admin,
      };

      const dto = plainToInstance(AdminUsersQueryDto, input);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.limit).toBe(50);
      expect(dto.offset).toBe(10);
      expect(dto.search).toBe('Berk');
      expect(dto.role).toBe(Role.admin);
    });

    it('should fail validation when limit is less than 1 or greater than MAX_LIMIT', async () => {
      const dtoTooSmall = plainToInstance(AdminUsersQueryDto, { limit: 0 });
      const errorsSmall = await validate(dtoTooSmall);
      expect(errorsSmall.some((e) => e.property === 'limit')).toBe(true);

      const dtoTooBig = plainToInstance(AdminUsersQueryDto, {
        limit: ADMIN_PAGINATION.MAX_LIMIT + 1,
      });
      const errorsBig = await validate(dtoTooBig);
      expect(errorsBig.some((e) => e.property === 'limit')).toBe(true);
    });

    it('should fail validation when offset is negative', async () => {
      const dto = plainToInstance(AdminUsersQueryDto, { offset: -5 });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'offset')).toBe(true);
    });

    it('should fail validation when an invalid role value is provided', async () => {
      const dto = plainToInstance(AdminUsersQueryDto, {
        role: 'superadmin',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'role')).toBe(true);
    });
  });

  describe('UpdateUserRoleDto', () => {
    it('should successfully validate Role.admin and Role.customer', async () => {
      const dtoAdmin = plainToInstance(UpdateUserRoleDto, {
        role: Role.admin,
      });
      expect(await validate(dtoAdmin)).toHaveLength(0);

      const dtoCustomer = plainToInstance(UpdateUserRoleDto, {
        role: Role.customer,
      });
      expect(await validate(dtoCustomer)).toHaveLength(0);
    });

    it('should fail validation when role is missing or invalid', async () => {
      const dtoEmpty = plainToInstance(UpdateUserRoleDto, {});
      const errorsEmpty = await validate(dtoEmpty);
      expect(errorsEmpty.some((e) => e.property === 'role')).toBe(true);

      const dtoInvalid = plainToInstance(UpdateUserRoleDto, {
        role: 'invalid_role',
      });
      const errorsInvalid = await validate(dtoInvalid);
      expect(errorsInvalid.some((e) => e.property === 'role')).toBe(true);
    });
  });
});

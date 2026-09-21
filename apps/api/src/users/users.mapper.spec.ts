import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersMapper } from './users.mapper';

describe('UsersMapper & DTO Validation Suite', () => {
  describe('UsersMapper.toAccountProfile', () => {
    it('should completely map database user to snake_case AccountProfile format', () => {
      const mockDbUser = {
        id: 'user-uuid-1',
        email: 'user@example.com',
        firstName: 'Ali',
        lastName: 'Kaya',
        phoneNumber: '+905551112233',
        passwordHash: '$2b$10$hashedpassword',
        role: 'customer' as const,
      };

      const result = UsersMapper.toAccountProfile(mockDbUser);

      expect(result).toEqual({
        id: 'user-uuid-1',
        email: 'user@example.com',
        first_name: 'Ali',
        last_name: 'Kaya',
        phone_number: '+905551112233',
      });
      expect('passwordHash' in result).toBe(false);
      expect('role' in result).toBe(false);
    });

    it('should return phone_number field as null when phone number is null', () => {
      const mockDbUser = {
        id: 'user-uuid-2',
        email: 'user2@example.com',
        firstName: 'Zeynep',
        lastName: 'Demir',
        phoneNumber: null,
      };

      const result = UsersMapper.toAccountProfile(mockDbUser);

      expect(result.phone_number).toBeNull();
    });
  });

  describe('UsersMapper.toPrismaUpdateInput', () => {
    it('should correctly map to Prisma format when all fields are defined', () => {
      const dto: UpdateProfileDto = {
        first_name: 'Mehmet',
        last_name: 'Öztürk',
        phone_number: '+905559998877',
      };

      const updateInput = UsersMapper.toPrismaUpdateInput(dto);

      expect(updateInput).toEqual({
        firstName: 'Mehmet',
        lastName: 'Öztürk',
        phoneNumber: '+905559998877',
      });
    });

    it('should only map provided fields when partial fields are passed', () => {
      const dto: UpdateProfileDto = {
        first_name: 'Can',
      };

      const updateInput = UsersMapper.toPrismaUpdateInput(dto);

      expect(updateInput).toEqual({
        firstName: 'Can',
      });
      expect(updateInput.lastName).toBeUndefined();
      expect(updateInput.phoneNumber).toBeUndefined();
    });

    it('should return empty object when an empty DTO is passed', () => {
      const dto: UpdateProfileDto = {};

      const updateInput = UsersMapper.toPrismaUpdateInput(dto);

      expect(updateInput).toEqual({});
    });
  });

  describe('UpdateProfileDto Validation & Transform', () => {
    it('should successfully validate and trim valid update data', async () => {
      const raw = {
        first_name: '  Emre  ',
        last_name: '  Aydın  ',
        phone_number: '  +90 555 123 4567  ',
      };

      const dto = plainToInstance(UpdateProfileDto, raw);
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
      expect(dto.first_name).toBe('Emre');
      expect(dto.last_name).toBe('Aydın');
      expect(dto.phone_number).toBe('+90 555 123 4567');
    });

    it('should fail validation when first_name is shorter than 2 characters', async () => {
      const raw = { first_name: 'A' };
      const dto = plainToInstance(UpdateProfileDto, raw);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('first_name');
    });

    it('should fail validation when last_name exceeds 100 characters', async () => {
      const raw = { last_name: 'a'.repeat(101) };
      const dto = plainToInstance(UpdateProfileDto, raw);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('last_name');
    });

    it('should fail validation when phone_number has invalid characters', async () => {
      const raw = { phone_number: 'abc123invalid' };
      const dto = plainToInstance(UpdateProfileDto, raw);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('phone_number');
    });
  });
});

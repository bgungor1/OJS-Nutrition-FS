import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersMapper } from './users.mapper';

describe('UsersMapper & DTO Validation Suite', () => {
  describe('UsersMapper.toAccountProfile', () => {
    it('veritabanı kullanıcısını snake_case AccountProfile formatına eksiksiz dönüştürmeli', () => {
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

    it('telefon numarası null olduğunda phone_number alanını null olarak döndürmeli', () => {
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
    it('tüm alanlar tanımlı olduğunda Prisma formatına doğru eşleme yapmalı', () => {
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

    it('yalnızca kısmi alanlar gönderildiğinde sadece o alanları eşlemeli', () => {
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

    it('boş bir DTO verildiğinde boş nesne üretmeli', () => {
      const dto: UpdateProfileDto = {};

      const updateInput = UsersMapper.toPrismaUpdateInput(dto);

      expect(updateInput).toEqual({});
    });
  });

  describe('UpdateProfileDto Validation & Transform', () => {
    it('geçerli bir güncelleme verisi başarıyla doğrulanmalı ve trim edilmeli', async () => {
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

    it('ad 2 karakterden kısa olduğunda hata vermeli', async () => {
      const raw = { first_name: 'A' };
      const dto = plainToInstance(UpdateProfileDto, raw);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('first_name');
    });

    it('soyad 100 karakteri aştığında hata vermeli', async () => {
      const raw = { last_name: 'a'.repeat(101) };
      const dto = plainToInstance(UpdateProfileDto, raw);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('last_name');
    });

    it('telefon numarasında geçersiz karakterler varsa hata vermeli', async () => {
      const raw = { phone_number: 'abc123invalid' };
      const dto = plainToInstance(UpdateProfileDto, raw);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('phone_number');
    });
  });
});

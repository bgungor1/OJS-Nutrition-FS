import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateContactDto } from './create-contact.dto';
import { ContactQueryDto } from './contact-query.dto';
import { UpdateContactDto } from './update-contact.dto';
import { CONTACT_PAGINATION } from '../contact.constants';

describe('Contact DTO Validation', () => {
  describe('CreateContactDto', () => {
    it('should pass validation with valid input', async () => {
      const input = {
        name: '  Ahmet Yılmaz  ',
        email: '  AHMET.YILMAZ@EXAMPLE.COM  ',
        message: '  Siparişim hakkında bilgi almak istiyorum, teşekkürler.  ',
      };

      const dto = plainToInstance(CreateContactDto, input);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.name).toBe('Ahmet Yılmaz');
      expect(dto.email).toBe('ahmet.yilmaz@example.com');
      expect(dto.message).toBe(
        'Siparişim hakkında bilgi almak istiyorum, teşekkürler.',
      );
    });

    it('should fail validation when fields are empty', async () => {
      const input = {
        name: '',
        email: '',
        message: '',
      };

      const dto = plainToInstance(CreateContactDto, input);
      const errors = await validate(dto);

      const properties = errors.map((e) => e.property);
      expect(properties).toContain('name');
      expect(properties).toContain('email');
      expect(properties).toContain('message');
    });

    it('should fail validation when name is shorter than 2 chars', async () => {
      const input = {
        name: 'A',
        email: 'test@example.com',
        message: 'Bu geçerli bir mesaj içeriğidir.',
      };

      const dto = plainToInstance(CreateContactDto, input);
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'name')).toBe(true);
    });

    it('should fail validation when email format is invalid', async () => {
      const input = {
        name: 'Mehmet Demir',
        email: 'invalid-email-address',
        message: 'Bu geçerli bir mesaj içeriğidir.',
      };

      const dto = plainToInstance(CreateContactDto, input);
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'email')).toBe(true);
    });

    it('should fail validation when message is shorter than 10 chars', async () => {
      const input = {
        name: 'Mehmet Demir',
        email: 'mehmet@example.com',
        message: 'Kısa',
      };

      const dto = plainToInstance(CreateContactDto, input);
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'message')).toBe(true);
    });

    it('should fail validation when fields exceed maximum limits', async () => {
      const input = {
        name: 'a'.repeat(101),
        email: `${'a'.repeat(250)}@test.com`,
        message: 'm'.repeat(1001),
      };

      const dto = plainToInstance(CreateContactDto, input);
      const errors = await validate(dto);

      const properties = errors.map((e) => e.property);
      expect(properties).toContain('name');
      expect(properties).toContain('email');
      expect(properties).toContain('message');
    });
  });

  describe('ContactQueryDto', () => {
    it('should pass with empty query (defaults applied in service)', async () => {
      const input = {};

      const dto = plainToInstance(ContactQueryDto, input);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.handled).toBeUndefined();
    });

    it('should correctly transform and validate handled boolean query', async () => {
      const inputTrue = { handled: 'true' };
      const dtoTrue = plainToInstance(ContactQueryDto, inputTrue);
      const errorsTrue = await validate(dtoTrue);
      expect(errorsTrue).toHaveLength(0);
      expect(dtoTrue.handled).toBe(true);

      const inputFalse = { handled: 'false' };
      const dtoFalse = plainToInstance(ContactQueryDto, inputFalse);
      const errorsFalse = await validate(dtoFalse);
      expect(errorsFalse).toHaveLength(0);
      expect(dtoFalse.handled).toBe(false);
    });

    it('should fail when handled is not a boolean string or boolean', async () => {
      const input = { handled: 'not-a-bool' };

      const dto = plainToInstance(ContactQueryDto, input);
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'handled')).toBe(true);
    });

    it('should pass validation with valid pagination parameters', async () => {
      const input = { limit: '10', offset: '20' };

      const dto = plainToInstance(ContactQueryDto, input);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.limit).toBe(10);
      expect(dto.offset).toBe(20);
    });

    it('should fail validation when pagination is out of bounds', async () => {
      const input = {
        limit: CONTACT_PAGINATION.MAX_LIMIT + 1,
        offset: -1,
      };

      const dto = plainToInstance(ContactQueryDto, input);
      const errors = await validate(dto);

      const properties = errors.map((e) => e.property);
      expect(properties).toContain('limit');
      expect(properties).toContain('offset');
    });
  });

  describe('UpdateContactDto', () => {
    it('should pass when handled is true or false', async () => {
      const dto1 = plainToInstance(UpdateContactDto, { handled: true });
      expect(await validate(dto1)).toHaveLength(0);

      const dto2 = plainToInstance(UpdateContactDto, { handled: false });
      expect(await validate(dto2)).toHaveLength(0);
    });

    it('should fail when handled is missing or not a boolean', async () => {
      const dtoMissing = plainToInstance(UpdateContactDto, {});
      expect((await validate(dtoMissing)).length).toBeGreaterThan(0);

      const dtoInvalid = plainToInstance(UpdateContactDto, {
        handled: 'invalid',
      });
      expect((await validate(dtoInvalid)).length).toBeGreaterThan(0);
    });
  });
});

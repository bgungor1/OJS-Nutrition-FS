import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticatedUser } from '../common/types/authenticated-user';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AccountProfile } from './interfaces/account-profile.interface';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: {
    getMyAccount: jest.Mock;
    updateMyAccount: jest.Mock;
  };

  const mockUser: AuthenticatedUser = {
    id: 'user-uuid-1',
    email: 'test@example.com',
    role: 'customer',
  };

  const mockProfile: AccountProfile = {
    id: 'user-uuid-1',
    email: 'test@example.com',
    first_name: 'Berk',
    last_name: 'Güngör',
    phone_number: '+905551112233',
  };

  beforeEach(async () => {
    usersService = {
      getMyAccount: jest.fn(),
      updateMyAccount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMyAccount', () => {
    it('kullanıcı profilini usersService.getMyAccount metodundan alıp dönmeli', async () => {
      usersService.getMyAccount.mockResolvedValue(mockProfile);

      const result = await controller.getMyAccount(mockUser);

      expect(usersService.getMyAccount).toHaveBeenCalledWith('user-uuid-1');
      expect(result).toEqual(mockProfile);
    });
  });

  describe('updateMyAccount', () => {
    it('profil güncelleme isteğini usersService.updateMyAccount metoduna iletmeli', async () => {
      const dto: UpdateProfileDto = {
        first_name: 'Ahmet',
        last_name: 'Yılmaz',
        phone_number: '+905559998877',
      };
      const updatedProfile: AccountProfile = {
        ...mockProfile,
        first_name: 'Ahmet',
        last_name: 'Yılmaz',
        phone_number: '+905559998877',
      };
      usersService.updateMyAccount.mockResolvedValue(updatedProfile);

      const result = await controller.updateMyAccount(mockUser, dto);

      expect(usersService.updateMyAccount).toHaveBeenCalledWith(
        'user-uuid-1',
        dto,
      );
      expect(result).toEqual(updatedProfile);
    });
  });
});

import { ApiProperty } from '@nestjs/swagger';

export interface AccountProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
}

export class AccountProfileDto implements AccountProfile {
  @ApiProperty({
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    description: 'Kullanıcının benzersiz kimliği (UUID)',
  })
  id!: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Kullanıcının e-posta adresi (salt-okunur)',
  })
  email!: string;

  @ApiProperty({
    example: 'Ahmet',
    description: 'Kullanıcının adı',
  })
  first_name!: string;

  @ApiProperty({
    example: 'Yılmaz',
    description: 'Kullanıcının soyadı',
  })
  last_name!: string;

  @ApiProperty({
    example: '+905551234567',
    nullable: true,
    description: 'Kullanıcının telefon numarası',
  })
  phone_number!: string | null;
}

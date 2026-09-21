import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma';
import { ContactAdminController } from './contact-admin.controller';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';

@Module({
  imports: [PrismaModule],
  controllers: [ContactController, ContactAdminController],
  providers: [ContactService],
  exports: [ContactService],
})
export class ContactModule {}

import { ContactMessage } from '@prisma/client';
import { ContactListResponse, ContactMessageResponse } from './interfaces';

export class ContactMapper {
  static toContactMessageResponse(
    entity: ContactMessage,
  ): ContactMessageResponse {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.email,
      message: entity.message,
      handled: entity.handled,
      created_at:
        entity.createdAt instanceof Date
          ? entity.createdAt.toISOString()
          : new Date(entity.createdAt).toISOString(),
    };
  }

  static toContactMessageList(
    entities: ContactMessage[],
  ): ContactMessageResponse[] {
    return entities.map((entity) => this.toContactMessageResponse(entity));
  }

  static toContactListResponse(
    count: number,
    entities: ContactMessage[],
  ): ContactListResponse {
    return {
      count,
      results: this.toContactMessageList(entities),
    };
  }
}

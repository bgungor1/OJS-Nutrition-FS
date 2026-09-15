import { ContactMessage } from '@prisma/client';
import { ContactMapper } from './contact.mapper';

describe('ContactMapper', () => {
  const mockDate = new Date('2026-09-15T12:00:00.000Z');

  const mockContactMessage: ContactMessage = {
    id: 'f93d3950-e14b-4b2e-a579-30ec6071efc5',
    name: 'Ahmet Yılmaz',
    email: 'ahmet.yilmaz@example.com',
    message: 'Kargo durumu hakkında bilgi almak istiyorum.',
    handled: false,
    createdAt: mockDate,
  };

  describe('toContactMessageResponse', () => {
    it('should map ContactMessage entity to ContactMessageResponse correctly', () => {
      const result = ContactMapper.toContactMessageResponse(mockContactMessage);

      expect(result).toEqual({
        id: 'f93d3950-e14b-4b2e-a579-30ec6071efc5',
        name: 'Ahmet Yılmaz',
        email: 'ahmet.yilmaz@example.com',
        message: 'Kargo durumu hakkında bilgi almak istiyorum.',
        handled: false,
        created_at: '2026-09-15T12:00:00.000Z',
      });
    });

    it('should handle string date inputs gracefully', () => {
      const messageWithStringDate = {
        ...mockContactMessage,
        createdAt: '2026-09-15T12:00:00.000Z' as unknown as Date,
      };

      const result = ContactMapper.toContactMessageResponse(
        messageWithStringDate,
      );

      expect(result.created_at).toBe('2026-09-15T12:00:00.000Z');
    });
  });

  describe('toContactMessageList', () => {
    it('should map an array of ContactMessage entities', () => {
      const entities = [
        mockContactMessage,
        {
          ...mockContactMessage,
          id: '123e4567-e89b-12d3-a456-426614174000',
          handled: true,
        },
      ];

      const results = ContactMapper.toContactMessageList(entities);

      expect(results).toHaveLength(2);
      expect(results[0].id).toBe(mockContactMessage.id);
      expect(results[1].id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(results[1].handled).toBe(true);
    });

    it('should return empty array for empty entity list', () => {
      expect(ContactMapper.toContactMessageList([])).toEqual([]);
    });
  });

  describe('toContactListResponse', () => {
    it('should wrap count and results into ContactListResponse', () => {
      const response = ContactMapper.toContactListResponse(1, [
        mockContactMessage,
      ]);

      expect(response).toEqual({
        count: 1,
        results: [ContactMapper.toContactMessageResponse(mockContactMessage)],
      });
    });
  });
});

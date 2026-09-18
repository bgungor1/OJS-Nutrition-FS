import { AuthProvider, Role } from '@prisma/client';
import { AdminMapper, UserWithCountRelation } from './admin.mapper';

describe('AdminMapper (Facade)', () => {
  const mockUser: UserWithCountRelation = {
    id: 'user-uuid-1',
    email: 'user@example.com',
    passwordHash: '$2b$10$hashed',
    authProvider: AuthProvider.local,
    googleId: null,
    role: Role.customer,
    firstName: 'Zeynep',
    lastName: 'Kaya',
    phoneNumber: '05559876543',
    createdAt: new Date('2026-03-01T12:00:00.000Z'),
    updatedAt: new Date('2026-03-02T12:00:00.000Z'),
    _count: {
      orders: 3,
      addresses: 2,
    },
  };

  it('should forward toUserListItem through the facade', () => {
    const result = AdminMapper.toUserListItem(mockUser, 500);
    expect(result.id).toBe(mockUser.id);
    expect(result.totalSpent).toBe(500);
  });

  it('should forward toDashboardSummary through the facade', () => {
    const summary = AdminMapper.toDashboardSummary(10, 5000, 20, 5);
    expect(summary.totalOrders).toBe(10);
    expect(summary.totalRevenue).toBe(5000);
  });
});

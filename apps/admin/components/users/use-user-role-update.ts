import * as React from 'react';
import type { Role } from '@/types';

interface UseUserRoleUpdateOptions {
  userId: string;
  currentUserId: string;
  initialRole: Role;
  onUpdate: (userId: string, role: Role) => Promise<void>;
  onSuccess?: () => void;
}

export function useUserRoleUpdate({
  userId,
  currentUserId,
  initialRole,
  onUpdate,
  onSuccess,
}: UseUserRoleUpdateOptions) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [role, setRole] = React.useState<Role>(initialRole);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setRole(initialRole);
  }, [initialRole]);

  const isSelfLockout = userId === currentUserId && role === 'customer';

  const isEscalation = role === 'admin' && initialRole !== 'admin';

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setRole(initialRole);
      setError(null);
    }
    setIsOpen(open);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role === initialRole) {
      setIsOpen(false);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onUpdate(userId, role);
      setIsOpen(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rol güncellenirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isOpen,
    role,
    isSubmitting,
    error,
    isSelfLockout,
    isEscalation,
    setRole,
    handleOpenChange,
    handleSubmit,
  };
}

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useOrderStatusUpdate } from './use-order-status-update';

describe('useOrderStatusUpdate', () => {
  it('initializes with given status and closed state', () => {
    const { result } = renderHook(() =>
      useOrderStatusUpdate({
        orderId: 'ord-1',
        initialStatus: 'processing',
        onUpdate: vi.fn(),
      }),
    );

    expect(result.current.isOpen).toBe(false);
    expect(result.current.status).toBe('processing');
    expect(result.current.isStockRestore).toBe(false);
  });

  it('detects stock restoration for cancelled and refunded statuses', () => {
    const { result } = renderHook(() =>
      useOrderStatusUpdate({
        orderId: 'ord-1',
        initialStatus: 'processing',
        onUpdate: vi.fn(),
      }),
    );

    act(() => {
      result.current.setStatus('cancelled');
    });
    expect(result.current.isStockRestore).toBe(true);

    act(() => {
      result.current.setStatus('refunded');
    });
    expect(result.current.isStockRestore).toBe(true);

    act(() => {
      result.current.setStatus('delivered');
    });
    expect(result.current.isStockRestore).toBe(false);
  });

  it('invokes onUpdate callback on form submit', async () => {
    const mockOnUpdate = vi.fn().mockResolvedValue(undefined);
    const mockOnSuccess = vi.fn();

    const { result } = renderHook(() =>
      useOrderStatusUpdate({
        orderId: 'ord-1',
        initialStatus: 'processing',
        onUpdate: mockOnUpdate,
        onSuccess: mockOnSuccess,
      }),
    );

    act(() => {
      result.current.handleOpenChange(true);
      result.current.setStatus('shipped');
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(mockOnUpdate).toHaveBeenCalledWith('ord-1', 'shipped');
    expect(mockOnSuccess).toHaveBeenCalled();
    expect(result.current.isOpen).toBe(false);
  });
});

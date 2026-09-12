import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { Button } from './button';

describe('Button component', () => {
  it('renders with children and default classes', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });

    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary');
    expect(button).toHaveClass('h-9');
  });

  it('renders all variant classes correctly', () => {
    const { rerender } = render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-destructive');

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button')).toHaveClass('border');

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-secondary');

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole('button')).toHaveClass('hover:bg-accent');

    rerender(<Button variant="link">Link</Button>);
    expect(screen.getByRole('button')).toHaveClass('underline-offset-4');
  });

  it('renders all size classes correctly', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-8');

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-10');

    rerender(<Button size="icon">Icon</Button>);
    expect(screen.getByRole('button')).toHaveClass('size-9');
  });

  it('disables button and prevents click events when disabled', async () => {
    const handleClick = vi.fn();
    const { user } = render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>,
    );

    const button = screen.getByRole('button', { name: /disabled/i });
    expect(button).toBeDisabled();

    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('triggers onClick handler when clicked by user', async () => {
    const handleClick = vi.fn();
    const { user } = render(<Button onClick={handleClick}>Active</Button>);

    await user.click(screen.getByRole('button', { name: /active/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders as a custom child element when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/login">Navigate</a>
      </Button>,
    );

    const link = screen.getByRole('link', { name: /navigate/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/login');
    expect(link).toHaveClass('bg-primary');
  });
});

import * as React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

interface AllTheProvidersProps {
  children: React.ReactNode;
}

function AllTheProviders({ children }: AllTheProvidersProps) {
  return <React.Fragment>{children}</React.Fragment>;
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  wrapper?: React.ComponentType<{ children: React.ReactNode }>;
}

function customRender(
  ui: React.ReactElement,
  options?: CustomRenderOptions,
) {
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: options?.wrapper ?? AllTheProviders, ...options }),
  };
}

export * from '@testing-library/react';
export { userEvent };
export { customRender as render };

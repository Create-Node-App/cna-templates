import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Button } from './Button';

describe('Button', () => {
  it('renders the default label', () => {
    render(<Button />);

    expect(screen.getByRole('button', { name: 'Boop' })).toBeInTheDocument();
  });
});

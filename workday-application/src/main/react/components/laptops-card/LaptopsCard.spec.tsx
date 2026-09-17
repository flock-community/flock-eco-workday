import { cleanup, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import dayjs from 'dayjs';
import type { Laptop } from '../../clients/LaptopClient';
import { LaptopsCard } from './LaptopsCard';

const laptop = (overrides: Partial<Laptop> = {}): Laptop => ({
  id: 1,
  code: 'laptop-1',
  name: 'MacBook Pro 16 (2023)',
  serialNumber: 'C02XK1ABCD01',
  contractSigned: true,
  purchaseDate: dayjs('2023-11-14'),
  person: null,
  ...overrides,
});

describe('LaptopsCard', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows a loader while the laptops are being loaded', () => {
    render(<LaptopsCard items={undefined} />);

    expect(screen.getByTestId('laptops-card')).toBeInTheDocument();
    expect(screen.getByText('Laptops')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryAllByTestId('table-row-laptop')).toHaveLength(0);
  });

  it('tells the person that no laptop is assigned to them', () => {
    render(<LaptopsCard items={[]} />);

    expect(screen.getByTestId('laptops-empty')).toHaveTextContent(
      'No laptop assigned to you.',
    );
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.queryAllByTestId('table-row-laptop')).toHaveLength(0);
  });

  it('lists each laptop with its serial number and whether the contract is signed', () => {
    render(
      <LaptopsCard
        items={[
          laptop(),
          laptop({
            id: 2,
            code: 'laptop-2',
            name: 'ThinkPad X1 Carbon',
            serialNumber: 'PF3ABCD03',
            contractSigned: false,
            purchaseDate: null,
          }),
        ]}
      />,
    );

    const rows = screen.getAllByTestId('table-row-laptop');
    expect(rows).toHaveLength(2);

    expect(
      within(rows[0]).getByText('MacBook Pro 16 (2023)'),
    ).toBeInTheDocument();
    expect(within(rows[0]).getByText('C02XK1ABCD01')).toBeInTheDocument();
    expect(within(rows[0]).getByText('Signed')).toBeInTheDocument();
    expect(within(rows[0]).queryByText('Not signed')).not.toBeInTheDocument();

    expect(within(rows[1]).getByText('ThinkPad X1 Carbon')).toBeInTheDocument();
    expect(within(rows[1]).getByText('PF3ABCD03')).toBeInTheDocument();
    expect(within(rows[1]).getByText('Not signed')).toBeInTheDocument();

    expect(screen.queryByTestId('laptops-empty')).not.toBeInTheDocument();
  });
});

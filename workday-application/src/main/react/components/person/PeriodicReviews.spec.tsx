import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import dayjs from 'dayjs';
import PeriodicReviews from './PeriodicReviews';

describe('PeriodicReviews', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows who never had a review and marks planned and overdue reviews', () => {
    render(
      <PeriodicReviews
        withinNWeeks={6}
        showAll
        onShowAllChange={() => {}}
        periodicReviews={[
          { personUuid: '1', personName: 'Never Reviewed' },
          {
            personUuid: '2',
            personName: 'Long Ago',
            lastReview: dayjs('2020-01-01'),
            dueDate: dayjs('2020-07-01'),
          },
          {
            personUuid: '3',
            personName: 'Planned Soon',
            lastReview: dayjs().add(1, 'week'),
            dueDate: dayjs().add(1, 'week').add(6, 'months'),
          },
        ]}
      />,
    );

    const cells = (name: string) =>
      Array.from(
        screen.getByText(name).closest('tr')?.querySelectorAll('td') ?? [],
      ).map((cell) => cell.textContent);

    expect(screen.getByText('Periodic reviews')).toBeInTheDocument();
    expect(cells('Never Reviewed')).toEqual(['Never Reviewed', 'Never', '-']);
    expect(cells('Long Ago')).toEqual([
      'Long Ago',
      '01-01-2020',
      '01-07-2020 (overdue)',
    ]);
    expect(cells('Planned Soon')[1]).toMatch(/\(planned\)$/);
  });

  it('switches between the reviews to plan and all internal engineers', () => {
    const onShowAllChange = jest.fn();
    render(
      <PeriodicReviews
        withinNWeeks={6}
        showAll={false}
        onShowAllChange={onShowAllChange}
        periodicReviews={[]}
      />,
    );

    expect(screen.getByText('Periodic reviews to plan')).toBeInTheDocument();
    expect(
      screen.getByText('No periodic reviews to plan within 6 weeks'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('All internal engineers'));

    expect(onShowAllChange).toHaveBeenCalledWith(true);
  });
});

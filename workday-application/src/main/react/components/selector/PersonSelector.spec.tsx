import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { type Person, PersonClient } from '../../clients/PersonClient';
import { PersonSelector } from './PersonSelector';

jest.mock('../../clients/PersonClient', () => ({
  PersonClient: { findAllByPage: jest.fn() },
}));

const person = (overrides: Partial<Person>): Person =>
  ({
    uuid: 'ernie',
    firstname: 'Ernie',
    lastname: 'Muppets',
    active: true,
    ...overrides,
  }) as Person;

const persons = [
  person({}),
  person({
    uuid: 'oscar',
    firstname: 'Oscar',
    lastname: 'Grouch',
    active: false,
  }),
];

const openOptions = () =>
  fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' });

const optionNames = () =>
  screen.getAllByRole('option').map((it) => it.textContent);

describe('PersonSelector', () => {
  beforeEach(() => {
    jest
      .mocked(PersonClient.findAllByPage)
      .mockResolvedValue({ list: persons, count: persons.length });
  });

  afterEach(() => {
    cleanup();
  });

  it('only offers active persons by default', async () => {
    render(<PersonSelector onChange={jest.fn()} embedded />);

    await screen.findByRole('button', { name: 'Show inactive persons' });
    openOptions();

    expect(optionNames()).toEqual(['Ernie Muppets']);
  });

  it('offers inactive persons after clicking show inactive persons', async () => {
    render(<PersonSelector onChange={jest.fn()} embedded />);

    fireEvent.click(
      await screen.findByRole('button', { name: 'Show inactive persons' }),
    );
    openOptions();

    expect(optionNames()).toEqual(['Ernie Muppets', 'Oscar Grouchinactive']);

    fireEvent.click(
      screen.getByRole('button', { name: 'Hide inactive persons' }),
    );

    expect(optionNames()).toEqual(['Ernie Muppets']);
  });

  it('keeps showing a selected inactive person while inactive persons are hidden', async () => {
    render(<PersonSelector value="oscar" onChange={jest.fn()} embedded />);

    await screen.findByRole('button', { name: 'Show inactive persons' });

    expect(screen.getByRole('combobox')).toHaveValue('Oscar Grouch');
  });

  it('offers inactive persons in the multiple selector after clicking show inactive persons', async () => {
    render(<PersonSelector onChange={jest.fn()} embedded multiple />);

    fireEvent.click(
      await screen.findByRole('button', { name: 'Show inactive persons' }),
    );
    fireEvent.mouseDown(screen.getByRole('combobox'));

    const listbox = within(screen.getByRole('listbox'));
    expect(listbox.getAllByRole('option').map((it) => it.textContent)).toEqual([
      'Ernie Muppets',
      'Oscar Grouchinactive',
    ]);
  });
});

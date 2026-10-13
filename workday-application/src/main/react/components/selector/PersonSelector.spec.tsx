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

const openOptions = async () =>
  fireEvent.keyDown(await screen.findByRole('combobox'), { key: 'ArrowDown' });

const optionNames = () =>
  within(screen.getByRole('listbox'))
    .getAllByRole('option')
    .map((it) => it.textContent);

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

    await openOptions();

    expect(optionNames()).toEqual(['Ernie Muppets']);
  });

  it('shows the inactive persons toggle inside the dropdown', async () => {
    render(<PersonSelector onChange={jest.fn()} embedded />);

    await screen.findByRole('combobox');
    expect(
      screen.queryByRole('button', { name: 'Show inactive persons' }),
    ).not.toBeInTheDocument();

    await openOptions();

    expect(
      within(screen.getByRole('presentation')).getByRole('button', {
        name: 'Show inactive persons',
      }),
    ).toBeInTheDocument();
  });

  it('offers inactive persons after clicking show inactive persons', async () => {
    render(<PersonSelector onChange={jest.fn()} embedded />);

    await openOptions();
    fireEvent.click(
      screen.getByRole('button', { name: 'Show inactive persons' }),
    );

    expect(optionNames()).toEqual(['Ernie Muppets', 'Oscar Grouchinactive']);

    fireEvent.click(
      screen.getByRole('button', { name: 'Hide inactive persons' }),
    );

    expect(optionNames()).toEqual(['Ernie Muppets']);
  });

  it('keeps the focus in the input when pressing the toggle, so the dropdown stays open', async () => {
    render(<PersonSelector onChange={jest.fn()} embedded />);

    await openOptions();
    const toggle = screen.getByRole('button', {
      name: 'Show inactive persons',
    });

    // fireEvent returns false when the default action was prevented
    expect(fireEvent.mouseDown(toggle)).toBe(false);
  });

  it('keeps showing a selected inactive person while inactive persons are hidden', async () => {
    render(<PersonSelector value="oscar" onChange={jest.fn()} embedded />);

    expect(await screen.findByRole('combobox')).toHaveValue('Oscar Grouch');
  });

  it('offers inactive persons in the multiple selector after clicking show inactive persons', async () => {
    const onChange = jest.fn();
    render(<PersonSelector onChange={onChange} embedded multiple />);

    fireEvent.mouseDown(await screen.findByRole('combobox'));
    expect(optionNames()).toEqual(['Ernie Muppets']);

    fireEvent.click(
      screen.getByRole('button', { name: 'Show inactive persons' }),
    );

    expect(optionNames()).toEqual(['Ernie Muppets', 'Oscar Grouchinactive']);
    expect(onChange).not.toHaveBeenCalled();
  });
});

import { cleanup, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { Cv } from '../../clients/CvClient';
import { CvDocument } from './CvDocument';

const cv = (overrides: Partial<Cv> = {}): Cv =>
  ({
    code: 'cv-1',
    language: 'NL',
    place: 'Hilversum',
    phone: '0612345678',
    summary: 'Tommy is een engineer.\n\nHij bouwt graag dingen.',
    updatedAt: '2025-04-01T10:00:00Z',
    person: {
      fullName: 'Tommy Dog',
      email: 'tommy@sesam.straat',
      birthdate: '1980-05-08',
    },
    experiences: [
      {
        from: '2022-12',
        to: '2024-07',
        role: 'Software Engineer',
        client: 'ING',
        employer: 'Flock',
        technologies: ['Kotlin', 'Typescript'],
        description:
          'Werkte aan Baker.\n\nBaker Github: https://ing-bank.github.io/baker/',
      },
      {
        from: '2007-01',
        to: '2012-12',
        role: 'Java engineer',
        client: 'Information Makers',
        employer: undefined,
        technologies: [],
        description: undefined,
      },
    ],
    skills: [
      { category: 'Programming', name: 'Kotlin', level: 5 },
      { category: 'Tools', name: 'Git', level: 4 },
      { category: 'Programming', name: 'Java', level: 3 },
    ],
    education: 'Master, Rotterdam (2012)',
    languages: 'Nederlands – moedertaal\nEngels – uitstekend',
    ...overrides,
  }) as Cv;

describe('CvDocument', () => {
  beforeEach(() => {
    // The shared logos
    const logos = [
      {
        id: 'logo-ing',
        name: 'ING',
        contentType: 'image/svg+xml',
        updatedAt: '2025-01-01T00:00:00Z',
      },
    ];
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        headers: new Map(),
        json: () => Promise.resolve(logos),
      }),
    ) as jest.Mock;
  });

  afterEach(() => {
    cleanup();
  });

  it('shows the logo of an assignment next to it', async () => {
    render(
      <CvDocument
        cv={cv({
          experiences: [
            {
              from: '2022-12',
              to: '2024-07',
              role: 'Software Engineer',
              client: 'ING',
              employer: 'Flock',
              technologies: ['Kotlin'],
              description: 'Werkte aan Baker.',
              logoId: 'logo-ing',
            },
          ],
        })}
      />,
    );

    expect(
      await screen.findByRole('img', { name: 'Logo ING' }),
    ).toHaveAttribute(
      'src',
      '/api/logos/logo-ing/image?v=2025-01-01T00%3A00%3A00Z',
    );
  });

  it('shows the photo in the header when the CV has one', () => {
    render(
      <CvDocument
        cv={cv({
          person: {
            fullName: 'Tommy Dog',
            email: 'tommy@sesam.straat',
            birthdate: '1980-05-08',
            photo: 'data:image/png;base64,abc',
          } as Cv['person'],
        })}
      />,
    );

    expect(screen.getByRole('img', { name: 'Tommy Dog' })).toHaveAttribute(
      'src',
      'data:image/png;base64,abc',
    );
  });

  it('shows no photo when the CV has none', () => {
    render(<CvDocument cv={cv()} />);

    expect(
      screen.queryByRole('img', { name: 'Tommy Dog' }),
    ).not.toBeInTheDocument();
  });

  it('shows the personal details with the labels of the CV language', () => {
    render(<CvDocument cv={cv()} />);

    expect(
      screen.getByRole('heading', { name: 'Curriculum Vitae - Tommy Dog' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Woonplaats')).toBeInTheDocument();
    expect(screen.getByText('Hilversum')).toBeInTheDocument();
    expect(screen.getByText('tommy@sesam.straat')).toBeInTheDocument();
    expect(screen.getByText('08-05-1980')).toBeInTheDocument();
    expect(screen.getByText('Tommy is een engineer.')).toBeInTheDocument();
    expect(screen.getByText('Hij bouwt graag dingen.')).toBeInTheDocument();
  });

  it('lists every experience in the overview with the months worked', () => {
    render(<CvDocument cv={cv()} />);

    const [table] = screen.getAllByRole('table');
    const rows = within(table).getAllByRole('row');
    expect(rows[0]).toHaveTextContent('PeriodeFunctieMaandenOpdrachtgever');
    expect(rows[1]).toHaveTextContent(
      '12-2022 - 07-2024Software Engineer20ING (via Flock)',
    );
    expect(rows[2]).toHaveTextContent(
      '01-2007 - 12-2012Java engineer72Information Makers',
    );
  });

  it('writes up only the experiences that have something to tell, with clickable links', () => {
    render(<CvDocument cv={cv()} />);

    expect(screen.getByText('Kotlin, Typescript')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'https://ing-bank.github.io/baker/' }),
    ).toHaveAttribute('href', 'https://ing-bank.github.io/baker/');
    // The overview row is the only mention of the job without a description
    expect(screen.getAllByText('Information Makers')).toHaveLength(1);
  });

  it('renders a description written in Markdown, without its raw HTML', () => {
    render(
      <CvDocument
        cv={cv({
          experiences: [
            {
              from: '2022-12',
              to: '2024-07',
              role: 'Software Engineer',
              client: 'ING',
              employer: 'Flock',
              technologies: [],
              description:
                'Werkte aan **Baker**:\n\n- de API\n- de [docs](https://ing-bank.github.io/baker/)\n\nRegel een\nregel twee <script>alert(1)</script>',
              logoId: undefined,
            },
          ],
        })}
      />,
    );

    expect(screen.getByText('Baker').tagName).toBe('STRONG');
    const items = screen.getAllByRole('listitem');
    expect(items.map((it) => it.textContent)).toEqual(['de API', 'de docs']);
    expect(screen.getByRole('link', { name: 'docs' })).toHaveAttribute(
      'target',
      '_blank',
    );
    const lines = screen.getByText(/Regel een/);
    expect(lines.querySelector('br')).not.toBeNull();
    expect(document.querySelector('script')).toBeNull();
  });

  it('shows the skills per category with their stars, and the other sections', () => {
    render(<CvDocument cv={cv()} />);

    expect(
      screen.getByRole('heading', { name: 'Vaardigheden' }),
    ).toBeInTheDocument();
    const programming = screen
      .getByRole('columnheader', { name: 'Programming' })
      .closest('table') as HTMLElement;
    expect(
      within(programming)
        .getAllByRole('row')
        .map((it) => it.textContent),
    ).toEqual(['Programming', 'Kotlin★★★★★', 'Java★★★']);
    expect(
      within(programming).getByRole('img', { name: '5 of 5' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Opleiding' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Master, Rotterdam (2012)')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Talen' })).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Kennisgebieden' }),
    ).not.toBeInTheDocument();
  });

  it('uses English labels for an English CV and leaves out missing details', () => {
    render(
      <CvDocument
        cv={cv({
          language: 'EN',
          phone: undefined,
          experiences: [],
          skills: [],
        })}
      />,
    );

    expect(screen.getByText('Place')).toBeInTheDocument();
    expect(screen.queryByText('Phone')).not.toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});

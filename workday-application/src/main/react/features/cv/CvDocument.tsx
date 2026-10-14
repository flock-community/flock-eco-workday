import { Box, Link } from '@mui/material';
import dayjs from 'dayjs';
import { Fragment, type ReactNode } from 'react';
import type { Cv } from '../../clients/CvClient';
import { type Logo, LogoClient } from '../../clients/LogoClient';
import { DMY_DATE } from '../../clients/util/DateFormats';
import { FlockDisc } from '../../components/FlockDisc';
import { brand } from '../../theme/tokens';
import type { CvExperience } from '../../wirespec/model';
import { CvMarkdown } from './CvMarkdown';
import {
  CV_LABELS,
  clientText,
  groupSkills,
  linkify,
  longPeriodText,
  monthsWorked,
  paragraphs,
  periodText,
} from './cvText';
import { useLogos } from './logos';

// The CV is a document in the Flock template: it keeps its paper colours in dark
// mode and when printed. Sizes are in points, as in the template.
const paper = '#ffffff';
const ink = '#000000';
const rule = '#9e9e9e';
const muted = '#434343';
const bodyFont = 'Verdana, "DejaVu Sans", Geneva, sans-serif';
const titleFont =
  '"Trebuchet MS", "Lucida Grande", Tahoma, "DejaVu Sans", sans-serif';
const headingFont = 'Arial, Helvetica, "Liberation Sans", sans-serif';
/** The yellow band along the left edge of every page. */
const band = '3mm';
/** The page margins left and right of the text. */
const sideMargin = '25mm';

/**
 * Printed, every page gets the yellow band along its left edge and its number at the
 * bottom right, in the page margins (the CSS paged media margin boxes).
 */
const pageStyles = `
@media print {
  @page {
    size: A4;
    margin: 10mm ${sideMargin} 20mm;
    @bottom-right {
      content: counter(page);
      font: 10pt ${headingFont};
      color: ${ink};
      vertical-align: top;
      padding-top: 6mm;
    }
${[
  'top-left-corner',
  'left-top',
  'left-middle',
  'left-bottom',
  'bottom-left-corner',
]
  .map(
    (box) =>
      `    @${box} { content: ''; background: linear-gradient(to right, ${brand.yellow} ${band}, transparent ${band}); }`,
  )
  .join('\n')}
  }
}
`;

type CvDocumentProps = {
  cv: Cv;
};

/** Paragraphs of text with clickable links; a single line break stays a line break. */
function Text({ value }: { value: string | null | undefined }) {
  return (
    <>
      {paragraphs(value).map((paragraph, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: paragraphs have no identity of their own
        <p key={index}>
          {paragraph.split('\n').map((line, lineIndex) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: lines have no identity of their own
            <Fragment key={lineIndex}>
              {lineIndex > 0 && <br />}
              {linkify(line).map((part, partIndex) =>
                part.href ? (
                  <Link
                    // biome-ignore lint/suspicious/noArrayIndexKey: parts have no identity of their own
                    key={partIndex}
                    href={part.href}
                    target="_blank"
                    rel="noreferrer"
                    sx={{ color: '#1155cc' }}
                  >
                    {part.text}
                  </Link>
                ) : (
                  // biome-ignore lint/suspicious/noArrayIndexKey: parts have no identity of their own
                  <Fragment key={partIndex}>{part.text}</Fragment>
                ),
              )}
            </Fragment>
          ))}
        </p>
      ))}
    </>
  );
}

/**
 * A CV in the Flock template: personal details with the photo, profile, an overview
 * of the working experience, a section per assignment, and the skills, education and
 * languages as lists. Rendered as a sheet on screen; the same markup is what gets
 * printed (or saved as PDF), with the name and the Flock logo on top of every page.
 */
export function CvDocument({ cv }: CvDocumentProps) {
  const language = cv.language ?? 'NL';
  const labels = CV_LABELS[language];
  const name = cv.person?.fullName ?? '';
  const experiences = cv.experiences ?? [];
  const [logos] = useLogos();
  // A logo deleted since shows nothing
  const logoOf = (it: CvExperience) =>
    it.logoId ? logos?.find((logo) => logo.id === it.logoId) : undefined;
  const skills = cv.skills ?? [];
  const birthdate = cv.person?.birthdate
    ? dayjs(cv.person.birthdate).format(DMY_DATE)
    : undefined;

  const details: [string, string | undefined][] = [
    [labels.name, name],
    [labels.place, cv.place ?? undefined],
    [labels.phone, cv.phone ?? undefined],
    [labels.mail, cv.person?.email ?? undefined],
    [labels.birthdate, birthdate],
  ];

  return (
    <Box
      component="article"
      lang={language.toLowerCase()}
      aria-label={`${labels.title} - ${name}`}
      sx={{
        bgcolor: paper,
        color: ink,
        fontFamily: bodyFont,
        fontSize: '9pt',
        lineHeight: 1.5,
        width: '100%',
        maxWidth: '210mm',
        mx: 'auto',
        // The yellow band of the template along the left edge of the sheet
        borderLeft: `${band} solid ${brand.yellow}`,
        pl: { xs: 3, sm: `calc(${sideMargin} - ${band})` },
        pr: { xs: 3, sm: sideMargin },
        pt: { xs: 2, sm: '10mm' },
        pb: { xs: 3, sm: '20mm' },
        boxShadow:
          '0 1px 2px rgba(28,27,20,0.08), 0 8px 28px rgba(28,27,20,0.10)',
        printColorAdjust: 'exact',
        WebkitPrintColorAdjust: 'exact',
        '& p': { m: 0, mb: '1.5em' },
        '@media print': {
          maxWidth: 'none',
          p: 0,
          border: 'none',
          boxShadow: 'none',
          bgcolor: 'transparent',
        },
      }}
    >
      <style>{pageStyles}</style>
      {/*
        A layout table: when printed, the browser repeats its head at the top of every
        page, so each page of the CV starts with the name and the Flock logo.
      */}
      <Box
        component="table"
        role="presentation"
        sx={{
          width: '100%',
          borderCollapse: 'collapse',
          '& > thead > tr > th, & > tbody > tr > td': {
            p: 0,
            textAlign: 'left',
            fontWeight: 'inherit',
            verticalAlign: 'top',
          },
        }}
      >
        <thead>
          <tr>
            <th>
              <Box
                component="header"
                sx={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  gap: 2,
                  borderBottom: `1px solid ${rule}`,
                  pb: '10pt',
                  mb: '18pt',
                }}
              >
                <Box
                  component="h1"
                  sx={{
                    m: 0,
                    fontFamily: titleFont,
                    fontSize: '17pt',
                    fontWeight: 400,
                    lineHeight: 1.2,
                  }}
                >
                  {labels.title} - {name}
                </Box>
                <FlockDisc
                  width="54pt"
                  height="54pt"
                  style={{ flexShrink: 0, marginBottom: '8pt' }}
                />
              </Box>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              {/* Only on the first page, beside the personal details and the profile */}
              {cv.person?.photo && (
                <Box
                  component="img"
                  src={cv.person.photo}
                  alt={name}
                  sx={{
                    float: 'right',
                    width: '32mm',
                    height: '32mm',
                    objectFit: 'cover',
                    mt: '8pt',
                    ml: '12pt',
                    mb: '8pt',
                  }}
                />
              )}
              <Box
                component="dl"
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '144pt 1fr',
                  m: 0,
                  mb: '13.5pt',
                  '& dt, & dd': { m: 0 },
                  '& dd': { overflowWrap: 'anywhere' },
                }}
              >
                {details
                  .filter(([, value]) => value)
                  .map(([label, value]) => (
                    <Fragment key={label}>
                      <dt>{label}:</dt>
                      <dd>{value}</dd>
                    </Fragment>
                  ))}
              </Box>

              {cv.summary && (
                <Box
                  component="section"
                  sx={{ fontStyle: 'italic', textAlign: 'justify' }}
                >
                  <Text value={cv.summary} />
                </Box>
              )}

              {experiences.length > 0 && (
                <Box
                  component="section"
                  sx={{
                    clear: 'both',
                    pt: '13.5pt',
                    mb: '27pt',
                    breakInside: 'avoid',
                    // The assignments always start on a page of their own
                    breakAfter: 'page',
                  }}
                >
                  <Box
                    component="h2"
                    sx={{ fontSize: '9pt', fontWeight: 700, m: 0 }}
                  >
                    {labels.workingExperience}
                  </Box>
                  <Box
                    component="table"
                    sx={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      '& th, & td': {
                        border: `1px solid ${ink}`,
                        px: '4.5pt',
                        py: '5pt',
                        textAlign: 'left',
                        verticalAlign: 'top',
                      },
                      '& th': { fontSize: '8pt', fontWeight: 700 },
                    }}
                  >
                    <colgroup>
                      <col style={{ width: '24%' }} />
                      <col style={{ width: '32%' }} />
                      <col style={{ width: '10%' }} />
                      <col style={{ width: '34%' }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>{labels.period}</th>
                        <th>{labels.function}</th>
                        <th>{labels.months}</th>
                        <th>{labels.clientColumn}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {experiences.map((it) => (
                        <tr key={`${it.from}-${it.to}-${it.client}-${it.role}`}>
                          <td>{periodText(it.from, it.to, language)}</td>
                          <td>{it.role}</td>
                          <td>{monthsWorked(it.from, it.to)}</td>
                          <td>{clientText(it.client, it.employer)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Box>
                </Box>
              )}

              {experiences
                .filter(
                  (it) =>
                    it.description || it.technologies?.length || logoOf(it),
                )
                .map((it, index) => (
                  <Box
                    component="section"
                    key={`${it.from}-${it.to}-${it.client}-${it.role}`}
                    sx={{
                      clear: 'both',
                      mb: '13.5pt',
                      // The grey rule of the header between assignments, after a blank line
                      ...(index > 0 && {
                        mt: '27pt',
                        pt: '13.5pt',
                        borderTop: `1px solid ${rule}`,
                      }),
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        mb: '13.5pt',
                        breakInside: 'avoid',
                        breakAfter: 'avoid',
                      }}
                    >
                      <Box
                        component="dl"
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: 'max-content 1fr',
                          columnGap: '4pt',
                          m: 0,
                          lineHeight: 1.35,
                          '& dt': { fontWeight: 700, minWidth: '82pt' },
                          '& dd': { fontStyle: 'italic' },
                          '& dt, & dd': { m: 0 },
                        }}
                      >
                        <dt>{labels.period}:</dt>
                        <dd>{longPeriodText(it.from, it.to, language)}</dd>
                        <dt>{labels.client}:</dt>
                        <dd>{clientText(it.client, it.employer)}</dd>
                        <dt>{labels.role}:</dt>
                        <dd>{it.role}</dd>
                        {it.technologies?.length > 0 && (
                          <>
                            <dt>{labels.technologies}:</dt>
                            <dd>{it.technologies.join(', ')}</dd>
                          </>
                        )}
                      </Box>
                      {logoOf(it) && (
                        <Box
                          component="img"
                          src={LogoClient.imageUrl(logoOf(it) as Logo)}
                          alt={`Logo ${logoOf(it)?.name}`}
                          sx={{
                            maxHeight: '48pt',
                            maxWidth: '90pt',
                            objectFit: 'contain',
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </Box>
                    <CvMarkdown value={it.description} />
                  </Box>
                ))}

              <TextSections label={labels.education} value={cv.education} />
              {groupSkills(skills).map((group) => (
                <Section
                  key={group.category ?? ''}
                  heading={group.category ?? labels.skills}
                >
                  <List>
                    {group.skills.map((skill) => (
                      <Box
                        component="li"
                        key={skill.name}
                        sx={{
                          '& > span:first-of-type': {
                            display: 'inline-block',
                            width: '1.5in',
                          },
                        }}
                      >
                        <span>{skill.name}</span>
                        <Stars level={skill.level} />
                      </Box>
                    ))}
                  </List>
                </Section>
              ))}

              <TextSections label={labels.subjects} value={cv.subjects} />
              <TextSections label={labels.languages} value={cv.languages} />
            </td>
          </tr>
        </tbody>
      </Box>
    </Box>
  );
}

/**
 * A free text section as headed bullet lists. A later block of lines starts with its own
 * heading, like Training below Education.
 */
function TextSections({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return paragraphs(value).map((block, index) => {
    const lines = block.split('\n');
    const [heading, items] =
      index === 0 ? [label, lines] : [lines[0], lines.slice(1)];
    return (
      <Section key={heading} heading={heading}>
        {items.length > 0 && (
          <List>
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </List>
        )}
      </Section>
    );
  });
}

/** A section below the assignments, with its heading in the template's style. */
function Section({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <Box
      component="section"
      sx={{ clear: 'both', mb: '18pt', breakInside: 'avoid' }}
    >
      <Box
        component="h2"
        sx={{
          fontFamily: headingFont,
          fontSize: '13pt',
          fontWeight: 400,
          color: muted,
          m: 0,
          mb: '8pt',
        }}
      >
        {heading}
      </Box>
      {children}
    </Box>
  );
}

/** A bulleted list, indented like in the template. */
function List({ children }: { children: ReactNode }) {
  return (
    <Box
      component="ul"
      sx={{ m: 0, pl: '36pt', '& li': { pl: '4pt' }, listStyle: 'disc' }}
    >
      {children}
    </Box>
  );
}

/** The rating of a skill as asterisks, the way the CV template shows it. */
function Stars({ level }: { level: number | null | undefined }) {
  if (!level) return null;
  return (
    <Box
      component="span"
      role="img"
      aria-label={`${level} of 5`}
      sx={{ letterSpacing: '0.12em' }}
    >
      {'*'.repeat(level)}
    </Box>
  );
}

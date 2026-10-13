import { Box, Link } from '@mui/material';
import dayjs from 'dayjs';
import { Fragment } from 'react';
import type { Cv } from '../../clients/CvClient';
import { type Logo, LogoClient } from '../../clients/LogoClient';
import { DMY_DATE } from '../../clients/util/DateFormats';
import { FlockDisc } from '../../components/FlockDisc';
import { brand } from '../../theme/tokens';
import type { CvExperience } from '../../wirespec/model';
import {
  CV_LABELS,
  clientText,
  groupSkills,
  linkify,
  monthsWorked,
  paragraphs,
  periodText,
} from './cvText';
import { useLogos } from './logos';

// The CV is a document: it keeps its paper colours in dark mode and when printed.
const paper = '#fffdf5';
const ink = brand.ink;
const rule = '#8a877a';

type CvDocumentProps = {
  cv: Cv;
};

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
                    sx={{ color: '#1a56c4' }}
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
 * A CV in the Flock template: personal details, profile, an overview of the working
 * experience and a section per assignment. Rendered as an A4 sheet on screen; the
 * same markup is what gets printed (or saved as PDF).
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
        fontFamily: 'Verdana, "DejaVu Sans", Geneva, sans-serif',
        fontSize: '10pt',
        lineHeight: 1.45,
        width: '100%',
        maxWidth: '210mm',
        mx: 'auto',
        px: { xs: 3, sm: '18mm' },
        py: { xs: 3, sm: '16mm' },
        boxShadow:
          '0 1px 2px rgba(28,27,20,0.08), 0 8px 28px rgba(28,27,20,0.10)',
        borderRadius: '4px',
        '& p': { m: 0, mb: '0.9em' },
        '@media print': {
          maxWidth: 'none',
          p: 0,
          boxShadow: 'none',
          borderRadius: 0,
          bgcolor: 'transparent',
        },
      }}
    >
      <Box
        component="header"
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 2,
          borderBottom: `1px solid ${rule}`,
          pb: 1,
          mb: 3,
        }}
      >
        <Box
          component="h1"
          sx={{
            m: 0,
            fontFamily: 'Tahoma, Verdana, "DejaVu Sans", sans-serif',
            fontSize: '17pt',
            fontWeight: 400,
          }}
        >
          {labels.title} - {name}
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            flexShrink: 0,
          }}
        >
          {cv.person?.photo && (
            <Box
              component="img"
              src={cv.person.photo}
              alt={name}
              sx={{
                width: 64,
                height: 64,
                borderRadius: '4px',
                objectFit: 'cover',
                flexShrink: 0,
              }}
            />
          )}
          <FlockDisc width={56} height={56} style={{ flexShrink: 0 }} />
        </Box>
      </Box>

      <Box
        component="dl"
        sx={{
          display: 'grid',
          gridTemplateColumns: 'max-content 1fr',
          columnGap: 6,
          rowGap: 1,
          m: 0,
          mb: 4,
          '& dt, & dd': { m: 0 },
          '& dd': { overflowWrap: 'anywhere' },
        }}
      >
        {details
          .filter(([, value]) => value)
          .map(([label, value]) => (
            <Fragment key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </Fragment>
          ))}
      </Box>

      {cv.summary && (
        <Box component="section" sx={{ mb: 3, textAlign: 'justify' }}>
          <Text value={cv.summary} />
        </Box>
      )}

      {experiences.length > 0 && (
        <Box component="section" sx={{ mb: 4, breakInside: 'avoid' }}>
          <Box
            component="h2"
            sx={{ fontSize: '10pt', fontWeight: 700, m: 0, mb: 1.5 }}
          >
            {labels.workingExperience}
          </Box>
          <Box
            component="table"
            sx={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '9.5pt',
              '& th, & td': {
                border: `1px solid ${ink}`,
                px: 0.5,
                py: 0,
                textAlign: 'left',
                fontWeight: 400,
                verticalAlign: 'top',
              },
              '& th': {
                bgcolor: brand.yellow,
                printColorAdjust: 'exact',
                WebkitPrintColorAdjust: 'exact',
              },
              '& .months': { textAlign: 'right', width: '4.5em' },
            }}
          >
            <thead>
              <tr>
                <th>{labels.period}</th>
                <th>{labels.function}</th>
                <th className="months">{labels.months}</th>
                <th>{labels.clientColumn}</th>
              </tr>
            </thead>
            <tbody>
              {experiences.map((it) => (
                <tr key={`${it.from}-${it.to}-${it.client}-${it.role}`}>
                  <td>{periodText(it.from, it.to, language)}</td>
                  <td>{it.role}</td>
                  <td className="months">{monthsWorked(it.from, it.to)}</td>
                  <td>{clientText(it.client, it.employer)}</td>
                </tr>
              ))}
            </tbody>
          </Box>
        </Box>
      )}

      {experiences
        .filter((it) => it.description || it.technologies?.length || logoOf(it))
        .map((it) => (
          <Box
            component="section"
            key={`${it.from}-${it.to}-${it.client}-${it.role}`}
            sx={{ mb: 3.5 }}
          >
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                mb: 1.5,
                breakInside: 'avoid',
                breakAfter: 'avoid',
              }}
            >
              <Box
                component="dl"
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(7.5em, max-content) 1fr',
                  columnGap: 1,
                  m: 0,
                  mb: 0,
                  breakInside: 'avoid',
                  breakAfter: 'avoid',
                  '& dt': { fontWeight: 700 },
                  '& dt, & dd': { m: 0 },
                }}
              >
                <dt>{labels.period}</dt>
                <dd>{periodText(it.from, it.to, language)}</dd>
                <dt>{labels.client}</dt>
                <dd>{clientText(it.client, it.employer)}</dd>
                <dt>{labels.role}</dt>
                <dd>{it.role}</dd>
                {it.technologies?.length > 0 && (
                  <>
                    <dt>{labels.technologies}</dt>
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
                    maxHeight: '64px',
                    maxWidth: '150px',
                    objectFit: 'contain',
                    flexShrink: 0,
                  }}
                />
              )}
            </Box>
            <Box sx={{ textAlign: 'justify' }}>
              <Text value={it.description} />
            </Box>
          </Box>
        ))}

      {skills.length > 0 && (
        <Box component="section" sx={{ mb: 3.5 }}>
          <SectionHeading>{labels.skills}</SectionHeading>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2,
              alignItems: 'start',
            }}
          >
            {groupSkills(skills).map((group) => (
              <Box
                component="table"
                key={group.category ?? ''}
                sx={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  breakInside: 'avoid',
                  '& th, & td': {
                    border: `1px solid ${ink}`,
                    px: 0.75,
                    py: 0.25,
                    textAlign: 'left',
                  },
                  '& th': { fontWeight: 700 },
                }}
              >
                {group.category && (
                  <thead>
                    <tr>
                      <th colSpan={2}>{group.category}</th>
                    </tr>
                  </thead>
                )}
                <tbody>
                  {group.skills.map((skill) => (
                    <tr key={skill.name}>
                      <td>{skill.name}</td>
                      <td style={{ width: '6.5em' }}>
                        <Stars level={skill.level} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {(
        [
          [labels.education, cv.education],
          [labels.subjects, cv.subjects],
          [labels.languages, cv.languages],
        ] as const
      )
        .filter(([, value]) => value)
        .map(([label, value]) => (
          <Box
            component="section"
            key={label}
            sx={{ mb: 2.5, breakInside: 'avoid' }}
          >
            <SectionHeading>{label}</SectionHeading>
            <Text value={value} />
          </Box>
        ))}
    </Box>
  );
}

function SectionHeading({ children }: { children: string }) {
  return (
    <Box component="h2" sx={{ fontSize: '10pt', fontWeight: 700, m: 0, mb: 1 }}>
      {children}
    </Box>
  );
}

/** The rating of a skill as stars, the way the CV template shows it. */
function Stars({ level }: { level: number | null | undefined }) {
  if (!level) return null;
  return (
    <Box
      component="span"
      role="img"
      aria-label={`${level} of 5`}
      sx={{
        color: brand.yellowDark,
        letterSpacing: '0.1em',
        printColorAdjust: 'exact',
        WebkitPrintColorAdjust: 'exact',
      }}
    >
      {'★'.repeat(level)}
    </Box>
  );
}

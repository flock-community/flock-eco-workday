import { Box, Link } from '@mui/material';
import Markdown from 'markdown-to-jsx';
import type { ComponentProps } from 'react';
import { markdownLineBreaks } from './cvText';

function CvLink(props: ComponentProps<'a'>) {
  return (
    <Link
      {...props}
      target="_blank"
      rel="noreferrer"
      sx={{ color: '#1a56c4' }}
    />
  );
}

/**
 * CV text written in Markdown: bullet lists, **bold**, *italic*, links and so on. Raw
 * HTML is not rendered, and a single line break stays a line break, as in the plain
 * text descriptions written before.
 */
export function CvMarkdown({ value }: { value: string | null | undefined }) {
  if (!value?.trim()) return null;
  return (
    <Box
      sx={{
        '& ul, & ol': { m: 0, mb: '0.9em', pl: '1.6em', textAlign: 'left' },
        '& li > p': { mb: 0 },
        '& h1, & h2, & h3, & h4, & h5, & h6': {
          fontSize: '10pt',
          fontWeight: 700,
          m: 0,
          mb: '0.5em',
        },
        '& blockquote': { m: 0, mb: '0.9em', pl: '1em' },
        '& code': { fontFamily: 'monospace', fontSize: '0.95em' },
      }}
    >
      <Markdown
        options={{
          disableParsingRawHTML: true,
          forceBlock: true,
          wrapper: null,
          overrides: { a: { component: CvLink } },
        }}
      >
        {markdownLineBreaks(value)}
      </Markdown>
    </Box>
  );
}

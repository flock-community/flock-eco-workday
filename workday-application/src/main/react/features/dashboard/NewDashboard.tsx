import { Box, Paper, Typography, MenuItem, Select, alpha } from '@mui/material';
import dayjs from 'dayjs';
import { useState } from 'react';
import { styled, keyframes } from '@mui/material/styles';
import { useLocation } from 'react-router-dom';
import { DashboardComparison } from './DashboardComparison';
import { AverageHoursPerDayChart } from '../../components/charts/AverageHoursPerDayChart';
import { ExternalOverviewChart } from '../../components/charts/ExternalOverviewChart';
import { HackDaysPerPersonChart } from '../../components/charts/HackDaysPerPersonChart';
import { InternalOverviewChart } from '../../components/charts/InternalOverviewChart';
import { LeaveDaysPerPersonChart } from '../../components/charts/LeaveDaysPerPersonChart';
import { ManagementOverviewChart } from '../../components/charts/ManagementOverviewChart';
import { RevenuePerClientTable } from '../../components/charts/RevenuePerClientTable';
import { SickdayPerPersonChart } from '../../components/charts/SickdayPerPersonChart';
import { TotalPerMonthChart } from '../../components/charts/TotalPerMonthChart';
import { GrossMarginTable } from '../../components/tables/GrossMarginTable';

// Keyframe animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(60px) rotateX(-15deg);
  }
  to {
    opacity: 1;
    transform: translateY(0) rotateX(0);
  }
`;

const fadeInDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shimmer = keyframes`
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(200%);
  }
`;

const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const diagonalMove = keyframes`
  from {
    transform: translateX(-100%) rotate(-45deg);
  }
  to {
    transform: translateX(0) rotate(-45deg);
  }
`;

const pulseGlow = keyframes`
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
`;

// Custom styled components with bold aesthetic
const DashboardContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
  padding: '3rem 2rem',
  animation: `${fadeInUp} 0.6s ease-out`,

  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `
      radial-gradient(circle at 20% 50%, rgba(252, 222, 0, 0.03) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(252, 222, 0, 0.02) 0%, transparent 50%)
    `,
    pointerEvents: 'none',
    animation: `${pulseGlow} 4s ease-in-out infinite`,
  },

  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.03\'/%3E%3C/svg%3E")',
    opacity: 0.5,
    mixBlendMode: 'overlay',
    pointerEvents: 'none',
  },
}));

const DashboardHeader = styled(Box)(({ theme }) => ({
  position: 'relative',
  marginBottom: '4rem',
  zIndex: 1,
  animation: `${fadeInDown} 0.8s cubic-bezier(0.16, 1, 0.3, 1)`,
}));

const MainTitle = styled(Typography)(({ theme }) => ({
  fontFamily: '"Clash Display", "Inter", -apple-system, sans-serif',
  fontSize: 'clamp(3rem, 8vw, 6rem)',
  fontWeight: 700,
  lineHeight: 0.9,
  color: '#fcde00',
  letterSpacing: '-0.04em',
  marginBottom: '1rem',
  textTransform: 'uppercase',

  '& .outline': {
    WebkitTextStroke: '2px #fcde00',
    WebkitTextFillColor: 'transparent',
    color: 'transparent',
  },
}));

const Subtitle = styled(Typography)(({ theme }) => ({
  fontFamily: '"General Sans", -apple-system, sans-serif',
  fontSize: '1.125rem',
  fontWeight: 400,
  color: alpha('#ffffff', 0.6),
  letterSpacing: '0.02em',
  textTransform: 'uppercase',
  marginBottom: '2rem',
}));

const YearSelector = styled(Paper)(({ theme }) => ({
  display: 'inline-block',
  background: 'rgba(252, 222, 0, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '2px solid rgba(252, 222, 0, 0.2)',
  borderRadius: '0',
  padding: '0.5rem 1.5rem',
  position: 'relative',
  overflow: 'hidden',
  animation: `${fadeInUp} 0.8s ease-out 0.3s backwards`,

  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(252, 222, 0, 0.1), transparent)',
    transition: 'left 0.5s ease',
  },

  '&:hover::before': {
    animation: `${shimmer} 1s ease-in-out`,
  },

  '& .MuiSelect-select': {
    fontFamily: '"Clash Display", sans-serif',
    fontSize: '2rem',
    fontWeight: 600,
    color: '#fcde00',
    padding: '0.5rem',
    border: 'none',
  },

  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
}));

const GridContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(12, 1fr)',
  gap: '2rem',
  position: 'relative',
  zIndex: 1,

  [theme.breakpoints.down('lg')]: {
    gridTemplateColumns: 'repeat(6, 1fr)',
  },

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
  },
}));

const MetricCard = styled(Box)<{
  gridArea?: string;
  variant?: 'primary' | 'secondary' | 'accent';
  delay?: number;
}>(({ theme, gridArea, variant = 'primary', delay = 0 }) => {
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, rgba(45, 45, 45, 0.9) 0%, rgba(30, 30, 30, 0.95) 100%)',
      border: '1px solid rgba(252, 222, 0, 0.15)',
    },
    secondary: {
      background: 'linear-gradient(135deg, rgba(252, 222, 0, 0.08) 0%, rgba(252, 222, 0, 0.03) 100%)',
      border: '2px solid rgba(252, 222, 0, 0.3)',
    },
    accent: {
      background: 'linear-gradient(135deg, #fcde00 0%, #e6c900 100%)',
      border: 'none',
    },
  };

  return {
    gridColumn: gridArea || 'span 4',
    position: 'relative',
    padding: '2.5rem',
    borderRadius: '0',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    overflow: 'hidden',
    transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease',
    animation: `${fadeInUp} 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay * 0.1}s backwards`,
    ...variants[variant],

    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: variant === 'accent' ? '#1a1a1a' : '#fcde00',
      transform: 'scaleX(0)',
      transformOrigin: 'left',
      transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    },

    '&:hover': {
      transform: 'translateY(-8px)',
      boxShadow: '0 30px 80px rgba(252, 222, 0, 0.2)',

      '&::before': {
        transform: 'scaleX(1)',
      },
    },

    [theme.breakpoints.down('lg')]: {
      gridColumn: 'span 6',
    },

    [theme.breakpoints.down('md')]: {
      gridColumn: 'span 1',
    },
  };
});

const CardTitle = styled(Typography)<{ variant?: 'primary' | 'secondary' | 'accent' }>(
  ({ variant = 'primary' }) => ({
    fontFamily: '"Clash Display", sans-serif',
    fontSize: '1.5rem',
    fontWeight: 600,
    letterSpacing: '-0.02em',
    marginBottom: '1.5rem',
    color: variant === 'accent' ? '#1a1a1a' : '#fcde00',
    textTransform: 'uppercase',
    position: 'relative',
    paddingBottom: '0.5rem',

    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '40px',
      height: '2px',
      background: variant === 'accent' ? '#1a1a1a' : '#fcde00',
    },
  })
);

const CardContent = styled(Box)<{ variant?: 'primary' | 'secondary' | 'accent' }>(
  ({ variant = 'primary' }) => ({
    position: 'relative',
    zIndex: 1,

    '& *': {
      color: variant === 'accent' ? '#1a1a1a !important' : undefined,
    },
  })
);

const DiagonalAccent = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '200%',
  height: '2px',
  background: 'rgba(252, 222, 0, 0.1)',
  transform: 'rotate(-45deg)',
  top: '50%',
  left: '-50%',
  pointerEvents: 'none',
  animation: `${diagonalMove} 1.5s ease-out`,
}));

const FloatingLabel = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '1rem',
  right: '1rem',
  fontFamily: '"General Sans", monospace',
  fontSize: '0.75rem',
  fontWeight: 500,
  color: alpha('#fcde00', 0.5),
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  padding: '0.25rem 0.75rem',
  border: '1px solid rgba(252, 222, 0, 0.2)',
  borderRadius: '0',
  animation: `${slideInRight} 0.6s ease-out 0.5s backwards`,
}));

export function NewDashboard() {
  const startYear = 2019;
  const now = dayjs();
  const [year, setYear] = useState<number>(now.year());
  const location = useLocation();

  return (
    <>
      <DashboardComparison currentPath={location.pathname} />
      <DashboardContainer style={{ marginTop: '60px' }}>
      <DashboardHeader>
        <MainTitle>
          Work<span className="outline">space</span>
          <br />
          Metrics
        </MainTitle>
        <Subtitle>Real-time workforce analytics & insights</Subtitle>
        <YearSelector elevation={0}>
          <Select
            value={year.toString()}
            onChange={(e) => setYear(parseInt(e.target.value as string, 10))}
            variant="outlined"
          >
            {Array.from(Array(now.year() - startYear + 1).keys())
              .map((i) => String(startYear + i))
              .map((it) => (
                <MenuItem key={it} value={it}>
                  {it}
                </MenuItem>
              ))}
          </Select>
        </YearSelector>
      </DashboardHeader>

      <GridContainer>
        {/* Hero Card - Full Width */}
        <MetricCard gridArea="span 12" variant="accent" delay={0}>
          <FloatingLabel>Primary</FloatingLabel>
          <CardTitle variant="accent">Revenue & Cost Analysis</CardTitle>
          <CardContent variant="accent" style={{ height: 450 }}>
            <TotalPerMonthChart year={year} />
          </CardContent>
          <DiagonalAccent />
        </MetricCard>

        {/* Two Column Layout */}
        <MetricCard gridArea="span 6" variant="secondary" delay={1}>
          <FloatingLabel>Performance</FloatingLabel>
          <CardTitle>Average Hours / Day</CardTitle>
          <CardContent style={{ height: 400 }}>
            <AverageHoursPerDayChart year={year} />
          </CardContent>
        </MetricCard>

        <MetricCard gridArea="span 6" variant="primary" delay={2}>
          <FloatingLabel>Internal</FloatingLabel>
          <CardTitle>Internal Operations</CardTitle>
          <CardContent style={{ height: 400 }}>
            <InternalOverviewChart year={year} />
          </CardContent>
        </MetricCard>

        {/* Three Column Layout */}
        <MetricCard gridArea="span 4" delay={3}>
          <FloatingLabel>External</FloatingLabel>
          <CardTitle>Client Work</CardTitle>
          <CardContent style={{ height: 400 }}>
            <ExternalOverviewChart year={year} />
          </CardContent>
        </MetricCard>

        <MetricCard gridArea="span 4" variant="secondary" delay={4}>
          <FloatingLabel>Leadership</FloatingLabel>
          <CardTitle>Management</CardTitle>
          <CardContent style={{ height: 400 }}>
            <ManagementOverviewChart year={year} />
          </CardContent>
        </MetricCard>

        <MetricCard gridArea="span 4" delay={5}>
          <FloatingLabel>Revenue</FloatingLabel>
          <CardTitle>Client Revenue</CardTitle>
          <CardContent>
            <RevenuePerClientTable year={year} />
          </CardContent>
        </MetricCard>

        {/* People Metrics - Asymmetric Layout */}
        <MetricCard gridArea="span 5" variant="secondary" delay={6}>
          <FloatingLabel>People</FloatingLabel>
          <CardTitle>Leave Days</CardTitle>
          <CardContent style={{ height: 350 }}>
            <LeaveDaysPerPersonChart year={year} />
          </CardContent>
        </MetricCard>

        <MetricCard gridArea="span 7" delay={7}>
          <FloatingLabel>Innovation</FloatingLabel>
          <CardTitle>Hack Days Budget</CardTitle>
          <CardContent style={{ height: 350 }}>
            <HackDaysPerPersonChart year={year} />
          </CardContent>
        </MetricCard>

        {/* Health & Financial */}
        <MetricCard gridArea="span 7" variant="primary" delay={8}>
          <FloatingLabel>Health</FloatingLabel>
          <CardTitle>Sick Days</CardTitle>
          <CardContent style={{ height: 350 }}>
            <SickdayPerPersonChart year={year} />
          </CardContent>
        </MetricCard>

        <MetricCard gridArea="span 5" variant="secondary" delay={9}>
          <FloatingLabel>Financial</FloatingLabel>
          <CardTitle>Gross Margin</CardTitle>
          <CardContent>
            <GrossMarginTable year={year} />
          </CardContent>
        </MetricCard>
      </GridContainer>
    </DashboardContainer>

      {/* Global Styles */}
      <style>{`
        @import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,600,700&f[]=general-sans@300,400,500,600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(252, 222, 0, 0.05);
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(252, 222, 0, 0.3);
          border-radius: 0;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(252, 222, 0, 0.5);
        }

        /* Smooth scroll behavior */
        html {
          scroll-behavior: smooth;
        }

        /* Override Material-UI defaults for darker theme */
        .MuiMenuItem-root {
          font-family: 'Clash Display', sans-serif !important;
        }
      `}</style>
    </>
  );
}
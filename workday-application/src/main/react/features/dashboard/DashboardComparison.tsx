import { Box, Typography, Button, Paper, alpha } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';

const ComparisonContainer = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 9999,
  background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
  padding: '1rem 2rem',
  borderBottom: '2px solid #fcde00',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '2rem',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
});

const InfoText = styled(Typography)({
  fontFamily: '"General Sans", -apple-system, sans-serif',
  fontSize: '0.875rem',
  color: alpha('#ffffff', 0.8),

  '& strong': {
    color: '#fcde00',
    fontWeight: 600,
  },
});

const ButtonGroup = styled(Box)({
  display: 'flex',
  gap: '1rem',
  alignItems: 'center',
});

const StyledButton = styled(Button)<{ variant?: 'primary' | 'secondary' }>(({ variant = 'secondary' }) => ({
  fontFamily: '"Clash Display", sans-serif',
  fontSize: '0.875rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  padding: '0.5rem 1.5rem',
  borderRadius: 0,
  border: variant === 'primary' ? 'none' : '2px solid #fcde00',
  background: variant === 'primary' ? '#fcde00' : 'transparent',
  color: variant === 'primary' ? '#1a1a1a' : '#fcde00',
  transition: 'all 0.3s ease',

  '&:hover': {
    background: variant === 'primary' ? '#e6c900' : 'rgba(252, 222, 0, 0.1)',
    borderColor: variant === 'primary' ? '#e6c900' : '#fcde00',
    transform: 'translateY(-2px)',
  },
}));

interface DashboardComparisonProps {
  currentPath: string;
}

export function DashboardComparison({ currentPath }: DashboardComparisonProps) {
  const isNewDashboard = currentPath === '/dashboard-new';
  const isOldDashboard = currentPath === '/dashboard';

  if (!isNewDashboard && !isOldDashboard) return null;

  return (
    <ComparisonContainer>
      <InfoText>
        {isNewDashboard ? (
          <>You're viewing the <strong>NEW</strong> dashboard design — "Studio Workspace" aesthetic</>
        ) : (
          <>You're viewing the <strong>ORIGINAL</strong> dashboard design</>
        )}
      </InfoText>

      <ButtonGroup>
        {isNewDashboard ? (
          <StyledButton
            component={Link}
            to="/dashboard"
            variant="secondary"
          >
            View Original
          </StyledButton>
        ) : (
          <StyledButton
            component={Link}
            to="/dashboard-new"
            variant="primary"
          >
            View New Design
          </StyledButton>
        )}

        <StyledButton
          variant="secondary"
          onClick={() => {
            const url = 'https://github.com/flock-community/flock-eco-workday/blob/main/workday-application/src/main/react/features/dashboard/DASHBOARD_DESIGN.md';
            window.open(url, '_blank');
          }}
        >
          Design Docs
        </StyledButton>
      </ButtonGroup>
    </ComparisonContainer>
  );
}
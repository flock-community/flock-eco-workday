import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { APP_STORE_URL, FlockAppCard, PLAY_STORE_URL } from './FlockAppCard';

describe('FlockAppCard', () => {
  afterEach(() => {
    cleanup();
  });

  it('links to the Flock app in the App Store and Google Play', () => {
    render(<FlockAppCard />);

    expect(screen.getByTestId('flock-app-card')).toBeInTheDocument();
    const appStore = screen.getByRole('link', {
      name: 'Download on the App Store',
    });
    const playStore = screen.getByRole('link', {
      name: 'Get it on Google Play',
    });
    expect(appStore).toHaveAttribute('href', APP_STORE_URL);
    expect(playStore).toHaveAttribute('href', PLAY_STORE_URL);
    for (const link of [appStore, playStore]) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });
});

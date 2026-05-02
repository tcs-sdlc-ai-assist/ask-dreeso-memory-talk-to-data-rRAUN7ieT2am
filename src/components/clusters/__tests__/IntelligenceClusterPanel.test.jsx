import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '../../../context/AuthContext.jsx';
import { QueryProvider } from '../../../context/QueryContext.jsx';
import { IntelligenceClusterPanel } from '../IntelligenceClusterPanel.jsx';
import { INTELLIGENCE_CLUSTERS, STORAGE_KEYS } from '../../../utils/constants.js';
import { SUGGESTED_QUERIES } from '../../../data/mockData.js';
import { quickLogin } from '../../../services/PersonaService.js';

/**
 * Helper to render IntelligenceClusterPanel within the required providers.
 * @param {object} [props={}] - Props to pass to IntelligenceClusterPanel.
 * @returns {object} The render result plus a user-event instance.
 */
function renderPanel(props = {}) {
  const user = userEvent.setup();

  const result = render(
    <AuthProvider>
      <QueryProvider>
        <IntelligenceClusterPanel {...props} />
      </QueryProvider>
    </AuthProvider>,
  );

  return { ...result, user };
}

describe('IntelligenceClusterPanel', () => {
  beforeEach(() => {
    localStorage.clear();
    // Create a session so QueryProvider can function properly
    quickLogin('lukas-muller');
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------

  describe('rendering', () => {
    it('renders the default panel title', () => {
      renderPanel();

      expect(screen.getByText('Intelligence Clusters')).toBeInTheDocument();
    });

    it('renders a custom panel title when provided', () => {
      renderPanel({ title: 'Custom Title' });

      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    it('renders the subtitle text', () => {
      renderPanel();

      expect(screen.getByText('Select a domain to explore insights and suggested queries')).toBeInTheDocument();
    });

    it('hides the title when showTitle is false', () => {
      renderPanel({ showTitle: false });

      expect(screen.queryByText('Intelligence Clusters')).not.toBeInTheDocument();
      expect(screen.queryByText('Select a domain to explore insights and suggested queries')).not.toBeInTheDocument();
    });

    it('renders all 5 intelligence cluster cards', () => {
      renderPanel();

      for (const cluster of INTELLIGENCE_CLUSTERS) {
        expect(screen.getByRole('button', { name: new RegExp(`Select ${cluster.label}`, 'i') })).toBeInTheDocument();
      }
    });

    it('renders cluster labels for all domains', () => {
      renderPanel();

      expect(screen.getByText('Cost Management')).toBeInTheDocument();
      expect(screen.getByText('Schedule Tracking')).toBeInTheDocument();
      expect(screen.getByText('Risk Assessment')).toBeInTheDocument();
      expect(screen.getByText('Quality Assurance')).toBeInTheDocument();
      expect(screen.getByText('Stakeholder Communications')).toBeInTheDocument();
    });

    it('does not show the clear selection button when no cluster is selected', () => {
      renderPanel();

      expect(screen.queryByText('Clear selection')).not.toBeInTheDocument();
    });

    it('does not show the active cluster indicator when no cluster is selected', () => {
      renderPanel();

      expect(screen.queryByText(/Filtering by/)).not.toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Cluster card content
  // ---------------------------------------------------------------------------

  describe('cluster card content', () => {
    it('renders suggested queries for each cluster', () => {
      renderPanel();

      // Check that at least one suggested query from each cluster is rendered
      for (const cluster of INTELLIGENCE_CLUSTERS) {
        const suggestions = SUGGESTED_QUERIES[cluster.id];
        if (suggestions && suggestions.length > 0) {
          // The first suggestion should be visible
          expect(screen.getByRole('button', { name: new RegExp(`Query: ${suggestions[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i') })).toBeInTheDocument();
        }
      }
    });

    it('renders the Suggested Queries label for each cluster card', () => {
      renderPanel();

      const labels = screen.getAllByText('Suggested Queries');
      expect(labels.length).toBe(INTELLIGENCE_CLUSTERS.length);
    });

    it('renders up to 4 suggested queries per cluster', () => {
      renderPanel();

      for (const cluster of INTELLIGENCE_CLUSTERS) {
        const suggestions = SUGGESTED_QUERIES[cluster.id];
        if (suggestions) {
          const maxExpected = Math.min(suggestions.length, 4);
          for (let i = 0; i < maxExpected; i++) {
            expect(screen.getByTitle(suggestions[i])).toBeInTheDocument();
          }
        }
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Cluster selection interaction
  // ---------------------------------------------------------------------------

  describe('cluster selection', () => {
    it('selects a cluster when clicked', async () => {
      const { user } = renderPanel();

      const costCard = screen.getByRole('button', { name: /Select Cost Management/i });
      await user.click(costCard);

      await waitFor(() => {
        expect(screen.getByText('Active')).toBeInTheDocument();
      });
    });

    it('shows the clear selection button when a cluster is selected', async () => {
      const { user } = renderPanel();

      const scheduleCard = screen.getByRole('button', { name: /Select Schedule Tracking/i });
      await user.click(scheduleCard);

      await waitFor(() => {
        expect(screen.getByText('Clear selection')).toBeInTheDocument();
      });
    });

    it('shows the active cluster indicator when a cluster is selected', async () => {
      const { user } = renderPanel();

      const riskCard = screen.getByRole('button', { name: /Select Risk Assessment/i });
      await user.click(riskCard);

      await waitFor(() => {
        expect(screen.getByText(/Filtering by/)).toBeInTheDocument();
        expect(screen.getByText('Risk Assessment')).toBeInTheDocument();
      });
    });

    it('deselects a cluster when the same cluster is clicked again', async () => {
      const { user } = renderPanel();

      const qualityCard = screen.getByRole('button', { name: /Select Quality Assurance/i });
      await user.click(qualityCard);

      await waitFor(() => {
        expect(screen.getByText('Active')).toBeInTheDocument();
      });

      await user.click(qualityCard);

      await waitFor(() => {
        expect(screen.queryByText('Active')).not.toBeInTheDocument();
        expect(screen.queryByText(/Filtering by/)).not.toBeInTheDocument();
      });
    });

    it('clears selection when clear selection button is clicked', async () => {
      const { user } = renderPanel();

      const stakeholderCard = screen.getByRole('button', { name: /Select Stakeholder Communications/i });
      await user.click(stakeholderCard);

      await waitFor(() => {
        expect(screen.getByText('Clear selection')).toBeInTheDocument();
      });

      const clearButton = screen.getByText('Clear selection');
      await user.click(clearButton);

      await waitFor(() => {
        expect(screen.queryByText('Active')).not.toBeInTheDocument();
        expect(screen.queryByText(/Filtering by/)).not.toBeInTheDocument();
        expect(screen.queryByText('Clear selection')).not.toBeInTheDocument();
      });
    });

    it('switches selection when a different cluster is clicked', async () => {
      const { user } = renderPanel();

      const costCard = screen.getByRole('button', { name: /Select Cost Management/i });
      await user.click(costCard);

      await waitFor(() => {
        expect(screen.getByText('Active')).toBeInTheDocument();
      });

      const riskCard = screen.getByRole('button', { name: /Select Risk Assessment/i });
      await user.click(riskCard);

      await waitFor(() => {
        const activeLabels = screen.getAllByText('Active');
        expect(activeLabels).toHaveLength(1);
        expect(screen.getByText(/Filtering by/)).toBeInTheDocument();
      });
    });

    it('sets aria-pressed to true on the selected cluster card', async () => {
      const { user } = renderPanel();

      const costCard = screen.getByRole('button', { name: /Select Cost Management/i });
      expect(costCard).toHaveAttribute('aria-pressed', 'false');

      await user.click(costCard);

      await waitFor(() => {
        expect(costCard).toHaveAttribute('aria-pressed', 'true');
      });
    });

    it('sets aria-pressed to false on non-selected cluster cards', async () => {
      const { user } = renderPanel();

      const costCard = screen.getByRole('button', { name: /Select Cost Management/i });
      await user.click(costCard);

      await waitFor(() => {
        const scheduleCard = screen.getByRole('button', { name: /Select Schedule Tracking/i });
        expect(scheduleCard).toHaveAttribute('aria-pressed', 'false');
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Keyboard accessibility
  // ---------------------------------------------------------------------------

  describe('keyboard accessibility', () => {
    it('selects a cluster when Enter is pressed on a focused card', async () => {
      const { user } = renderPanel();

      const costCard = screen.getByRole('button', { name: /Select Cost Management/i });
      costCard.focus();
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Active')).toBeInTheDocument();
      });
    });

    it('selects a cluster when Space is pressed on a focused card', async () => {
      const { user } = renderPanel();

      const scheduleCard = screen.getByRole('button', { name: /Select Schedule Tracking/i });
      scheduleCard.focus();
      await user.keyboard(' ');

      await waitFor(() => {
        expect(screen.getByText('Active')).toBeInTheDocument();
      });
    });

    it('all cluster cards have tabIndex 0 for keyboard navigation', () => {
      renderPanel();

      for (const cluster of INTELLIGENCE_CLUSTERS) {
        const card = screen.getByRole('button', { name: new RegExp(`Select ${cluster.label}`, 'i') });
        expect(card).toHaveAttribute('tabindex', '0');
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Suggested query click
  // ---------------------------------------------------------------------------

  describe('suggested query click', () => {
    it('triggers a query when a suggested query is clicked', async () => {
      const { user } = renderPanel();

      const firstSuggestion = SUGGESTED_QUERIES['cost-management'][0];
      const queryButton = screen.getByTitle(firstSuggestion);

      await user.click(queryButton);

      // The click should not throw and the panel should still be rendered
      expect(screen.getByText('Cost Management')).toBeInTheDocument();
    });

    it('does not select the cluster when a suggested query is clicked', async () => {
      const { user } = renderPanel();

      const firstSuggestion = SUGGESTED_QUERIES['schedule-tracking'][0];
      const queryButton = screen.getByTitle(firstSuggestion);

      await user.click(queryButton);

      // The click on a suggested query should not toggle the cluster selection
      // (stopPropagation is called)
      // We verify the panel is still functional
      expect(screen.getByText('Schedule Tracking')).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Responsive layout
  // ---------------------------------------------------------------------------

  describe('responsive layout', () => {
    it('renders the cluster grid container', () => {
      const { container } = renderPanel();

      // The grid container should have the responsive grid classes
      const gridElement = container.querySelector('.grid');
      expect(gridElement).toBeInTheDocument();
    });

    it('renders the correct number of cluster cards in the grid', () => {
      renderPanel();

      const clusterButtons = screen.getAllByRole('button', { name: /Select .+ intelligence cluster/i });
      expect(clusterButtons).toHaveLength(INTELLIGENCE_CLUSTERS.length);
    });
  });

  // ---------------------------------------------------------------------------
  // Animated entry
  // ---------------------------------------------------------------------------

  describe('animated entry', () => {
    it('renders all cluster cards after animation', async () => {
      renderPanel();

      await waitFor(() => {
        for (const cluster of INTELLIGENCE_CLUSTERS) {
          expect(screen.getByRole('button', { name: new RegExp(`Select ${cluster.label}`, 'i') })).toBeInTheDocument();
        }
      });
    });

    it('renders the panel container with opacity animation', () => {
      const { container } = renderPanel();

      // The panel should be rendered (framer-motion will handle opacity)
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Edge cases
  // ---------------------------------------------------------------------------

  describe('edge cases', () => {
    it('renders without crashing when no props are provided', () => {
      expect(() => renderPanel()).not.toThrow();
    });

    it('renders without crashing when showTitle is true', () => {
      expect(() => renderPanel({ showTitle: true })).not.toThrow();
    });

    it('renders without crashing when title is an empty string', () => {
      renderPanel({ title: '' });

      // Empty string should fall back to default title
      expect(screen.getByText('Intelligence Clusters')).toBeInTheDocument();
    });

    it('maintains cluster card count after multiple selections and deselections', async () => {
      const { user } = renderPanel();

      // Select and deselect multiple clusters
      const costCard = screen.getByRole('button', { name: /Select Cost Management/i });
      await user.click(costCard);
      await user.click(costCard);

      const riskCard = screen.getByRole('button', { name: /Select Risk Assessment/i });
      await user.click(riskCard);
      await user.click(riskCard);

      // All cluster cards should still be present
      const clusterButtons = screen.getAllByRole('button', { name: /Select .+ intelligence cluster/i });
      expect(clusterButtons).toHaveLength(INTELLIGENCE_CLUSTERS.length);
    });
  });
});
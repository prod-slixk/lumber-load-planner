/**
 * Accessibility audit — jest-axe
 *
 * Covers the two fully static pages (no auth, no Supabase, no router deps
 * beyond MemoryRouter where needed). Interactive pages (Results, Configure)
 * require a running Supabase mock and are covered by manual axe-browser audit
 * during the Vercel preview review.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { axe, toHaveNoViolations } from 'jest-axe'

import LumberGuide from '../LumberGuide'
import ProjectSelector from '../ProjectSelector'

// ── Extend jest matchers ────────────────────────────────────────────────────
expect.extend(toHaveNoViolations)

// ── Mock Zustand store for ProjectSelector ──────────────────────────────────
// ProjectSelector only reads setProjectType — no state selectors that would
// require a real store initialisation.
jest.mock('../../store', () => ({
  useLLPStore: (selector: (s: { setProjectType: jest.Mock }) => unknown) =>
    selector({ setProjectType: jest.fn() }),
}))

// ── LumberGuide ─────────────────────────────────────────────────────────────

describe('LumberGuide page', () => {
  test('renders without axe violations', async () => {
    const { container } = render(<LumberGuide />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  test('has a top-level <main> landmark', () => {
    const { container } = render(<LumberGuide />)
    expect(container.querySelector('main')).not.toBeNull()
  })

  test('has a visible h1', () => {
    const { getByRole } = render(<LumberGuide />)
    expect(getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('accordion buttons have aria-expanded', () => {
    const { getAllByRole } = render(<LumberGuide />)
    const buttons = getAllByRole('button')
    buttons.forEach((btn) => {
      expect(btn).toHaveAttribute('aria-expanded')
    })
  })
})

// ── ProjectSelector ─────────────────────────────────────────────────────────

describe('ProjectSelector page', () => {
  function renderSelector() {
    return render(
      <MemoryRouter>
        <ProjectSelector />
      </MemoryRouter>
    )
  }

  test('renders without axe violations', async () => {
    const { container } = renderSelector()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  test('has a <main> landmark', () => {
    const { container } = renderSelector()
    expect(container.querySelector('main')).not.toBeNull()
  })

  test('project cards have accessible labels', () => {
    const { getAllByRole } = renderSelector()
    const buttons = getAllByRole('button')
    buttons.forEach((btn) => {
      // Each project button must have discernible text (via aria-label or textContent)
      const hasLabel =
        btn.getAttribute('aria-label') ||
        (btn.textContent?.trim().length ?? 0) > 0
      expect(hasLabel).toBeTruthy()
    })
  })
})

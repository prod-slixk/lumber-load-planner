import type { CSSProperties } from 'react'

export const labelStyle: CSSProperties = {
  display: 'block',
  fontWeight: 600,
  marginBottom: '0.35rem',
  fontSize: '0.875rem',
  color: '#1A2533',
  letterSpacing: '0.01em',
}

export const inputStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '0.65rem 1rem',
  border: '1.5px solid #D8DCE0',
  borderRadius: '8px',
  fontSize: '0.95rem',
  fontFamily: 'inherit',
  background: '#fff',
  color: '#1A2533',
  // No outline:none — browser focus ring must remain visible for a11y
  boxSizing: 'border-box',
  transition: 'border-color 150ms cubic-bezier(0.4,0,0.2,1), box-shadow 150ms cubic-bezier(0.4,0,0.2,1)',
}

export const selectStyle: CSSProperties = {
  ...inputStyle,
  cursor: 'pointer',
  appearance: 'auto',
}

export const checkboxRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.6rem',
  fontSize: '0.9rem',
  cursor: 'pointer',
  padding: '0.5rem 0',          // larger touch target
  userSelect: 'none',
}

/** Base styles only — hover/active state handled in SubmitButton component */
export const submitBtnStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  width: '100%',
  minHeight: '48px',
  padding: '0.75rem 1.5rem',
  background: '#004990',
  color: '#fff',
  border: 'none',
  borderRadius: '10px',
  fontSize: '1rem',
  fontFamily: 'inherit',
  fontWeight: 700,
  letterSpacing: '0.01em',
  cursor: 'pointer',
  marginTop: '1rem',
  transition: 'background 150ms cubic-bezier(0.4,0,0.2,1), transform 150ms cubic-bezier(0.4,0,0.2,1)',
}

export const previewBoxStyle: CSSProperties = {
  background: 'var(--llp-blue-light)',
  border: '1.5px solid var(--llp-blue-border, #B8CCE8)',
  borderRadius: '10px',
  padding: '1rem 1.25rem',
  margin: '0.75rem 0 1.25rem',
}

/** Used below chip group fields — same visual treatment as FormField hint */
export const hintStyle: CSSProperties = {
  margin: '0.35rem 0 0',
  fontSize: '
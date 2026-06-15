import type { CSSProperties } from 'react'

export const inputStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '0.55rem 0.85rem',
  border: '1.5px solid #D8DCE0',
  borderRadius: '6px',
  fontSize: '0.95rem',
  fontFamily: 'inherit',
  background: '#fff',
  color: '#1A2533',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 150ms cubic-bezier(0.4,0,0.2,1)',
}

export const selectStyle: CSSProperties = {
  ...inputStyle,
  cursor: 'pointer',
  appearance: 'auto',
}

export const checkboxRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: '0.9rem',
  cursor: 'pointer',
}

export const submitBtnStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  padding: '0.75rem 2rem',
  background: '#004990',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '1rem',
  fontFamily: 'inherit',
  fontWeight: 700,
  cursor: 'pointer',
  marginTop: '0.75rem',
  transition: 'background 150ms cubic-bezier(0.4,0,0.2,1)',
}

export const previewBoxStyle: CSSProperties = {
  background: '#E6EEF8',
  border: '1px solid #B8CCE8',
  borderRadius: '8px',
  padding: '1rem 1.25rem',
  margin: '1.5rem 0 1rem',
}

export const gridTwoStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '0 1.25rem',
}

import type { CSSProperties } from 'react'

export const inputStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '0.5rem 0.75rem',
  border: '1.5px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '0.95rem',
  fontFamily: 'inherit',
  background: '#fff',
  outline: 'none',
  boxSizing: 'border-box',
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
  display: 'inline-block',
  padding: '0.75rem 2rem',
  background: '#2563eb',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '1rem',
  fontFamily: 'inherit',
  cursor: 'pointer',
  marginTop: '0.75rem',
}

export const previewBoxStyle: CSSProperties = {
  background: '#f0f9ff',
  border: '1px solid #bae6fd',
  borderRadius: '8px',
  padding: '1rem 1.25rem',
  margin: '1.5rem 0 1rem',
}

export const gridTwoStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '0 1.25rem',
}

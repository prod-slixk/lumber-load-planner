import type { ReactNode } from 'react'

interface FormFieldProps {
  id: string
  label: string
  error?: string
  hint?: string
  children: ReactNode
}

/**
 * Accessible labeled form field wrapper.
 * Every input in the app should live inside this.
 */
export function FormField({ id, label, error, hint, children }: FormFieldProps) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label
        htmlFor={id}
        style={{
          display: 'block',
          fontWeight: 600,
          marginBottom: '0.35rem',
          fontSize: '0.875rem',
          color: '#1A2533',
          letterSpacing: '0.01em',
        }}
      >
        {label}
      </label>

      {children}

      {hint && (
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.78rem', color: '#6b7280', lineHeight: 1.45 }}>
          {hint}
        </p>
      )}
      {error && (
        <p
          role="alert"
          aria-live="polite"
          style={{ margin: '0.25rem 0 0', fontSize: '0.78rem', color: '#dc2626', fontWeight: 500 }}
        >
          {error}
        </p>
      )}
    </div>
  )
}

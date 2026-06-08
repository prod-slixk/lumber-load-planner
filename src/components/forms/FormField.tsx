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
    <div style={{ marginBottom: '1.1rem' }}>
      <label
        htmlFor={id}
        style={{ display: 'block', fontWeight: 500, marginBottom: '0.3rem', fontSize: '0.875rem' }}
      >
        {label}
      </label>

      {children}

      {hint && (
        <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#6b7280', lineHeight: 1.4 }}>
          {hint}
        </p>
      )}
      {error && (
        <p
          role="alert"
          aria-live="polite"
          style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#dc2626' }}
        >
          {error}
        </p>
      )}
    </div>
  )
}

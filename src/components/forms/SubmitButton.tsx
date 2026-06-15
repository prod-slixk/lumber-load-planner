import { useState } from 'react'
import { submitBtnStyle } from './shared'

interface Props {
  label?: string
}

export function SubmitButton({ label = 'Generate shopping list' }: Props) {
  const [hovered, setHovered] = useState(false)
  const [active, setActive] = useState(false)

  return (
    <button
      type="submit"
      style={{
        ...submitBtnStyle,
        background: active ? '#002f5c' : hovered ? '#003a70' : '#004990',
        transform: active ? 'translateY(1px)' : hovered ? 'translateY(-1px)' : 'none',
        boxShadow: hovered && !active
          ? '0 4px 12px rgba(0,73,144,0.25)'
          : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setActive(false) }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
    >
      {label}
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M3 8h10M9 4l4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

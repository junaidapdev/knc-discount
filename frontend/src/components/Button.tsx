import { type ButtonHTMLAttributes, type ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

const VARIANT_STYLES: Record<ButtonVariant, object> = {
  primary: { background: '#3b82f6', color: '#fff', border: '1px solid #3b82f6' },
  secondary: { background: '#fff', color: '#374151', border: '1px solid #d1d5db' },
  danger: { background: '#ef4444', color: '#fff', border: '1px solid #ef4444' },
  ghost: { background: 'transparent', color: '#64748b', border: '1px solid transparent' },
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  children: ReactNode
}

export default function Button({ variant = 'primary', children, disabled, style, ...rest }: ButtonProps) {
  return (
    <button
      disabled={disabled}
      style={{
        ...VARIANT_STYLES[variant],
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '7px 14px',
        borderRadius: 6,
        fontSize: 14,
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'opacity 0.15s',
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  )
}

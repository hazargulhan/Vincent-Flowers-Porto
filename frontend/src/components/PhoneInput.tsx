import { COUNTRY_CODES } from '../data/countryCodes'

interface PhoneInputProps {
  dialCode: string
  number: string
  onDialCodeChange: (dialCode: string) => void
  onNumberChange: (number: string) => void
  placeholder?: string
  required?: boolean
}

export default function PhoneInput({ dialCode, number, onDialCodeChange, onNumberChange, placeholder, required = true }: PhoneInputProps) {
  return (
    <div className="phone-input-group" style={{ display: 'flex', gap: '0.5rem' }}>
      <select
        aria-label="Country code"
        value={dialCode}
        onChange={e => onDialCodeChange(e.target.value)}
        required={required}
        style={{ flex: '0 0 auto', width: '108px' }}
      >
        {COUNTRY_CODES.map(c => (
          <option key={`${c.iso2}-${c.dialCode}`} value={c.dialCode}>
            {c.iso2} {c.dialCode}
          </option>
        ))}
      </select>
      <input
        type="tel"
        inputMode="tel"
        placeholder={placeholder}
        required={required}
        value={number}
        onChange={e => onNumberChange(e.target.value)}
        style={{ flex: '1 1 auto', minWidth: 0 }}
      />
    </div>
  )
}

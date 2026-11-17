// 공통 입력칸. multiline이면 여러 줄 입력(textarea)으로 바뀝니다.

export interface FieldProps {
  name: string
  label: string
  value: string
  onChange: (name: string, value: string) => void
  type?: string
  placeholder?: string
  autoComplete?: string
  multiline?: boolean
  rows?: number
}

export default function Field({ name, label, value, onChange, multiline, rows = 6, ...rest }: FieldProps) {
  const id = `field-${name}`

  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          name={name}
          rows={rows}
          className="field__input"
          value={value}
          placeholder={rest.placeholder}
          onChange={(e) => onChange(name, e.target.value)}
        />
      ) : (
        <input
          id={id}
          name={name}
          className="field__input"
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          {...rest}
        />
      )}
    </div>
  )
}

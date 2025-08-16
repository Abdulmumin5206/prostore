import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export type AdminSelectOption = { value: string; label: string; disabled?: boolean }

type AdminSelectProps = {
  value: string
  onChange: (value: string) => void
  options: AdminSelectOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
}

const AdminSelect: React.FC<AdminSelectProps> = ({ value, onChange, options, placeholder = 'Select', disabled = false, className = '' }) => {
  const [open, setOpen] = useState(false)
  const [hoveredOption, setHoveredOption] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({})

  const selectedLabel = useMemo(() => options.find(o => o.value === value)?.label ?? '', [options, value])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!containerRef.current) return
      if (!(e.target instanceof Node)) return
      // Close only if clicking outside both the trigger and the portal menu
      const clickedInsideTrigger = containerRef.current.contains(e.target)
      const clickedInsideMenu = menuRef.current ? menuRef.current.contains(e.target) : false
      if (!clickedInsideTrigger && !clickedInsideMenu) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Position the menu via fixed coordinates to avoid nesting inside scrollable parents
  useEffect(() => {
    if (!open) return
    const updatePosition = () => {
      const btn = buttonRef.current
      if (!btn) return
      const rect = btn.getBoundingClientRect()
      setMenuStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      })
    }
    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [open])

  const baseButton = 'w-full flex items-center justify-between bg-white/5 text-white border border-white/10 rounded-lg px-3 py-2 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10'
  const baseMenu = 'rounded-xl border border-white/10 bg-black/95 backdrop-blur-sm shadow-lg py-2'
  const baseItem = 'px-3 py-2 text-sm hover:bg-white/15 cursor-pointer flex items-center justify-between transition-colors duration-200 group'

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        className={baseButton}
        ref={buttonRef}
        disabled={disabled}
        onClick={() => setOpen(prev => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={`${value ? 'text-white' : 'text-white/60'} transition-colors duration-200`}>
          {value ? selectedLabel : placeholder}
        </span>
        <svg className="ml-2 h-4 w-4 text-white/70 transition-transform duration-200" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd"/>
        </svg>
      </button>

      {open && createPortal(
        (
          <ul role="listbox" ref={menuRef} className={baseMenu} style={menuStyle}>
            {options.length === 0 && (
              <li className="px-3 py-2 text-sm text-white/60">No options</li>
            )}
            {options.map((opt) => (
              <li
                key={opt.value}
                role="option"
                aria-selected={value === opt.value}
                className={`${baseItem} ${opt.disabled ? 'opacity-50 cursor-not-allowed' : ''} ${value === opt.value ? 'bg-white/20' : ''}`}
                onClick={() => { if (!opt.disabled) { onChange(opt.value); setOpen(false) } }}
                onMouseEnter={() => setHoveredOption(opt.value)}
                onMouseLeave={() => setHoveredOption(null)}
              >
                <span className="flex-1 min-w-0">
                  <span className={`block transition-all duration-200 ${hoveredOption === opt.value ? 'text-white' : 'text-white/90'}`}>
                    {opt.label}
                  </span>
                </span>
                {value === opt.value && (
                  <svg className="h-4 w-4 text-white/80 ml-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.415l-7.378 7.377a1 1 0 01-1.415 0L3.296 9.768a1 1 0 111.415-1.415l3.2 3.2 6.67-6.67a1 1 0 011.415 0z" clipRule="evenodd"/>
                  </svg>
                )}
              </li>
            ))}
          </ul>
        ),
        document.body
      )}
    </div>
  )
}

export default AdminSelect
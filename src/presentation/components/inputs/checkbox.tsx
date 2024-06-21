import React from 'react'
import classNames from 'classnames'

type CheckboxInputProps = {
  label?: string
  onClick: (v: boolean) => void
  disabled?: boolean
  checked: boolean
}

export const CheckboxInput = ({ label, onClick, disabled, checked }: CheckboxInputProps) => {
  //---------------------
  // RENDER
  //---------------------
  return (
    <label htmlFor={label} onClick={() => !disabled && onClick(!checked)}>
      <div
        className={classNames('w-4 h-4 rounded-[4px] flex justify-center items-center', {
          'bg-white': !disabled && !checked,
          'bg-primary': disabled && !checked,
          'bg-primary-lighter': checked && !disabled,
          'bg-primary-light': checked && disabled,
          'cursor-not-allowed text-primary': disabled,
          'cursor-pointer text-white': !disabled,
          'border border-dark-4': !checked,
        })}
      >
        <i className="text-xs fa-solid fa-check" />
      </div>
    </label>
  )
}

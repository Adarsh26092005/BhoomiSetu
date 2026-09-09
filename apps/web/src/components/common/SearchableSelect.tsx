import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';

export interface OptionItem {
  value: string;
  label: string;
  subLabel?: string;
  group?: string;
}

interface SearchableSelectProps {
  id?: string;
  name?: string;
  label?: string;
  required?: boolean;
  value?: string;
  onChange: (value: string) => void;
  options: OptionItem[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  helperText?: string;
}

export function SearchableSelect({
  id,
  name,
  label,
  required = false,
  value = '',
  onChange,
  options,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  disabled = false,
  error,
  className = '',
  helperText,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(
    (opt) => opt.value === value || opt.label.toLowerCase() === value.toLowerCase(),
  );

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (opt.subLabel && opt.subLabel.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (opt.group && opt.group.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  return (
    <div className={`space-y-1.5 ${className}`} ref={containerRef}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-ink-700"
        >
          {label} {required && <span className="text-rust-600">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          id={id}
          name={name}
          disabled={disabled}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          className={`h-9 w-full flex items-center justify-between rounded-md border px-3 text-xs text-left transition-colors ${
            disabled
              ? 'bg-ink-100 border-ink-200 text-ink-400 cursor-not-allowed'
              : error
              ? 'bg-paper border-rust-400 text-ink-900 focus:border-rust-600 focus:ring-1 focus:ring-rust-500'
              : isOpen
              ? 'bg-paper border-terracotta-500 ring-1 ring-terracotta-500 text-ink-900'
              : 'bg-paper border-ink-300 text-ink-900 hover:border-ink-400'
          }`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className={`truncate ${!selectedOption ? 'text-ink-400' : 'font-medium'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>

          <div className="flex items-center gap-1 shrink-0 ml-2">
            {selectedOption && !disabled && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onChange('');
                  }
                }}
                className="p-0.5 rounded text-ink-400 hover:text-ink-700 hover:bg-ink-100 cursor-pointer"
                title="Clear selection"
              >
                <X className="h-3 w-3" />
              </span>
            )}
            <ChevronDown
              className={`h-3.5 w-3.5 text-ink-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-terracotta-600' : ''
              }`}
            />
          </div>
        </button>

        {isOpen && !disabled && (
          <div className="absolute z-50 mt-1 w-full rounded-md border border-ink-200 bg-paper shadow-lg overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="p-2 border-b border-ink-100 bg-ink-50/70 flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-ink-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-xs text-ink-900 placeholder:text-ink-400 focus:outline-none"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsOpen(false);
                  }
                  if (e.key === 'Enter' && filteredOptions.length > 0) {
                    e.preventDefault();
                    handleSelect(filteredOptions[0].value);
                  }
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-ink-400 hover:text-ink-700 p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            <ul
              className="max-h-56 overflow-y-auto p-1 divide-y divide-ink-50 focus:outline-none text-xs"
              role="listbox"
            >
              {filteredOptions.length === 0 ? (
                <li className="py-3 px-2 text-center text-ink-400 italic text-[11px]">
                  No matching options found
                </li>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected =
                    selectedOption?.value === option.value ||
                    selectedOption?.label === option.label;
                  return (
                    <li
                      key={option.value}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(option.value)}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-terracotta-50 text-terracotta-900 font-semibold'
                          : 'text-ink-800 hover:bg-ink-100'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="truncate">{option.label}</span>
                        {option.subLabel && (
                          <span className="text-[10px] text-ink-400 font-normal">
                            {option.subLabel}
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-terracotta-600 shrink-0 ml-2" />
                      )}
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        )}
      </div>

      {helperText && !error && (
        <p className="text-[11px] text-ink-500">{helperText}</p>
      )}

      {error && (
        <p className="text-[11px] text-rust-600">{error}</p>
      )}
    </div>
  );
}

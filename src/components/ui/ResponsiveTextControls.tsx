import React, { useRef, useEffect, useState } from 'react';

interface AutoGrowPromptInputProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'onSubmit'> {
  value: string;
  onValueChange: (next: string) => void;
  onSubmitPrompt?: () => void;
  onSubmit?: () => void;
  ariaLabel?: string;
  maxHeightPx?: number;
}

/**
 * Single-row-looking input at rest that automatically expands vertically as text is typed,
 * preventing typed words from getting clipped horizontally on narrow/mobile screens.
 * Pressing Enter submits (when onSubmitPrompt or onSubmit is provided); Shift+Enter inserts a newline.
 */
export const AutoGrowPromptInput: React.FC<AutoGrowPromptInputProps> = ({
  value,
  onValueChange,
  onSubmitPrompt,
  onSubmit,
  ariaLabel,
  maxHeightPx = 140,
  className = '',
  onKeyDown,
  ...rest
}) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  const submitHandler = onSubmitPrompt ?? onSubmit;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    const nextH = Math.min(el.scrollHeight, maxHeightPx);
    el.style.height = `${Math.max(40, nextH)}px`;
  }, [value, maxHeightPx]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && submitHandler) {
      e.preventDefault();
      submitHandler();
      return;
    }
    onKeyDown?.(e);
  };

  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      aria-label={ariaLabel || rest['aria-label']}
      onChange={(e) => onValueChange(e.target.value)}
      onKeyDown={handleKeyDown}
      className={`resize-none overflow-y-auto leading-snug break-words ${className}`}
      {...rest}
    />
  );
};

interface ExpandableTextProps {
  text: string;
  maxChars?: number;
  className?: string;
  toggleClassName?: string;
}

/**
 * Wraps text naturally and provides an inline tap-to-expand toggle when copy is extra long,
 * keeping card grids visually balanced without irreversible ellipsis clipping.
 */
export const ExpandableText: React.FC<ExpandableTextProps> = ({
  text,
  maxChars = 110,
  className = '',
  toggleClassName = 'text-cyan-400 hover:text-cyan-300',
}) => {
  const [expanded, setExpanded] = useState(false);
  const clean = text || '';
  const needsToggle = clean.length > maxChars;

  if (!needsToggle) {
    return <span className={`break-words [overflow-wrap:anywhere] ${className}`}>{clean}</span>;
  }

  return (
    <span className={`break-words [overflow-wrap:anywhere] ${className}`}>
      {expanded ? clean : `${clean.slice(0, maxChars).trimEnd()}...`}{' '}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setExpanded((v) => !v);
        }}
        className={`inline font-bold underline-offset-2 hover:underline cursor-pointer ${toggleClassName}`}
      >
        {expanded ? 'Show less' : 'Show full'}
      </button>
    </span>
  );
};

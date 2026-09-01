'use client';

import Editor, { type OnMount, type OnValidate } from '@monaco-editor/react';
import { CheckCircle, ClipboardCopy, RefreshCw, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useCallback, useMemo, useRef, useState } from 'react';

import { Button } from './ui/button';
import { useToast } from './ui/toast';

interface RawJsonEditorProps {
  /** The JSON value to edit */
  value: object;
  /** Callback when the value changes (called only with valid JSON) */
  onChange: (value: object) => void;
  /** Whether the editor is read-only */
  readOnly?: boolean;
  /** Callback when validation state changes */
  onValidationChange?: (isValid: boolean) => void;
  /** Placeholder text when empty */
  placeholder?: string;
}

/**
 * A reusable JSON editor component using Monaco Editor
 * Features:
 * - Syntax highlighting
 * - JSON validation
 * - Format/prettify
 * - Copy to clipboard
 * - Error highlighting
 */
export function RawJsonEditor({
  value,
  onChange,
  readOnly = false,
  onValidationChange,
  placeholder,
}: RawJsonEditorProps) {
  const t = useTranslations('rawEdit');
  const { toast } = useToast();
  const { resolvedTheme } = useTheme();

  // Track the external value as JSON string for comparison
  const externalValueJson = useMemo(() => JSON.stringify(value, null, 2), [value]);

  // Track if user has made local edits
  const [localEdits, setLocalEdits] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  // The displayed value: local edits if any, otherwise external value
  const internalValue = localEdits ?? externalValueJson;
  const hasChanges = localEdits !== null && localEdits !== externalValueJson;

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  const handleEditorChange = useCallback(
    (newValue: string | undefined) => {
      if (!newValue) return;
      setLocalEdits(newValue);

      try {
        const parsed = JSON.parse(newValue);
        setIsValid(true);
        onValidationChange?.(true);
        onChange(parsed);
      } catch {
        setIsValid(false);
        onValidationChange?.(false);
      }
    },
    [onChange, onValidationChange],
  );

  const handleValidate: OnValidate = (markers) => {
    const hasErrors = markers.some((m) => m.severity === 8);
    setIsValid(!hasErrors);
    onValidationChange?.(!hasErrors);
  };

  const handleFormat = useCallback(() => {
    try {
      const parsed = JSON.parse(internalValue);
      const formatted = JSON.stringify(parsed, null, 2);
      setLocalEdits(formatted);
      if (editorRef.current) {
        editorRef.current.setValue(formatted);
      }
      onChange(parsed);
    } catch {
      toast({
        title: t('formatError'),
        description: t('formatErrorDesc'),
        variant: 'destructive',
      });
    }
  }, [internalValue, onChange, toast, t]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(internalValue);
      toast({
        title: t('copied'),
        description: t('copiedDesc'),
      });
    } catch {
      toast({
        title: t('copyError'),
        description: t('copyErrorDesc'),
        variant: 'destructive',
      });
    }
  }, [internalValue, toast, t]);

  const handleReset = useCallback(() => {
    // Clear local edits to revert to external value
    setLocalEdits(null);
    if (editorRef.current) {
      editorRef.current.setValue(externalValueJson);
    }
    setIsValid(true);
    onValidationChange?.(true);
  }, [externalValueJson, onValidationChange]);

  return (
    <div className="flex flex-col h-full gap-2">
      {/* Toolbar */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          {isValid ? (
            <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              {t('validJson')}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
              <XCircle className="h-4 w-4" />
              {t('invalidJson')}
            </span>
          )}
          {hasChanges && <span className="text-xs text-muted-foreground">({t('unsavedChanges')})</span>}
        </div>

        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RefreshCw className="mr-1 h-3 w-3" />
              {t('reset')}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleFormat} disabled={!isValid || readOnly}>
            {t('format')}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            <ClipboardCopy className="mr-1 h-3 w-3" />
            {t('copy')}
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0 overflow-hidden rounded-md border bg-background">
        <Editor
          height="100%"
          language="json"
          value={internalValue}
          onChange={handleEditorChange}
          onMount={handleEditorMount}
          onValidate={handleValidate}
          theme={resolvedTheme === 'dark' ? 'vs-dark' : 'light'}
          options={{
            readOnly,
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            tabSize: 2,
            automaticLayout: true,
            formatOnPaste: true,
            formatOnType: true,
            folding: true,
            foldingHighlight: true,
            bracketPairColorization: { enabled: true },
          }}
        />
      </div>

      {placeholder && !internalValue && <p className="text-sm text-muted-foreground">{placeholder}</p>}
    </div>
  );
}

export default RawJsonEditor;

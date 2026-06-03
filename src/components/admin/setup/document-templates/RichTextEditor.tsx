"use client";

import { plainTextToHtml } from "@/lib/settings/document-rich-text";
import { cn } from "@/lib/utils";
import {
  Bold,
  Code2,
  Eye,
  Italic,
  List,
  ListOrdered,
  Underline,
} from "lucide-react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

export type RichTextEditorHandle = {
  focus: () => void;
  insertText: (text: string) => void;
};

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  onFocus?: () => void;
  minHeight?: number;
  placeholder?: string;
  className?: string;
};

type EditorMode = "visual" | "html";

function normalizeStoredValue(value: string): string {
  if (!value.trim()) return "";
  return plainTextToHtml(value);
}

export const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(
  function RichTextEditor(
    { value, onChange, onFocus, minHeight = 160, placeholder, className },
    ref,
  ) {
    const [mode, setMode] = useState<EditorMode>("visual");
    const [htmlSource, setHtmlSource] = useState(() => normalizeStoredValue(value));
    const visualRef = useRef<HTMLDivElement>(null);
    const htmlRef = useRef<HTMLTextAreaElement>(null);
    const lastExternal = useRef(value);

    const syncVisualFromValue = useCallback((next: string) => {
      const el = visualRef.current;
      if (!el) return;
      const html = normalizeStoredValue(next);
      if (el.innerHTML !== html) {
        el.innerHTML = html;
      }
    }, []);

    useEffect(() => {
      if (value === lastExternal.current) return;
      lastExternal.current = value;
      const normalized = normalizeStoredValue(value);
      setHtmlSource(normalized);
      if (mode === "visual") {
        syncVisualFromValue(value);
      }
    }, [value, mode, syncVisualFromValue]);

    useEffect(() => {
      if (mode === "visual") {
        syncVisualFromValue(value);
      }
    }, [mode, syncVisualFromValue, value]);

    const emitVisual = useCallback(() => {
      const html = visualRef.current?.innerHTML ?? "";
      lastExternal.current = html;
      setHtmlSource(html);
      onChange(html);
    }, [onChange]);

    const emitHtml = useCallback(
      (next: string) => {
        lastExternal.current = next;
        setHtmlSource(next);
        onChange(next);
      },
      [onChange],
    );

    const exec = useCallback(
      (command: string, arg?: string) => {
        visualRef.current?.focus();
        document.execCommand(command, false, arg);
        emitVisual();
      },
      [emitVisual],
    );

    const insertTextAtCursor = useCallback(
      (text: string) => {
        if (mode === "html") {
          const el = htmlRef.current;
          const start = el?.selectionStart ?? htmlSource.length;
          const end = el?.selectionEnd ?? start;
          const next = htmlSource.slice(0, start) + text + htmlSource.slice(end);
          emitHtml(next);
          requestAnimationFrame(() => {
            el?.focus();
            const cursor = start + text.length;
            el?.setSelectionRange(cursor, cursor);
          });
          return;
        }

        visualRef.current?.focus();
        const sel = window.getSelection();
        if (!sel?.rangeCount) {
          const el = visualRef.current;
          if (el) {
            el.innerHTML += text;
            emitVisual();
          }
          return;
        }
        const range = sel.getRangeAt(0);
        range.deleteContents();
        const node = document.createTextNode(text);
        range.insertNode(node);
        range.setStartAfter(node);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        emitVisual();
      },
      [emitHtml, emitVisual, htmlSource, mode],
    );

    useImperativeHandle(
      ref,
      () => ({
        focus: () => {
          if (mode === "html") htmlRef.current?.focus();
          else visualRef.current?.focus();
        },
        insertText: insertTextAtCursor,
      }),
      [insertTextAtCursor, mode],
    );

    function switchMode(next: EditorMode) {
      if (next === mode) return;
      if (next === "html") {
        const html = visualRef.current?.innerHTML ?? htmlSource;
        setHtmlSource(html);
        emitHtml(html);
      } else {
        syncVisualFromValue(htmlSource);
      }
      setMode(next);
    }

    return (
      <div className={cn("w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm", className)}>
        <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-100 bg-slate-50/80 px-2 py-1.5">
          {mode === "visual" ? (
            <>
              <ToolbarButton label="Bold" onClick={() => exec("bold")}>
                <Bold className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton label="Italic" onClick={() => exec("italic")}>
                <Italic className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton label="Underline" onClick={() => exec("underline")}>
                <Underline className="h-4 w-4" />
              </ToolbarButton>
              <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden />
              <ToolbarButton label="Bullet list" onClick={() => exec("insertUnorderedList")}>
                <List className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton label="Numbered list" onClick={() => exec("insertOrderedList")}>
                <ListOrdered className="h-4 w-4" />
              </ToolbarButton>
            </>
          ) : null}
          <span className="flex-1" />
          <ToolbarButton
            label="Visual editor"
            active={mode === "visual"}
            onClick={() => switchMode("visual")}
          >
            <Eye className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="HTML source"
            active={mode === "html"}
            onClick={() => switchMode("html")}
          >
            <Code2 className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {mode === "visual" ? (
          <div
            ref={visualRef}
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-multiline
            data-placeholder={placeholder}
            onFocus={onFocus}
            onInput={emitVisual}
            className={cn(
              "rich-text-editor w-full px-3 py-2.5 text-sm leading-relaxed text-slate-900 outline-none",
              "focus:ring-2 focus:ring-inset focus:ring-brand-500/20",
              "empty:before:pointer-events-none empty:before:text-slate-400 empty:before:content-[attr(data-placeholder)]",
              "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5",
              "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5",
              "[&_li]:my-0.5",
              "[&_p]:my-1.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0",
              "[&_strong]:font-semibold",
            )}
            style={{ minHeight }}
          />
        ) : (
          <textarea
            ref={htmlRef}
            value={htmlSource}
            onFocus={onFocus}
            onChange={(e) => emitHtml(e.target.value)}
            className="block w-full resize-y border-0 bg-white px-3 py-2.5 font-mono text-xs leading-relaxed text-slate-800 outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500/20"
            style={{ minHeight }}
            spellCheck={false}
          />
        )}
      </div>
    );
  },
);

function ToolbarButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-md p-1.5 text-slate-600 transition-colors hover:bg-white hover:text-slate-900",
        active && "bg-white text-brand-700 shadow-sm ring-1 ring-brand-200",
      )}
    >
      {children}
    </button>
  );
}

import { useEffect, useRef, useState } from 'react';

const EDITOR_JS_CDN = 'https://cdn.jsdelivr.net/npm/@editorjs/editorjs@latest';
const HEADER_TOOL_CDN = 'https://cdn.jsdelivr.net/npm/@editorjs/header@latest';
const LIST_TOOL_CDN = 'https://cdn.jsdelivr.net/npm/@editorjs/list@latest';
const QUOTE_TOOL_CDN = 'https://cdn.jsdelivr.net/npm/@editorjs/quote@latest';

const loadedScripts = new Set();

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    if (loadedScripts.has(src)) {
      resolve();
      return;
    }

    const existing = document.querySelector(`script[data-src="${src}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error(`Failed to load script: ${src}`)), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.dataset.src = src;
    script.onload = () => {
      loadedScripts.add(src);
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.body.appendChild(script);
  });

const parseEditorValue = (value) => {
  if (!value) {
    return { time: Date.now(), blocks: [] };
  }

  try {
    const parsed = JSON.parse(value);
    if (parsed && Array.isArray(parsed.blocks)) {
      return parsed;
    }
  } catch {
    // Fallback to plain text conversion.
  }

  const lines = String(value)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    time: Date.now(),
    blocks: lines.map((line) => ({
      type: 'paragraph',
      data: { text: line },
    })),
  };
};

function EditorJsField({ value, onChange, error }) {
  const holderRef = useRef(null);
  const editorRef = useRef(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        await loadScript(EDITOR_JS_CDN);
        await Promise.all([loadScript(HEADER_TOOL_CDN), loadScript(LIST_TOOL_CDN), loadScript(QUOTE_TOOL_CDN)]);

        if (!isMounted || !holderRef.current || !window.EditorJS) {
          return;
        }

        const initialData = parseEditorValue(value);
        const editor = new window.EditorJS({
          holder: holderRef.current,
          placeholder: 'Write blog content...',
          data: initialData,
          tools: {
            header: window.Header,
            list: window.EditorjsList || window.List,
            quote: window.Quote,
          },
          async onChange(api) {
            const output = await api.saver.save();
            onChange(JSON.stringify(output));
          },
        });

        editorRef.current = editor;
      } catch {
        if (isMounted) {
          setLoadError('Editor failed to load. Using plain textarea mode.');
        }
      }
    };

    init();

    return () => {
      isMounted = false;
      if (editorRef.current?.destroy) {
        editorRef.current.destroy();
      }
      editorRef.current = null;
    };
  }, []);

  if (loadError) {
    return (
      <>
        <textarea
          rows={10}
          className={`form-control ${error ? 'is-invalid' : ''}`}
          value={value || ''}
          onChange={(event) => onChange(event.target.value)}
        />
        <small className="text-muted">{loadError}</small>
      </>
    );
  }

  return (
    <div className={`editorjs-wrap ${error ? 'is-invalid' : ''}`}>
      <div ref={holderRef} className="editorjs-holder" />
    </div>
  );
}

export default EditorJsField;

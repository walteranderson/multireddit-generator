import { useState, type FormEventHandler } from 'react'
import { LoaderCircle, Copy } from 'lucide-react';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [isErr, setErr] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState('');

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('Text copied to clipboard');
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const onSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch(`/api?prompt=${prompt}`);
      const items = await res.json() as string[];
      const multireddits = items.join('+')
      setAnswer(`r/${multireddits}`);
      setLoading(false);
      setPrompt('');
      setErr(false);
    } catch (err) {
      setLoading(false);
      setErr(true);
    }
  }

  return (
    <div className="container">
      <h1>MultiReddit Generator</h1>

      <form onSubmit={onSubmit}>
        <textarea
          required
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Pretty landscapes and nature"
        />
        <button disabled={loading}>
          Submit
          {loading ? <LoaderCircle className="loading-icon" /> : ''}
        </button>
      </form>

      {isErr && (
        <div className="error">
          There was an error!
        </div>
      )}

      {answer && (
        <>
          <a href={`https://reddit.com/${answer}`} target="_blank">
            View Multireddit
          </a>
          <div className="output">
            <p>{answer}</p>
            <button
              className="icon-button"
              onClick={() => copyToClipboard(answer)}
              aria-label="Copy to clipboard"
              title="Copy to clipboard"
            >
              <Copy size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}

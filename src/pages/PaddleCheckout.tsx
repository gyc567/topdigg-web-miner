/**
 * Paddle Checkout page — redirect-mode checkout for testing sandbox integration.
 * Route: /checkout
 *
 * Uses redirect mode to avoid CSP frame-ancestors issues that block overlay/iframe.
 */
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { initializePaddle, type Paddle } from '@paddle/paddle-js';
import { paddleConfig } from '@/lib/paddle-config';

type CheckoutState = 'idle' | 'loading' | 'ready' | 'error';

export default function PaddleCheckout() {
  const [searchParams] = useSearchParams();
  const priceId = searchParams.get('price') || paddleConfig.prices.monthly;

  const [paddle, setPaddle] = useState<Paddle | null>(null);
  const [checkoutState, setCheckoutState] = useState<CheckoutState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [logLines, setLogLines] = useState<string[]>([]);

  const log = useCallback((msg: string) => {
    setLogLines(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }, []);

  useEffect(() => {
    if (!paddleConfig.clientToken) {
      setErrorMsg('VITE_PADDLE_CLIENT_TOKEN is not set. Copy .env.example to .env.local and fill in your sandbox token.');
      setCheckoutState('error');
      return;
    }

    setCheckoutState('loading');
    log(`Initializing Paddle (${paddleConfig.env})...`);

    initializePaddle({
      token: paddleConfig.clientToken,
      environment: paddleConfig.env,
      eventCallback: (event) => {
        if (event.name) {
          log(`Paddle event: ${event.name}`);
          if (event.data) console.log('[Paddle]', event.name, event.data);
        }
      },
    })
      .then(p => {
        if (p) {
          setPaddle(p);
          setCheckoutState('ready');
          log('Paddle initialized successfully');
        } else {
          setErrorMsg('Paddle initialization returned null');
          setCheckoutState('error');
        }
      })
      .catch(err => {
        setErrorMsg(err?.message || String(err));
        setCheckoutState('error');
        log(`Init error: ${err?.message}`);
      });
  }, [log]);

  const openCheckout = useCallback(() => {
    if (!paddle) return;
    log(`Opening checkout for price: ${priceId}`);
    paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      settings: {
        displayMode: 'overlay',
        variant: 'one-page',
      },
    });
  }, [paddle, priceId, log]);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-bold mb-6">Paddle Sandbox Checkout Test</h1>

      <div className="mb-4 p-4 bg-muted rounded-lg text-sm font-mono space-y-1">
        <div><strong>Environment:</strong> {paddleConfig.env}</div>
        <div><strong>Price ID:</strong> {priceId}</div>
        <div><strong>Status:</strong> {checkoutState}</div>
        <div><strong>Display mode:</strong> overlay (CSP frame-ancestors fixed in vite.config)</div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
          <strong>Error:</strong> {errorMsg}
        </div>
      )}

      <div className="flex gap-3 mb-8">
        <button
          onClick={openCheckout}
          disabled={checkoutState !== 'ready'}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50"
        >
          {checkoutState === 'loading' ? 'Loading Paddle...' : checkoutState === 'ready' ? 'Open Checkout (Overlay)' : 'Paddle Error'}
        </button>

        <button
          onClick={() => setLogLines([])}
          className="px-4 py-3 border rounded-lg text-sm"
        >
          Clear log
        </button>
      </div>

      <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-xs h-64 overflow-y-auto">
        {logLines.length === 0 ? (
          <span className="text-muted-foreground">Waiting for events...</span>
        ) : (
          logLines.map((line, i) => <div key={i}>{line}</div>)
        )}
      </div>

      <div className="mt-8 p-4 border rounded-lg text-sm text-muted-foreground">
        <strong>Sandbox test card:</strong> 4242 4242 4242 4242 — any future expiry, any CVC
      </div>
    </div>
  );
}

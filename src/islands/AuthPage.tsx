import { ArrowLeft, Mail, ShieldCheck } from 'lucide-react';
import { useStore } from '@nanostores/react';
import { motion } from 'motion/react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { User } from 'firebase/auth';
import { Mindy } from '../components/Mindy';
import { Button, Field } from '../components/ui/core';
import { $childId, $session, go, startSession } from '../lib/session';

type Mode = 'login' | 'signup' | 'forgot';

const copy: Record<Mode, { title: string; subtitle: string; cta: string }> = {
  login: { title: 'Welcome back!', subtitle: 'Log in to your family account.', cta: 'Log in' },
  signup: { title: 'Create a family account', subtitle: 'For parents and caregivers. Then add a profile for each child.', cta: 'Create account' },
  forgot: { title: 'Reset your password', subtitle: 'We’ll email you a link to choose a new password.', cta: 'Send reset link' },
};

/** Set before a Google redirect so the consent ticked on the sign-up page survives the round trip. */
const CONSENT_KEY = 'mm:google-consent';

function friendlyError(code: string): string {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'That email or password doesn’t match. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try logging in instead.';
    case 'auth/account-exists-with-different-credential':
      return 'This email already has an account with a different sign-in method. Try logging in with your email and password.';
    case 'auth/weak-password':
      return 'Please choose a password with at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please check the email address.';
    case 'auth/too-many-requests':
      return 'Too many tries. Please wait a few minutes and try again.';
    case 'auth/network-request-failed':
      return 'No internet connection. Please check and try again.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not switched on for this app yet.';
    case 'auth/unauthorized-domain':
      return 'Google sign-in isn’t allowed on this web address yet. Please use email and password for now.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

const SILENT_ERRORS = new Set(['auth/popup-closed-by-user', 'auth/cancelled-popup-request', 'auth/user-cancelled']);

export default function AuthPage({ mode }: { mode: Mode }) {
  const session = useStore($session);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  /** A first-time Google user who still needs to confirm they are a parent or caregiver. */
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  /** While a Google sign-in is being finished, don't auto-navigate on the auth state change. */
  const googleFlow = useRef(false);

  useEffect(() => startSession(), []);
  useEffect(() => {
    if (googleFlow.current) return;
    if (mode !== 'forgot' && session.status === 'user') go($childId.get() ? '/home' : '/profiles');
  }, [session.status, mode]);

  // Finish a Google sign-in that fell back to a full-page redirect.
  useEffect(() => {
    if (mode === 'forgot') return;
    googleFlow.current = true;
    void (async () => {
      try {
        const [{ firebaseAuth }, auth] = await Promise.all([import('../lib/firebase'), import('firebase/auth')]);
        const result = await auth.getRedirectResult(firebaseAuth());
        if (result) {
          setBusy(true);
          await finishGoogle(result.user, sessionStorage.getItem(CONSENT_KEY) === '1');
          return;
        }
      } catch (err) {
        // Only surface real auth errors; a page that just checked for a redirect shouldn't alarm anyone.
        const code = (err as { code?: string }).code ?? '';
        if (code.startsWith('auth/') && !SILENT_ERRORS.has(code)) setError(friendlyError(code));
      } finally {
        sessionStorage.removeItem(CONSENT_KEY);
        setBusy(false);
      }
      googleFlow.current = false;
      // The session effect was paused while we checked; catch up if already signed in.
      if ($session.get().status === 'user') go($childId.get() ? '/home' : '/profiles');
    })();
  }, [mode]);

  const leave = () => {
    $childId.set('');
    go('/profiles');
  };

  /** Create the family record for first-time Google users once consent is given. */
  async function finishGoogle(user: User, consented: boolean) {
    const [{ firestore }, { doc, getDoc, setDoc }] = await Promise.all([import('../lib/firebase'), import('firebase/firestore')]);
    const ref = doc(firestore(), 'users', user.uid);
    if ((await getDoc(ref)).exists()) return leave();
    if (!consented) {
      setPendingUser(user);
      return;
    }
    await setDoc(ref, {
      email: user.email ?? '',
      displayName: user.displayName ?? '',
      createdAt: Date.now(),
      consentAt: Date.now(),
      provider: 'google',
    });
    leave();
  }

  const google = async () => {
    setError('');
    setBusy(true);
    googleFlow.current = true;
    try {
      localStorage.removeItem('mm:guest');
      const [{ firebaseAuth }, auth] = await Promise.all([import('../lib/firebase'), import('firebase/auth')]);
      const provider = new auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      try {
        const cred = await auth.signInWithPopup(firebaseAuth(), provider);
        await finishGoogle(cred.user, mode === 'signup' && consent);
      } catch (err) {
        const code = (err as { code?: string }).code ?? '';
        if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-environment') {
          if (mode === 'signup' && consent) sessionStorage.setItem(CONSENT_KEY, '1');
          await auth.signInWithRedirect(firebaseAuth(), provider);
          return;
        }
        throw err;
      }
    } catch (err) {
      const code = (err as { code?: string }).code ?? '';
      if (!SILENT_ERRORS.has(code)) setError(friendlyError(code));
      googleFlow.current = false;
    } finally {
      setBusy(false);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (mode === 'signup' && !consent) {
      setError('Please confirm you are a parent or caregiver.');
      return;
    }
    setBusy(true);
    try {
      localStorage.removeItem('mm:guest');
      const [{ firebaseAuth, firestore }, auth] = await Promise.all([import('../lib/firebase'), import('firebase/auth')]);
      if (mode === 'login') {
        await auth.signInWithEmailAndPassword(firebaseAuth(), email.trim(), password);
        // Navigate explicitly: if this page loaded in guest mode, no auth listener is running.
        leave();
      } else if (mode === 'signup') {
        const cred = await auth.createUserWithEmailAndPassword(firebaseAuth(), email.trim(), password);
        await auth.updateProfile(cred.user, { displayName: name.trim() });
        const { doc, setDoc } = await import('firebase/firestore');
        await setDoc(doc(firestore(), 'users', cred.user.uid), {
          email: email.trim(),
          displayName: name.trim(),
          createdAt: Date.now(),
          consentAt: Date.now(),
        });
        leave();
      } else {
        await auth.sendPasswordResetEmail(firebaseAuth(), email.trim());
        setSent(true);
      }
    } catch (err) {
      setError(friendlyError((err as { code?: string }).code ?? ''));
    } finally {
      setBusy(false);
    }
  };

  if (pendingUser)
    return (
      <ConsentStep
        user={pendingUser}
        onAccept={async () => {
          setBusy(true);
          try {
            await finishGoogle(pendingUser, true);
          } catch {
            setError('Could not finish setting up your account. Please try again.');
            setBusy(false);
          }
        }}
        onDecline={async () => {
          setBusy(true);
          // Nothing has been stored yet: remove the just-created sign-in so no account is left behind.
          try {
            await pendingUser.delete();
          } catch {
            const [{ firebaseAuth }, { signOut }] = await Promise.all([import('../lib/firebase'), import('firebase/auth')]);
            await signOut(firebaseAuth());
          }
          go('/');
        }}
        busy={busy}
        error={error}
      />
    );

  const c = copy[mode];
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10" style={{ background: 'var(--grad-hero)' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card w-full max-w-md p-6 sm:p-8">
        <a href="/" className="mb-2 inline-flex min-h-11 items-center gap-1 font-semibold text-ink-soft">
          <ArrowLeft aria-hidden="true" className="size-5" /> Back
        </a>
        <div className="flex justify-center">
          <Mindy size={90} mood={sent ? 'cheer' : 'happy'} />
        </div>
        <h1 className="mt-2 text-center text-3xl font-bold">{c.title}</h1>
        <p className="mt-1 text-center text-ink-soft">{c.subtitle}</p>

        {sent ? (
          <div className="mt-6 rounded-2xl bg-mint-soft p-4 text-center text-mint-ink" role="status">
            <Mail aria-hidden="true" className="mx-auto mb-2 size-8" />
            Check your inbox for a reset link, then come back and log in.
            <div className="mt-4">
              <Button href="/login" tone="teal">
                Back to log in
              </Button>
            </div>
          </div>
        ) : (
          <>
            {mode !== 'forgot' && (
              <>
                <GoogleButton onClick={google} disabled={busy} label={mode === 'signup' ? 'Sign up with Google' : 'Continue with Google'} />
                <div className="my-5 flex items-center gap-3 text-sm font-semibold text-ink-soft" aria-hidden="true">
                  <span className="h-px flex-1 bg-line" />
                  or use your email
                  <span className="h-px flex-1 bg-line" />
                </div>
              </>
            )}
            <form onSubmit={submit} className={mode === 'forgot' ? 'mt-6 grid gap-4' : 'grid gap-4'} noValidate>
              {mode === 'signup' && (
                <Field label="Your name" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} />
              )}
              <Field label="Email" type="email" autoComplete="email" inputMode="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              {mode !== 'forgot' && (
                <Field
                  label="Password"
                  type="password"
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  required
                  minLength={6}
                  hint={mode === 'signup' ? 'At least 6 characters.' : undefined}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              )}
              {mode === 'signup' && (
                <label className="flex items-start gap-3 rounded-2xl bg-bg-2 p-3">
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 size-5" style={{ accentColor: 'var(--violet)' }} />
                  <span className="text-sm">
                    I am a parent or caregiver. I agree to store my children’s check-ins in this account so they can see their progress. I can delete this data at any time.
                  </span>
                </label>
              )}
              {error && (
                <p role="alert" className="rounded-2xl bg-coral-soft p-3 font-semibold text-coral-ink">
                  {error}
                </p>
              )}
              <Button type="submit" variant="gradient" size="lg" block disabled={busy}>
                {busy ? 'Please wait…' : c.cta}
              </Button>
            </form>
          </>
        )}

        <div className="mt-6 grid gap-2 text-center text-sm">
          {mode === 'login' && (
            <>
              <a href="/forgot" className="font-semibold text-violet underline-offset-4 hover:underline">
                Forgot your password?
              </a>
              <span className="text-ink-soft">
                New here?{' '}
                <a href="/signup" className="font-semibold text-violet underline-offset-4 hover:underline">
                  Create an account
                </a>
              </span>
            </>
          )}
          {mode === 'signup' && (
            <span className="text-ink-soft">
              Already have an account?{' '}
              <a href="/login" className="font-semibold text-violet underline-offset-4 hover:underline">
                Log in
              </a>
            </span>
          )}
        </div>
      </motion.div>
    </main>
  );
}

/** Google-branded button: white surface, grey outline, multicolour "G" (per Google's sign-in guidelines). */
function GoogleButton({ onClick, disabled, label }: { onClick: () => void; disabled: boolean; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl border-2 border-[#dadce0] bg-white px-5 font-display text-lg font-semibold text-[#1f1f1f] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#f8f9fa] disabled:pointer-events-none disabled:opacity-60"
    >
      <svg aria-hidden="true" viewBox="0 0 48 48" className="size-6">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
      </svg>
      {label}
    </button>
  );
}

/** First Google sign-in: confirm the account holder is a parent or caregiver before storing anything. */
function ConsentStep({
  user,
  onAccept,
  onDecline,
  busy,
  error,
}: {
  user: User;
  onAccept: () => void;
  onDecline: () => void;
  busy: boolean;
  error: string;
}) {
  const [agreed, setAgreed] = useState(false);
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10" style={{ background: 'var(--grad-hero)' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card w-full max-w-md p-6 sm:p-8">
        <div className="flex justify-center">
          <Mindy size={90} mood="happy" />
        </div>
        <h1 className="mt-2 text-center text-3xl font-bold">Welcome{user.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}!</h1>
        <p className="mt-1 text-center text-ink-soft">One quick step to set up your family account{user.email ? ` for ${user.email}` : ''}.</p>
        <label className="mt-6 flex items-start gap-3 rounded-2xl bg-bg-2 p-4">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 size-5" style={{ accentColor: 'var(--violet)' }} />
          <span className="text-sm">
            I am a parent or caregiver. I agree to store my children’s check-ins in this account so they can see their progress. I can delete this data at any time.
          </span>
        </label>
        {error && (
          <p role="alert" className="mt-4 rounded-2xl bg-coral-soft p-3 font-semibold text-coral-ink">
            {error}
          </p>
        )}
        <div className="mt-6 grid gap-3">
          <Button variant="gradient" size="lg" block icon={ShieldCheck} disabled={!agreed || busy} onClick={onAccept}>
            {busy ? 'Please wait…' : 'Continue'}
          </Button>
          <Button variant="ghost" block disabled={busy} onClick={onDecline}>
            Cancel and go back
          </Button>
        </div>
      </motion.div>
    </main>
  );
}

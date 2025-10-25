import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login, register } = useAuth();

  const [mode, setMode] = useState('login');
  const [formValues, setFormValues] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/lobby', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await login(formValues.email, formValues.password);
      } else {
        await register(formValues.email, formValues.password);
      }
      const redirectPath = location.state?.from?.pathname || '/lobby';
      navigate(redirectPath, { replace: true });
    } catch (submitError) {
      setError(submitError.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page auth-page">
      <section className="auth-card">
        <div className="auth-card__header">
          <h1>{mode === 'login' ? 'Welcome Back' : 'Create Your Demo Account'}</h1>
          <p>
            {mode === 'login'
              ? 'Log in to resume torching your fictional retirement tokens.'
              : 'Register to receive a fully fake 401k and play Blackjack.'}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={formValues.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={formValues.password}
            minLength={8}
            onChange={handleChange}
            required
          />

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="cta-button cta-button--primary" disabled={isSubmitting}>
            {isSubmitting ? 'Processing…' : mode === 'login' ? 'Log in' : 'Register'}
          </button>
        </form>

        <p className="auth-card__switch">
          {mode === 'login' ? (
            <>
              Need an account?{' '}
              <button type="button" onClick={() => setMode('register')}>
                Register instead
              </button>
            </>
          ) : (
            <>
              Already registered?{' '}
              <button type="button" onClick={() => setMode('login')}>
                Log in instead
              </button>
            </>
          )}
        </p>

        <div className="auth-card__footer">
          <p>
            By proceeding you agree that this is 100% satire and no actual financial products are
            provided. Seriously.
          </p>
          <Link to="/">Back to overview</Link>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;

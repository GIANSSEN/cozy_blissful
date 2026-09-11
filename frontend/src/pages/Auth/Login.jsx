import React from 'react';
import AuthPortal from './AuthPortal';

/**
 * Login component
 * Delegates to the unified AuthPortal with 'login' as the active initial tab.
 * Provides complete visual continuity with the landing page design language.
 */
export default function Login() {
  return <AuthPortal initialTab="login" />;
}

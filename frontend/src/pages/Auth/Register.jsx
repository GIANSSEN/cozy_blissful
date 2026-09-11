import React from 'react';
import AuthPortal from './AuthPortal';

/**
 * Register component
 * Delegates to the unified AuthPortal with 'register' as the active initial tab.
 * Provides complete visual continuity with the landing page design language.
 */
export default function Register() {
  return <AuthPortal initialTab="register" />;
}

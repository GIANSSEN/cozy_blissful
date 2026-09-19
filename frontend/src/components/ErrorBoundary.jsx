import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    const role = localStorage.getItem('role') || '';
    const dashboardRoutes = {
      admin: '/admin/dashboard',
      staff: '/staff/dashboard',
      therapist: '/therapist/dashboard',
      client: '/client/dashboard',
    };
    window.location.href = dashboardRoutes[role] || '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#080d17] text-[#e2eaf4]">
          <div className="max-w-md w-full bg-[#111827] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold tracking-tight mb-2">Something unexpected happened</h2>
            <p className="text-sm text-slate-400 mb-6">
              We encountered an issue rendering this section. You can refresh or return to the main dashboard.
            </p>
            {this.state.error && (
              <div className="text-left bg-black/40 border border-white/5 rounded-xl p-3 mb-6 max-h-32 overflow-y-auto text-xs font-mono text-rose-300/80">
                {this.state.error.toString()}
              </div>
            )}
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reload Page
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

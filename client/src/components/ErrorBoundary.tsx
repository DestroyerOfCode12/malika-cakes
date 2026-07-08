import React from 'react';
import Logo from './Logo';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Unhandled UI error:', error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 text-center">
          <div className="text-6xl mb-4 animate-pop">🧁</div>
          <Logo variant="stacked" className="mb-6 scale-90" />
          <h1 className="text-2xl font-bold text-charcoal mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-8 max-w-md">
            We hit an unexpected snag. Your order details weren't lost — try heading back home.
          </p>
          <button onClick={this.handleReload} className="btn-primary">
            Back to Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

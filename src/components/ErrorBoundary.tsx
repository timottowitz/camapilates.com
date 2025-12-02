import React from 'react';

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: any };

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    try { 
      console.error('UI ErrorBoundary caught:', error?.message || error, error?.stack);
      console.error('Component stack:', info?.componentStack);
    } catch {}
  }
  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || String(this.state.error);
      return (
        <div className="min-h-screen grid place-content-center p-6 text-center text-sm text-muted-foreground">
          <div>
            <h1 className="text-lg font-semibold text-foreground mb-2">Ocurrió un error</h1>
            <p className="mb-4">Intenta recargar la página o volver al inicio.</p>
            <details className="text-xs text-left mb-4 max-w-md mx-auto">
              <summary className="cursor-pointer text-gray-500">Detalles del error</summary>
              <pre className="bg-gray-100 p-2 mt-2 overflow-auto rounded whitespace-pre-wrap">
                {errorMessage}
              </pre>
            </details>
            <div className="flex gap-3 justify-center">
              <a href={typeof window !== 'undefined' ? window.location.href : '/'} className="px-3 py-2 rounded-md border border-border">Recargar</a>
              <a href="/" className="px-3 py-2 rounded-md bg-primary text-primary-foreground">Inicio</a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;


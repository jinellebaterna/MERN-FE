import React from "react";
import Card from "../card/card";
import Button from "../button/button";
import "./errorBoundary.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <Card className="error-boundary__card">
            <h2>Something went wrong.</h2>
            <p>
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <div className="error-boundary__actions">
              <Button onClick={this.handleReset}>Try Again</Button>
              <Button href="/" inverse>
                Go Home
              </Button>
            </div>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

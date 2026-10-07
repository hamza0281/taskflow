import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }

  reload = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="loader-wrap">
        <div>
          <h2>Something went wrong</h2>
          <p style={{ color: "var(--muted)", margin: "8px 0 16px" }}>Please reload the page.</p>
          <button onClick={this.reload}>Reload TaskFlow</button>
        </div>
      </div>
    );
  }
}
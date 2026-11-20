import { Component, type ErrorInfo, type ReactNode } from "react";
import { BrandMark } from "@/ui/Brand";

interface State {
  hasError: boolean;
  message?: string;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[app] boundary", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="app-shell">
        <div className="screen screen--center">
          <div className="content content--narrow glass panel text-center">
            <BrandMark height={24} className="mx-auto" />
            <h1 className="h2 mt-6">Tín hiệu bị nhiễu</h1>
            <p className="body mt-3">
              Có một lỗi nhỏ khiến hành trình dừng lại. Tiến trình của bạn vẫn được lưu trên thiết bị.
            </p>
            <button className="btn btn-primary btn-block mt-6" onClick={() => window.location.reload()}>
              Tải lại hành trình
            </button>
            <p className="small mt-4">{this.state.message}</p>
          </div>
        </div>
      </div>
    );
  }
}

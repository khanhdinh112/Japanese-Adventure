'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  /** Đổi giá trị này (ví dụ khi đổi màn hình) thì lỗi cũ được xoá và thử vẽ lại */
  resetKey: string;
  onHome: () => void;
  children: ReactNode;
}

/** Bắt lỗi khi vẽ một màn hình: thay vì trắng trang, hiện thông báo thân thiện, ghi lỗi ra console và cho thử lại. */
export class ErrorBoundary extends Component<Props, { error: Error | null; key: string }> {
  state = { error: null as Error | null, key: this.props.resetKey };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  static getDerivedStateFromProps(props: Props, state: { error: Error | null; key: string }) {
    return props.resetKey !== state.key ? { error: null, key: props.resetKey } : null;
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    console.error('[Japanese Adventure] Lỗi hiển thị màn hình:', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div className="err-screen" role="alert">
        <div className="err-card paper">
          <div className="err-ic" aria-hidden>
            🍃
          </div>
          <h2>Ôi, có chút trục trặc rồi</h2>
          <p>Màn hình này chưa mở được. Tiến trình của bé vẫn an toàn.</p>
          <pre className="err-msg">{error.message}</pre>
          <div className="err-actions">
            <button type="button" className="btn btn-ghost" onClick={() => this.setState({ error: null })}>
              Thử lại
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                this.setState({ error: null });
                this.props.onHome();
              }}
            >
              Về màn hình chính
            </button>
          </div>
        </div>
      </div>
    );
  }
}

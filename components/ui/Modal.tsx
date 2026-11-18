'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  title?: string;
  onClose: () => void;
  children: ReactNode;
  width?: number;
  tone?: 'paper' | 'night';
  footer?: ReactNode;
}

export function Modal({ title, onClose, children, width = 760, tone = 'paper', footer }: Props) {
  // Hiện ở gốc khung game (không nằm trong thanh trên cùng), để nền mờ luôn phủ kín cả màn hình.
  const [host, setHost] = useState<Element | null>(null);
  useEffect(() => setHost(document.querySelector('.stage-canvas')), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  if (!host) return null;
  return createPortal(
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal modal-${tone}`} style={{ width }} role="dialog" aria-modal="true" aria-label={title}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Đóng">
          ✕
        </button>
        {title && <h2 className="modal-title">{title}</h2>}
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>,
    host,
  );
}

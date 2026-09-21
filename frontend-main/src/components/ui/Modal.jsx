import React from "react";
import '../../styles/ui.css';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="orbit-modal-overlay" onClick={onClose}>
      <div className="orbit-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="orbit-modal-header">
          <h3 className="orbit-heading-3" style={{ margin: 0 }}>{title}</h3>
          <button className="orbit-icon-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>
        <div className="orbit-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;

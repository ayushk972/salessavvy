// CustomModal — used by AdminPage for all 8 card actions
// Props: isOpen, onClose, title, children, size ("sm"|"md"|"lg")

const CustomModal = ({ isOpen, onClose, title, children, size = "md" }) => {
  if (!isOpen) return null;

  return (
    <div className="cm-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`cm-panel cm-${size}`}>
        {/* Header */}
        <div className="cm-header">
          <h3 className="cm-title">{title}</h3>
          <button className="cm-close" onClick={onClose}>✕</button>
        </div>
        {/* Body */}
        <div className="cm-body">{children}</div>
      </div>
    </div>
  );
};

export default CustomModal;

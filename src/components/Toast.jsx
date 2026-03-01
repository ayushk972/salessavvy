const Toast = ({ msg, show }) => {
  return (
    <div className={`toast ${show ? "show" : ""}`}>
      <span className="t-icon">✓</span> {msg}
    </div>
  );
};

export default Toast;

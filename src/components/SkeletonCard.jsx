const SkeletonCard = () => {
  return (
    <div className="skeleton-card">
      <div className="skel-img skeleton" />
      <div className="skel-body">
        <div className="skel-line w40 skeleton" />
        <div className="skel-line w80 skeleton" />
        <div className="skel-line w60 skeleton" />
        <div
          className="skel-line skeleton"
          style={{ height: 36, borderRadius: 10 }}
        />
      </div>
    </div>
  );
};

export default SkeletonCard;

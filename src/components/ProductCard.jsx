const CATEGORY_LABELS = [
  "Shirts",
  "Pants",
  "Accessories",
  "Mobiles",
  "Mobile Accessories",
];

const ProductCard = ({ product, onAddToCart, isAdding, isAdded }) => {
  const categoryLabel =
    CATEGORY_LABELS[product.productId % CATEGORY_LABELS.length] ?? "Product";

  return (
    <div className="card">
      {/* Product Image */}
      <div className="card-img">
        {product.images && product.images.length > 0 ? (
          <>
            <img
              src={product.images[0]}
              alt={product.name}
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
            <span className="placeholder" style={{ display: "none" }}>
              🛍️
            </span>
          </>
        ) : (
          <span className="placeholder">🛍️</span>
        )}
      </div>

      {/* Card Body */}
      <div className="card-body">
        <div className="card-cat">{categoryLabel}</div>
        <div className="card-name">{product.name}</div>
        <div className="card-desc">{product.description}</div>

        <div className="card-row">
          <div className="card-price">
            ${Number(product.price).toFixed(2)}
          </div>
          <div className={`card-stock ${product.stock < 10 ? "low" : ""}`}>
            {product.stock === 0
              ? "Out of Stock"
              : product.stock < 10
              ? `Only ${product.stock} left!`
              : `In stock: ${product.stock}`}
          </div>
        </div>

        <button
          className={`add-btn ${isAdded ? "added" : ""}`}
          onClick={() => onAddToCart(product)}
          disabled={isAdding || product.stock === 0}
        >
          {isAdding
            ? "Adding…"
            : isAdded
            ? "✓ Added!"
            : product.stock === 0
            ? "Out of Stock"
            : "＋ Add to Cart"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

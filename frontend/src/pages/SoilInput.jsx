import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateRequired, validateNumeric, validateRange } from '../utils/validation';
import { mlService } from '../services/mlService';
import { productService } from '../services/productService';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './SoilInput.css';

const SoilInput = () => {
  const [formData, setFormData] = useState({
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    ph: '',
    temperature: '',
    humidity: '',
    rainfall: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const inputFields = [
    { name: 'nitrogen', label: 'Nitrogen (N)', range: '0-300 ppm', placeholder: '50 (Mango optimal)', icon: '🧪', min: 0, max: 300 },
    { name: 'phosphorus', label: 'Phosphorus (P)', range: '5-300 ppm', placeholder: '25 (Low-Moderate)', icon: '⚗️', min: 5, max: 300 },
    { name: 'potassium', label: 'Potassium (K)', range: '5-400 ppm', placeholder: '50 (Moderate)', icon: '🔬', min: 5, max: 400 },
    { name: 'ph', label: 'pH Level', range: '3.5-10.0', placeholder: '6.5 (Optimal)', icon: '📊', min: 3.5, max: 10 },
    { name: 'temperature', label: 'Temperature', range: '8-55°C', placeholder: '30 (Tropical)', icon: '🌡️', min: 8, max: 55 },
    { name: 'humidity', label: 'Humidity', range: '14-100%', placeholder: '65 (Moderate)', icon: '💧', min: 14, max: 100 },
    { name: 'rainfall', label: 'Rainfall', range: '20-2000 mm', placeholder: '150 (Optimal)', icon: '🌧️', min: 20, max: 2000 },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    inputFields.forEach((field) => {
      const value = formData[field.name];
      const error = validateRequired(value) || validateNumeric(value) || validateRange(value, field.min, field.max);
      if (error) newErrors[field.name] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setAnalysis(null);

    if (!validate()) return;

    setLoading(true);
    setRelatedProducts([]);

    try {
      const submitData = {
        nitrogen: parseFloat(formData.nitrogen),
        phosphorus: parseFloat(formData.phosphorus),
        potassium: parseFloat(formData.potassium),
        ph: parseFloat(formData.ph),
        temperature: parseFloat(formData.temperature),
        humidity: parseFloat(formData.humidity),
        rainfall: parseFloat(formData.rainfall),
      };

      const result = await mlService.hybridAnalyze(submitData);
      setAnalysis(result);
      fetchRelatedProducts(result);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.response?.status === 422 ? 'Invalid input data. Please check ranges.' : 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (analysisResult) => {
    if (!analysisResult) return;
    setProductsLoading(true);
    try {
      const cropNames = [];
      if (analysisResult.crop_recommendation?.recommended_crop) {
        cropNames.push(analysisResult.crop_recommendation.recommended_crop);
      }
      if (analysisResult.crop_recommendation?.alternatives) {
        analysisResult.crop_recommendation.alternatives.forEach((alt) => {
          if (alt.crop && !cropNames.includes(alt.crop)) cropNames.push(alt.crop);
        });
      }
      if (cropNames.length > 0) {
        const products = await productService.searchByMultipleCrops(cropNames, 12);
        setRelatedProducts(products);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  const addToCart = (product) => {
    if (!user) { navigate('/login'); return; }
    const cartKey = `cart_${user.id}`;
    const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
    const existing = cart.find((item) => item.id === product.id);
    if (existing) existing.quantity += 1;
    else cart.push({ ...product, quantity: 1 });
    localStorage.setItem(cartKey, JSON.stringify(cart));
    navigate('/cart');
  };

  const getCategoryIcon = (category) => {
    const icons = { seeds: '🌱', crops: '🌾', fertilizers: '🧪', tools: '🔧' };
    return icons[category] || '📦';
  };

  const getScoreClass = (score) => {
    if (score >= 80) return 'soil-score-green';
    if (score >= 60) return 'soil-score-blue';
    if (score >= 40) return 'soil-score-yellow';
    return 'soil-score-red';
  };

  const getQualityClass = (quality) => {
    const classes = {
      'Excellent': 'soil-quality-excellent',
      'Good': 'soil-quality-good',
      'Moderate': 'soil-quality-moderate',
      'Fair': 'soil-quality-fair',
      'Poor': 'soil-quality-poor',
    };
    return classes[quality] || 'soil-quality-moderate';
  };

  return (
    <div className="soil-page">
      <Navbar />

      {/* Hero */}
      <section className="soil-hero">
        <div className="soil-hero-bg" />
        <div className="soil-hero-glow" />

        <div className="soil-hero-content">
          <div className="soil-badge">
            <span className="soil-badge-dot">
              <span className="soil-badge-ping"></span>
              <span className="soil-badge-inner"></span>
            </span>
            AI-Powered Analysis
          </div>
          <h1 className="soil-title">
            Soil <span className="soil-title-gradient">Analysis</span>
          </h1>
          <p className="soil-subtitle">
            Enter your soil parameters for AI-powered soil classification and crop recommendations
          </p>
        </div>
      </section>

      <div className="soil-container">
        {!analysis ? (
          /* Input Form */
          <div className="soil-form-card">
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="soil-error">
                  <span>⚠️</span> {error}
                </div>
              )}

              <div className="soil-form-grid">
                {inputFields.map((field) => (
                  <div key={field.name} className={field.name === 'rainfall' ? 'soil-form-field-full' : 'soil-form-field'}>
                    <label className="soil-label">
                      <span className="soil-label-icon">{field.icon}</span>
                      <span>{field.label}</span>
                      <span className="soil-label-range">({field.range})</span>
                    </label>
                    <input
                      type="number"
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      step="0.1"
                      className={`soil-input ${errors[field.name] ? 'soil-input-error' : ''}`}
                    />
                    {errors[field.name] && <p className="soil-field-error">{errors[field.name]}</p>}
                  </div>
                ))}
              </div>

              <button type="submit" disabled={loading} className="soil-submit-btn">
                {loading ? (
                  <>
                    <div className="soil-spinner" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <span>🔬</span>
                    <span>Run AI Analysis</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Results */
          <div className="soil-results">
            {/* Overall Score Card */}
            <div className="soil-score-card">
              <div className="soil-score-grid">
                {/* Final Score */}
                <div className="soil-score-item">
                  <div className={`soil-score-value ${getScoreClass(analysis.final_score)}`}>
                    {analysis.final_score?.toFixed(0)}%
                  </div>
                  <p className="soil-score-label">Overall Score</p>
                  <div className={`soil-quality-badge ${getQualityClass(analysis.recommendation_quality)}`}>
                    {analysis.recommendation_quality}
                  </div>
                </div>

                {/* Soil Type */}
                <div className="soil-score-item soil-score-item-bordered">
                  <div className="soil-type-icon soil-type-icon-soil">🌍</div>
                  <h3 className="soil-type-name">{analysis.soil_analysis?.predicted_type}</h3>
                  <p className="soil-type-label">Detected Soil Type</p>
                  <p className="soil-type-confidence">{analysis.soil_analysis?.confidence?.toFixed(1)}% confidence</p>
                </div>

                {/* Recommended Crop */}
                <div className="soil-score-item">
                  <div className="soil-type-icon soil-type-icon-crop">🌾</div>
                  <h3 className="soil-type-name">{analysis.crop_recommendation?.recommended_crop}</h3>
                  <p className="soil-type-label">Recommended Crop</p>
                  <p className="soil-type-confidence">{analysis.crop_recommendation?.ml_confidence?.toFixed(1)}% match</p>
                  {analysis.crop_recommendation?.original_ml_prediction && (
                    <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                      ✅ Better than ML's: {analysis.crop_recommendation.original_ml_prediction}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Detailed Results Grid */}
            <div className="soil-detail-grid">
              {/* Validation Scores */}
              <div className="soil-detail-card">
                <h3 className="soil-detail-title">
                  <span>📊</span> Validation Scores
                </h3>
                <div className="soil-progress-list">
                  {[
                    { label: 'ML Confidence', value: analysis.crop_recommendation?.ml_confidence },
                    { label: 'Rule Validation', value: analysis.rule_validation?.validation_score },
                    { label: 'Final Score', value: analysis.final_score },
                  ].map((item, i) => (
                    <div key={i} className="soil-progress-item">
                      <div className="soil-progress-header">
                        <span className="soil-progress-label">{item.label}</span>
                        <span className={getScoreClass(item.value)}>{item.value?.toFixed(1)}%</span>
                      </div>
                      <div className="soil-progress-track">
                        <div className="soil-progress-fill" style={{ width: `${item.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggestions & Notes */}
              <div className="soil-detail-card">
                <h3 className="soil-detail-title">
                  <span>💡</span> Insights & Suggestions
                </h3>
                {analysis.suggestions?.length > 0 ? (
                  <div className="soil-warning-list">
                    {analysis.suggestions.map((suggestion, i) => (
                      <div key={i} className="soil-success-item">{suggestion}</div>
                    ))}
                  </div>
                ) : (
                  <div className="soil-success-item">
                    ✅ All conditions are optimal for the recommended crop
                  </div>
                )}
                {analysis.warnings?.length > 0 && (
                  <div className="soil-warning-list" style={{ marginTop: '1rem' }}>
                    <p style={{ color: '#f97316', fontWeight: 600, marginBottom: '0.5rem' }}>⚠️ Minor Warnings:</p>
                    {analysis.warnings.map((warning, i) => (
                      <div key={i} className="soil-warning-item">{warning}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Soil Probabilities */}
            <div className="soil-detail-card">
              <h3 className="soil-detail-title">
                <span>🌍</span> Soil Type Probabilities
              </h3>
              <div className="soil-prob-grid">
                {Object.entries(analysis.soil_analysis?.all_probabilities || {})
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 6)
                  .map(([soil, prob]) => (
                    <div key={soil} className="soil-prob-card">
                      <div className="soil-prob-value">{prob.toFixed(0)}%</div>
                      <div className="soil-prob-name">{soil}</div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Related Products */}
            {(relatedProducts.length > 0 || productsLoading) && (
              <div className="soil-detail-card">
                <h3 className="soil-detail-title">
                  <span>🛒</span> Recommended Products
                </h3>
                <p className="soil-products-subtitle">
                  Products related to <strong>{analysis.crop_recommendation?.recommended_crop}</strong> across all categories
                </p>
                {productsLoading ? (
                  <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                    <div className="soil-spinner" style={{ margin: '0 auto 1rem' }} />
                    Searching for related products...
                  </div>
                ) : (
                  <div className="soil-products-grid">
                    {relatedProducts.map((product) => (
                      <div key={product.id} className="soil-product-card">
                        <div className="soil-product-content">
                          <div className="soil-product-icon">{getCategoryIcon(product.category)}</div>
                          <div className="soil-product-info">
                            <h4 className="soil-product-name">{product.name}</h4>
                            <span className="soil-product-badge">{product.category}</span>
                            <div className="soil-product-footer">
                              <span className="soil-product-price">₹{product.price}</span>
                              <button onClick={() => addToCart(product)} className="soil-product-add-btn">
                                🛒 Add to Cart
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* New Analysis Button */}
            <div className="soil-action-center">
              <button
                onClick={() => { setAnalysis(null); setRelatedProducts([]); }}
                className="soil-new-btn"
              >
                🔄 Run New Analysis
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SoilInput;

import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './LegalPage.css';

const TermsOfService = () => {
    return (
        <div className="legal-page">
            <Navbar />
            <div className="legal-container">
                <div className="legal-header">
                    <h1 className="legal-title">Terms of <span className="legal-title-gradient">Service</span></h1>
                    <p className="legal-updated">Last updated: March 4, 2026</p>
                </div>

                <div className="legal-content">
                    <section className="legal-section">
                        <h2>1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using Agri-Soil AI ("the Service"), you agree to be bound by these Terms of Service.
                            If you do not agree with any part of these terms, you may not access the Service.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>2. Description of Service</h2>
                        <p>
                            Agri-Soil AI provides AI-powered soil analysis, crop recommendation services, and an integrated
                            agricultural marketplace. Our hybrid intelligence system combines machine learning predictions with
                            agricultural rule validation to provide crop and soil recommendations for farmers,
                            primarily focused on Kerala, India.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>3. User Accounts</h2>
                        <ul>
                            <li>You must provide accurate and complete information when creating an account.</li>
                            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                            <li>You must notify us immediately of any unauthorized use of your account.</li>
                            <li>You must be at least 18 years old to create an account.</li>
                        </ul>
                    </section>

                    <section className="legal-section">
                        <h2>4. AI Recommendations Disclaimer</h2>
                        <p>
                            The soil analysis and crop recommendations provided by Agri-Soil AI are generated using machine
                            learning models and rule-based validation. These recommendations are intended as guidance only
                            and should not be considered as professional agricultural advice. Results may vary based on
                            actual field conditions, and we recommend consulting with local agricultural experts before
                            making farming decisions.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>5. Marketplace &amp; Purchases</h2>
                        <ul>
                            <li>All product prices are listed in Indian Rupees (₹) and are subject to change.</li>
                            <li>Orders are subject to product availability.</li>
                            <li>We reserve the right to refuse or cancel any order at our discretion.</li>
                            <li>Delivery timelines are estimates and may vary depending on location and availability.</li>
                        </ul>
                    </section>

                    <section className="legal-section">
                        <h2>6. Intellectual Property</h2>
                        <p>
                            All content, features, and functionality of the Service — including but not limited to text,
                            graphics, logos, ML models, and software — are the exclusive property of Agri-Soil AI and
                            are protected by intellectual property laws.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>7. Limitation of Liability</h2>
                        <p>
                            Agri-Soil AI shall not be liable for any indirect, incidental, special, consequential, or
                            punitive damages arising out of or relating to your use of the Service, including but not
                            limited to crop loss, financial loss, or any damages resulting from reliance on AI-generated
                            recommendations.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>8. Modifications to Terms</h2>
                        <p>
                            We reserve the right to modify these terms at any time. Changes will be effective immediately
                            upon posting. Your continued use of the Service after changes constitutes acceptance of the
                            modified terms.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>9. Contact Us</h2>
                        <p>
                            If you have any questions about these Terms of Service, please contact us at{' '}
                            <a href="mailto:support@agrisoilai.com" className="legal-link">support@agrisoilai.com</a>.
                        </p>
                    </section>
                </div>

                <div className="legal-footer">
                    <Link to="/" className="legal-back-btn">← Back to Home</Link>
                    <Link to="/privacy" className="legal-nav-link">Privacy Policy →</Link>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;

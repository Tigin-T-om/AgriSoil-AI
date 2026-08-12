import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './LegalPage.css';

const PrivacyPolicy = () => {
    return (
        <div className="legal-page">
            <Navbar />
            <div className="legal-container">
                <div className="legal-header">
                    <h1 className="legal-title">Privacy <span className="legal-title-gradient">Policy</span></h1>
                    <p className="legal-updated">Last updated: March 4, 2026</p>
                </div>

                <div className="legal-content">
                    <section className="legal-section">
                        <h2>1. Information We Collect</h2>
                        <p>We collect the following types of information when you use Agri-Soil AI:</p>
                        <ul>
                            <li><strong>Account Information:</strong> Name, email address, and password when you register.</li>
                            <li><strong>Soil Analysis Data:</strong> Soil parameters you input such as nitrogen, phosphorus, potassium, pH, temperature, humidity, and rainfall values.</li>
                            <li><strong>Order Information:</strong> Shipping address, contact number, and payment details when you make purchases.</li>
                            <li><strong>Usage Data:</strong> How you interact with the platform, including pages visited and features used.</li>
                        </ul>
                    </section>

                    <section className="legal-section">
                        <h2>2. How We Use Your Information</h2>
                        <ul>
                            <li>To provide AI-powered soil analysis and crop recommendations.</li>
                            <li>To process and deliver your marketplace orders.</li>
                            <li>To improve our machine learning models and recommendation accuracy.</li>
                            <li>To communicate with you about your account, orders, and service updates.</li>
                            <li>To ensure the security and integrity of the platform.</li>
                        </ul>
                    </section>

                    <section className="legal-section">
                        <h2>3. Data Storage &amp; Security</h2>
                        <p>
                            Your data is stored securely using industry-standard encryption. Soil analysis data and
                            personal information are stored in encrypted databases. We implement appropriate technical
                            and organizational measures to protect your personal data against unauthorized access,
                            alteration, disclosure, or destruction.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>4. Soil Analysis Data</h2>
                        <p>
                            Soil parameters you submit for analysis may be used anonymously to improve our AI models.
                            This data is aggregated and cannot be traced back to individual users. We do not share
                            your raw soil analysis data with third parties.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>5. Cookies &amp; Tracking</h2>
                        <p>
                            We use essential cookies to maintain your session and authentication state. We do not use
                            third-party advertising cookies. Analytics cookies may be used to understand how users
                            interact with our service, helping us improve the user experience.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>6. Third-Party Services</h2>
                        <p>
                            We may use third-party services for authentication (such as social login providers).
                            These services have their own privacy policies, and we encourage you to review them.
                            We do not sell your personal information to third parties.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>7. Your Rights</h2>
                        <ul>
                            <li><strong>Access:</strong> You can request a copy of the personal data we hold about you.</li>
                            <li><strong>Correction:</strong> You can update or correct your personal information at any time.</li>
                            <li><strong>Deletion:</strong> You can request deletion of your account and associated data.</li>
                            <li><strong>Portability:</strong> You can request your data in a portable format.</li>
                        </ul>
                    </section>

                    <section className="legal-section">
                        <h2>8. Data Retention</h2>
                        <p>
                            We retain your personal data for as long as your account is active. Order information is
                            retained for a minimum of 3 years for legal and accounting purposes. You may request
                            deletion of your data at any time by contacting us.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>9. Changes to This Policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time. We will notify you of significant
                            changes via email or through a notice on our platform. Your continued use of the Service
                            after changes constitutes acceptance of the updated policy.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>10. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy or how we handle your data, please
                            contact us at{' '}
                            <a href="mailto:privacy@agrisoilai.com" className="legal-link">privacy@agrisoilai.com</a>.
                        </p>
                    </section>
                </div>

                <div className="legal-footer">
                    <Link to="/" className="legal-back-btn">← Back to Home</Link>
                    <Link to="/terms" className="legal-nav-link">Terms of Service →</Link>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user || !user.is_admin) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminRoute;

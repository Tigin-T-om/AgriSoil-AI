import { Navigate } from 'react-router-dom';

const DeliveryRoute = ({ children }) => {
    const staffStr = localStorage.getItem('delivery_staff');
    const token = localStorage.getItem('access_token');

    if (!token || !staffStr) {
        return <Navigate to="/delivery/login" replace />;
    }

    try {
        const staff = JSON.parse(staffStr);
        if (!staff || !staff.id) {
            return <Navigate to="/delivery/login" replace />;
        }
    } catch {
        return <Navigate to="/delivery/login" replace />;
    }

    return children;
};

export default DeliveryRoute;

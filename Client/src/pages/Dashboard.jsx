import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase/config';
import axios from 'axios';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LogoutIcon from '@mui/icons-material/Logout';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

// Add the axios instance at the top of the file, after imports
// const api = axios.create({
//     baseURL: 'http://localhost:5000/api',
//     withCredentials: true,
//     headers: {
//         'Content-Type': 'application/json'
//     }
// });

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [userStatus, setUserStatus] = useState(null);
    const [latestReport, setLatestReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAssessmentSuccess, setShowAssessmentSuccess] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Create axios instance


   
const API_URL = 'http://localhost:5000/api'; // change to your backend URL

const fetchLatestReport = async () => {
    try {
        setLoading(true);

        const user = auth.currentUser;
        if (!user) {
            throw new Error('User not authenticated');
        }

        const idToken = localStorage.getItem('authToken');

        const response = await axios({
            method: 'get',
            url: `${API_URL}/reports/latest`,
            headers: {
                'Authorization': `Bearer ${idToken}`,
                'Content-Type': 'application/json'
            }
            // No `params` or `data` needed since backend gets user from token
        });

        console.log('Report response:', response.data);
        setLatestReport(response.data);
        if(response.data.error === 'No reports found') {
            setLatestReport(null);
        }
        setError(null);

    } catch (error) {
        console.error('Error fetching latest report:', error);

        if (axios.isAxiosError(error)) {
            const status = error.response?.status;

            if (status === 401) {
                setError('Authentication failed. Please log in again.');
            } else if (status === 404) {
                setLatestReport(null); // No report available
            } else {
                setError('Something went wrong. Please try again later.');
            }

            console.error('Response:', error.response?.data);
        } else {
            setError('Unexpected error occurred.');
        }
    } finally {
        setLoading(false);
    }
};
    
    

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
            if (firebaseUser) {
                setUser({
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    uid: firebaseUser.uid
                });

                try {
                    // Get fresh token and fetch report
                    const token = await firebaseUser.getIdToken(true);
                    await fetchLatestReport(token);
                } catch (error) {
                    console.error('Error getting token:', error);
                    setError('Authentication error');
                    setLoading(false);
                }
            } else {
                navigate('/login');
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    useEffect(() => {
        if (location.state?.userInfo?.isExisting !== undefined) {
            setUserStatus(location.state.userInfo.isExisting);
            if (location.state.userInfo.isExisting === 0) {
                navigate('/health-assessment');
            }
        }
    }, [location, navigate]);

    useEffect(() => {
        if (location.state?.assessmentCompleted) {
            setShowAssessmentSuccess(true);
            // Refresh the latest report after new assessment
            const refreshReport = async () => {
                const token = await auth.currentUser?.getIdToken();
                if (token) {
                    await fetchLatestReport(token);
                }
            };
            refreshReport();

            const timer = setTimeout(() => {
                setShowAssessmentSuccess(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [location]);

    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate('/login');
        } catch (error) {
            console.error('Error logging out:', error);
            setError('Failed to log out');
        }
    };

    const handleStartTest = () => {
        navigate('/health-assessment');
    };

    if (!user) {
        return null;
    }

    const renderPredictionCard = () => (
        <div className="col-span-2 bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-2xl font-bold mb-4">Latest Heart Health Assessment</h2>
            {loading ? (
                <div className="flex items-center justify-center p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : error ? (
                <div className="text-red-600 p-4 text-center">
                    <p>{error}</p>
                    <button
                        onClick={() => fetchLatestReport(auth.currentUser?.getIdToken())}
                        className="mt-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            ) : (
                renderAssessmentResults()
            )}
        </div>
    );

    const renderAssessmentResults = () => {
        if (!latestReport) {
            return (
                <div className="text-gray-500 p-4 text-center">
                    <p className="mb-4">No assessment results available yet.</p>
                    <button
                        onClick={handleStartTest}
                        className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Take Your First Assessment
                    </button>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                <div className={`p-4 rounded-lg ${
                    latestReport.prediction.result === "Heart Disease exists" 
                        ? "bg-red-100 text-red-700" 
                        : "bg-green-100 text-green-700"
                }`}>
                    <h3 className="text-xl font-semibold">
                        {latestReport.prediction.result}
                    </h3>
                    <p>Confidence: {latestReport.prediction.confidence}</p>
                </div>

                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={[
                            { name: 'BP', value: latestReport.vitals.bloodPressure },
                            { name: 'Cholesterol', value: latestReport.vitals.cholesterol },
                            { name: 'Heart Rate', value: latestReport.vitals.heartRate }
                        ]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="value" stroke="#2563eb" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <p className="text-sm text-gray-500">
                    Assessment date: {new Date(latestReport.timestamp).toLocaleDateString()}
                </p>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Show success message if assessment was just completed */}
            {showAssessmentSuccess && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 fixed top-4 right-4 rounded shadow-lg">
                    <p className="font-medium">Assessment completed successfully!</p>
                    <p className="text-sm">Your health report has been updated.</p>
                </div>
            )}

            {/* Navigation Bar */}
            <nav className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <FavoriteIcon sx={{ fontSize: 32, color: '#2563eb' }} />
                            <span className="ml-2 text-2xl font-bold text-blue-600">CardioHealth</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-gray-700">{user.email}</span>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100"
                            >
                                <LogoutIcon />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {renderPredictionCard()}
                    
                    {/* Profile Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                            <PersonIcon sx={{ fontSize: 24, color: '#2563eb' }} />
                            <h2 className="text-xl font-semibold">Profile</h2>
                        </div>
                        <div className="space-y-2">
                            <p className="text-gray-600">Email: {user.email}</p>
                            <p className="text-gray-600">Name: {user.displayName || 'Not set'}</p>
                        </div>
                    </div>

                    {/* Health Assessment Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                            <AssessmentIcon sx={{ fontSize: 24, color: '#2563eb' }} />
                            <h2 className="text-xl font-semibold">Health Assessment</h2>
                        </div>
                        <p className="text-gray-600 mb-4">
                            {userStatus === 1 
                                ? "Take our health assessment to update your heart health profile."
                                : "Complete your initial health assessment to get started."}
                        </p>
                        <button
                            onClick={handleStartTest}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            {userStatus === 1 ? "Retake Assessment" : "Start Assessment"}
                        </button>
                    </div>

                    {/* Settings Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                            <SettingsIcon sx={{ fontSize: 24, color: '#2563eb' }} />
                            <h2 className="text-xl font-semibold">Settings</h2>
                        </div>
                        <p className="text-gray-600">Customize your account settings</p>
                        <p className="text-gray-600">User Status: {userStatus ? 'Existing' : 'New'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;












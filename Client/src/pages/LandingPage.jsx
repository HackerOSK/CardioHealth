import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import FavoriteIcon from '@mui/icons-material/Favorite';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: MonitorHeartIcon && <MonitorHeartIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: '#2563eb' }} />,
            title: "Heart Monitoring",
            description: "Real-time heart rate monitoring and analysis for proactive health management."
        },
        {
            icon: HealthAndSafetyIcon && <HealthAndSafetyIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: '#2563eb' }} />,
            title: "Risk Assessment",
            description: "Advanced algorithms to assess cardiovascular health risks and provide early warnings."
        },
        {
            icon: LocalHospitalIcon && <LocalHospitalIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: '#2563eb' }} />,
            title: "Medical Insights",
            description: "Expert medical insights and personalized recommendations for heart health."
        },
        {
            icon: FavoriteIcon && <FavoriteIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: '#2563eb' }} />,
            title: "Lifestyle Tips",
            description: "Customized lifestyle and dietary recommendations for a healthy heart."
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <Hero />
            
            {/* Features Section */}
            <section className="py-12 sm:py-20 bg-gray-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10 sm:mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                            Why Choose CardioHealth?
                        </h2>
                        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
                            Our comprehensive cardiovascular health platform provides cutting-edge solutions for monitoring and improving heart health.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                        {features.map((feature, index) => (
                            <div 
                                key={index} 
                                className="bg-white p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                            >
                                <div className="mb-4 flex justify-center">{feature.icon}</div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 text-center">
                                    {feature.title}
                                </h3>
                                <p className="text-sm sm:text-base text-gray-600 text-center">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Statistics Section */}
            <section className="py-12 sm:py-20 bg-blue-600">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
                        <div className="p-4 sm:p-6">
                            <div className="text-4xl sm:text-5xl font-bold text-white mb-2">98%</div>
                            <p className="text-lg sm:text-xl text-blue-100">Accuracy Rate</p>
                        </div>
                        <div className="p-4 sm:p-6">
                            <div className="text-4xl sm:text-5xl font-bold text-white mb-2">50K+</div>
                            <p className="text-lg sm:text-xl text-blue-100">Active Users</p>
                        </div>
                        <div className="p-4 sm:p-6">
                            <div className="text-4xl sm:text-5xl font-bold text-white mb-2">24/7</div>
                            <p className="text-lg sm:text-xl text-blue-100">Monitoring</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-12 sm:py-20 bg-gray-50">
                <div className="container mx-auto px-4 sm:px-6 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                        Ready to Take Control of Your Heart Health?
                    </h2>
                    <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
                        Join thousands of users who trust CardioHealth for their cardiovascular wellness journey.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 px-4">
                        <button 
                            onClick={() => navigate('/register')}
                            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-base sm:text-lg font-semibold"
                        >
                            Get Started Now
                        </button>
                        <button 
                            onClick={() => navigate('/login')}
                            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-base sm:text-lg font-semibold"
                        >
                            Learn More
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-8 sm:py-12">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-center mb-6 sm:mb-8">
                        <FavoriteIcon 
                            sx={{ 
                                fontSize: { xs: 24, sm: 30 }, 
                                color: '#2563eb' 
                            }} 
                            className="mr-2" 
                        />
                        <span className="text-xl sm:text-2xl font-bold">CardioHealth</span>
                    </div>
                    <div className="text-center text-gray-400 text-sm sm:text-base">
                        <p>&copy; {new Date().getFullYear()} CardioHealth. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

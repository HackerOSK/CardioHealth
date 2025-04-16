import heroImg from "../assets/landingPage/hero.jpg";
import { useNavigate } from "react-router-dom";
const Hero = () => {
    const navigate = useNavigate();
    
    return (
        <section className="hero min-h-screen bg-gray-50 pt-20 sm:pt-36 px-4 sm:px-10">
            <div className="container-xl mx-auto px-4 py-8 sm:py-16 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="content w-full md:w-1/2 space-y-4 sm:space-y-6 text-center md:text-left">
                    <div className="space-y-2">
                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-gray-900 tracking-tight">
                            CARDIOVASCULAR
                        </h1>
                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-blue-600 tracking-tight">
                            DISEASE.
                        </h1>
                    </div>
                    <p className="text-lg sm:text-xl text-gray-600 max-w-lg">
                        Understanding and preventing cardiovascular disease for a healthier future.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                        <button 
                            onClick={() => navigate('/register')}
                            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Learn More
                        </button>
                        <button 
                            onClick={() => navigate('/login')}
                            className="w-full sm:w-auto px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
                <div className="image w-full md:w-1/2 mt-8 md:mt-0">
                    <img 
                        src={heroImg} 
                        alt="Cardiovascular Health Illustration" 
                        className="w-full h-auto rounded-xl shadow-2xl object-cover"
                        loading="lazy"
                    />
                </div>
            </div>
        </section>
    );
};

export default Hero;

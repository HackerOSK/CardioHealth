import heroImg from "../assets/landingPage/hero.jpg";
import { useNavigate } from "react-router-dom";
const Hero = () => {
    const navigate = useNavigate();
    return (
        <section className="hero min-h-screen bg-gray-50 pt-36 px-10">
            <div className="container-xl mx-auto px-4 py-16 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="content w-full md:w-1/2 space-y-6">
                    <div className="space-y-2">
                        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight">
                            CARDIOVASCULAR
                        </h1>
                        <h1 className="text-5xl md:text-7xl font-bold text-blue-600 tracking-tight">
                            DISEASE.
                        </h1>
                    </div>
                    <p className="text-xl text-gray-600 max-w-lg">
                        Understanding and preventing cardiovascular disease for a healthier future.
                    </p>
                    <div className="flex gap-4">
                        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Learn More
                        </button>
                        <button className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors" onClick={() => navigate('/login')}>
                            Get Started
                        </button>
                    </div>
                </div>
                <div className="image w-full md:w-1/2">
                    <img 
                        src={heroImg} 
                        alt="Cardiovascular Health Illustration" 
                        className="w-full h-auto rounded-xl shadow-2xl object-cover"
                    />
                </div>
            </div>
        </section>
    );
};

export default Hero;

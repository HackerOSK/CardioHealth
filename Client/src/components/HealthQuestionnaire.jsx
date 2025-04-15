import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { healthQuestions } from '../data/healthQuestions';
import DoctorAvatar from './DoctorAvatar';
import { ArrowBack, Assignment, Warning } from '@mui/icons-material';
import { auth } from '../firebase/config';
import { useNavigate } from 'react-router-dom';

// Configure API URL based on environment
const API_URL = 'https://cardiohealth.publicvm.com';

const HealthQuestionnaire = () => {
    const navigate = useNavigate();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [error, setError] = useState('');
    const [showSummary, setShowSummary] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    const handleBack = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(prev => prev - 1);
            setError('');
        }
    };

    const handleAnswer = (value) => {
        const question = healthQuestions[currentQuestion];
        
        if (question.validate && !question.validate(value)) {
            setError('Please enter a valid date');
            return;
        }
        
        const transformedValue = question.transform ? question.transform(value) : value;
        
        setAnswers(prev => ({
            ...prev,
            [question.field]: transformedValue
        }));
        
        setError('');
        
        if (currentQuestion < healthQuestions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        } else {
            setShowSummary(true);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            // Get current user's token
            const user = auth.currentUser;
            if (!user) {
                throw new Error('No authenticated user found');
            }
            const token = await user.getIdToken();

            // Transform answers into model data format
            const modelData = {
                age: calculateAge(answers.dateOfBirth),
                sex: answers.sex,
                cp: parseInt(answers.cp),
                trestbps: parseInt(answers.trestbps),
                chol: parseInt(answers.chol),
                fbs: parseInt(answers.fbs),
                restecg: parseInt(answers.restecg),
                thalach: parseInt(answers.thalach),
                exang: parseInt(answers.exang),
                oldpeak: parseFloat(answers.oldpeak),
                slope: parseInt(answers.slope),
                ca: parseInt(answers.ca),
                thal: parseInt(answers.thal)
            };

            // Validate all required fields
            const requiredFields = Object.keys(modelData);
            const missingFields = requiredFields.filter(field => modelData[field] === undefined);

            if (missingFields.length > 0) {
                throw new Error(`Please complete all questions. Missing: ${missingFields.join(', ')}`);
            }

            const response = await fetch(`${API_URL}/api/predict`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(modelData),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit assessment');
            }

            const result = await response.json();
            console.log('Prediction result:', result);

            // Navigate to dashboard with success state
            navigate('/dashboard', {
                state: { 
                    assessmentCompleted: true,
                    result: result
                }
            });

        } catch (error) {
            console.error('Submission error:', error);
            setError(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const getOptionGridClass = (optionsLength) => {
        if (optionsLength === 3) {
            return "grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto";
        }
        return "grid grid-cols-1 md:grid-cols-2 gap-4";
    };

    const calculateAge = (birthDate) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    if (showSummary) {
        return (
            <div className="max-w-4xl mx-auto p-4">
                <DoctorAvatar />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-lg p-8"
                >
                    <div className="flex items-center justify-between mb-8 border-b pb-4">
                        <div className="flex items-center gap-3">
                            <Assignment className="text-blue-600" sx={{ fontSize: 32 }} />
                            <h2 className="text-3xl font-bold text-gray-900">Health Assessment Report</h2>
                        </div>
                        <p className="text-gray-500">Date: {new Date().toLocaleDateString()}</p>
                    </div>

                    {/* Basic Information Section */}
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h3>
                        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                            <div>
                                <p className="text-gray-600">Age</p>
                                <p className="font-semibold">{calculateAge(answers.dateOfBirth)} years</p>
                            </div>
                            {/* Add other basic info fields here */}
                        </div>
                    </div>

                    {/* Responses Section */}
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Detailed Responses</h3>
                        <div className="space-y-6">
                            {healthQuestions.map((q, index) => {
                                const answer = answers[q.field];
                                let displayAnswer = answer;

                                if (q.type === 'choice' || q.type === 'image-choice') {
                                    const option = q.options.find(opt => opt.value === answer);
                                    displayAnswer = option ? option.label : answer;
                                }

                                return (
                                    <div key={q.id} className="bg-white p-4 rounded-lg border">
                                        <div className="flex items-start gap-4">
                                            <span className="bg-blue-100 text-blue-800 font-semibold px-3 py-1 rounded-full text-sm">
                                                Q{index + 1}
                                            </span>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-800 mb-2">{q.question}</h4>
                                                <p className="text-gray-700 bg-gray-50 p-2 rounded">
                                                    {displayAnswer}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Risk Factors Section (if applicable) */}
                    <div className="mb-8 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <div className="flex items-center gap-2 mb-3">
                            <Warning className="text-yellow-600" />
                            <h3 className="text-xl font-semibold text-gray-800">Risk Factors</h3>
                        </div>
                        <p className="text-gray-600">Based on your responses, please consult with a healthcare professional for a thorough evaluation.</p>
                    </div>
                    
                    <div className="mt-8 flex gap-4 justify-end">
                        <button
                            onClick={() => {
                                setShowSummary(false);
                                setCurrentQuestion(healthQuestions.length - 1);
                            }}
                            className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center gap-2"
                            disabled={submitting}
                        >
                            <ArrowBack fontSize="small" />
                            Edit Responses
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className={`px-6 py-2 bg-blue-600 text-white rounded-lg ${
                                submitting ? 'opacity-75 cursor-not-allowed' : 'hover:bg-blue-700'
                            }`}
                        >
                            {submitting ? 'Submitting...' : 'Submit to AI Analysis'}
                        </button>
                        {error && (
                            <p className="text-red-500 text-sm mt-2">{error}</p>
                        )}
                    </div>
                </motion.div>
            </div>
        );
    }

    const question = healthQuestions[currentQuestion];

    return (
        <div className="max-w-2xl mx-auto p-4">
            <DoctorAvatar />
            
            <div className="mb-8">
                <div className="h-2 bg-gray-200 rounded-full">
                    <div 
                        className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${((currentQuestion + 1) / healthQuestions.length) * 100}%` }}
                    />
                </div>
                <div className="flex justify-between items-center mt-2">
                    <p className="text-sm text-gray-600">
                        Question {currentQuestion + 1} of {healthQuestions.length}
                    </p>
                    {currentQuestion > 0 && (
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                        >
                            <ArrowBack fontSize="small" />
                            Back
                        </button>
                    )}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={question.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="bg-white rounded-xl shadow-lg p-6"
                >
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">{question.question}</h2>
                    
                    {question.type === "date" && (
                        <div className="space-y-2">
                            <input
                                type="date"
                                min={question.min}
                                max={question.max}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                onChange={(e) => handleAnswer(e.target.value)}
                            />
                            {error && (
                                <p className="text-red-500 text-sm">{error}</p>
                            )}
                        </div>
                    )}
                    
                    {question.type === "number" && (
                        <input
                            type="number"
                            min={question.min}
                            max={question.max}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            onBlur={(e) => handleAnswer(parseInt(e.target.value))}
                        />
                    )}

                    {question.type === "choice" && (
                        <div className={getOptionGridClass(question.options.length)}>
                            {question.options.map((option) => (
                                <button
                                    key={option.value}
                                    className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                                    onClick={() => handleAnswer(option.value)}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {question.type === "image-choice" && (
                        <div className={getOptionGridClass(question.options.length)}>
                            {question.options.map((option) => (
                                <button
                                    key={option.value}
                                    className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                                    onClick={() => handleAnswer(option.value)}
                                >
                                    <img 
                                        src={option.image} 
                                        alt={option.label}
                                        className="w-full h-40 object-cover rounded-lg mb-4"
                                    />
                                    <h3 className="text-lg font-semibold text-gray-900">{option.label}</h3>
                                    <p className="text-sm text-gray-600">{option.description}</p>
                                </button>
                            ))}
                        </div>
                    )}
                    <p className="text-gray-600 mt-4 text-sm">{question.description}</p>
                    <img src={question.image} alt={question.question} className="w-full h-auto rounded-lg shadow-2xl object-cover mt-4" />
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default HealthQuestionnaire;











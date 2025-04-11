import chestp1 from "../assets/chestPain/1.png";
import chestp2 from "../assets/chestPain/2.png";
import chestp3 from "../assets/chestPain/3.png";
import chestp4 from "../assets/chestPain/4.png";
import ecg1 from "../assets/ecg/1.png";
import ecg2 from "../assets/ecg/2.png";
import ecg3 from "../assets/ecg/3.png";
import age from "../assets/age.webp";
import gender from "../assets/gender.jpg";
import chestpain from "../assets/chestp.jpg";
import bloodpressure from "../assets/bp.webp";
import cholesterol from "../assets/cholesterol.jpg";
import bloodsugar from "../assets/bloodsugar.webp";
import ecg from "../assets/ecggif.gif";
import exercisePain from "../assets/expain.webp";
import stDepression from "../assets/st.png";
import thalassemia from "../assets/thalassemia.jpg";
import heartRate from "../assets/heartrate.jpg";
import bloodvessel from "../assets/bloodvessel.gif"
import slope1 from "../assets/slope/1.png";
import slope2 from "../assets/slope/2.png";
import slope3 from "../assets/slope/3.png";


export const healthQuestions = [
    {
        id: 1,
        title: "Let's Start with the Basics",
        question: "What's your date of birth?",
        type: "date",
        field: "dateOfBirth",
        min: "1903-01-01", // For someone who could be 120 years old
        max: new Date().toISOString().split('T')[0], // Today's date
        description: "Your age helps us understand your heart health risk factors better.",
        image: age,
        validate: (value) => {
            const birthDate = new Date(value);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear() - 
                       (today.getMonth() < birthDate.getMonth() || 
                       (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate()) ? 1 : 0);
            return age >= 1 && age <= 120;
        },
        transform: (value) => {
            // Convert DOB to age for the model
            const birthDate = new Date(value);
            const today = new Date();
            return today.getFullYear() - birthDate.getFullYear() - 
                   (today.getMonth() < birthDate.getMonth() || 
                   (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate()) ? 1 : 0);
        }
    },
    {
        id: 2,
        title: "About You",
        question: "What's your gender?",
        type: "choice",
        field: "sex",
        options: [
            { value: 0, label: "Female" },
            { value: 1, label: "Male" }
        ],
        description: "Different genders can have different heart health patterns.",
        image: gender
    },
    {
        id: 3,
        title: "Chest Pain",
        question: "Have you experienced chest pain? If yes, what type?",
        type: "image-choice",
        field: "cp",
        options: [
            { value: 0, label: "Typical Angina", image: chestp1 },
            { value: 1, label: "Atypical Angina", image: chestp2 },
            { value: 2, label: "Non-anginal Pain", image: chestp3 },
            { value: 3, label: "Asymptomatic", image: chestp4 }
        ],
        description: "Select the type of chest pain you've experienced.",
        image: chestpain
    },
    {
        id: 4,
        title: "Blood Pressure",
        question: "What is your resting blood pressure (in mm Hg)?",
        type: "number",
        field: "trestbps",
        min: 90,
        max: 200,
        description: "Enter your resting blood pressure measurement.",
        image: bloodpressure
    },
    {
        id: 5,
        title: "Cholesterol",
        question: "What is your cholesterol level (in mg/dl)?",
        type: "number",
        field: "chol",
        min: 100,
        max: 600,
        description: "Enter your cholesterol level from your most recent blood test.",
        image: cholesterol
    },
    {
        id: 6,
        title: "Fasting Blood Sugar",
        question: "Is your fasting blood sugar level above 120 mg/dl?",
        type: "choice",
        field: "fbs",
        options: [
            { value: 0, label: "No (Normal)" },
            { value: 1, label: "Yes (High)" }
        ],
        description: "This measures your blood sugar level after not eating for at least 8 hours.",
        image: bloodsugar
    },
    {
        id: 7,
        title: "ECG Results",
        question: "What were your resting ECG results?",
        type: "image-choice",
        field: "restecg",
        options: [
            { 
                value: 0, 
                label: "Normal", 
                description: "Your ECG shows no concerning patterns",
                image: ecg1
            },
            { 
                value: 1, 
                label: "Mild Abnormality", 
                description: "Shows some minor irregularities",
                image: ecg2
            },
            { 
                value: 2, 
                label: "Major Abnormality", 
                description: "significant changes that need attention",
                image: ecg3
            }
        ],
        description: "An ECG records the electrical activity of your heart.",
        image: ecg
    },
    {
        id: 8,
        title: "Maximum Heart Rate",
        question: "What's your maximum heart rate achieved during exercise?",
        type: "number",
        field: "thalach",
        min: 60,
        max: 220,
        description: "This is the highest your heart rate gets during physical activity. Higher numbers usually indicate better fitness.",
        image: heartRate
    },
    {
        id: 9,
        title: "Exercise and Pain",
        question: "Do you experience chest pain during exercise?",
        type: "choice",
        field: "exang",
        options: [
            { value: 0, label: "No" },
            { value: 1, label: "Yes" }
        ],
        description: "This helps us understand how exercise affects your heart.",
        image: exercisePain
    },
    {
        id: 10,
        title: "ST Depression",
        question: "What is your ST depression value induced by exercise?",
        type: "number",
        field: "oldpeak",
        min: 0,
        max: 6.2,
        step: 0.1,
        description: "This measures changes in your ECG during exercise. Lower values are generally better.",
        image: stDepression
    },
    {
        id: 11,
        title: "ST Slope",
        question: "What is the slope of your peak exercise ST segment?",
        type: "image-choice",
        field: "slope",
        options: [
            { 
                value: 0, 
                label: "Downsloping", 
                description: "The ECG line slopes downward (may indicate risk)",
                image: slope1
            },
            { 
                value: 1, 
                label: "Flat", 
                description: "The ECG line remains level",
                image: slope2
            },
            { 
                value: 2, 
                label: "Upsloping", 
                description: "The ECG line slopes upward (generally better)",
                image: slope3
            }
        ],
        description: "This describes the shape of your ECG during peak exercise.",
        image: stDepression
    },
    {
        id: 12,
        title: "Blood Vessels",
        question: "How many major blood vessels are colored by fluoroscopy?",
        type: "choice",
        field: "ca",
        options: [
            { value: 0, label: "None" },
            { value: 1, label: "One vessel" },
            { value: 2, label: "Two vessels" },
            { value: 3, label: "Three vessels" }
        ],
        description: "This shows how many of your major heart blood vessels show signs of narrowing.",
        image: bloodvessel
    },
    {
        id: 13,
        title: "Thalassemia",
        question: "What type of thalassemia do you have?",
        type: "choice",
        field: "thal",
        options: [
            { value: 1, label: "Fixed Defect (possible damage)" },
            { value: 2, label: "Normal" },
            { value: 3, label: "Reversible Defect (could be stress-related)" }
        ],
        description: "Thalassemia is a blood disorder that can affect heart function.",
        image: thalassemia
    }
];



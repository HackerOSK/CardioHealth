import doctor_avatar from "../assets/main/doctor-avatar.png";

const DoctorAvatar = () => {
    return (
        <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center">
            <img
                src={doctor_avatar}
                alt="Doctor Avatar"
                className="w-14 h-14 rounded-full object-cover"
            />
        </div>
    );
};

export default DoctorAvatar;
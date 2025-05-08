import { useState } from "react";
import { FaEye, FaEyeSlash, FaApple, FaGoogle, FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";
import axios from "axios";
import { setuserForm } from "../../redux/reducers/Auth";
import { useDispatch } from "react-redux";
import ClipLoader from "react-spinners/ClipLoader";
import { useNavigate } from "react-router-dom";

export default function SignupPage({ onClose, setShowLoginModal }) {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [apiError, setApiError] = useState("");

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      valid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }

    if (!formData.role) {
      newErrors.role = "Role is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsLoading(true);
      const config = {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      };
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_SERVER}/api/v1/user/send-otp`,
          { email: formData.email },
          config
        );

        // Make sure navigate is called after a successful response
        if (data.success) {
          dispatch(setuserForm(formData)); // Store form data for later use
          toast.success("OTP sent successfully. Please check your email.", {
            duration: 3000,
            position: "top-left",
            style: {
              background: "#4CAF50",
              color: "#fff",
            },
          });
          navigate("/verify-otp");
        } else {
          throw new Error("Failed to send OTP");
        }
      } catch (error) {
        const errorMessage =
          error?.response?.data?.message || "User already exist please login";
        setApiError(errorMessage);
        toast.error(errorMessage, {
          duration: 3000,
          position: "top-left",
          style: {
            background: "#FF0000",
            color: "#fff",
          },
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="w-96 max-w-3xl bg-white rounded-lg shadow-xl p-9 relative animate-fadeIn">
      {/* Add close button */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 transition-colors"
        aria-label="Close"
      >
        <FaTimes size={20} />
      </button>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Create an account</h2>
        <p className="text-gray-600">
          Enter your information to create an account
        </p>
      </div>

      <div className="space-y-4">
        {/* Social Login Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            className="flex items-center justify-center gap-2 p-2 border rounded-md hover:bg-gray-50"
            onClick={() => console.log("Google signup clicked")}
          >
            <FaApple className="text-black" />
            Apple
          </button>
          <button
            className="flex items-center justify-center gap-2 p-2 border rounded-md hover:bg-gray-50"
            onClick={() => console.log("Facebook signup clicked")}
          >
            <FaGoogle className="text-blue-600" />
            Google
          </button>
        </div>

        {/* Role Selection Buttons */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Select your role
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              name="role"
              onClick={() => setFormData({ ...formData, role: "tenant" })}
              className={`p-2 text-sm border rounded-md transition-colors ${
                formData.role === "tenant"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Tenant
            </button>
            <button
              type="button"
              name="role"
              onClick={() => setFormData({ ...formData, role: "landlord" })}
              className={`p-2 text-sm border rounded-md transition-colors ${
                formData.role === "landlord"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Landlord
            </button>
          </div>
          {errors.role && (
            <p className="text-xs text-red-500 mt-1">{errors.role}</p>
          )}
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border ${
                errors.name ? "border-red-500" : "border-gray-300"
              } px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="john.doe@example.com"
              value={formData.email}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                className={`block w-full rounded-md border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } px-3 py-2 pr-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full text-white rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition 
                                 ${
                                   isLoading
                                     ? "bg-blue-400 cursor-not-allowed"
                                     : "bg-blue-600 hover:bg-blue-700"
                                 }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <ClipLoader
                  color="#ffffff"
                  size={20}
                  aria-label="Loading Spinner"
                  data-testid="loader"
                  className="mr-2"
                />
                Signing up...
              </span>
            ) : (
              "Sign up"
            )}
          </button>

          {/* Display API error message if present */}
          {apiError && (
            <p className="text-xs text-red-500 mt-2 text-center">{apiError}</p>
          )}
        </form>
      </div>

      <div className="text-center mt-6">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <button
            onClick={() => {
              onClose();
              setShowLoginModal && setShowLoginModal(true);
            }}
            className="text-blue-600 hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Loader2, BookOpen } from "lucide-react";
import { loginUser } from "../../store/slices/authSlice";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "", role: "Student" });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoggingIn } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(loginUser(formData));
    if (loginUser.fulfilled.match(resultAction)) {
      const role = resultAction.payload.role.toLowerCase();
      if (role === "student") navigate("/student/dashboard");
      else if (role === "professor") navigate("/teacher/dashboard");
      else if (role === "admin") navigate("/admin/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans border-t-8 border-[#5b6a51]">
      <div className="mb-6 flex flex-col items-center">
        <div className="w-14 h-14 bg-[#0ea5e9] rounded-full flex items-center justify-center mb-4 text-white shadow-sm">
          <BookOpen strokeWidth={2} className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Uni Track Project Management</h2>
        <p className="text-sm text-slate-500 mt-1">Sign in to your account</p>
      </div>

      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Role filter */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-slate-700 bg-white"
              >
                <option value="Student">Student</option>
                <option value="Professor">Professor</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-slate-700"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-slate-700"
              />
            </div>

            <div className="flex items-center justify-end">
              <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
                Forgot your password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-[#0ea5e9] text-white p-2.5 rounded-md font-semibold text-sm flex items-center justify-center hover:bg-sky-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isLoggingIn ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>
            <div className="text-center mt-4">
              <Link to="/register" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
                Register an Account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

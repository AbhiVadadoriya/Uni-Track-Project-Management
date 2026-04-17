import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Mail, Lock, Loader2, ArrowRight, UserCircle, GraduationCap, User } from "lucide-react";
import { registerUser } from "../../store/slices/authSlice";

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "Student" });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoggingIn } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(registerUser(formData));
    if (registerUser.fulfilled.match(resultAction)) {
      const role = resultAction.payload.role.toLowerCase();
      if (role === "student") navigate("/student/dashboard");
      else if (role === "professor") navigate("/teacher/dashboard");
      else navigate("/");
    }
  };

  const roles = [
    { id: "Student", label: "Student", icon: GraduationCap },
    { id: "Professor", label: "Professor", icon: UserCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Create Account</h2>
            <p className="text-sm text-slate-500 mt-2">Register as a Student or Professor</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Role Filter Selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Account Type</label>
              <div className="flex p-1 bg-slate-100 rounded-lg">
                {roles.map((r) => {
                  const Icon = r.icon;
                  const active = formData.role === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleRoleSelect(r.id)}
                      className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-colors ${
                        active 
                          ? "bg-white text-blue-600 shadow-sm border border-slate-200" 
                          : "text-slate-600 hover:text-slate-800 hover:bg-slate-200/50"
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-1.5" />
                      {r.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                  className="pl-9 w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-slate-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="name@university.edu"
                  className="pl-9 w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-slate-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  minLength={8}
                  className="pl-9 w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-slate-700"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-blue-600 text-white p-2.5 rounded-lg font-medium flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isLoggingIn ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
            
            <div className="text-center mt-6">
              <p className="text-slate-600 text-sm">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

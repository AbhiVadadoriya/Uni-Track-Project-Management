import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Lock, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { axiosInstance } from "../../lib/axios";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }
    setIsLoading(true);
    try {
      await axiosInstance.put(`/auth/password/reset/${token}`, { password, confirmPassword });
      toast.success("Password reset successfully. Please log in.");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden shadow-blue-900/10 border border-slate-100 p-10">
        <div className="mb-8 w-full text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <Lock className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">Set New Password</h2>
          <p className="text-slate-500 font-medium text-sm">Your new password must be securely configured.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">New Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="pl-11 w-full p-3.5 border border-slate-200 bg-slate-50 rounded-xl focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus:bg-white outline-none transition-all font-medium text-slate-700"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="pl-11 w-full p-3.5 border border-slate-200 bg-slate-50 rounded-xl focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus:bg-white outline-none transition-all font-medium text-slate-700"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white p-3.5 rounded-xl font-bold flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30 active:scale-[0.98] mt-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Set Password"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/login" className="text-sm font-semibold text-slate-500 hover:text-blue-600 inline-flex items-center transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to login phase
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

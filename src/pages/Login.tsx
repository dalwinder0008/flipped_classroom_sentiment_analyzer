import React, { useState, useEffect, useRef } from "react";
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  getMultiFactorResolver, 
  PhoneAuthProvider, 
  PhoneMultiFactorGenerator,
  MultiFactorResolver,
  RecaptchaVerifier
} from "@/src/lib/firebase";
import { motion } from "motion/react";
import { GraduationCap, BookOpen, School, Pencil, ShieldCheck, ArrowLeft, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mfaResolver, setMfaResolver] = useState<MultiFactorResolver | null>(null);
  const [mfaVerificationId, setMfaVerificationId] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaSent, setMfaSent] = useState(false);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
      }
    };
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/");
    } catch (err: any) {
      if (err.code === "auth/popup-closed-by-user" || err.code === "auth/cancelled-popup-request") {
        setLoading(false);
        return;
      }

      if (err.code === "auth/multi-factor-auth-required") {
        const resolver = getMultiFactorResolver(auth, err);
        setMfaResolver(resolver);
        setLoading(false);
        return;
      }

      console.error("Login error:", err);
      if (err.code === "auth/popup-blocked") {
        setError("The login popup was blocked by your browser. Please allow popups.");
      } else {
        setError(err.message || "Failed to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const sendMfaCode = async (hintIndex: number = 0) => {
    if (!mfaResolver) return;
    setLoading(true);
    setError(null);

    try {
      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible'
        });
      }

      const phoneAuthProvider = new PhoneAuthProvider(auth);
      const hint = mfaResolver.hints[hintIndex];
      
      if (hint.factorId === PhoneMultiFactorGenerator.FACTOR_ID) {
        const verificationId = await phoneAuthProvider.verifyPhoneNumber(
          { multiFactorHint: hint, session: mfaResolver.session },
          recaptchaVerifierRef.current
        );
        setMfaVerificationId(verificationId);
        setMfaSent(true);
      } else {
        setError("Unsupported MFA method: " + hint.factorId);
      }
    } catch (err: any) {
      console.error("MFA send error:", err);
      if (err.code === "auth/operation-not-allowed") {
        setError("SMS authentication is not enabled for this project or region. Please enable 'Phone' authentication and the relevant SMS regions in the Firebase Console (Authentication > Sign-in method).");
      } else if (err.code === "auth/sms-quota-exceeded") {
        setError("SMS quota exceeded. Please try again later.");
      } else {
        setError("Failed to send verification code: " + (err.message || "Unknown error"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaResolver || !mfaVerificationId || !mfaCode) return;

    setLoading(true);
    setError(null);
    try {
      const cred = PhoneAuthProvider.credential(mfaVerificationId, mfaCode);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
      await mfaResolver.resolveSignIn(multiFactorAssertion);
      navigate("/");
    } catch (err: any) {
      console.error("MFA verification error:", err);
      setError("Invalid verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetMfa = () => {
    setMfaResolver(null);
    setMfaVerificationId(null);
    setMfaCode("");
    setMfaSent(false);
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Background Blobs & Patterns */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-brand-600/10 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[120px] animate-blob [animation-delay:2s]" />
        
        {/* Floating Education Icons */}
        <div className="absolute top-[15%] left-[15%] text-white/5 animate-pulse">
          <BookOpen className="w-24 h-24 rotate-12" />
        </div>
        <div className="absolute bottom-[20%] left-[20%] text-white/5 animate-bounce [animation-duration:10s]">
          <GraduationCap className="w-32 h-32 -rotate-12" />
        </div>
        <div className="absolute top-[40%] right-[15%] text-white/5 animate-pulse [animation-delay:3s]">
          <School className="w-28 h-28 rotate-6" />
        </div>
        <div className="absolute bottom-[10%] right-[25%] text-white/5 animate-bounce [animation-duration:8s]">
          <Pencil className="w-20 h-20 -rotate-45" />
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 md:p-12 max-w-md w-full relative z-10 text-center"
      >
        <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-600/40 mx-auto mb-6">
          <span className="text-3xl font-bold text-white">F</span>
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Welcome to FlipSense</h1>
        <p className="text-slate-400 mb-8">Sign in to share your flipped classroom feedback and view analytics.</p>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm mb-6">
            {error}
          </div>
        )}

        {mfaResolver ? (
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-2 text-brand-400">
              <ShieldCheck className="w-6 h-6" />
              <span className="font-bold text-lg">Verification Required</span>
            </div>
            
            {!mfaSent ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-400">
                  Select a verification method:
                </p>
                {mfaResolver.hints.map((hint, index) => (
                  <button
                    key={index}
                    onClick={() => sendMfaCode(index)}
                    disabled={loading}
                    className="w-full flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-brand-500 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-600/10 rounded-lg flex items-center justify-center text-brand-400 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-white">
                          {hint.factorId === PhoneMultiFactorGenerator.FACTOR_ID ? "Phone Number" : "Other Method"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {hint.factorId === PhoneMultiFactorGenerator.FACTOR_ID ? 
                            `Ending in ${(hint as any).phoneNumber?.slice(-4)}` : 
                            hint.displayName || "Unknown"}
                        </div>
                      </div>
                    </div>
                    <Send className="w-4 h-4 text-slate-600 group-hover:text-brand-400 transition-colors" />
                  </button>
                ))}
                <div id="recaptcha-container"></div>
              </div>
            ) : (
              <form onSubmit={handleMfaVerify} className="space-y-4">
                <p className="text-sm text-slate-400">
                  Enter the 6-digit code sent to your phone.
                </p>
                <input
                  type="text"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 px-4 text-center text-2xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
                <button
                  type="submit"
                  disabled={loading || mfaCode.length < 6}
                  className="w-full bg-brand-600 text-white font-bold py-4 rounded-xl hover:bg-brand-500 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Verify & Sign In"
                  )}
                </button>
              </form>
            )}

            <button
              onClick={resetMfa}
              className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-white transition-colors mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </div>
        ) : (
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white text-slate-950 font-bold py-4 rounded-xl hover:bg-slate-100 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
                Continue with Google
              </>
            )}
          </button>
        )}

        <p className="mt-8 text-xs text-slate-500">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { CIBN_DEPARTMENT_OPTIONS } from "@/lib/config/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
    AlertCircle,
    Crown,
    Eye, EyeOff,
    Lock,
    LogIn,
    Mail,
    Shield,
    Sparkles
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const getErrorMessage = (error: any, fallback: string) => {
  const detail =
    error?.response?.data?.detail ??
    error?.data?.detail ??
    error?.response?.data?.message ??
    error?.data?.message;

  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const parts = detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (item?.msg) {
          const loc = Array.isArray(item.loc) ? item.loc.join(".") : item.loc;
          return loc ? `${loc}: ${item.msg}` : item.msg;
        }
        return null;
      })
      .filter(Boolean);
    if (parts.length) return parts.join(" ");
  }
  if (detail && typeof detail === "object") {
    const msg = (detail as any).msg;
    const loc = (detail as any).loc;
    if (typeof msg === "string") {
      const locText = Array.isArray(loc) ? loc.join(".") : loc;
      return locText ? `${locText}: ${msg}` : msg;
    }
  }
  if (typeof error?.message === "string") return error.message;
  if (typeof error?.data?.message === "string") return error.data.message;
  return fallback;
};

function useSafeAuth() {
  try {
    return useAuth();
  } catch {
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: async (_: any) => {},
      cibnLogin: async (_: any) => {},
      register: async (_: any) => {},
      logout: () => {},
      refreshUser: async () => {},
    } as any;
  }
}

const UserLoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

const CibnLoginSchema = z.object({
  empId: z.string().min(1, { message: "Employee ID is required" }),
  department: z.string().min(1, { message: "Department is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type UserLoginFormValues = z.infer<typeof UserLoginSchema>;
type CibnLoginFormValues = z.infer<typeof CibnLoginSchema>;

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestSignup?: () => void;
  onRequestForgot?: () => void;
}

export function LoginModal({
  isOpen,
  onClose,
  onRequestSignup,
  onRequestForgot,
}: LoginModalProps) {
  const { login, cibnLogin, isLoading } = useSafeAuth();

  const [activeTab, setActiveTab] = useState<"user" | "cibn">("user");
  const [showPassword, setShowPassword] = useState(false);
  const [showCibnPassword, setShowCibnPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const userForm = useForm<UserLoginFormValues>({
    resolver: zodResolver(UserLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const cibnForm = useForm<CibnLoginFormValues>({
    resolver: zodResolver(CibnLoginSchema),
    defaultValues: {
      empId: "",
      department: "",
      password: "",
    },
    mode: "onBlur",
  });

  const onOpenChange = (open: boolean) => {
    if (!open) {
      userForm.reset();
      cibnForm.reset();
      setError("");
      onClose();
    }
  };

  const onUserSubmit = async (data: UserLoginFormValues) => {
    setError("");
    setSubmitting(true);
    try {
      await login({ email: data.email, password: data.password });
      onClose();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth:login"));
      }
    } catch (e: any) {
      console.error("User login error:", e);
      const msg = getErrorMessage(
        e,
        "Login failed. Please check your credentials."
      );
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const onCibnSubmit = async (data: CibnLoginFormValues) => {
    setError("");
    setSubmitting(true);
    try {
      await cibnLogin({ cibn_employee_id: data.empId, password: data.password });
      onClose();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth:login"));
      }
    } catch (e: any) {
      console.error("CIBN login error:", e);
      const msg = getErrorMessage(
        e,
        "Login failed. Please check your credentials."
      );
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden sm:max-w-[550px] border-none bg-transparent shadow-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white/90 dark:bg-gray-950/90 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
        >
          {/* Premium Header */}
          <div className="relative h-48 flex items-end px-8 pb-8 overflow-hidden bg-gradient-to-br from-premium-navy via-[#003399] to-premium-emerald">
            {/* Animated decorative circles */}
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" 
            />
            <motion.div 
              animate={{ 
                scale: [1, 1.3, 1],
                x: [0, 20, 0],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-24 -left-12 w-64 h-64 bg-premium-gold/10 rounded-full blur-3xl" 
            />
            
            <div className="relative z-10 w-full">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-inner">
                    <LogIn className="w-6 h-6 text-white" />
                  </div>
                  <Badge variant="secondary" className="bg-premium-gold/20 text-premium-gold border-premium-gold/30 backdrop-blur-md px-3 py-1">
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    Premium Access
                  </Badge>
                </div>
                <DialogTitle className="text-4xl font-bold text-white tracking-tight">Welcome</DialogTitle>
                <DialogDescription className="text-white/80 text-lg mt-1 font-medium">
                  Digital Library & Resources
                </DialogDescription>
              </motion.div>
            </div>
          </div>

          {/* Body */}
          <div className="px-8 py-8">
            <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
              <TabsList className="grid grid-cols-2 w-full h-12 bg-gray-100/50 dark:bg-white/5 p-1 rounded-xl mb-8">
                <TabsTrigger 
                  value="user" 
                  className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-md transition-all duration-300 font-semibold"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Standard
                </TabsTrigger>
                <TabsTrigger 
                  value="cibn" 
                  className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-md transition-all duration-300 font-semibold"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  CIBN Member
                </TabsTrigger>
              </TabsList>

              {/* User tab */}
              <TabsContent value="user" className="mt-0 focus-visible:outline-none">
                <Form {...userForm}>
                  <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-6">
                    <AnimatePresence>
                      {error && activeTab === "user" && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="flex items-start gap-3 text-sm text-red-600 bg-red-50/50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 backdrop-blur-sm rounded-xl p-4 shadow-sm"
                        >
                          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                          <span className="font-medium leading-relaxed">{error}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="space-y-5">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <FormField
                          control={userForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-600 dark:text-gray-400 font-semibold ml-1 flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Email Address *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="name@company.com"
                                  type="email"
                                  autoComplete="username"
                                  className="border-gray-200/50 dark:border-white/10"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="font-medium ml-1" />
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <FormField
                          control={userForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex justify-between items-center ml-1 mb-1">
                                <FormLabel className="text-gray-600 dark:text-gray-400 font-semibold flex items-center gap-2">
                                  <Lock className="w-4 h-4" />
                                  Password *
                                </FormLabel>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onClose();
                                    onRequestForgot?.();
                                  }}
                                  className="text-xs font-bold text-premium-navy dark:text-premium-emerald hover:underline"
                                >
                                  Forgot?
                                </button>
                              </div>
                              <FormControl>
                                <div className="relative group">
                                  <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    className="pr-12 border-gray-200/50 dark:border-white/10 transition-all font-mono"
                                    {...field}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-premium-emerald transition-colors p-1"
                                  >
                                    {showPassword ? <EyeOff className="w-5 h-5 transition-transform group-hover:scale-110" /> : <Eye className="w-5 h-5 transition-transform group-hover:scale-110" />}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage className="font-medium ml-1" />
                            </FormItem>
                          )}
                        />
                      </motion.div>
                    </div>

                    <motion.div
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: 0.5 }}
                    >
                      <Button
                        type="submit"
                        variant="premium"
                        size="lg"
                        disabled={isLoading || submitting}
                        className="w-full"
                      >
                        {isLoading || submitting ? (
                          <>
                            <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                            Authenticating...
                          </>
                        ) : (
                          <>
                            Sign In
                            <LogIn className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </Button>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="text-center pt-4"
                    >
                      <p className="text-sm text-gray-500 font-medium">
                        New content awaits.{" "}
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onRequestSignup?.();
                          }}
                          className="text-premium-emerald font-bold hover:underline"
                        >
                          Join CIBN
                        </button>
                      </p>
                    </motion.div>
                  </form>
                </Form>
              </TabsContent>

              {/* CIBN tab */}
              <TabsContent value="cibn" className="mt-0 focus-visible:outline-none">
                <Form {...cibnForm}>
                  <form onSubmit={cibnForm.handleSubmit(onCibnSubmit)} className="space-y-6">
                    <AnimatePresence>
                      {error && activeTab === "cibn" && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="flex items-start gap-3 text-sm text-red-600 bg-red-50/50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 backdrop-blur-sm rounded-xl p-4 shadow-sm"
                        >
                          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                          <span className="font-medium leading-relaxed">{error}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Member Alert Card */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center gap-4 p-4 bg-premium-gold/5 dark:bg-premium-gold/10 border border-premium-gold/20 rounded-2xl shadow-inner"
                    >
                      <div className="p-2 bg-premium-gold/20 rounded-xl">
                        <Shield className="w-5 h-5 text-premium-gold" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">Member Verification</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Secure login for CIBN personnel</p>
                      </div>
                    </motion.div>

                    <div className="space-y-5">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <FormField
                          control={cibnForm.control}
                          name="empId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-600 dark:text-gray-400 font-semibold ml-1">Employee ID *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="CIBN-XXXX"
                                  className="border-gray-200/50 dark:border-white/10"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="font-medium ml-1" />
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <FormField
                          control={cibnForm.control}
                          name="department"
                          render={({ field }) => (
                            <FormItem>
                               <FormLabel className="text-gray-600 dark:text-gray-400 font-semibold ml-1">Department</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-11 border-gray-200/50 dark:border-white/10 rounded-lg">
                                    <SelectValue placeholder="Select Department" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-xl border-white/20 backdrop-blur-xl">
                                  {CIBN_DEPARTMENT_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value} className="rounded-lg">
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage className="font-medium ml-1" />
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <FormField
                          control={cibnForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-600 dark:text-gray-400 font-semibold ml-1">Secure Password</FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <Input
                                    type={showCibnPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="pr-12 border-gray-200/50 dark:border-white/10 font-mono"
                                    {...field}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowCibnPassword(!showCibnPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-premium-gold transition-colors p-1"
                                  >
                                    {showCibnPassword ? <EyeOff className="w-5 h-5 transition-transform group-hover:scale-110" /> : <Eye className="w-5 h-5 transition-transform group-hover:scale-110" />}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage className="font-medium ml-1" />
                            </FormItem>
                          )}
                        />
                      </motion.div>
                    </div>

                    <motion.div
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: 0.6 }}
                    >
                      <Button
                        type="submit"
                        variant="premium"
                        size="lg"
                        disabled={isLoading || submitting}
                        className="w-full bg-gradient-to-r from-premium-navy to-black"
                      >
                        {isLoading || submitting ? (
                          <>
                            <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            Member Sign In
                            <Crown className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </Button>
                    </motion.div>

                    <div className="text-center pt-4">
                      <p className="text-sm text-gray-400 font-medium">
                        Credential issues?{" "}
                        <span className="text-premium-gold cursor-pointer hover:underline">Support</span>
                      </p>
                    </div>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

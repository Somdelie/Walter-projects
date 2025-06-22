"use client"
import { Loader2, Lock, Mail, Building2, CheckCircle, Shield, Truck, Headphones } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { motion } from "framer-motion"

import type { LoginProps } from "@/types/types"
import toast from "react-hot-toast"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "../ui/button"
import { FaGithub, FaGoogle } from "react-icons/fa"
import TextInput from "../FormInputs/TextInput"
import PasswordInput from "../FormInputs/PasswordInput"
import SubmitButton from "../FormInputs/SubmitButton"

export default function LoginForm() {
  const [loading, setLoading] = useState(false)
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm<LoginProps>()
  const params = useSearchParams()
  const returnUrl = params.get("returnUrl") || "/"
  const [passErr, setPassErr] = useState("")
  const router = useRouter()

  async function onSubmit(data: LoginProps) {
    try {
      setLoading(true)
      setPassErr("")
      console.log("Attempting to sign in with credentials:", data)
      const loginData = await signIn("credentials", {
        ...data,
        redirect: false,
      })
      console.log("SignIn response:", loginData)
      if (loginData?.error) {
        setLoading(false)
        toast.error("Sign-in error: Check your credentials")
        setPassErr("Wrong Credentials, Check again")
      } else {
        reset()
        setLoading(false)
        toast.success("Login Successful")
        setPassErr("")
        router.push(returnUrl)
      }
    } catch (error) {
      setLoading(false)
      console.error("Network Error:", error)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.08,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  }

  const slideInLeft = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  const slideInRight = {
    hidden: { opacity: 0, x: 30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex min-h-screen">
        {/* Left Side - Image & Branding */}
        <motion.div
          variants={slideInLeft}
          className="hidden lg:flex w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden"
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1587293852726-70cdb56c2866?ixlib=rb-4.0.3&auto=format&fit=crop&w=2072&q=80"
              alt="Aluminum warehouse with stacked materials"
              className="absolute inset-0 w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/90" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center py-8 px-8 text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg mb-4 w-fit">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-2 leading-tight">
                Welcome Back to
                <span className="block text-blue-300 text-4xl">WalterProjects</span>
              </h1>
              <p className="text-slate-200 mb-6 leading-relaxed text-sm max-w-sm">
                Sign in to access your account and continue shopping for premium aluminum windows, doors, and building
                materials.
              </p>

              <div className="space-y-3">
                {[
                  { icon: CheckCircle, text: "Access your order history" },
                  { icon: CheckCircle, text: "Manage your wishlist" },
                  { icon: CheckCircle, text: "Track your shipments" },
                  { icon: CheckCircle, text: "Exclusive member pricing" },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                    className="flex items-center space-x-2"
                  >
                    <div className="bg-blue-500/20 rounded-full p-1">
                      <feature.icon className="h-3 w-3 text-blue-300" />
                    </div>
                    <span className="text-slate-200 text-xs">{feature.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* Trust Indicators */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex items-center space-x-4 text-xs text-slate-300">
                  <div className="flex items-center space-x-1">
                    <Shield className="h-3 w-3" />
                    <span>Secure</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Truck className="h-3 w-3" />
                    <span>Fast Shipping</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Headphones className="h-3 w-3" />
                    <span>24/7 Support</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div variants={slideInRight} className="w-full flex items-center justify-center">
          <div className="w-full">
            <div className="bg-white border-0">
              <div className="text-center pb-4 pt-8 px-6">
                <motion.div variants={itemVariants} className="flex items-center justify-center mb-3 lg:hidden">
                  <div className="bg-gradient-to-r from-slate-600 to-slate-800 p-2 rounded-lg shadow-lg">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                    Welcome Back
                  </h1>
                  <p className="text-sm mt-1 text-slate-600">Sign in to your WalterProjects account to continue shopping</p>
                </motion.div>
              </div>

              <div className="px-6 pb-8">
                <motion.div variants={itemVariants}>
                  {passErr && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600 flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        {passErr}
                      </p>
                    </div>
                  )}

                  <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    <motion.div variants={itemVariants}>
                      <TextInput
                        register={register}
                        errors={errors}
                        label="Email Address"
                        name="email"
                        icon={Mail}
                        placeholder="john.doe@email.com"
                        // className="h-11 border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                      />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <PasswordInput
                        register={register}
                        errors={errors}
                        label="Password"
                        name="password"
                        icon={Lock}
                        placeholder="••••••••"
                        forgotPasswordLink="/forgot-password"
                        // className="h-11 border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                      />
                    </motion.div>

                    <motion.div variants={itemVariants} className="pt-2">
                      <SubmitButton
                        title="Sign In"
                        loadingTitle="Signing In..."
                        loading={loading}
                        className="w-full bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 h-11"
                        loaderIcon={Loader2}
                        showIcon={false}
                      />
                    </motion.div>
                  </form>

                  {/* <div className="flex items-center py-4 justify-center space-x-1 text-slate-900">
                    <div className="h-[1px] w-full bg-slate-200"></div>
                    <div className="uppercase text-xs text-slate-500">Or continue with</div>
                    <div className="h-[1px] w-full bg-slate-200"></div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <Button
                      onClick={() => signIn("google")}
                      variant="outline"
                      className="w-full h-11 border-slate-200 hover:bg-slate-50"
                    >
                      <FaGoogle className="mr-2 w-4 h-4 text-red-500" />
                      Google
                    </Button>
                    <Button
                      onClick={() => signIn("github")}
                      variant="outline"
                      className="w-full h-11 border-slate-200 hover:bg-slate-50"
                    >
                      <FaGithub className="mr-2 w-4 h-4 text-slate-900 dark:text-white" />
                      GitHub
                    </Button>
                  </div> */}

                  <p className="mt-6 text-sm text-slate-600 text-center">
                    Don't have an account?{" "}
                    <Link
                      href="/register"
                      className="text-slate-700 hover:text-slate-900 font-semibold underline transition-colors"
                    >
                      Create one here
                    </Link>
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

import Link from "next/link";
import LoginForm from "./components/login-form";
import SignupForm from "./components/signup-form";
import ContinueAsGuest from "./components/continue-as-guest";
import Header from "../components/header";


export default function AuthPage() {

  return (
    <>
      <Header text="Auth" />
      <div className="flex flex-col px-4 py-5 gap-14 default-font">
        <div>
          <h1 className="text-xl font-bold">Login</h1>
          <LoginForm />
        </div>

        <div className="flex flex-col">
          <Link href={'/auth/forgot-password'} className="a w-fit!">
            Forgot your password?
          </Link>
          <ContinueAsGuest />
        </div>

        <div>
          <h1 className="text-xl font-bold">Create Account</h1>
          <SignupForm />
        </div>
      </div>
    </>
  );
}
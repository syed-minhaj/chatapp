"use client";
import {signIn} from "next-auth/react"

const SignInButt = () => {
    return(
        <div><button onClick={() => signIn()} className="border border-yellow-950 dark:border-yellow-600 text-yellow-950 dark:text-yellow-600 rounded m-4 py-1 px-2"> Sign In</button></div>
    )
}
export default SignInButt;
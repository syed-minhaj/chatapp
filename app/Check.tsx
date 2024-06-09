"use client";
import React from "react";
import { signIn, useSession } from "next-auth/react";

const Check = ({
  children
} : {
  children: React.ReactNode;
}) => {
    const { data: session , status } = useSession();
  if (session && session.user) {
    return (
        <div>{children}</div>

    );
  }
  else if(status != "loading") {
    return (
      <div className="h-screen bg-gray-50 dark:bg-zinc-800">
     <div className=" pt-4 pl-4 font-serif italic text-yellow-950 dark:text-yellow-600 " >ChatApp</div>
     <div className="pt-40   flex flex-row  justify-center items-start ">
      <div className="flex flex-col items-center justify-around  ">
        <div>
         You are currently not login. Pless sign in first
        </div>
        <div><button onClick={() => signIn()} className="border border-yellow-950 dark:border-yellow-600 text-yellow-950 dark:text-yellow-600 rounded m-4 py-1 px-2"> Sign In</button></div>
      </div>
     </div>
    </div>

  );}
  else{
    return(
      <div className="h-screen bg-gray-50 dark:bg-zinc-800">
     <div className=" pt-4 pl-4 font-serif italic text-yellow-950 dark:text-yellow-600 " >ChatApp</div>
     <div className="pt-40   flex flex-row  justify-center items-start ">
      <div className="flex flex-col items-center justify-around ">
        <div>
         Loading...
        </div>
      </div>
     </div>
    </div>
    )
  }
    

}

export default Check;
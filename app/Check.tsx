
import React from "react";
import { getServerSession } from "next-auth";
import SignInButt from "./components/SignInButt";
const Check = async({
  children
} : {
  children: React.ReactNode;
}) => {
  const session = await getServerSession();
  if (session && session.user) {
    return (
        <div>{children}</div>

    );
  }
  else  {
    return (
      <div className="h-screen bg-gray-50 dark:bg-zinc-800">
     <div className=" pt-4 pl-4 font-serif italic text-yellow-950 dark:text-yellow-600 " >ChatApp</div>
     <div className="pt-40   flex flex-row  justify-center items-start ">
      <div className="flex flex-col items-center justify-around  ">
        <div>
         You are currently not login. Pless sign in first
        </div>
        <SignInButt />
      </div>
     </div>
    </div>

  );}
  // else{
  //   return(
  //     <div className="h-screen bg-gray-50 dark:bg-zinc-800">
  //    <div className=" pt-4 pl-4 font-serif italic text-yellow-950 dark:text-yellow-600 " >ChatApp</div>
  //    <div className="pt-40   flex flex-row  justify-center items-start ">
  //     <div className="flex flex-col items-center justify-around ">
  //       <div>
  //        Loading...
  //       </div>
  //     </div>
  //    </div>
  //   </div>
  //   )
  // }
    

}

export default Check;
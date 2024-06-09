"use client";
import React from "react";
import SigninButton from "./SigninButton";





const Appbar = () => {
  return (
      <div className=" flex static  gap-4 p-4  bg-gray-50 dark:bg-zinc-800  h-[70px]">
        <div className=" font-serif italic text-yellow-950 dark:text-yellow-600 grid place-items-center">ChatApp</div>
        <SigninButton />
      </div>
  );
};

export default Appbar;

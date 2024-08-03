
import React from "react";
import UserIco from "./UserIco"


const Appbar = () => {
  return (
      <div className=" flex static  gap-4 p-4  bg-gray-50 dark:bg-zinc-800  h-[70px]">
        <div className=" font-serif italic text-yellow-950 dark:text-yellow-600 grid place-items-center">ChatApp</div>
        <UserIco />
      </div>
  );
};

export default Appbar;

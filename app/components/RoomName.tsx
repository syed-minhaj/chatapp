"use client"
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react"

interface userinfos{
    user1: userinfo | null; 
    user2: userinfo | null; 
    
} 

interface userinfo { 
    id: number; 
    name: string | null; 
    image: string | null; 
    email: string | null; 
}

const RoomName = ( { userinfos} : { userinfos: userinfos}) => {
    var userEmail:string;
    const { data: session } = useSession();
    if (session && session.user) {
        userEmail = session.user.email ?? "";
            return (
                <div className="flex gap-2 items-center">
                    <Link className="text-zinc-600 dark:text-gray-200 p-1 " href={`/`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75 14.25 12m0 0 2.25 2.25M14.25 12l2.25-2.25M14.25 12 12 14.25m-2.58 4.92-6.374-6.375a1.125 1.125 0 0 1 0-1.59L9.42 4.83c.21-.211.497-.33.795-.33H19.5a2.25 2.25 0 0 1 2.25 2.25v10.5a2.25 2.25 0 0 1-2.25 2.25h-9.284c-.298 0-.585-.119-.795-.33Z" />
                        </svg>
                    </Link>
                    <img src={userinfos.user1?.email == userEmail ? (userinfos.user2?.image ?? "") : (userinfos.user1?.image ?? "")}
                    alt="user1" className="rounded-full p-1 " width="30" height="30"/>
                    {userinfos.user1?.email == userEmail ? userinfos.user2?.name : userinfos.user1?.name}
                </div>
           )
    }
    
}

export default RoomName
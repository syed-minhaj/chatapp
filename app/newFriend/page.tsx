"use client";
import Link from "next/link";
import { useState } from "react";
import { prisma } from "./../lib/prisma";
import { createNotification } from "../actions/actions";
import { useSession } from "next-auth/react";


export default function Home() {
    const [sending , setSending] = useState(false)
    const [personEmail , setPersonEmail] = useState("")
    const [message , setMessage] = useState("")
    const { data: session } = useSession();
    var senderEmail:any = "" ;
    if (session && session.user) {
         senderEmail = session.user.email ;
    }
    function sendResquest(){
        setSending(true)
        createNotification( senderEmail , personEmail , message).then(()=>{
            setSending(false)
            setMessage("")
            setPersonEmail("")
        })
    }

    return(
        <div className="bg-gray-50 dark:bg-zinc-800 min-h-[100dvh]">
            <div className=" flex   gap-4 p-4  bg-gray-50 dark:bg-zinc-800 w-screen h-[70px]">
                <Link href="/" className="flex ml-auto text-yellow-950 dark:text-yellow-600 ">home</Link>
            </div>
            <div className=" p-20 flex justify-center">
                <div className="flex flex-col ">
                    <div >email of friend </div>
                    <input  className="border-2 rounded-md border-yellow-900 mb-2 p-1 disabled:opacity-50" value={personEmail} onChange={(e:any) => setPersonEmail(e.target.value)} type="email"
                    placeholder="*requried" disabled={sending}/>
                    <input  className="border-2 rounded-md border-yellow-900 mb-2 p-1 disabled:opacity-50" value={message} onChange={(e:any) => setMessage(e.target.value)} type="text"
                    placeholder="any message" disabled={sending}/>
                    <button onClick={()=>{sendResquest()}} disabled={sending} 
                    className="p-2 px-4 w-fit ml-auto rounded bg-yellow-900 dark:bg-yellow-600 disabled:opacity-50">
                        {sending ? "sending" : "send request"}
                    </button>
                </div>
            </div>
        </div>
    )
}
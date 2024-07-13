"use client";
import Link from "next/link";
import { useState } from "react";
import { prisma } from "./../lib/prisma";
import { createNotification } from "../actions/actions";
import { useSession } from "next-auth/react";


export default function Home() {
    const [showPopup , setShowPopup] = useState(false)
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
        createNotification( senderEmail , personEmail , message).then((data)=>{
            if (data == "no user found"){
                setShowPopup(true)
            }
            setSending(false)
            setMessage("")
            setPersonEmail("")
        })
    }

    return(
        <>
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
        {showPopup && (
                <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                            User you are trying to send request to is not registered ask them to signIn using google account
                                        </h3>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm" onClick={() => setShowPopup(false)}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
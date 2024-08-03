"use client";
import React, { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import ModeIco from "./Mode";
import Link from "next/link";
import Image from 'next/image'
import { createFriend, deletNotification, getUser, getnotifications } from "../actions/actions";
import { revalidatePath } from "next/cache";

interface Notification {
  id: number;
  senderID: number;
  receiverID: number;
  message: string;
  senderName: string | null;
  senderImg: string | null;
}
interface userInfo {
  id: number;
  name: string | null;
  image: string | null;
  email: string | null;
} 

const UserIco = () => {
  const { data: session } = useSession();
  
  const [show , setShow] = useState('hidden')
  const [showNoti , setShowNoti] = useState(false)
  const [notifications , setNotifications] = useState<Notification[]>([])
  
  useEffect(() => {
    if (session && session.user) {
      getnotifications(session.user.email).then(n => {
        setNotifications(n);
      });
    }
  }, [session]);

  const Notification = ({f , key} : { f: Notification; key: number; }) => {
    const [removeingNotification , setRemoveingNotification] = useState(false)
    
    return(
      
      <div className={`mx-2 mt-2 w-[100% - 8px] dark:bg-gray-700 bg-gray-400  rounded items-center flex `}>
              <Image alt="no img" width={25} height={25} src={f.senderImg ?? ""} 
                className={` rounded-full`} />
              <div>{f.senderName}</div>
              <div className="m-1 opacity-60 ">{f.message}</div>
              <div className="ml-auto flex ">
                <button onClick={() => {
                  setRemoveingNotification(true);
                  createFriend(f.senderID , f.receiverID , f.id).then(()=>{
                    const updatedNotifications = notifications.filter(n => n.id!== f.id);
                    setNotifications(updatedNotifications);
                    setRemoveingNotification(false);

                  })
                }} disabled={removeingNotification}
                className="bg-green-600 p-1 px-2 rounded m-1 disabled:opacity-50 ">Appect</button>
                <button onClick={() => {
                  setRemoveingNotification(true);
                  deletNotification(f.id).then(()=>{
                    notifications.forEach((n, i) => {
                      if (n.id === f.id) {
                        notifications.splice(i, 1);
                      }
                    });
                    setNotifications(notifications);
                  })
                }} disabled={removeingNotification}
                className="bg-red-600 p-1 px-2 rounded m-1 disabled:opacity-50 ">Reject</button>
              </div>
      </div>
    
    )
  }
  
    return (
      <>
      <div className="flex ml-auto z-30 ">
        <div>
            <button onClick={() => {
                                if(show == 'hidden'){setShow('flex')}
                                else{setShow('hidden')}
                            }}
             className="flex rounded-full  p-1 ml-auto ">
                <Image className="rounded-full" src={session?.user?.image ?? ""} alt="no img" height={30} width={30} />
            </button>
            <div className="flex gap-1">
              <Link href="/newGroupe" 
                className={`px-2 py-1 bg-slate-500 rounded text-gray-50 ${show} `} >+ group</Link>
              <Link href="/newFriend"
                className={`px-2 py-1 bg-slate-500 rounded text-gray-50 ${show} `} >+ friend</Link>
            </div>
            <div className="flex gap-1 my-2 ">
              <button className={`px-2 py-1 bg-slate-500  rounded text-gray-50 ${show} `} ><ModeIco/></button>
              <button className={`px-2 py-1 bg-slate-500  rounded text-gray-50 ${show} `} onClick={()=>{setShowNoti(!showNoti)}}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5" />
</svg>

              </button>
            </div>
            <button onClick={() => signOut()}
             className={`px-2 py-1 bg-red-500 m-2 rounded text-gray-50 ${show} `} >sign out
            </button>
        </div>
      </div>
      
      <div className= {` h-[100dvh] w-full justify-center items-center
       bg-black bg-opacity-65  fixed top-0 left-0 z-20 ${showNoti ? `flex` : `hidden` }` }>
        <button className="fixed left-0 top-0" onClick={()=>{setShowNoti(false)}} >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-yellow-600 font-bold m-2 ">
  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
</svg>

        </button>
        <div className="w-[80dvw] h-[80vh]  rounded dark:bg-zinc-800 bg-slate-300 flex flex-col ">
          {notifications.map((f:Notification)=> (
            <Notification f={f} key={f.id} />
          ))}
        </div>
      </div>
      </>
    );
  
};



export default UserIco;

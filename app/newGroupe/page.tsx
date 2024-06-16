"use client";
import Link from "next/link";
import { useState } from "react";
import { createRoom, createRoomAndAddUser } from "../actions/actions";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";



export default function Home() {
    
    const [roomName , setRoomName] = useState("")
    const [submiting, setSubmiting] = useState(false)
    const router = useRouter();

    const { data: session } = useSession();
    let myemail: string;

    if (session && session.user) {
        myemail = session.user.email || "";
    }
    const onSubmit = () => {
        setSubmiting(true)
        createRoomAndAddUser(roomName , myemail).then(() => {
            setSubmiting(false)
            setRoomName("")
            router.push("/")
        })
    }

    
    

    return(
        <div className="bg-gray-50 dark:bg-zinc-800 min-h-[100dvh]">
            <div className=" flex   gap-4 p-4  bg-gray-50 dark:bg-zinc-800 w-screen h-[70px]">
                <Link href="/" className="flex ml-auto text-yellow-950 dark:text-yellow-600 ">home</Link>
            </div>
            <div className=" p-20 flex justify-center">
                <div className=" ">
                    <div >name of group</div>
                    <input  className="border-2 rounded-md border-yellow-900 my-2 p-1 disabled:opacity-50" value={roomName} onChange={(e:any) => setRoomName(e.target.value)} type="text"
                    placeholder="*requried" disabled={submiting} />
                    <button className="bg-yellow-900 text-white rounded-md p-2 mx-2 disabled:opacity-50"
                     onClick={onSubmit} disabled={submiting}>
                        create
                    </button>
                </div>
            </div>
        </div>
    )
}
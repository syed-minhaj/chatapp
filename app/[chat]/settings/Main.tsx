"use client";
import { addUserToRoom , changeRoomName, createNotification, getFriendsByUser, getUserID } from "@/app/actions/actions";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import { useEffect, useState } from "react";

interface user { 
    id: number; 
    name: string | null; 
    image: string | null; 
    email: string | null; 
}

export default function Main({usersID, chatID}: {usersID: number[], chatID: number}) {

    const [myID, setMyID] = useState<number>();
    const [isLoading, setIsLoading] = useState(true);
    const [roomName , setRoomName] = useState("")
    const [userID , setUserID] = useState<number | null>(null)
    const [friends , setFriends] = useState<user[]>([])
    const [addingUser, setAddingUser] = useState(false)
    const [changeingName, setChangeingName] = useState(false)
    const router = useRouter();

    const { data: session } = useSession();
    let myemail: string;

    if (session && session.user) {
        myemail = session.user.email || "";
    }

    const getMyID = async () => {
        const id = await getUserID(myemail);
        setMyID(id)
        
    };

    useEffect(() => {
        getMyID().then(() => {
            if(myID == null){return}
            else if ( !usersID.includes(myID)) {
                router.push("/"); 
            }else{
                setIsLoading(false)
                
            }
        });
    }, [usersID, myID]);

    useEffect(() => {
        const getFriends = async () => {
            const friends = await getFriendsByUser(myID ?? 0);
            setFriends(friends)
        }
        getFriends();
    })
    const onChangeName = () => {
        setChangeingName(true)
        changeRoomName(chatID , roomName).then(() => {
            setRoomName("")
            setChangeingName(false)
        })
    }
    const addUserToRoomByID = () => {
        setAddingUser(true)
        addUserToRoom(Number(userID) ?? 0, chatID).then(() => {
            setUserID(null)
            setAddingUser(false)
        })
    }

    

    if (isLoading) {
        return (
                <div className="pt-40  bg-gray-50 dark:bg-zinc-800 min-h-[100dvh] flex flex-row  justify-center items-start ">
                    <div className="flex flex-col items-center justify-around ">
                        <div>Loading...</div>
                    </div>
                </div>
        );
        
    }
    // in html create a drop box with search to find all friends 

    return (
        <div className="bg-gray-50 dark:bg-zinc-800 min-h-[100dvh]">
            <div className=" flex   gap-4 p-4  bg-gray-50 dark:bg-zinc-800 w-screen h-[70px]">
                <Link href={`/${chatID}`} className="flex  text-yellow-950 dark:text-yellow-600 ">Back</Link>
            </div>
            <div className=" p-20 flex flex-col justify-center items-center gap-2">
                <div className="  ">
                    <div >change room name </div>
                    <input  className="border-2 rounded-md border-yellow-900 p-1 disabled:opacity-50" value={roomName} onChange={(e:any) => setRoomName(e.target.value)} type="text"
                    placeholder="Enter new name" disabled={changeingName} />
                    <button className="bg-yellow-900 text-white rounded-md  p-1 px-2 m-2 sm:m-0 sm:mx-2 disabled:opacity-50"
                     onClick={onChangeName} disabled={changeingName} >Change</button>
                </div>
                <div>
                    <div >select friend to add</div>
                    <select className="border-2 rounded-md border-yellow-900 p-1 disabled:opacity-50" value={userID!== null? userID : undefined} onChange={(e:any) => setUserID(e.target.value)}  disabled={addingUser}>
                        {friends.filter((friend) => !usersID.includes(friend.id) ).map((friend) => (
                            <option key={friend.id} value={friend.id.toString()}>{friend.name}</option>
                        ))}
                    </select>
                    
                    <button className="bg-yellow-900 text-white rounded-md p-1 px-2 mx-2 disabled:opacity-50"
                    onClick={addUserToRoomByID} disabled={addingUser}>Add</button>
                </div>
            </div>
        </div>
    )
}
"use client";
import Appbar from "./components/Appbar";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { getRoomsByUser, getUser } from "./actions/actions";

interface Room {
  id: number;
  name: string | null;
}

export default function Home() {
  

  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<{ id: number; name: string | null; }[]>([]);
  const { data: session } = useSession();
  let myemail: string = "";

  if (session && session.user) {
      myemail = session.user.email || "";
  }

  const getRooms = async () => {
    setRooms(await getRoomsByUser(myemail));
  }

  useEffect(() => {
    setLoading(true);
    getRooms().then(() => setLoading(false));
  }, [myemail]);

  function getName(roomName: string){
    const [number1, number2] = roomName.split("/")
    return {number1 : Number(number1), number2 : Number(number2)}
  }

  async function getUserInfo(usersID: number[]){
    const user1 = await getUser(usersID[0])
    const user2 = await getUser(usersID[1])
    return {user1 : user1 , user2 : user2 }
  }

  const RoomName =  ({roomName} : {roomName: string | null}) => {
    if(roomName === null){ return <h1>no name</h1>}
    const [name , setName] = useState<string | null>(roomName)
    const [img , setImg] = useState<string | null>(null)
    const [isNotRoom, setIsNotRoom] = useState(false)
    
    if(getName(roomName).number1 && getName(roomName).number2){
        getUserInfo([getName(roomName).number1, getName(roomName).number2]).then((userinfos) => {
            if (userinfos.user1?.email == myemail && userinfos.user2?.name) {
                setIsNotRoom(true)
                setName(userinfos.user2?.name)
                setImg(userinfos.user2?.image)
            } else if (userinfos.user2?.email == myemail && userinfos.user1?.name) {
                setIsNotRoom(true)
                setName(userinfos.user1?.name)
                setImg(userinfos.user1?.image)
            }
        })
    } 
        
    return <div className="text-sm flex flex-col items-center justify-center">
            {isNotRoom ? <img className="rounded-full" src={img? img : ""} height={30} width={30} /> : ""}
            {name}
            </div>
    
  }
  

  const RoomComponent = () => {
    return (
      <>
      {rooms?.map((r: Room) => (
        <Link href={`/${r.id}`} className="
        relative cross justify-center items-center border-2 flex
         rounded border-yellow-900 w-full h-32 bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600">
          <RoomName roomName={r.name}/>
        </Link>
     ))}
     </>
    )
  }
  
  return (
    <main className="w-[100vsw] min-h-[100dvh] bg-gray-50 dark:bg-zinc-800 z-1 ">
      
      <Appbar/>
      <div className=" grid place-items-center grid-cols-2 gap-2 p-2 md:grid-cols-6 sm:grid-cols-4 text-xl w-full">
        {loading ? <div className=" text-gray-800 dark:text-gray-50 "> Loading...</div> : <RoomComponent/>}
      </div>
    </main>
  );
}

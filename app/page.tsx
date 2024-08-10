import Appbar from "./components/Appbar";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { getRoomsByUser} from "./actions/actions";
import { PrismaClient } from "@prisma/client";



export default async function Home() {
  
  const prisma = new PrismaClient();
  const session = await getServerSession(); 
  let myemail: string = session?.user?.email || "";
  const rooms = await getRoomsByUser(myemail);
  function getName(roomName: string){
    const [number1, number2] = roomName.split("/")
    return {number1 : Number(number1), number2 : Number(number2)}
  }
  function getUserInfo(usersID: number[]){
    function getUser(id: number){
      return prisma.user.findUnique({
        where: {
          id: id,
        },
        select: {
          name: true,
          email: true,
          image: true,
        },
      });
    }
    const user1 =  getUser(usersID[0])
    const user2 =  getUser(usersID[1])
    return {user1 : user1 , user2 : user2 }
  }
  const newRooms = await Promise.all(rooms.map( async (room) => {
    if(room.name === null){return {id : room.id , name : "no name" , img : null}}
      
      if(getName(room.name).number1 && getName(room.name).number2){
          const userinfos = getUserInfo([getName(room.name).number1, getName(room.name).number2])
              if ((await userinfos.user1)?.email == session?.user?.email && (await userinfos.user2)?.name) {
                  return {id : room.id , name : (await userinfos.user2)?.name , img : (await userinfos.user2)?.image , isNotRoom : true  }
              } else if ((await userinfos.user2)?.email == session?.user?.email && (await userinfos.user1)?.name) {
                  return{ id : room.id , name : (await userinfos.user1)?.name , img : (await userinfos.user1)?.image , isNotRoom : true  }
              }
      }
    return {id : room.id , name : room.name , img : null , isNotRoom : false  }
  
  }))
  const RoomComponent = () => {
    return (
      <>
      {newRooms?.map((room) => (
        <Link href={`/${room.id}`} className="
        relative cross justify-center items-center border-2 flex
         rounded border-yellow-900 w-full h-32 bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600">
            <div className="text-sm flex flex-col items-center justify-center">
            			{room.isNotRoom ? <img className="rounded-full" src={room.img? room.img : ""} alt={""} height={30} width={30} /> : ""}
        					{room.name}
        		</div>
        </Link>
      ))}
     </>
    )
  }
  
  return (
    <main className="w-[100vsw] min-h-[100dvh] bg-gray-50 dark:bg-zinc-800 z-1 ">
      
      <Appbar/>
      <div className=" grid place-items-center grid-cols-2 gap-2 p-2 md:grid-cols-6 sm:grid-cols-4 text-xl w-full">
         <RoomComponent/>
      </div>
    </main>
  );
}

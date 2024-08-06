import { getMessages } from "../actions/actions";
import UserIco from "../components/UserIco";
import { prisma } from "../lib/prisma";
import Main from "./Main";
import Cryptr from "cryptr";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import BackButton from "../components/BackButton";


interface pageProps{
    params: {chat:  number|null|undefined }
}
export default async function Home({params}: pageProps) {
    
    const session = await getServerSession();
    const usersID = await prisma.room.findUnique({
        where:{id : Number(params.chat) },
        select:{
            users: {
                select: { userId : true}
            }
        }
    }).then(data => data?.users.map(user => user.userId))
    const user = await prisma.user.findUnique({
        where: {
            email: session?.user?.email ?? "",
        },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
        }
    })
    if(!user?.id || !usersID?.includes(user?.id )){
        redirect("/")
    }
    const secretKey = process.env.NEXT_PUBLIC_PUSHER_SECRET as string;
    const newCryptr = new Cryptr(secretKey);
    const unmessages = await getMessages(Number(params.chat))
    const messages = unmessages.map(message => {
        return {
            ...message,
            message: newCryptr.decrypt(message.message)
        }
    })
    const room = await prisma.room.findUnique({
        where:{id : Number(params.chat) },
    })
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
        const user1 = getUser(usersID[0])
        const user2 = getUser(usersID[1])
        return {user1 : user1 , user2 : user2 }
    }
    const getNewRoom:any=  async () => {
        if(!room?.name){return {id : room?.id , name : "no name" , img : null , isNotRoom : false}}
        
        if(getName(room?.name).number1 && getName(room?.name).number2){
            const userinfos = getUserInfo([getName(room?.name).number1, getName(room?.name).number2])
                if ((await userinfos.user1)?.email == session?.user?.email && (await userinfos.user2)?.name) {
                    return {id : room.id , name : (await userinfos.user2)?.name , img : (await userinfos.user2)?.image , isNotRoom : true  }
                } else if ((await userinfos.user2)?.email == session?.user?.email && (await userinfos.user1)?.name) {
                    return{ id : room.id , name : (await userinfos.user1)?.name , img : (await userinfos.user1)?.image , isNotRoom : true  }
                }
        }
        return {id : room.id , name : room.name , img : null , isNotRoom : false  }
    
    }
    const newRoom = await getNewRoom()

    

    return(
        <div className="min-h-[100svh] bg-gray-50 dark:bg-zinc-800">
            <div className=" flex static  gap-4 p-4  bg-gray-50 dark:bg-zinc-800  h-[70px]">
                <div className=" font-serif italic text-yellow-950 dark:text-yellow-600 grid place-items-center">
                    <div className="flex gap-2 items-center">
                        <BackButton />
                        {newRoom.isNotRoom ? <img src={newRoom.img ?? "" } alt="user1" className="rounded-full p-1 " width="30" height="30"/> : "" }
                        {newRoom.name}
                        {newRoom.isNotRoom ? "" :
                        <a href={`/${newRoom.id}/settings`} className=" p-2 text-gray-500" >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width={1.5} stroke="currentColor" className="size-4 ">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            </svg>
                        </a>}
                    </div>
                </div>
                <UserIco />
            </div>
            <Main roomID={Number(params.chat)} messages={messages} user={user}  />
        </div>
    )

}
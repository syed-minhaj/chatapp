import { getMessages, getUser } from "../actions/actions";
import SigninButton from "../components/SigninButton";
import { prisma } from "../lib/prisma";
import Main from "./Main";
import RoomName from "../components/RoomName";
import RoomName1 from "../components/RoomName";
import Link from "next/link"

interface pageProps{
    params: {chat:  number|null|undefined }
}
export default async function Home({params}: pageProps) {
    
    const messages = await getMessages(Number(params.chat))
    
    const usersID = await prisma.room.findUnique({
        where:{id : Number(params.chat) },
        select:{
            users: {
                select: { userId : true}
            }
        }
    })

    const room = await prisma.room.findUnique({
        where:{id : Number(params.chat) },
    })
    
    // room.name will be like "number1/number2" create a function which will return number1 and number2
    function getName(roomName: string){
        const [number1, number2] = roomName.split("/")
        return {number1 : Number(number1), number2 : Number(number2)}
    }
    
    const test = room?.name ? room.name : "";

    async function getUserInfo(usersID: number[]){
        const user1 = await getUser(usersID[0])
        const user2 = await getUser(usersID[1])
        return {user1 : user1 , user2 : user2 }
    }

    const RoomNames = async () => {

        if(getName(test).number1 && getName(test).number2){
            const userinfos = await getUserInfo([getName(test).number1, getName(test).number2])
            return <RoomName  userinfos={userinfos}  />
        }else{
            return <div className="flex justify-center items-center">
                    <Link className="text-zinc-600 dark:text-gray-200 p-1 " href={`/`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75 14.25 12m0 0 2.25 2.25M14.25 12l2.25-2.25M14.25 12 12 14.25m-2.58 4.92-6.374-6.375a1.125 1.125 0 0 1 0-1.59L9.42 4.83c.21-.211.497-.33.795-.33H19.5a2.25 2.25 0 0 1 2.25 2.25v10.5a2.25 2.25 0 0 1-2.25 2.25h-9.284c-.298 0-.585-.119-.795-.33Z" />
                        </svg>
                    </Link>
                    <div>{test}</div>
                    <Link href={`/${params.chat}/settings`} className=" p-2 text-gray-500" >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 ">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                    </Link>
                   </div>
        }
    }

    

    

    
    return(
        <div className="min-h-[100svh] bg-gray-50 dark:bg-zinc-800">
            <div className=" flex static  gap-4 p-4  bg-gray-50 dark:bg-zinc-800  h-[70px]">
                <div className=" font-serif italic text-yellow-950 dark:text-yellow-600 grid place-items-center">
                    <RoomNames/>
                </div>
                <SigninButton />
            </div>
            <Main usersID = {usersID? usersID.users.map(user => user.userId): []} 
            roomID={Number(params.chat)} messages={messages}  />
        </div>
    )
}




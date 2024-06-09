import { prisma } from "@/app/lib/prisma";
import Main from "./Main";
import { getFriendsByUser } from "@/app/actions/actions";

interface pageProps{
    params: {chat:  number|null|undefined }
}
export default async function Home({params}: pageProps) {

    const usersID = await prisma.room.findUnique({
        where:{id : Number(params.chat) },
        select:{
            users: {
                select: { userId : true}
            }
        }
    })


    
    return (
        <Main  usersID = {usersID? usersID.users.map(user => user.userId): []} 
        chatID={Number(params.chat)}  />
    )
}
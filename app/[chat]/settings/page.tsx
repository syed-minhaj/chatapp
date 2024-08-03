import { prisma } from "@/app/lib/prisma";
import Main from "./Main";
import { getFriendsByUser, getUserID } from "@/app/actions/actions";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

interface pageProps{
    params: {chat:  number|null|undefined }
}
export default async function Home({params}: pageProps) {

    const session = await getServerSession()
    const usersID = await prisma.room.findUnique({
        where:{id : Number(params.chat) },
        select:{
            users: {
                select: { userId : true}
            }
        }
    }).then(data => data?.users.map(user => user.userId))
    const id = await getUserID(session?.user?.email ?? "");
    if( !id  || !usersID?.includes(id)){
        redirect("/")
    }
    const friends = await getFriendsByUser(id ?? 0)

    
    return (
        <Main  usersID = {usersID || []} ofriends={friends}
        chatID={Number(params.chat)}  />
    )
}
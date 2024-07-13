"use server"
import { revalidatePath } from "next/cache"
import { prisma } from "./../lib/prisma"
import Pusher from 'pusher';
import { cachedDataVersionTag } from "v8";

// Assuming you have initialized Pusher somewhere in your server setup
const pusher = new Pusher({
  appId: process.env.NEXT_PUBLIC_PUSHER_APP_ID || "",
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || "",
  secret: process.env.NEXT_PUBLIC_PUSHER_SECRET || "",
  cluster: "mt1", // Replace 'your_cluster' with your actual cluster name
  useTLS: true,
});

interface message { 
    message: string; 
    userEmail: string; 
    roomID: number; 
}

export async function createNotification(senderEmail: any , ReseverEmail: string , message: string){
    // if ReseverEmail is not in the database then return a message to senderEmail
    const datad = await prisma.user.findFirst({
        where: {
            email: ReseverEmail,
        },
    })
    if(datad == null){
        return "no user found"
    }
    await prisma.notification.create({
        data:{
            message : message,
            sender: {
                connect: {email :senderEmail},
            },
            receiver: {
                connect: {email : ReseverEmail},
            } ,
        },
    })
    return "user found"
    
} 

export async function getnotifications(ReseverEmail: any){
    const data = await prisma.notification.findMany({
        where:{
            receiver: {
                email: ReseverEmail
            }
        }
    })
    const enhancedData: {
        id: number;
        senderID: number;
        receiverID: number;
        message: string;
        senderName: string | null;
        senderImg: string | null ;
    }[] = await Promise.all(data.map(async (d) => {
            const info = await prisma.user.findFirst({
                where: { id: d.senderID },
                select: { 
                    name: true ,
                    image: true,
                },
            });
            if(info){ return {...d, senderName: info.name , senderImg : info.image }; }
            return {...d, senderName: "" , senderImg : "" };
        }));

    return enhancedData;
    //return data 
}

export async function getUser(id: number){
    const data = await prisma.user.findFirst({
        where: {
           id : id,
        }
    })
    return data
} 

export async function deletNotification(id: number){
    await prisma.notification.delete({
        where:{
            id: id,
        }
    })
    revalidatePath("/")
}

export async function createFriend(id1: number , id2: number , notiId : number){
    // if id1 and id2 are already friends then return
    
    await prisma.user.update({
        where: { id: id1 },
            data: {
              friends: {
                connect: { id: id2 },
              },
            },
    });
    await prisma.user.update({
        where: { id: id2 },
            data: {
              friends: {
                connect: { id: id1 },
              },
            },
    })
    const roomId = await createRoom(`${id1} / ${id2}`)
    addUserToRoom(id1 , roomId)
    addUserToRoom(id2 , roomId)
    deletNotification(notiId)
    revalidatePath("/")
    
}

export async function createRoom(name: string) {
    const newRoom = await prisma.room.create({
        data: {
            name: name,
        }
    })
    
    return newRoom.id
}

export async function addUserToRoom(userId:number , roomId : number) {
   
    await prisma.roomUser.create({
        data:{
            roomId: roomId,
            userId: userId,
        }
    })
}

export async function getMessages(roomId: number) {
    
    const data = await prisma.message.findMany({
        where: { roomID: roomId },
    });

    const enhancedData: {
        id: number,
        message: string,
        userID : number,
        roomID : number,
        userName : string | null,
    }[] = await Promise.all(data.map(async (d) => {
            const info = await prisma.user.findFirst({
                where: { id: d.userID },
                select: { name: true },
            });
            if(info){ return {...d, userName: info.name }; }
            return {...d, userName: "" };
        }));

    return enhancedData;
}

export async function createMessage(message: message){
    const userData  = await prisma.user.findFirst({
        where: {email : message.userEmail},
        select: {
            id : true,
            name: true,
        }
    }) || {
        id: 99999999,
        name: "dfs",
    }
    await prisma.message.create({
        data:{
            message: message.message,
            roomID: message.roomID,
            userID: userData.id ,
        }
    })
    const channelName = `room-${message.roomID}`; // Assuming you're using room IDs to identify channels
    const eventName = 'new-message'; // The name of the event to trigger

  // Trigger the event with the message details
    await pusher.trigger(channelName, eventName, {
        message: message.message,
        userID: userData.id,
        userName: userData.name,
    });
    
}

export async function createRoomAndAddUser(roomName: string , userEmail: string){
    const room = await createRoom(roomName)
    const userID = await getUserID(userEmail)
    await addUserToRoom(userID , room)
}

export async function getUserID(email: string){
    const data = await prisma.user.findFirst({
        where: {
            email : email,
        },
        select:{
            id: true,
        }
    })
    if(data){
        return data.id
    }
    const newUser = await prisma.user.create({
        data:{
            email: email,
        }
    })
    return newUser.id
}

export async function changeRoomName(roomID: number , newName: string){
    await prisma.room.update({
        where: { id: roomID },
        data: {
            name: newName,
        },
    })
}

export async function addUserToRoomByEmail(email: string , roomId : number){
    const userID = await getUserID(email)
    await addUserToRoom(userID , roomId)
}

export async function getRoomsByUser(userEmail: string){
    const data = await prisma.roomUser.findMany({
        where: {
            user: {
                email: userEmail,
            },
        },
        select: {
            roomId: true,
        },
    });
    const roomIds = data.map((d) => d.roomId);
    const rooms = await prisma.room.findMany({
        where: {
            id: {
                in: roomIds,
            },
        },
    });
    return rooms;
}

// create a function to get all of friends of a user by user email

export async function getFriendsByUser(userID: number){
    // get friends of user and users who are friends with user
    const data = await prisma.user.findMany({
        where: {
            friends: {
                some: {
                    id : userID,
                },
            },

        },
    })
    return data
}


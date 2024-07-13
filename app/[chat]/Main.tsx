"use client"
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation'; 
import resizeTextarea from "../api/resizeTextarea";
//import Cryptr from 'cryptr';
import { createMessage,  getUserID } from "../actions/actions";
import Pusher from 'pusher-js';
import { useSession } from "next-auth/react";

interface message { 
    id: number; 
    message: string; 
    userID: number; 
    roomID: number;
    userName : string | null; 
}[]; 

interface userInfo {
    id: number;
    name: string | null;
    image: string | null;
    email: string | null;
}

const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || "", {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "",
});

const Main = ({ usersID, roomID, messages }: { usersID: number[], roomID: number, messages: message[] }) => {
    
    const router = useRouter(); // Initialize useRouter

    const [newMessages, setNewMessages] = useState<message[]>(messages);
    const [message, setMessage] = useState("");
    const [myID, setMyID] = useState<number>();
    const [isLoading, setIsLoading] = useState(true);

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
                setTimeout(() => {
                    resizeTextarea()    
                }, 10);
                
            }
        });
    }, [usersID, myID]);

    useEffect(() => {
        const channel = pusher.subscribe(`room-${roomID}`);
        channel.bind('new-message', (data: any) => {
            setNewMessages((prev) => prev.filter((m) => m.userName != "test-test-test-123-test"))
            setNewMessages((prev) => [...prev, {
                id: prev.length + 1,
                message: data.message,
                userID: data.userID,
                roomID: roomID,
                userName: data.userName,
            }]);
            
        });

        return () => {
            channel.unbind();
            pusher.unsubscribe(`room-${roomID}`);
        };
    }, [roomID]);

   

    const submit = () => {
        
        setNewMessages((prev) => [...prev, {
                id: prev.length + 1,
                message: message,
                userID: (myID ) ? myID : 0,
                roomID: roomID,
                userName: "test-test-test-123-test",
        }]);
        createMessage({
            message: message,
            userEmail: myemail,
            roomID: roomID,
        });
        setMessage("");
    };
    
    
    
    if (isLoading) {
        return (
                <div className="pt-40   flex flex-row  justify-center items-start ">
                    <div className="flex flex-col items-center justify-around ">
                        <div>Loading...</div>
                    </div>
                </div>
        );
        
    }
    

    return(
        
            <div>
                <div className=" w-full  flex justify-center  ">
                    <div className="flex flex-col w-11/12 sm:w-[80%] mt-4 gap-3 overflow-y-auto scrollbar-thumb-blue 
                    scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch">
                        {newMessages.map((m: message , index:number) => (
                        <div className="">  
                            <div className={'flex  w-full ' + (m.userID == myID ? 'justify-end' : "" )}>
                                <div className={'px-4 py-2 rounded-lg flex items-end w-fit ' +
                                ( m.userID == myID ? ' bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-gray-50 ':
                                '  bg-yellow-950 dark:bg-yellow-600 text-gray-50 ') +
                                ( m.userName == "test-test-test-123-test" ? ` opacity-50 bg-opacity-50 ` : " " ) }>
                                    {m.message} 
                                </div>
                            </div>
                            <div className={'flex  w-full text-xs text-opacity-65 ' + (m.userID == myID ? 'justify-end' : "" )
                                + (m.userID == myID  ? ' hidden ' : "")
                            }>{m.userName}</div>
                        </div>
                        ))}
                    </div>
                </div>
                
                <div className="w-full h-[20vh]"></div>
                    <div className=" fixed bottom-0 pb-2 w-screen flex flex-col  items-center bg-opacity-60 bg-gradient-to-b 
                    from-transparent to-gray-50 dark:to-zinc-800">
                        <div className=" topB w-6 relative  cursor-n-resize active:bg-yellow-950  
                        dark:active:bg-yellow-600  sm:left-[33%] left-[40%] h-3 mt-2  bg-zinc-500 rounded-t "></div>
                        <textarea value={message} onChange={(e) => setMessage(e.target.value)}
                        className="bg-gray-200 dark:bg-zinc-700 disabled:opacity-50 mx-2 mb-[-16px] p-1 border-2
                        border-yellow-950 dark:border-yellow-600  txA resize-none sm:w-3/4 w-11/12  rounded-md  min-h-[56px] max-h-[60dvh]" ></textarea>
                         <button onClick={submit}
                          className="bg-yellow-950 dark:bg-yellow-600 cursor-pointer disabled:opacity-50  h-6 w-6 relative top-[-24px] 
                          sm:left-[calc(37.5%-28px)] rounded left-[40%] flex justify-center items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" 
                          className="w-4 h-4 opacity-60 text-gray-50 dark:text-gray-50 "  >
                            <path stroke-linecap="round" stroke-linejoin="round" 
                          d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"></path>
                          </svg>
                          </button>
                    </div>
            </div>
        
    )
    
};

export default Main;


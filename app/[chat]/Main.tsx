"use client"
import { useEffect, useState , useRef } from "react"; 
import resizeTextarea from "../api/resizeTextarea";
import { createMessage , deleteMessage as deleteMessageAPI} from "../actions/actions";
import io from "socket.io-client";
import { Socket  } from "socket.io-client";


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


const Main = ({ roomID, messages , user }: { roomID: number, messages: message[] , user: userInfo | null}) => {
    
    const [newMessages, setNewMessages] = useState<message[]>(messages);
    const [message, setMessage] = useState("");
    const [socket, setSocket] = useState<Socket>();
    const [showDeleteButtons, setShowDeleteButtons] = useState(Object.assign({}, ...messages.map(obj => ({ [obj.id]: false }))));
    const messageRefs = useRef<HTMLDivElement[]>([]);
    
    useEffect(() => {
        const nodejs_url = process.env.NEXT_PUBLIC_NODEJS_BACKEND_URL || "";
        const socket = io(nodejs_url);
        setSocket(socket)
        socket.on("connection" , () => {
            console.log("connected")
            
        });
        socket.emit('join', `room-${roomID}`);
        socket.on('new-message', (data: any) => {
            setNewMessages((prev) => prev.filter((m) => m.userName != "test-test-test-123-test"))
            setNewMessages((prev) => [...prev, {
                id: data.id,
                message: data.message,
                userID: data.userID,
                roomID: roomID,
                userName: data.userName,
            }]);
            
        });
        socket.on('delete-message', (data: any) => {
            setNewMessages(prev => prev.filter((m) => m.id != data.id))
        });
        return () => {
            socket.disconnect();
        };
            
    }, [roomID]);

    const submit = () => {
        setNewMessages((prev) => [...prev, {
                id: prev.length + 1,
                message: message,
                userID: user?.id || 0,
                roomID: roomID,
                userName: "test-test-test-123-test",
        }]);
        createMessage({
            message: message,
            userEmail: user?.email || "",
            roomID: roomID,
            orId : newMessages.length +1 ,
        }).then((res: {id: number , orId: number}) => {
            if (socket) {
                socket.emit('sendMessage', {
                    id: res.id,
                    message: message,
                    userID: user?.id || 0,
                    userName: user?.name ?? "",
                    roomID: roomID
                });
                setNewMessages((prev) => prev.filter((m) => m.id != res.orId && m.userName != "test-test-test-123-test"))
                setNewMessages((prev) => [...prev, {
                    id: res.id,
                    message: message,
                    userID: user?.id || 0,
                    roomID: roomID,
                    userName: user?.name ?? "",
                }]);

            }
        });
        setMessage("");
    };
    
    
    const deleteMessage = (id: number) => {
        setShowDeleteButtons((prev: any) => ({...prev, [id] : false}))
        deleteMessageAPI(id).then(() => {
            if(socket){
                socket.emit('deleteMessage', {
                    id: id,
                    roomID: roomID,
                });
            }
            setNewMessages(prev => prev.filter((m) => m.id != id))
        });
    };

    let isHolding = false;
    const [messRefId , setMessRefId] = useState<null | number>(null) 
    const duringhold = (id:number) => {
        setShowDeleteButtons((prev: any) => ({...prev, [id] : true}))
        setMessRefId(id)
    }
    const starthold = (id:number) => {
        if (isHolding) {return;}
        isHolding = true;
        setTimeout(() => {
            if(isHolding){
                duringhold(id)
            }
            
        }, 333);
    }
    const stophold = () => {
        isHolding = false;
    }
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if(!messRefId){return;}
            const messageClickofId = messageRefs.current[messRefId].contains(event.target as HTMLElement)
            if (!messageClickofId) {
                setShowDeleteButtons(Object.assign({}, ...messages.map(obj => ({ [obj.id]: false }))))
            }
        };
        document.addEventListener("click", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [messRefId])
    
    useEffect(() => {
        resizeTextarea()       
    }, [])

    return(     
            <div>
                <div className=" w-full  flex justify-center  ">
                    <div className="flex flex-col w-11/12 sm:w-[80%] mt-4 gap-3 overflow-y-auto scrollbar-thumb-blue 
                    scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch">
                        {newMessages.map((m: message ) => (
                        <div className="" key={m.id}>
                            <div className={'flex w-full justify-end ' + (m.userID ==  user?.id ? ' ' : "flex-row-reverse" )} 
                            onMouseDown={() => starthold(m.id)} onMouseUp={() => stophold()} onTouchStart={() => starthold(m.id)} onTouchEnd={() => stophold()}
                            
                            ref={(el) => {if(el){messageRefs.current[m.id] = el }}}>
                                {showDeleteButtons[m.id] && m.userID == user?.id && (
                                    <button onClick={() => deleteMessage(m.id)} className="bg-red-600 bg-opacity-10 hover:bg-opacity-25 
                                     text-red-600 border-red-600 border px-2 rounded-md mx-2 disabled:opacity-50 ">Delete</button>
                                )}
                                <div className={'px-4 py-2 rounded-lg flex items-end w-fit ' +
                                ( m.userID == user?.id ? ' bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-gray-50 ':
                                '  bg-yellow-950 dark:bg-yellow-600 text-gray-50 ') +
                                ( m.userName == "test-test-test-123-test" ? ` opacity-50 bg-opacity-50 ` : " " ) } onContextMenu={(e :any) => {e.preventDefault(); duringhold(m.id)}}
                                >
                                    {m.message} 
                                </div>
                            </div>
                            <div className={'flex  w-full text-xs text-opacity-65 ' + (m.userID == user?.id ? 'justify-end' : "" )
                                + (m.userID == user?.id  ? ' hidden ' : "")
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


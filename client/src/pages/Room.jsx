import React, { useEffect, useCallback  , useState} from 'react'
import { useSocket } from '../providers/Socket'
import ReactPlayer from 'react-player'
import { usePeer } from '../providers/Peer';

const RoomPage = () => {
    const { socket } = useSocket();
    const { peer, createOffer, createAnswer ,setRemoteAnswer ,sendStream  , remoteStream} = usePeer();
    const [myStream , setMyStream] = useState(null);
    const [remoteEmailId , setRemoteEmailId] = useState();

    

    // always wrap these things in useCallback hook , other it will create performance issue

    const handleNewUserJoined = useCallback(
        async (data) => {
            const { emailId } = data;
            console.log('New user Joined Room', emailId);
            const offer = await createOffer();
            socket.emit('call-user', { emailId, offer });
            setRemoteEmailId(emailId);
        },
        [createOffer, socket]
    )

    const handleIncomingCall = useCallback(
        async (data) => {
            const { from, offer } = data;
            console.log('Incoming Call from ', from, offer);
            // now we want to create answer to offer
            const answer  = await createAnswer(offer);
            socket.emit('call-accepted' , {emailId: from , answer})
            setRemoteEmailId(from)
        }, [createAnswer , socket]

    )
    const handleCallAccepted = useCallback(async(data)=>{
        const{answer} = data;
        console.log("Call got accepted" , answer);
        await setRemoteAnswer(answer);
        

    } , [])

    const getUserMediaStream = useCallback(async()=>{
       const stream = await navigator.mediaDevices.getUserMedia({audio :true , video:true});
       
       setMyStream(stream);

    } ,[]);

    const handleNegotiations = useCallback(
        async()=>{
            console.log("Nego Please");
        const localOffer = await peer.createOffer();
        socket.emit('call-user' , {emailId : remoteEmailId , offer : localOffer})
        },[  ]
    )


    useEffect(() => {
        socket.on('user-joined', handleNewUserJoined);
        socket.on('incoming-call', handleIncomingCall);
        socket.on('call-accepted' , handleCallAccepted );

        

        // security issue hai  , hr baar render par baar barr , yeh  socket bar bar register ho rhe hai
        // jb bhi useEffect k andar , socket even listen krte hai
        // useeffect karan , yeh page re-render hota rehta hai 
        // jiska karan voh dubari call krta rehta hai (extra space)
        return () => {
            socket.off('user-joined', handleNewUserJoined);
            socket.off('incoming-call', handleIncomingCall);
            socket.off('call-accepted' , handleCallAccepted);
            
        }

    }, [handleIncomingCall, handleNewUserJoined , handleCallAccepted, handleNegotiations, socket])



    useEffect(()=>{
        peer.addEventListener('negotiationneeded' , handleNegotiations )
        return ()=>{
            peer.removeEventListener('negotiationneeded' ,handleNegotiations );
        }
    },[]);

    useEffect(()=>{
        getUserMediaStream();
    },[getUserMediaStream])

    return (
        <div className='room-page-container'>
            <h1>Room Page</h1>
            <h4> YOU are connected to {remoteEmailId}</h4>
              
            <button onClick={(e) => sendStream(myStream)} >Send My Video</button>
            
            <ReactPlayer url={myStream} playing muted/>
            <ReactPlayer url={remoteStream} playing />

        </div>
    )
}

export default RoomPage

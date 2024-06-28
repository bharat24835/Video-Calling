import React, { useState, useEffect, useCallback } from "react";
import { useSocket } from "../providers/Socket";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
    const { socket } = useSocket();
    const navigate = useNavigate();

    const [emailId, setEmailId] = useState();
    const [roomId, setRoomId] = useState();

    const handleJoinRoom = () => {
        socket.emit("join-room", { emailId: emailId, roomId: roomId });
    };

    const handleRoomJoined = useCallback(
        ({ roomId }) => {
            navigate(`/room/${roomId}`);
        },
        [navigate]
    );

    // jb bhi useEffect k andar , socket even listen krte hai
    // useeffect karan , yeh page re-render hota rehta hai
    // jiska karan voh dubari call krta rehta hai (extra space )
    useEffect(() => {
        socket.on("joined-room", handleRoomJoined);

        return () => {
            socket.off("joined-room", handleRoomJoined);
        };
    }, [socket, handleRoomJoined]);

    return (
        <div className="homepage-container">
            <div className="input-container">
                <div className="container">
                    <input
                        value={emailId}
                        onChange={(e) => setEmailId(e.target.value)}
                        required
                        type="email"
                        name="text"
                        className="input"
                    />
                </div>

                <div className="container">
                    <input
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        required
                        type="text"
                        name="text"
                        className="input"
                    />
                </div>

                <button onClick={handleJoinRoom}>Enter Room</button>
            </div>
        </div>
    );
};

export default HomePage;

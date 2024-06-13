import React, { useState } from 'react';

const RoomComponent = ({ onJoinRoom, onCreateRoom }) => {
    const [joinRoomId, setJoinRoomId] = useState('');
    const [createRoomId, setCreateRoomId] = useState('');
    const [createRoomName, setCreateRoomName] = useState('');

    const handleJoinRoomChange = (event) => {
        setJoinRoomId(event.target.value);
    };

    const handleCreateRoomIdChange = (event) => {
        setCreateRoomId(event.target.value);
    };

    const handleCreateRoomNameChange = (event) => {
        setCreateRoomName(event.target.value);
    };

    const handleJoinRoom = () => {
        if (joinRoomId.trim() !== '') {
            onJoinRoom(joinRoomId);
        }
    };

    const handleCreateRoom = () => {
        if (createRoomId.trim() !== '' && createRoomName.trim() !== '') {
            onCreateRoom(createRoomId, createRoomName);
        }
    };

    return (
        <div className="mt-5">
            <h2>Room Selection</h2>
            <div className="form-group">
                <label htmlFor="joinRoomId">Room ID to Join:</label>
                <input
                    type="text"
                    className="form-control"
                    id="joinRoomId"
                    placeholder="Enter room ID"
                    value={joinRoomId}
                    onChange={handleJoinRoomChange}
                />
                <button type="button" className="btn btn-primary mt-2" onClick={handleJoinRoom}>
                    Join Room
                </button>
            </div>
            <div className="form-group mt-4">
                <label htmlFor="createRoomId">New Room ID:</label>
                <input
                    type="text"
                    className="form-control"
                    id="createRoomId"
                    placeholder="Enter new room ID"
                    value={createRoomId}
                    onChange={handleCreateRoomIdChange}
                />
                <label htmlFor="createRoomName" className="mt-2">New Room Name:</label>
                <input
                    type="text"
                    className="form-control"
                    id="createRoomName"
                    placeholder="Enter new room name"
                    value={createRoomName}
                    onChange={handleCreateRoomNameChange}
                />
                <button type="button" className="btn btn-secondary mt-2" onClick={handleCreateRoom}>
                    Create Room
                </button>
            </div>
        </div>
    );
};

export default RoomComponent;

import React, { useState, useEffect } from 'react';
import StudyRoomList from '../components/group/StudyRoomList';
import LiveChat from '../components/group/LiveChat';
import SharedEditor from '../components/group/SharedEditor';
import VideoCall from '../components/group/VideoCall';

const GroupStudy = () => {
  const [activeRoom, setActiveRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);

  const handleJoinRoom = (roomId) => {
    setActiveRoom(roomId);
    // TODO: Implement WebSocket connection for real-time collaboration
  };

  const handleLeaveRoom = () => {
    setActiveRoom(null);
    // TODO: Clean up WebSocket connection
  };

  const handleSendMessage = (message) => {
    // TODO: Implement real-time messaging
    setMessages([
      ...messages,
      { id: Date.now(), text: message, sender: 'currentUser' },
    ]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {!activeRoom ? (
        <div>
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900">Group Study Rooms</h1>
            <p className="mt-4 text-xl text-gray-600">
              Join or create a study room to collaborate with other learners
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Create New Room</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Room Name
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter room name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Topic
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="What are you studying?"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Create Room
                </button>
              </form>
            </div>

            <StudyRoomList onJoinRoom={handleJoinRoom} />
          </div>
        </div>
      ) : (
        <div className="h-[calc(100vh-8rem)]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Study Room: {activeRoom}</h2>
            <button
              onClick={handleLeaveRoom}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Leave Room
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 h-full">
            <div className="col-span-2 grid grid-rows-2 gap-4">
              <div className="bg-white rounded-lg shadow-lg p-4">
                <VideoCall participants={participants} />
              </div>
              <div className="bg-white rounded-lg shadow-lg p-4">
                <SharedEditor />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-4">
              <LiveChat
                messages={messages}
                onSendMessage={handleSendMessage}
                participants={participants}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupStudy;

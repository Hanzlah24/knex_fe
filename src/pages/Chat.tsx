import React, { useState, useEffect, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { UserAvatar } from "@/components/layout/UserAvatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Phone,
  VideoIcon,
  MoreVertical,
  Smile,
  PaperclipIcon,
  Mic,
  ChevronDown,
  AlertCircle,
  MessageSquare,
  Loader2,
  Check,
  CheckCheck,
  Frown,
} from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { getUser } from "@/services/auth/authService";
import { searchUser, getUserFriendList } from "@/services/user/userService";
import { getMessages } from "@/services/chats/chatService";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useChat } from "@/hooks/useChat";
import { onMessageSent, offMessageSent } from "@/services/chats/socket";

type Friend = {
  id: string;
  name: string;
  online?: boolean;
  profilePictureUrl?: string;
};

type MessageStatus = "sending" | "sent" | "delivered" | "read";

interface Message {
  _id?: string;
  sender: string;
  content: string;
  timestamp?: Date | string;
  status?: MessageStatus;
}

export default function Chat() {
  const currentUser = getUser();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [mobileView, setMobileView] = useState<"sidebar" | "chat">(
    isMobile ? "sidebar" : "chat"
  );

  // Friends list state
  const [friends, setFriends] = useState<Friend[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [friendsError, setFriendsError] = useState<string | null>(null);

  // Chat state
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [draftMessage, setDraftMessage] = useState("");

  // Message state
  const [sendingMessages, setSendingMessages] = useState<Message[]>([]);
  const { messages: liveMessages, send } = useChat({
    myUserId: currentUser._id,
    otherUserId: selectedFriend?.id ?? "",
  });

  // Load friends list
  useEffect(() => {
    setFriendsLoading(true);
    getUserFriendList(currentUser._id)
      .then((friendsList) => {
        setFriends(friendsList);
        setFilteredFriends(friendsList);
      })
      .catch((err) => setFriendsError(err.message))
      .finally(() => setFriendsLoading(false));
  }, []);

  // Handle search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setSearchLoading(true);
    try {
      const results = await searchUser(searchTerm);
      setFilteredFriends(results);
    } catch (err) {
      setFriendsError(err.message);
    } finally {
      setSearchLoading(false);
    }
  };

  // Load messages when friend is selected
  useEffect(() => {
    if (!selectedFriend) {
      setInitialMessages([]);
      return;
    }

    let isMounted = true;
    setMessagesLoading(true);
    setMessagesError(null);

    getMessages(currentUser._id, selectedFriend.id)
      .then((messages) => {
        if (isMounted) {
          setInitialMessages(
            messages.map((msg) => ({
              ...msg,
              status: msg.sender === currentUser._id ? "delivered" : undefined,
            }))
          );
        }
      })
      .catch((err) => {
        if (isMounted) {
          setMessagesError(err.message || "Failed to load messages");
        }
      })
      .finally(() => {
        if (isMounted) {
          setMessagesLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedFriend, currentUser._id]);

  // Handle message sent acknowledgments
  useEffect(() => {
    const handleSentAck = (msg: Message) => {
      setSendingMessages((prev) =>
        prev.map((m) =>
          m.content === msg.content && m.sender === msg.sender
            ? { ...m, _id: msg._id, timestamp: msg.timestamp, status: "sent" }
            : m
        )
      );
    };

    onMessageSent(handleSentAck);
    return () => offMessageSent(handleSentAck);
  }, []);

  // Update sending messages when live messages arrive
  useEffect(() => {
    setSendingMessages((prev) =>
      prev.filter(
        (msg) =>
          !liveMessages.some(
            (liveMsg) =>
              liveMsg.content === msg.content && liveMsg.sender === msg.sender
          )
      )
    );
  }, [liveMessages]);

  // Combine all messages without duplicates
  const allMessages = useMemo(() => {
    const messageMap = new Map<string, Message>();

    // Add initial messages
    initialMessages.forEach((msg) => {
      const key = `${msg._id || msg.content}-${msg.sender}`;
      messageMap.set(key, msg);
    });

    // Add live messages (these will overwrite initial messages if they're the same)
    liveMessages.forEach((msg) => {
      const key = `${msg._id || msg.content}-${msg.sender}`;
      messageMap.set(key, {
        ...msg,
        status: msg.sender === currentUser._id ? "delivered" : undefined,
      });
    });

    // Add sending messages that haven't been confirmed yet
    sendingMessages.forEach((msg) => {
      const key = `temp-${msg.content}-${msg.sender}`;
      if (!messageMap.has(key)) {
        messageMap.set(key, msg);
      }
    });

    return Array.from(messageMap.values()).sort((a, b) => {
      const timeA = new Date(a.timestamp || 0).getTime();
      const timeB = new Date(b.timestamp || 0).getTime();
      return timeA - timeB;
    });
  }, [initialMessages, liveMessages, sendingMessages, currentUser._id]);

  // Handle sending a new message
  const handleSend = () => {
    if (!draftMessage.trim() || !selectedFriend) return;

    const tempMessage: Message = {
      sender: currentUser._id,
      content: draftMessage,
      timestamp: new Date(),
      status: "sending",
    };

    setSendingMessages((prev) => [...prev, tempMessage]);
    send(draftMessage);
    setDraftMessage("");
  };

  const getStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case "sending":
        return <Loader2 className="h-3 w-3 animate-spin" />;
      case "sent":
        return <Check className="h-3 w-3" />;
      case "delivered":
        return <CheckCheck className="h-3 w-3" />;
      case "read":
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="flex h-full">
        {/* Sidebar */}
        {(!isMobile || mobileView === "sidebar") && (
          <div className="w-full md:w-80 border-r flex flex-col h-full">
            <div className="p-4">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={searchLoading}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                    disabled={searchLoading || !searchTerm.trim()}
                  >
                    {searchLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {(friendsLoading || searchLoading) && (
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                ))}
              </div>
            )}

            {friendsError && (
              <div className="flex-1 flex flex-col items-center justify-center p-4">
                <Alert variant="destructive" className="w-auto">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{friendsError}</AlertDescription>
                </Alert>
              </div>
            )}

            {!friendsLoading && !searchLoading && !friendsError && (
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {filteredFriends.length > 0 ? (
                  filteredFriends.map((friend) => (
                    <button
                      key={friend.id}
                      className={`w-full flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${
                        selectedFriend?.id === friend.id
                          ? "bg-gray-100 dark:bg-gray-800"
                          : ""
                      }`}
                      onClick={() => {
                        setSelectedFriend(friend);
                        if (isMobile) setMobileView("chat");
                      }}
                    >
                      <UserAvatar
                        name={friend.name}
                        src={friend.profilePictureUrl}
                        className="mr-3"
                        size="sm"
                        online={friend.online}
                      />
                      <span className="font-medium">{friend.name}</span>
                    </button>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Frown className="h-8 w-8 mb-2" />
                    <p>No friends found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Chat area */}
        {(!isMobile || mobileView === "chat") && (
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileView("sidebar")}
                  className="mr-2"
                >
                  <ChevronDown className="h-5 w-5" />
                </Button>
              )}
              <div className="flex items-center">
                {selectedFriend ? (
                  <>
                    <UserAvatar
                      name={selectedFriend.name}
                      src={selectedFriend.profilePictureUrl}
                      size="sm"
                      online={selectedFriend.online}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">{selectedFriend.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {selectedFriend.online ? "Online" : "Offline"}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="font-medium">Select a chat</div>
                )}
              </div>
              {selectedFriend && (
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon">
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <VideoIcon className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              {!selectedFriend ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  <MessageSquare className="h-10 w-10 mb-2" />
                  <p>Select a chat to start messaging</p>
                </div>
              ) : messagesLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`flex ${
                        i % 2 === 0 ? "justify-start" : "justify-end"
                      }`}
                    >
                      <Skeleton
                        className={`h-16 w-3/4 rounded-xl ${
                          i % 2 === 0 ? "rounded-bl-none" : "rounded-br-none"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              ) : messagesError ? (
                <div className="h-full flex flex-col items-center justify-center">
                  <Alert variant="destructive" className="w-auto">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{messagesError}</AlertDescription>
                  </Alert>
                </div>
              ) : allMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  <MessageSquare className="h-10 w-10 mb-2" />
                  <p>No messages yet — say hello!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allMessages.map((message) => (
                    <div
                      key={`${message._id || 'temp'}-${message.timestamp}`}
                      className={`flex ${
                        message.sender === currentUser._id
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`p-2 max-w-xs rounded-xl ${
                          message.sender === currentUser._id
                            ? "bg-brand-purple text-white rounded-br-none"
                            : "bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-bl-none"
                        }`}
                      >
                        <p>{message.content}</p>
                        <div className="flex items-center justify-end space-x-1">
                          <span className="text-[10px]">
                            {new Date(
                              message.timestamp || new Date()
                            ).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {message.sender === currentUser._id && (
                            <span className="text-xs">
                              {getStatusIcon(message.status || "sent")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedFriend && (
              <div className="p-4 border-t">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon">
                    <PaperclipIcon className="h-5 w-5" />
                  </Button>
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Type your message here..."
                      className="pr-10"
                      value={draftMessage}
                      onChange={(e) => setDraftMessage(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && (handleSend(), e.preventDefault())
                      }
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2"
                    >
                      <Smile className="h-5 w-5" />
                    </Button>
                  </div>
                  <Button
                    onClick={handleSend}
                    size="icon"
                    className="rounded-full bg-brand-purple hover:bg-brand-purple/90"
                  >
                    <Mic className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
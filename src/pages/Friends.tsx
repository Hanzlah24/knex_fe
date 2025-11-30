// src/pages/Friends.jsx
import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { UserAvatar } from "@/components/layout/UserAvatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  searchUser,
  getUserFriendList,
  getIncomingRequests,
  getOutgoingRequests,
  sendFriendRequest,
  cancelFriendRequest,
  rejectFriendRequest,
  acceptFriendRequest,
  unfriendUser,
} from "@/services/user/userService";
import { getUser } from "@/services/auth/authService";
import {
  Search,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  Loader2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Friends() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [activeTab, setActiveTab] = useState("friends");
  const [hasSearched, setHasSearched] = useState(false); // Track if search has been performed

  const [friends, setFriends] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);

  const [loadingStates, setLoadingStates] = useState({
    friends: false,
    incoming: false,
    outgoing: false,
    search: false,
    actions: {},
  });
  const [error, setError] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedAction, setSelectedAction] = useState("");

  const current = getUser();
  const userId = current?._id;

  // Load data for the active tab
  useEffect(() => {
    if (!userId) return;

    const loadData = async () => {
      try {
        setLoadingStates((prev) => ({ ...prev, [activeTab]: true }));
        setError("");

        if (activeTab === "friends") {
          const data = await getUserFriendList(userId);
          setFriends(data);
        } else if (activeTab === "incoming") {
          const data = await getIncomingRequests(userId);
          setIncoming(data.incomingRequests);
        } else if (activeTab === "outgoing") {
          const data = await getOutgoingRequests(userId);
          setOutgoing(data.outgoingRequests);
        }
      } catch (err) {
        setError(err.message || `Failed to load ${activeTab}`);
      } finally {
        setLoadingStates((prev) => ({ ...prev, [activeTab]: false }));
      }
    };

    loadData();
  }, [userId, activeTab]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      setHasSearched(false);
    }
  }, [searchTerm]);
  // Search handler - triggered by button click or Enter key
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoadingStates((prev) => ({ ...prev, search: true }));
    setError("");
    setHasSearched(true);

    try {
      const data = await searchUser(searchTerm);
      setResults(data);
    } catch (err) {
      setError(err.message || "Search failed");
      setResults([]);
    } finally {
      setLoadingStates((prev) => ({ ...prev, search: false }));
    }
  };

  // Action confirmation handler
  const handleConfirmAction = async () => {
    if (!selectedUser || !selectedAction) return;

    setLoadingStates((prev) => ({
      ...prev,
      actions: { ...prev.actions, [selectedUser._id]: true },
    }));

    try {
      switch (selectedAction) {
        case "unfriend":
          await unfriendUser(userId, selectedUser._id);
          setFriends((prev) => prev.filter((u) => u._id !== selectedUser._id));
          break;
        case "cancel":
          await cancelFriendRequest(userId, selectedUser._id);
          setOutgoing((prev) => prev.filter((u) => u._id !== selectedUser._id));
          break;
        case "reject":
          await rejectFriendRequest(userId, selectedUser._id);
          setIncoming((prev) => prev.filter((u) => u._id !== selectedUser._id));
          break;
        case "accept":
          await acceptFriendRequest(userId, selectedUser._id);
          setIncoming((prev) => prev.filter((u) => u._id !== selectedUser._id));
          setFriends((prev) => [...prev, selectedUser]);
          break;
        case "add":
          await sendFriendRequest(userId, selectedUser._id);
          setOutgoing((prev) => [...prev, selectedUser]);
          break;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        actions: { ...prev.actions, [selectedUser._id]: false },
      }));
      setSelectedUser(null);
      setSelectedAction("");
      setConfirmOpen(false);
    }
  };

  // Helper function to determine user status
  const getUserStatus = (user) => {
    if (friends.some((f) => f._id === user._id)) return "friend";
    if (outgoing.some((o) => o._id === user._id)) return "outgoing";
    if (incoming.some((i) => i._id === user._id)) return "incoming";
    return "none";
  };

  // Skeleton loader for user cards
  const UserCardSkeleton = () => (
    <Card className="p-4 mb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-3 w-[80px]" />
          </div>
        </div>
        <Skeleton className="h-9 w-[100px]" />
      </div>
    </Card>
  );

  // User card component
  const UserCard = ({ user, status, showActions = true }) => {
    const isLoading = loadingStates.actions[user._id];

    return (
      <Card className="p-4 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <UserAvatar src={user?.profilePictureUrl} name={user.name} className="h-10 w-10" />
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
          </div>

          {showActions && (
            <div className="flex space-x-2">
              {status === "friend" && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setSelectedUser(user);
                    setSelectedAction("unfriend");
                    setConfirmOpen(true);
                  }}
                  className="gap-1"
                  disabled={isLoading}
                >
                  {isLoading && selectedAction === "unfriend" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserMinus className="h-4 w-4" />
                  )}
                  Unfriend
                </Button>
              )}
              {status === "outgoing" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedUser(user);
                    setSelectedAction("cancel");
                    setConfirmOpen(true);
                  }}
                  className="gap-1"
                  disabled={isLoading}
                >
                  {isLoading && selectedAction === "cancel" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserX className="h-4 w-4" />
                  )}
                  Cancel
                </Button>
              )}
              {status === "incoming" && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user);
                      setSelectedAction("reject");
                      setConfirmOpen(true);
                    }}
                    className="gap-1"
                    disabled={isLoading}
                  >
                    {isLoading && selectedAction === "reject" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserX className="h-4 w-4" />
                    )}
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user);
                      setSelectedAction("accept");
                      setConfirmOpen(true);
                    }}
                    className="gap-1"
                    disabled={isLoading}
                  >
                    {isLoading && selectedAction === "accept" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserCheck className="h-4 w-4" />
                    )}
                    Accept
                  </Button>
                </>
              )}
              {status === "none" && (
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedUser(user);
                    setSelectedAction("add");
                    setConfirmOpen(true);
                  }}
                  className="gap-1"
                  disabled={isLoading}
                >
                  {isLoading && selectedAction === "add" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                  Add
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <MainLayout title="Friends">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6 mt-4">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loadingStates.search}
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                disabled={loadingStates.search || !searchTerm.trim()}
              >
                {loadingStates.search ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {loadingStates.search ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <UserCardSkeleton key={`search-skeleton-${i}`} />
            ))}
          </div>
        ) : hasSearched && results.length > 0 ? (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Search Results</h2>
            {results.map((user) => (
              <UserCard
                key={user._id}
                user={user}
                status={getUserStatus(user)}
              />
            ))}
          </div>
        ) : hasSearched && results.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No users found for "{searchTerm}"
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 w-full mb-4">
              <TabsTrigger value="friends">
                Friends{" "}
                {friends.length > 0 && (
                  <Badge className="ml-2">{friends.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="incoming">
                Requests{" "}
                {incoming.length > 0 && (
                  <Badge className="ml-2">{incoming.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="outgoing">
                Sent{" "}
                {outgoing.length > 0 && (
                  <Badge className="ml-2">{outgoing.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="friends">
              {loadingStates.friends ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <UserCardSkeleton key={`friends-skeleton-${i}`} />
                  ))}
                </div>
              ) : friends.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  You don't have any friends yet. Search for users to add
                  friends.
                </div>
              ) : (
                friends.map((user) => (
                  <UserCard key={user._id} user={user} status="friend" />
                ))
              )}
            </TabsContent>

            <TabsContent value="incoming">
              {loadingStates.incoming ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <UserCardSkeleton key={`incoming-skeleton-${i}`} />
                  ))}
                </div>
              ) : incoming.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No incoming friend requests
                </div>
              ) : (
                incoming.map((user) => (
                  <UserCard key={user._id} user={user} status="incoming" />
                ))
              )}
            </TabsContent>

            <TabsContent value="outgoing">
              {loadingStates.outgoing ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <UserCardSkeleton key={`outgoing-skeleton-${i}`} />
                  ))}
                </div>
              ) : outgoing.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No outgoing friend requests
                </div>
              ) : (
                outgoing.map((user) => (
                  <UserCard key={user._id} user={user} status="outgoing" />
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedAction === "unfriend" &&
                `This will remove ${selectedUser?.name} from your friends list.`}
              {selectedAction === "cancel" &&
                `This will cancel your friend request to ${selectedUser?.name}.`}
              {selectedAction === "reject" &&
                `This will reject the friend request from ${selectedUser?.name}.`}
              {selectedAction === "accept" &&
                `This will accept the friend request from ${selectedUser?.name}.`}
              {selectedAction === "add" &&
                `This will send a friend request to ${selectedUser?.name}.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}

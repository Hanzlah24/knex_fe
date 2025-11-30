import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Edit2,
  Upload,
  Loader2,
  Mail,
  Calendar,
  User,
  Users,
  Send,
  Clock,
} from "lucide-react";
import { getUser as getCurrentUser } from "@/services/auth/authService";
import {
  getUser as getUserService,
  updateUserInfo,
  uploadUserProfilePicture,
} from "@/services/user/userService";
import { MainLayout } from "@/components/layout/MainLayout";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface User {
  name: string;
  email: string;
  interests: string[];
  friends: string[];
  friendRequests: {
    received: string[];
    sent: string[];
  };
  profilePictureUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchUser() {
      try {
        setIsLoading(true);
        const current = await getCurrentUser();
        const data = await getUserService(current._id);
        setUser(data);
      } catch (err: any) {
        setError(err.message || "Failed to load user data.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
  }, []);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleUserUpdate = async (updatedData: Partial<User>) => {
    try {
      setIsLoading(true);
      const current = await getCurrentUser();
      const updatedUser = await updateUserInfo(current._id, updatedData);
      setUser(updatedUser);
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const current = await getCurrentUser();
      const imageUrl = await uploadUserProfilePicture(current._id, file);
      console.log(imageUrl);
      setUser((prev) =>
        prev
          ? { ...prev, profilePictureUrl: imageUrl?.profilePictureUrl }
          : null
      );
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been successfully updated.",
      });
    } catch (err: any) {
      setError(err.message || "Failed to upload profile picture.");
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 gap-8">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Loading Profile...</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center space-y-4">
                    <Skeleton className="w-32 h-32 rounded-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="md:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Interests</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8">
          {/* Left Column - Profile Card */}
          <div className="md:col-span-1">
            <Card className="sticky top-8">
              <CardHeader className="flex flex-col items-center">
                <div className="relative mb-4">
                  <Avatar className="w-32 h-32">
                    <AvatarImage
                      src={user?.profilePictureUrl || undefined}
                      alt="Profile Picture"
                    />
                    <AvatarFallback className="text-4xl">
                      {user?.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute bottom-2 right-2 rounded-full p-2 h-10 w-10"
                        onClick={handleImageUploadClick}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </Button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                    </>
                  )}
                </div>
                {isEditing ? (
                  <Input
                    type="text"
                    value={user?.name || ""}
                    onChange={(e) =>
                      setUser((prev) =>
                        prev ? { ...prev, name: e.target.value } : null
                      )
                    }
                    className="text-2xl font-bold text-center border rounded px-3 py-2 mb-2"
                  />
                ) : (
                  <CardTitle className="text-2xl text-center">
                    {user?.name}
                  </CardTitle>
                )}
                <CardDescription className="text-center">
                  Member since{" "}
                  {format(new Date(user?.createdAt || ""), "MMMM yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Button
                  variant={isEditing ? "outline" : "default"}
                  onClick={handleEditToggle}
                  disabled={isUploading}
                >
                  {isEditing ? (
                    "Cancel"
                  ) : (
                    <>
                      <Edit2 className="mr-2 h-4 w-4" /> Edit Profile
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Details */}
          <div className="md:col-span-2 space-y-8">
            {/* Basic Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-4">
                  <div className="p-2 rounded-full bg-secondary">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-2 rounded-full bg-secondary">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Friends</p>
                    <p className="font-medium">{user?.friends.length}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-2 rounded-full bg-secondary">
                    <Send className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Friend Requests Sent
                    </p>
                    <p className="font-medium">
                      {user?.friendRequests.sent.length}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-2 rounded-full bg-secondary">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Friend Requests Received
                    </p>
                    <p className="font-medium">
                      {user?.friendRequests.received.length}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-2 rounded-full bg-secondary">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Account Created
                    </p>
                    <p className="font-medium">
                      {format(new Date(user?.createdAt || ""), "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-2 rounded-full bg-secondary">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Last Updated
                    </p>
                    <p className="font-medium">
                      {format(new Date(user?.updatedAt || ""), "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interests Card */}
            <Card>
              <CardHeader>
                <CardTitle>Interests</CardTitle>
                <CardDescription>Your areas of interest</CardDescription>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {user?.interests.map((interest, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="px-3 py-1"
                        >
                          {interest}
                          <button
                            type="button"
                            className="ml-2 text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              const newInterests = [...(user?.interests || [])];
                              newInterests.splice(index, 1);
                              setUser((prev) =>
                                prev
                                  ? { ...prev, interests: newInterests }
                                  : null
                              );
                            }}
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <Input
                        type="text"
                        placeholder="Add new interest"
                        className="flex-1 border rounded px-3 py-2"
                        onKeyDown={(e) => {
                          if (
                            e.key === "Enter" &&
                            e.currentTarget.value.trim()
                          ) {
                            const newInterest = e.currentTarget.value.trim();
                            setUser((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    interests: [...prev.interests, newInterest],
                                  }
                                : null
                            );
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          const input = document.querySelector(
                            'input[placeholder="Add new interest"]'
                          ) as HTMLInputElement;
                          if (input?.value.trim()) {
                            const newInterest = input.value.trim();
                            setUser((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    interests: [...prev.interests, newInterest],
                                  }
                                : null
                            );
                            input.value = "";
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {user?.interests.length === 0 ? (
                      <p className="text-muted-foreground">
                        No interests added yet
                      </p>
                    ) : (
                      user?.interests.map((interest, index) => (
                        <Badge key={index} className="px-3 py-1 text-sm">
                          {interest}
                        </Badge>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Save Changes Button */}
            {isEditing && (
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleUserUpdate(user || {})}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

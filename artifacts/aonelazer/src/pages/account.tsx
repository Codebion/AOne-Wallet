import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUpdateProfile, useChangePassword, useChangeUsername, getGetMeQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function Account() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateProfileMutation = useUpdateProfile();
  const changeUsernameMutation = useChangeUsername();
  const changePasswordMutation = useChangePassword();

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || ""
  });

  const [usernameData, setUsernameData] = useState({
    newUsername: "",
    password: ""
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  if (!user) return null;

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({ data: profileData }, {
      onSuccess: (updatedUser) => {
        updateUser(updatedUser);
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        toast({ title: "Success", description: "Profile updated successfully" });
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err?.message || "Failed to update profile", variant: "destructive" });
      }
    });
  };

  const handleChangeUsername = (e: React.FormEvent) => {
    e.preventDefault();
    changeUsernameMutation.mutate({ data: { newUsername: usernameData.newUsername, password: usernameData.password } }, {
      onSuccess: (updatedUser) => {
        updateUser(updatedUser);
        setUsernameData({ newUsername: "", password: "" });
        toast({ title: "Success", description: "Username changed successfully" });
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err?.message || "Failed to change username", variant: "destructive" });
      }
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: "Error", description: "New passwords do not match", variant: "destructive" });
      return;
    }
    changePasswordMutation.mutate({ data: { currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword } }, {
      onSuccess: () => {
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        toast({ title: "Success", description: "Password changed successfully" });
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err?.message || "Failed to change password", variant: "destructive" });
      }
    });
  };

  const initial = user.name ? user.name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase();

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your profile and security preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="sticky top-24 space-y-6">
            <div className="flex flex-col items-center p-6 bg-card border border-border rounded-xl shadow-sm text-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-3xl font-bold text-primary mb-4 shadow-[0_0_20px_theme('colors.primary.DEFAULT')_inset]">
                {initial}
              </div>
              <h2 className="font-semibold text-xl">{user.name}</h2>
              <p className="text-muted-foreground text-sm font-mono mt-1">@{user.username}</p>
              <div className="mt-4 px-3 py-1 rounded-full bg-secondary text-xs border border-border">
                {user.role}
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Profile Details</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="bg-background" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} className="bg-background" />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={updateProfileMutation.isPending}>Save Profile</Button>
              </div>
            </form>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Change Username</h3>
            <form onSubmit={handleChangeUsername} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-username">Current Username</Label>
                <Input id="current-username" value={user.username} disabled className="bg-muted text-muted-foreground" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-username">New Username</Label>
                  <Input id="new-username" value={usernameData.newUsername} onChange={e => setUsernameData({...usernameData, newUsername: e.target.value})} required className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username-password">Confirm Password</Label>
                  <Input id="username-password" type="password" value={usernameData.password} onChange={e => setUsernameData({...usernameData, password: e.target.value})} required className="bg-background" />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" variant="secondary" disabled={changeUsernameMutation.isPending}>Update Username</Button>
              </div>
            </form>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Change Password</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" value={passwordData.currentPassword} onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} required className="bg-background" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} required className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" value={passwordData.confirmPassword} onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} required className="bg-background" />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" variant="destructive" disabled={changePasswordMutation.isPending}>Change Password</Button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

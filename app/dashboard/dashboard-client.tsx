"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { SensorChart } from "@/components/sensor-chart";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import {
  LogOut,
  User,
  Settings,
  Users,
  Database,
  Activity,
  TrendingUp,
  Shield,
  Calendar,
  Clock,
  BarChart3,
  Sparkles,
} from "lucide-react";

type UserAggregateData = {
  id: number;
  name: string;
  email: string;
  isAdmin: string;
  createdAt: Date;
  dataPointCount: number;
  latestActivity: Date | null;
};

type DashboardClientProps = {
  user: {
    id: number;
    name: string;
    email: string;
    isAdmin: string;
  };
  systemStats: {
    totalUsers: number;
    totalDataPoints: number;
    totalSensorReadings: number;
  };
  allUsers: Array<{
    id: number;
    name: string;
    email: string;
    isAdmin: string;
    createdAt: Date;
  }>;
  activeSensors: number;
  avgSensorValue: string;
  sensorReadings: Array<{
    id: number;
    sensorId: string;
    value: number;
    timestamp: Date;
  }>;
  recentIoTData: Array<{
    id: number;
    timestamp: Date;
    dataPayload: unknown;
    userId: number;
    userName: string | null;
    userEmail: string | null;
  }>;
  newUsersCount: number;
  userAggregateData: UserAggregateData[];
};

export function DashboardClient({
  user,
  systemStats,
  allUsers,
  activeSensors,
  avgSensorValue,
  sensorReadings,
  recentIoTData,
  newUsersCount,
  userAggregateData,
}: DashboardClientProps) {
  const [selectedUser, setSelectedUser] = useState<UserAggregateData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // Get user initials for avatar fallback
  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format date with time
  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isAdmin = user.isAdmin === "true";

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <DashboardSidebar user={user} />

      {/* Main Content */}
      <div className="flex-1 lg:pl-64">
        <div className="p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-8">
            {/* Page Header */}
            <div id="overview" className="scroll-mt-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1 pl-12 lg:pl-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold tracking-tight">
                        {isAdmin ? "Admin Dashboard" : "Dashboard"}
                      </h1>
                      <p className="text-sm text-muted-foreground">
                        {isAdmin
                          ? "System-wide monitoring and user management"
                          : "Monitor your IoT data and analytics"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* System Overview Cards */}
            <section>
              <h2 className="mb-4 text-2xl font-semibold">System Overview</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Users */}
                <Card className="overflow-hidden border-0 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Users
                    </CardTitle>
                    <div className="rounded-lg bg-blue-500/10 p-2">
                      <Users className="h-4 w-4 text-blue-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {systemStats.totalUsers}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +{newUsersCount} new this week
                    </p>
                  </CardContent>
                </Card>

                {/* Total Data Points */}
                <Card className="overflow-hidden border-0 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Data Points
                    </CardTitle>
                    <div className="rounded-lg bg-purple-500/10 p-2">
                      <Database className="h-4 w-4 text-purple-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {systemStats.totalDataPoints.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      IoT data records
                    </p>
                  </CardContent>
                </Card>

                {/* Active Sensors */}
                <Card className="overflow-hidden border-0 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Sensors
                    </CardTitle>
                    <div className="rounded-lg bg-emerald-500/10 p-2">
                      <Activity className="h-4 w-4 text-emerald-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {activeSensors}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Unique sensors reporting
                    </p>
                  </CardContent>
                </Card>

                {/* Total Sensor Readings */}
                <Card className="overflow-hidden border-0 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Sensor Readings
                    </CardTitle>
                    <div className="rounded-lg bg-amber-500/10 p-2">
                      <TrendingUp className="h-4 w-4 text-amber-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {systemStats.totalSensorReadings.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Avg: {avgSensorValue}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

        {/* User Management Section with Aggregate Data */}
        {isAdmin && (
          <section id="users" className="scroll-mt-8">
            <h2 className="mb-4 text-2xl font-semibold">
              User Management & Data Analytics
            </h2>
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-500/5 to-blue-500/5 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  All Users with Aggregate Data
                </CardTitle>
                <CardDescription>
                  Monitor all registered users and their data contributions
                </CardDescription>
              </CardHeader>
              <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Data Points</TableHead>
                      <TableHead>Latest Activity</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userAggregateData.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center text-muted-foreground"
                        >
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      userAggregateData.map((u) => (
                        <TableRow 
                          key={u.id} 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => {
                            setSelectedUser(u);
                            setIsDialogOpen(true);
                          }}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`}
                                />
                                <AvatarFallback>
                                  {getUserInitials(u.name)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{u.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {u.email}
                          </TableCell>
                          <TableCell>
                            {u.isAdmin === "true" ? (
                              <Badge variant="default">Admin</Badge>
                            ) : (
                              <Badge variant="secondary">User</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Database className="h-4 w-4 text-muted-foreground" />
                              <span className="font-semibold">
                                {u.dataPointCount.toLocaleString()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {u.latestActivity ? (
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {formatDateTime(u.latestActivity)}
                              </div>
                            ) : (
                              <span className="text-xs">No activity</span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {formatDate(u.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <button 
                              className="text-sm text-primary hover:underline"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUser(u);
                                setIsDialogOpen(true);
                              }}
                            >
                              View Details
                            </button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          </section>
        )}

        {/* User Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedUser?.name}`}
                  />
                  <AvatarFallback>
                    {selectedUser && getUserInitials(selectedUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span>{selectedUser?.name}</span>
                    {selectedUser?.isAdmin === "true" && (
                      <Badge variant="default">Admin</Badge>
                    )}
                  </div>
                  <p className="text-sm font-normal text-muted-foreground">
                    {selectedUser?.email}
                  </p>
                </div>
              </DialogTitle>
              <DialogDescription>
                Detailed user information and activity statistics
              </DialogDescription>
            </DialogHeader>
            
            {selectedUser && (
              <div className="space-y-6 py-4">
                {/* User Stats Grid */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        Data Points
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {selectedUser.dataPointCount.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Total uploaded
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Member Since
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatDate(selectedUser.createdAt)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {Math.floor(
                          (new Date().getTime() - new Date(selectedUser.createdAt).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{" "}
                        days ago
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Last Active
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm font-bold">
                        {selectedUser.latestActivity
                          ? formatDateTime(selectedUser.latestActivity)
                          : "No activity"}
                      </div>
                      {selectedUser.latestActivity && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {Math.floor(
                            (new Date().getTime() - new Date(selectedUser.latestActivity).getTime()) /
                              (1000 * 60 * 60 * 24)
                          )}{" "}
                          days ago
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Activity Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Activity Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Total Contributions
                        </span>
                        <span className="font-semibold">
                          {selectedUser.dataPointCount} data points
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Average per Day
                        </span>
                        <span className="font-semibold">
                          {selectedUser.dataPointCount > 0
                            ? (
                                selectedUser.dataPointCount /
                                Math.max(
                                  1,
                                  Math.floor(
                                    (new Date().getTime() -
                                      new Date(selectedUser.createdAt).getTime()) /
                                      (1000 * 60 * 60 * 24)
                                  )
                                )
                              ).toFixed(2)
                            : "0.00"}{" "}
                          points/day
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Account Status
                        </span>
                        <Badge variant={selectedUser.dataPointCount > 0 ? "default" : "secondary"}>
                          {selectedUser.dataPointCount > 0 ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Top Contributors Section */}
        {isAdmin && (
          <section id="contributors" className="scroll-mt-8">
            <h2 className="mb-4 text-2xl font-semibold">Top Contributors</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {userAggregateData
                .filter((u) => u.dataPointCount > 0)
                .sort((a, b) => b.dataPointCount - a.dataPointCount)
                .slice(0, 4)
                .map((topUser, index) => {
                  const gradients = [
                    "from-yellow-500/10 to-orange-500/10 border-yellow-500/20",
                    "from-blue-500/10 to-cyan-500/10 border-blue-500/20",
                    "from-purple-500/10 to-pink-500/10 border-purple-500/20",
                    "from-emerald-500/10 to-teal-500/10 border-emerald-500/20",
                  ];
                  const colors = [
                    "text-yellow-600 dark:text-yellow-400",
                    "text-blue-600 dark:text-blue-400",
                    "text-purple-600 dark:text-purple-400",
                    "text-emerald-600 dark:text-emerald-400",
                  ];
                  const badgeColors = [
                    "bg-gradient-to-br from-yellow-500 to-orange-500",
                    "bg-gradient-to-br from-blue-500 to-cyan-500",
                    "bg-gradient-to-br from-purple-500 to-pink-500",
                    "bg-gradient-to-br from-emerald-500 to-teal-500",
                  ];
                  return (
                    <Card
                      key={topUser.id}
                      className={`overflow-hidden border cursor-pointer hover:shadow-xl transition-all bg-gradient-to-br ${gradients[index]}`}
                      onClick={() => {
                        setSelectedUser(topUser);
                        setIsDialogOpen(true);
                      }}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="h-12 w-12 border-2">
                              <AvatarImage
                                src={`https://api.dicebear.com/7.x/initials/svg?seed=${topUser.name}`}
                              />
                              <AvatarFallback>
                                {getUserInitials(topUser.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={`absolute -top-1 -right-1 ${badgeColors[index]} text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold shadow-lg`}
                            >
                              #{index + 1}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm truncate">
                              {topUser.name}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground truncate">
                              {topUser.email}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Data Points
                          </span>
                          <span className={`text-lg font-bold ${colors[index]}`}>
                            {topUser.dataPointCount.toLocaleString()}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {topUser.latestActivity && (
                            <>
                              Last active:{" "}
                              {Math.floor(
                                (new Date().getTime() -
                                  new Date(topUser.latestActivity).getTime()) /
                                  (1000 * 60 * 60 * 24)
                              )}{" "}
                              days ago
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
            {userAggregateData.filter((u) => u.dataPointCount > 0).length ===
              0 && (
              <Card className="border-0 shadow-lg">
                <CardContent className="py-12">
                  <p className="text-center text-muted-foreground">
                    No user contributions yet. Users need to upload data.
                  </p>
                </CardContent>
              </Card>
            )}
          </section>
        )}

        {/* Analytics Section */}
        <section id="analytics" className="scroll-mt-8">
          <h2 className="mb-4 text-2xl font-semibold">System Analytics</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Sensor Chart */}
            <div className="col-span-full lg:col-span-4">
              <SensorChart data={sensorReadings} />
            </div>

            {/* Sensor Statistics */}
            <Card className="col-span-full md:col-span-1 lg:col-span-3 border-0 shadow-lg bg-gradient-to-br from-cyan-500/5 to-blue-500/5">
              <CardHeader>
                <CardTitle>Sensor Statistics</CardTitle>
                <CardDescription>
                  Key metrics from sensor readings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {sensorReadings.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No sensor statistics available yet.
                    </p>
                  ) : (
                    (() => {
                      const values = sensorReadings.map((r) => r.value);
                      const minValue = Math.min(...values);
                      const maxValue = Math.max(...values);
                      const avgValue =
                        values.reduce((a, b) => a + b, 0) / values.length;

                      // Normalize for display (0-100 scale for progress bars)
                      const range = maxValue - minValue || 1;
                      const normalizeValue = (val: number) =>
                        Math.round(((val - minValue) / range) * 100);

                      return (
                        <>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">
                                Maximum Value
                              </span>
                              <span className="text-muted-foreground">
                                {maxValue.toFixed(2)}
                              </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary w-[100%]" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">
                                Average Value
                              </span>
                              <span className="text-muted-foreground">
                                {avgValue.toFixed(2)}
                              </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary"
                                style={{
                                  width: `${normalizeValue(avgValue)}%`,
                                }}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">
                                Minimum Value
                              </span>
                              <span className="text-muted-foreground">
                                {minValue.toFixed(2)}
                              </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary w-[0%]" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">
                                Total Readings
                              </span>
                              <span className="text-muted-foreground">
                                {sensorReadings.length}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Range: {minValue.toFixed(2)} -{" "}
                              {maxValue.toFixed(2)}
                            </div>
                          </div>
                        </>
                      );
                    })()
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sensor Distribution */}
            <Card className="col-span-full md:col-span-1 lg:col-span-4 border-0 shadow-lg bg-gradient-to-br from-purple-500/5 to-pink-500/5">
              <CardHeader>
                <CardTitle>Sensor Distribution</CardTitle>
                <CardDescription>Top sensors by reading count</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sensorReadings.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No sensor data available yet.
                    </p>
                  ) : (
                    (() => {
                      // Group readings by sensor ID
                      const sensorCounts = sensorReadings.reduce(
                        (acc, reading) => {
                          acc[reading.sensorId] =
                            (acc[reading.sensorId] || 0) + 1;
                          return acc;
                        },
                        {} as Record<string, number>
                      );

                      // Sort by count and take top 5
                      const topSensors = Object.entries(sensorCounts)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 5)
                        .map(([sensorId, count]) => ({
                          sensorId,
                          count,
                          percentage: Math.round(
                            (count / sensorReadings.length) * 100
                          ),
                        }));

                      return topSensors.map((sensor, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium truncate">
                              {sensor.sensorId}
                            </span>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-muted-foreground">
                                {sensor.count}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                ({sensor.percentage}%)
                              </span>
                            </div>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${sensor.percentage}%` }}
                            />
                          </div>
                        </div>
                      ));
                    })()
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="col-span-full md:col-span-1 lg:col-span-3 border-0 shadow-lg bg-gradient-to-br from-emerald-500/5 to-teal-500/5">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest data ingestion from all users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentIoTData.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No recent activity.
                    </p>
                  ) : (
                    recentIoTData.slice(0, 10).map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-4 pb-4 border-b last:border-0"
                      >
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Database className="h-4 w-4" />
                        </div>
                        <div className="flex-1 space-y-1 min-w-0">
                          <p className="text-sm font-medium leading-none">
                            {activity.userName || "Unknown User"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {activity.userEmail || "No email"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(activity.timestamp)}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground flex-shrink-0">
                          <Badge variant="outline" className="text-xs">
                            ID: {activity.id}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
          </div>
        </div>
      </div>
    </div>
  );
}

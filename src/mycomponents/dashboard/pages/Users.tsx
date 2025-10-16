import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface User {
  id: number;
  name: string;
  email: string;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setUsers([
        { id: 1, name: "Ahmed Ali", email: "ahmed@example.com" },
        { id: 2, name: "Sara Mohamed", email: "sara@example.com" },
        { id: 3, name: "Khaled Mahmoud", email: "khaled@example.com" },
      ]);
    }, 1000);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Users</h1>

      <div className="grid gap-4">
        {users.map((u) => (
          <Card key={u.id} className="shadow-md border rounded-2xl">
            <CardContent className="flex justify-between items-center p-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-700">{u.name}</h2>
                <p className="text-gray-500">{u.email}</p>
              </div>
              <Button variant="outline">View</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Users;
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUsers, updateUserRole } from "../../api/admin";
import toast from "react-hot-toast";

const AdminUsersPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: string }) => updateUserRole(userId, role),
    onSuccess: () => {
      toast.success("User role updated");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-sm text-gray-500">View registered users and manage access levels.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Current Role</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users?.map((u: any) => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-900">
                   {u.firstName} {u.lastName}
                </td>
                <td className="px-6 py-4 text-gray-600">{u.email}</td>
                <td className="px-6 py-4">
                   <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      u.role === "admin" ? "bg-purple-100 text-purple-700" : 
                      u.role === "staff" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                   }`}>
                      {u.role}
                   </span>
                </td>
                <td className="px-6 py-4">
                   <select
                     value={u.role}
                     onChange={(e) => roleMutation.mutate({ userId: u.id, role: e.target.value })}
                     className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs focus:outline-none"
                   >
                     <option value="user">User</option>
                     <option value="staff">Staff</option>
                     <option value="admin">Admin</option>
                   </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isLoading && <div className="p-8 text-center text-gray-400">Loading users...</div>}
      </div>
    </div>
  );
};

export default AdminUsersPage;

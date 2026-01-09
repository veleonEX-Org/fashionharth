import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCustomers, createCustomer } from "../../api/admin";
import { FormField } from "../../components/forms/FormField";
import { Input } from "../../components/forms/Input";
import toast from "react-hot-toast";

const AdminCustomersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState("");
  
  // New Customer Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [anniversary, setAnniversary] = useState("");
  const [kaftan, setKaftan] = useState("");
  const [suit, setSuit] = useState("");
  const [agbada, setAgbada] = useState("");

  const { data: customers, isLoading } = useQuery({
    queryKey: ["customers", search],
    queryFn: () => fetchCustomers(search),
  });

  const mutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      toast.success("Customer added successfully");
      setIsAdding(false);
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      // Reset form
      setName(""); setEmail(""); setPhone(""); setDob(""); setAnniversary("");
      setKaftan(""); setSuit(""); setAgbada("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      name,
      email: email || undefined,
      phone: phone || undefined,
      dob: dob || undefined,
      anniversaryDate: anniversary || undefined,
      measurements: { kaftan, suit, agbada },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500">Manage your fashion clients and their measurements.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="rounded-full bg-black px-6 py-2 text-sm font-bold text-white hover:bg-gray-800 transition-colors"
        >
          {isAdding ? "CANCEL" : "ADD CUSTOMER"}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Name" name="name" required>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" />
              </FormField>
              <FormField label="Email" name="email">
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
              </FormField>
              <FormField label="Phone" name="phone">
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234..." />
              </FormField>
              <FormField label="Date of Birth" name="dob">
                <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
              </FormField>
              <FormField label="Anniversary Date" name="anniversary">
                <Input type="date" value={anniversary} onChange={(e) => setAnniversary(e.target.value)} />
              </FormField>
           </div>
           
           <div className="border-t border-gray-100 pt-4">
              <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Measurements</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <FormField label="Kaftan" name="kaftan">
                    <Input value={kaftan} onChange={(e) => setKaftan(e.target.value)} placeholder="e.g. Length: 40, Chest: 42..." />
                 </FormField>
                 <FormField label="Suit" name="suit">
                    <Input value={suit} onChange={(e) => setSuit(e.target.value)} placeholder="e.g. Shoulder: 18, Sleeve: 24..." />
                 </FormField>
                 <FormField label="Agbada" name="agbada">
                    <Input value={agbada} onChange={(e) => setAgbada(e.target.value)} placeholder="e.g. Big: 50, Small: 40..." />
                 </FormField>
              </div>
           </div>

           <button
             type="submit"
             disabled={mutation.isPending}
             className="w-full rounded-full bg-primary py-3 text-sm font-bold text-white hover:opacity-90 transition-opacity"
           >
             {mutation.isPending ? "SAVING..." : "SAVE CUSTOMER"}
           </button>
        </form>
      )}

      <div className="relative">
         <input
           type="text"
           placeholder="Search customers..."
           value={search}
           onChange={(e) => setSearch(e.target.value)}
           className="w-full rounded-full border border-gray-200 bg-white px-6 py-3 text-sm focus:border-primary focus:outline-none"
         />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Measurements</th>
              <th className="px-6 py-4">Dates</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers?.map((c: any) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-900">{c.name}</td>
                <td className="px-6 py-4 text-gray-600">
                   <div>{c.email}</div>
                   <div className="text-xs">{c.phone}</div>
                </td>
                <td className="px-6 py-4 text-xs text-gray-500">
                   {Object.entries(c.measurements || {}).map(([cat, val]: any) => (
                      val ? <div key={cat}><span className="font-bold uppercase">{cat}:</span> {val}</div> : null
                   ))}
                </td>
                <td className="px-6 py-4 text-xs text-gray-500">
                   {c.dob && <div>DOB: {new Date(c.dob).toLocaleDateString()}</div>}
                   {c.anniversaryDate && <div>Anniv: {new Date(c.anniversaryDate).toLocaleDateString()}</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isLoading && <div className="p-8 text-center text-gray-400">Loading customers...</div>}
        {customers?.length === 0 && <div className="p-8 text-center text-gray-400">No customers found.</div>}
      </div>
    </div>
  );
};

export default AdminCustomersPage;

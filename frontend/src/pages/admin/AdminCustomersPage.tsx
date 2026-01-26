import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCustomers, createCustomer, updateCustomer, fetchUsers } from "../../api/admin";
import { FormField } from "../../components/forms/FormField";
import { Input } from "../../components/forms/Input";
import { Select } from "../../components/forms/Select";
import { DynamicMeasurementFields } from "../../components/measurements/DynamicMeasurementFields";
import { BackButton } from "../../components/ui/BackButton";
import toast from "react-hot-toast";

const AdminCustomersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [viewingCustomer, setViewingCustomer] = useState<any>(null);
  const [search, setSearch] = useState("");
  
  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [userId, setUserId] = useState<string>("");
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [anniversary, setAnniversary] = useState("");
  const [measurements, setMeasurements] = useState<Record<string, any>>({});

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const { data: customers, isLoading } = useQuery({
    queryKey: ["customers", search],
    queryFn: () => fetchCustomers(search),
  });

  const resetForm = () => {
    setName(""); setEmail(""); setPhone(""); setBirthDay(""); setBirthMonth(""); setAnniversary("");
    setUserId("");
    setMeasurements({});
    setEditingCustomer(null);
    setIsAdding(false);
  };

  const createMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      toast.success("Customer added successfully");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => updateCustomer(id, data),
    onSuccess: () => {
      toast.success("Customer updated successfully");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      resetForm();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name,
      email: email || undefined,
      phone: phone || undefined,
      userId: userId ? parseInt(userId) : undefined,
      dob: (birthMonth && birthDay) ? `2000-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}` : undefined,
      anniversaryDate: anniversary || undefined,
      measurements,
    };

    if (editingCustomer) {
      updateMutation.mutate({ id: editingCustomer.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (customer: any) => {
    setEditingCustomer(customer);
    setName(customer.name);
    setEmail(customer.email || "");
    setPhone(customer.phone || "");
    setUserId(customer.userId ? String(customer.userId) : "");
    if (customer.dob) {
      const d = new Date(customer.dob);
      setBirthMonth(String(d.getUTCMonth() + 1));
      setBirthDay(String(d.getUTCDate()));
    } else {
      setBirthMonth("");
      setBirthDay("");
    }
    setAnniversary(customer.anniversaryDate ? new Date(customer.anniversaryDate).toISOString().split('T')[0] : "");
    setMeasurements(customer.measurements || {});
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUserSelect = (val: string) => {
    setUserId(val);
    if (val) {
      const selectedUser = users?.find((u: any) => String(u.id) === val);
      if (selectedUser) {
        setName(`${selectedUser.firstName} ${selectedUser.lastName}`);
        setEmail(selectedUser.email);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <BackButton />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
            <p className="text-sm text-gray-500">Manage your fashion clients and their measurements.</p>
          </div>
          <button
            onClick={() => {
              if (isAdding) resetForm();
              else setIsAdding(true);
            }}
            className="rounded-full bg-black px-6 py-2 text-sm font-bold text-white hover:bg-gray-800 transition-colors"
          >
            {isAdding ? "CANCEL" : "ADD CUSTOMER"}
          </button>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
           <h2 className="text-lg font-bold">{editingCustomer ? "Edit Customer" : "Add New Customer"}</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormField label="Link to Registered User (Optional)" name="userId">
                 <Select 
                    value={userId} 
                    onChange={(e) => handleUserSelect(e.target.value)} 
                    options={[
                      { value: "", label: "--- Select User ---" },
                      ...(users?.filter((u: any) => !u.customerId || (editingCustomer && u.customerId === editingCustomer.id))?.map((u: any) => ({
                        value: String(u.id),
                        label: `${u.firstName} ${u.lastName} (${u.email})`
                      })) || [])
                    ]}
                 />
               </FormField>
              <FormField label="Name" name="name" required>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" />
              </FormField>
              <FormField label="Email" name="email">
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
              </FormField>
              <FormField label="Phone" name="phone">
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234..." />
              </FormField>
              <FormField label="Birthday" name="dob">
                <div className="flex gap-2">
                  <select
                    value={birthMonth}
                    onChange={(e) => setBirthMonth(e.target.value)}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                  >
                    <option value="">Month</option>
                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => (
                      <option key={m} value={i + 1}>{m}</option>
                    ))}
                  </select>
                  <select
                    value={birthDay}
                    onChange={(e) => setBirthDay(e.target.value)}
                    className="w-24 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                  >
                    <option value="">Day</option>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </FormField>
              <FormField label="Anniversary Date" name="anniversary">
                <Input type="date" value={anniversary} onChange={(e) => setAnniversary(e.target.value)} />
              </FormField>
           </div>
           
           <div className="border-t border-gray-100 pt-4">
              <DynamicMeasurementFields
                measurements={measurements}
                onChange={setMeasurements}
              />
           </div>

           <button
             type="submit"
             disabled={createMutation.isPending || updateMutation.isPending}
             className="w-full rounded-full bg-primary py-3 text-sm font-bold text-white hover:opacity-90 transition-opacity"
           >
             {createMutation.isPending || updateMutation.isPending ? "SAVING..." : (editingCustomer ? "UPDATE CUSTOMER" : "SAVE CUSTOMER")}
           </button>
        </form>
      )}

      {viewingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <button 
              onClick={() => setViewingCustomer(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold mb-6">Customer Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Full Name</label>
                  <p className="text-lg font-semibold">{viewingCustomer.name}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Email Address</label>
                  <p className="text-gray-600">{viewingCustomer.email || "N/A"}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Phone Number</label>
                  <p className="text-gray-600">{viewingCustomer.phone || "N/A"}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Birthday</label>
                  <p className="text-gray-600">
                    {viewingCustomer.dob ? new Date(viewingCustomer.dob).toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' }) : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Anniversary Date</label>
                  <p className="text-gray-600">{viewingCustomer.anniversaryDate ? new Date(viewingCustomer.anniversaryDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : "N/A"}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-100">
               <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Measurements</h3>
               <div className="space-y-6">
                 {Object.entries(viewingCustomer.measurements || {}).map(([category, values]: [string, any]) => (
                   <div key={category} className="bg-gray-50 rounded-xl p-4">
                     <h4 className="font-bold text-primary uppercase text-xs mb-3">{category}</h4>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-4">
                        {Object.entries(values).map(([field, val]: [string, any]) => (
                          <div key={field}>
                            <span className="text-xs text-gray-400 block uppercase">{field.replace('_', ' ')}</span>
                            <span className="font-medium">{val}</span>
                          </div>
                        ))}
                     </div>
                   </div>
                 ))}
               </div>
            </div>
            
            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => {
                  handleEdit(viewingCustomer);
                  setViewingCustomer(null);
                }}
                className="flex-1 bg-black text-white py-3 rounded-full font-bold text-sm hover:bg-gray-800"
              >
                EDIT CUSTOMER
              </button>
              <button 
                onClick={() => setViewingCustomer(null)}
                className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-full font-bold text-sm hover:bg-gray-200"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
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

      {/* Desktop Table */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4 text-center">Tasks</th>
              <th className="px-6 py-4">Measurements</th>
              <th className="px-6 py-4 text-right">Actions</th>
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
                <td className="px-6 py-4 text-center font-bold text-gray-900">
                   {c.totalTasks || 0}
                </td>
                <td className="px-6 py-4 text-xs text-gray-500">
                   <div className="flex flex-wrap gap-1">
                     {Object.keys(c.measurements || {}).map((cat: string) => (
                       <span key={cat} className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] uppercase font-bold">
                         {cat}
                       </span>
                     ))}
                   </div>
                </td>
                <td className="px-6 py-4 text-right">
                   <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => setViewingCustomer(c)}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        VIEW
                      </button>
                      <button 
                        onClick={() => handleEdit(c)}
                        className="text-xs font-bold text-gray-400 hover:text-gray-900"
                      >
                        EDIT
                      </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isLoading && <div className="p-8 text-center text-gray-400">Loading customers...</div>}
        {customers?.length === 0 && !isLoading && <div className="p-8 text-center text-gray-400">No customers found.</div>}
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden space-y-4">
        {isLoading && <div className="p-8 text-center text-gray-400">Loading customers...</div>}
        {customers?.map((c: any) => (
          <div key={c.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-gray-900">{c.name}</h3>
                <p className="text-sm text-gray-500">{c.phone || c.email}</p>
                <p className="text-xs font-bold text-gray-400 mt-1">
                  Total Tasks: <span className="text-gray-900">{c.totalTasks || 0}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setViewingCustomer(c)}
                  className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary"
                >
                  VIEW
                </button>
                <button 
                  onClick={() => handleEdit(c)}
                  className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-600"
                >
                  EDIT
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 pt-2 border-t border-gray-50">
              {Object.keys(c.measurements || {}).map((cat: string) => (
                <span key={cat} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold">
                  {cat}
                </span>
              ))}
            </div>
          </div>
        ))}
        {customers?.length === 0 && !isLoading && <div className="p-8 text-center text-gray-400">No customers found.</div>}
      </div>
    </div>
  );
};

export default AdminCustomersPage;

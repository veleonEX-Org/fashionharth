import React, { useState } from 'react';
import Modal from '../Modal';
import { Input } from '../forms/Input';
import { Label } from '../forms/Label';
import { Textarea } from '../forms/Textarea';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (details: { deliveryAddress: string; notes: string; quantity: number }) => void;
  loading?: boolean;
  itemTitle: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  itemTitle
}) => {
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({ deliveryAddress, notes, quantity });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complete Your Order">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 mb-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">Item Selected</p>
                <p className="font-bold text-zinc-900">{itemTitle}</p>
            </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryAddress">Delivery Address</Label>
            <Input
              id="deliveryAddress"
              placeholder="e.g. 123 Fashion Ave, Lagos"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  required
                />
              </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Production Notes (Size, Customization, etc.)</Label>
            <Textarea
              id="notes"
              placeholder="Any specific instructions for production (e.g. measurements, fabric preferences)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-black text-white rounded-full font-black text-[10px] tracking-[0.2em] uppercase transition-all hover:bg-zinc-800 disabled:opacity-50"
          >
            {loading ? 'PROCESSING...' : 'PROCEED TO PAYMENT'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-[10px] font-black tracking-[0.2em] text-zinc-400 hover:text-black uppercase transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};

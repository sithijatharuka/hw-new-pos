import React, { useEffect, useState } from 'react';
import { getSettings, updateSettings } from '../api/settings/settings';

const SettingsPage = ({ user }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const isAdmin = user?.role === 'admin';

  const loadSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getSettings();
      setSettings({
        shopName: data.shopName || '',
        shopAddress: data.shopAddress || '',
        shopPhone: data.shopPhone || '',
        shopWhatsapp: data.shopWhatsapp || '',
        vatRegNo: data.vatRegNo || '',
        vatRate: data.vatRate ?? 0.15,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: name === 'vatRate' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      setError('Only admin users can change settings.');
      return;
    }
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const data = await updateSettings(settings);
      setSettings({
        shopName: data.shopName || '',
        shopAddress: data.shopAddress || '',
        shopPhone: data.shopPhone || '',
        shopWhatsapp: data.shopWhatsapp || '',
        vatRegNo: data.vatRegNo || '',
        vatRate: data.vatRate ?? 0.15,
      });
      setMessage('Settings saved successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !settings) {
    return <div className="text-xs text-gray-500">Loading settings…</div>;
  }

  if (!settings) {
    return (
      <div className="text-xs text-red-500">
        Failed to load settings. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Shop & VAT Settings</h2>
          <p className="text-xs text-gray-500">
            Manage shop details (used on invoices) and VAT rate. Changes affect new bills immediately.
          </p>
        </div>
        <div className="text-[11px] text-right">
          <p>
            Logged in as <span className="font-semibold">{user?.name}</span>
          </p>
          <p className="capitalize">Role: {user?.role}</p>
          {!isAdmin && (
            <p className="text-red-500 mt-1">
              Only admin can update settings (view only).
            </p>
          )}
        </div>
      </div>

      <div className="card max-w-2xl">
        {error && (
          <div className="mb-2 text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-2 text-xs text-green-600 bg-green-50 border border-green-100 px-3 py-2 rounded-lg">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block mb-1 font-medium">Shop name</label>
            <input
              name="shopName"
              className="w-full border rounded-xl px-3 py-2"
              value={settings.shopName}
              onChange={handleChange}
              disabled={!isAdmin}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Shop address</label>
            <textarea
              name="shopAddress"
              className="w-full border rounded-xl px-3 py-2 min-h-[60px]"
              value={settings.shopAddress}
              onChange={handleChange}
              disabled={!isAdmin}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="block mb-1 font-medium">Phone</label>
              <input
                name="shopPhone"
                className="w-full border rounded-xl px-3 py-2"
                value={settings.shopPhone}
                onChange={handleChange}
                disabled={!isAdmin}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">WhatsApp</label>
              <input
                name="shopWhatsapp"
                className="w-full border rounded-xl px-3 py-2"
                value={settings.shopWhatsapp}
                onChange={handleChange}
                disabled={!isAdmin}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">VAT Reg. No.</label>
              <input
                name="vatRegNo"
                className="w-full border rounded-xl px-3 py-2"
                value={settings.vatRegNo}
                onChange={handleChange}
                disabled={!isAdmin}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block mb-1 font-medium">VAT rate (%)</label>
              <input
                name="vatRate"
                type="number"
                step="0.01"
                className="w-full border rounded-xl px-3 py-2"
                value={settings.vatRate}
                onChange={handleChange}
                disabled={!isAdmin}
              />
              <p className="text-[10px] text-gray-500 mt-1">
                Example: enter <strong>15</strong> for 15% VAT.
              </p>
            </div>
            <div className="md:col-span-2 text-[11px] text-gray-500">
              <p>
                VAT is applied only when issuing a <strong>Tax Invoice</strong> and only on items marked as{' '}
                <strong>Tax applicable</strong> in the item master.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t mt-2 flex justify-end">
            <button
              type="submit"
              className="btn-primary"
              disabled={!isAdmin || saving}
            >
              {saving ? 'Saving…' : 'Save settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;

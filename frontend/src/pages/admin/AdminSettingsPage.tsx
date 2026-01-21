import React, { useEffect, useState } from "react";
import { getAllSettings, updateSetting, SystemSetting } from "../../api/settings";
import { forceCrawl } from "../../api/trending";
import toast from "react-hot-toast";
import { BackButton } from "../../components/ui/BackButton";

const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCrawling, setIsCrawling] = useState(false);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const data = await getAllSettings();
      setSettings(data);
      const initialValues: Record<string, string> = {};
      data.forEach(s => initialValues[s.key] = s.value);
      setEditedValues(initialValues);
    } catch (error) {
      toast.error("Failed to load settings");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (key: string) => {
    try {
      await updateSetting(key, editedValues[key]);
      toast.success("Setting updated successfully");
      fetchSettings(); // Refresh
    } catch (error) {
      toast.error("Failed to update setting");
      console.error(error);
    }
  };

  const handleCrawl = async () => {
    try {
      setIsCrawling(true);
      await forceCrawl();
      toast.success("Crawler started in background!");
    } catch (error) {
      toast.error("Failed to start crawler");
      console.error(error);
    } finally {
      setIsCrawling(false);
    }
  };

  const handleChange = (key: string, val: string) => {
    setEditedValues(prev => ({ ...prev, [key]: val }));
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading settings...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center gap-4 mb-6">
        <BackButton />
        <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
      </div>

      <div className="grid gap-8">
        {/* Crawler Section */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Trend Crawler Configuration</h2>
              <p className="text-sm text-muted-foreground">Manage how the system discovers and processes trends.</p>
            </div>
            <button
              onClick={handleCrawl}
              disabled={isCrawling}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-md transition-all hover:opacity-90 disabled:opacity-50"
            >
              {isCrawling ? "Starting..." : "Trigger Crawl Now"}
            </button>
          </div>

          <div className="space-y-6">
            {settings.filter(s => s.key.startsWith('trending_')).map((setting) => (
              <div key={setting.key} className="space-y-2">
                <label className="block text-sm font-medium text-foreground capitalize">
                  {setting.key.replace(/_/g, ' ')}
                </label>
                {setting.description && (
                  <p className="text-xs text-muted-foreground mb-1">{setting.description}</p>
                )}
                <textarea
                  value={editedValues[setting.key] || ""}
                  onChange={(e) => handleChange(setting.key, e.target.value)}
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <div className="flex justify-end">
                  <button
                    onClick={() => handleSave(setting.key)}
                    disabled={editedValues[setting.key] === setting.value}
                    className="rounded-md bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Other Settings could go here */}
        {settings.filter(s => !s.key.startsWith('trending_')).length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
             <h2 className="text-xl font-bold text-foreground mb-4">Other Settings</h2>
             <div className="space-y-6">
               {settings.filter(s => !s.key.startsWith('trending_')).map((setting) => (
                 <div key={setting.key} className="space-y-2">
                   <label className="block text-sm font-medium text-foreground capitalize">
                     {setting.key.replace(/_/g, ' ')}
                   </label>
                   <textarea
                     value={editedValues[setting.key] || ""}
                     onChange={(e) => handleChange(setting.key, e.target.value)}
                     className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                   />
                   <div className="flex justify-end">
                     <button
                       onClick={() => handleSave(setting.key)}
                       disabled={editedValues[setting.key] === setting.value}
                       className="rounded-md bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
                     >
                       Save
                     </button>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettingsPage;

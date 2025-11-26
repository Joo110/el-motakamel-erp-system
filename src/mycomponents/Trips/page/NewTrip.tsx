import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface TripFormData {
  Location: string;
  agent: string;
  driver: string;
  car: string;
  area: string;
  date: string;
}

const NewTrip: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<TripFormData>({
    Location: '',
    agent: '',
    driver: '',
    car: '',
    area: '',
    date: ''
  });

  const [saving, setSaving] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);

      if (!formData.Location || !formData.agent || !formData.driver) {
        toast.error(`❌ ${t('Please fill in all required fields!')}`);
        setSaving(false);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success(`✅ ${t('Trip created successfully!')}`);
      handleCancel();
    } catch (error: any) {
      console.error('❌ Error creating trip:', error);
      toast.error(t('Error creating trip.'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      Location: '',
      agent: '',
      driver: '',
      car: '',
      area: '',
      date: ''
    });
  };

  const agents = [
    { id: '1', name: 'EGC' },
    { id: '2', name: 'Akarab' },
    { id: '3', name: 'Fresh' }
  ];

  const areas = [
    { id: '1', name: 'Riyadh' },
    { id: '2', name: 'Jeddah' },
    { id: '3', name: 'Dammam' },
    { id: '4', name: 'Mecca' },
    { id: '5', name: 'Medina' }
  ];

  const cars = [
    { id: '1', name: 'Car 1' },
    { id: '2', name: 'Car 2' },
    { id: '3', name: 'Car 3' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-3 flex items-center gap-4 flex-wrap">
        <h1 className="text-3xl font-bold text-gray-800">{t('Trips Management')}</h1>

        <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
          <span>{t('Dashboard')}</span>
          <span>›</span>
          <span>{t('Delegates')}</span>
          <span>›</span>
          <span className="text-gray-700">{t('NewTrip')}</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-8">{t('NewTrip')}</h2>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('Location')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="Location"
                value={formData.Location}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                placeholder={t('Enter Location...')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Agent')} <span className="text-red-500">*</span>
                </label>
                <select
                  name="agent"
                  value={formData.agent}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                    backgroundPosition: "right 0.5rem center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "1.5em 1.5em",
                    paddingRight: "2.5rem",
                  }}
                >
                  <option value="">{t('Select Agent...')}</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.name}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('Driver')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="driver"
                  value={formData.driver}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                  placeholder={t('Enter driver name...')}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('Car')}</label>
              <select
                name="car"
                value={formData.car}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                  backgroundPosition: "right 0.5rem center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "1.5em 1.5em",
                  paddingRight: "2.5rem",
                }}
              >
                <option value="">{t('Select Car...')}</option>
                {cars.map((car) => (
                  <option key={car.id} value={car.name}>
                    {car.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('Area')}</label>
                <select
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                    backgroundPosition: "right 0.5rem center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "1.5em 1.5em",
                    paddingRight: "2.5rem",
                  }}
                >
                  <option value="">{t('Select Area...')}</option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.name}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('Date')}</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
            <button
              onClick={handleCancel}
              className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-50 transition-all font-medium"
            >
              {t('Cancel')}
            </button>

            <button
              onClick={handleSubmit}
              disabled={saving}
              className={`px-6 py-2.5 text-white rounded-xl shadow-md font-medium transition-all ${
                saving ? "bg-gray-400 cursor-not-allowed" : "bg-slate-700 hover:bg-slate-800"
              }`}
            >
              {saving ? t('Saving...') : t('SaveTrip')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewTrip;

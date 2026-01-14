
// FILE: src/mycomponents/trips/NewTrip.tsx
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import useEmployees from '../../HR/hooks/useEmployees';
import useMobileStocks from '../hooks/useMobileStocks';
import useTrips from '../hooks/useTrips';

interface TripFormData {
  Location: string;
  agent: string;
  driver: string;
  car: string;
  area: string;
  date: string;
}
interface TripPayload {
  location: string;
  representative: string;
  driver: string;
  car: string;
  area?: string;
  date?: string;
}

const NewTrip: React.FC = () => {
  const { t } = useTranslation();

  // hooks
  const { employees, loading: employeesLoading, refresh: refreshEmployees } = useEmployees();
  const { mobileStocks: carsList, loading: carsLoading, fetch: fetchCars } = useMobileStocks();
  const { createTrip } = useTrips();

  const [formData, setFormData] = useState<TripFormData>({
    Location: '',
    agent: '',
    driver: '',
    car: '',
    area: '',
    date: ''
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void refreshEmployees();
    void fetchCars();
  }, [refreshEmployees, fetchCars]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getEmployeeName = (e: any) =>
    e?.name ?? e?.fullName ?? e?.title ?? (e._id ?? e.id) ?? String(e);

  const getCarName = (c: any) =>
    c?.name ?? c?.title ?? c?.plateNumber ?? (c._id ?? c.id) ?? String(c);

  const handleSubmit = async () => {
    try {
      setSaving(true);

      if (!formData.Location || !formData.agent || !formData.driver) {
        toast.error(`❌ ${t('Please fill in all required fields!')}`);
        setSaving(false);
        return;
      }

const payload: TripPayload = {
  location: formData.Location,
  representative: formData.agent,
  driver: formData.driver,
  car: formData.car || "690b83336f579083d52617a4",
  area: formData.area || "",
  date: formData.date || "",
};


      await createTrip(payload as any);

      toast.success(`✅ ${t('Trip created successfully!')}`);
      handleCancel();
    } catch (error: any) {
      console.error('❌ Error creating trip:', error);
      const msg = error?.response?.data?.message ?? error?.message ?? t('Error creating trip.');
      toast.error(msg);
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
                  disabled={employeesLoading}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
                >
                  <option value="">{employeesLoading ? t('Loading...') : t('Select Agent...')}</option>
                  {employees?.map((emp: any) => (
                    <option key={emp._id ?? emp.id} value={emp._id ?? emp.id}>
                      {getEmployeeName(emp)}
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder={t('Enter Driver Name...')}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('Car')}</label>
              <select
                name="car"
                value={formData.car}
                onChange={handleInputChange}
                disabled={carsLoading}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
              >
                <option value="">{carsLoading ? t('Loading...') : t('Select Car...')}</option>
                {carsList?.map((car: any) => (
                  <option key={car._id ?? car.id} value={car._id ?? car.id}>
                    {getCarName(car)}
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
                >
                  <option value="">{t('Select Area...')}</option>
                  <option value="Riyadh">Riyadh</option>
                  <option value="Jeddah">Jeddah</option>
                  <option value="Dammam">Dammam</option>
                  <option value="Mecca">Mecca</option>
                  <option value="Medina">Medina</option>
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

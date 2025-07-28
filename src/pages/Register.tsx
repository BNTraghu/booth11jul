import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/UI/Button';
import { AlertCircle, CheckCircle } from 'lucide-react';

export const Register: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const eventId = searchParams.get('id');

  useEffect(() => {
    if (eventId) {
      supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error(error);
            setError('Event not found.');
          } else {
            setEvent(data);
          }
          setLoading(false);
        });
    }
  }, [eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.name || !formData.email) {
      setError('Name and email are required.');
      return;
    }

    const { error } = await supabase.from('event_registrations').insert({
      event_id: event.id,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
    });

    if (error) {
      setError('Registration failed.');
    } else {
      setSuccess(true);
    }
  };

  if (loading) return <div className="p-6">Loading event...</div>;
  if (!event) return <div className="p-6 text-red-600">Event not found.</div>;

  if (success) {
    return (
      <div className="p-6 max-w-lg mx-auto bg-white shadow rounded mt-12 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Registration Successful!</h2>
        <p className="text-gray-600 mt-2">You are registered for: <strong>{event.title}</strong></p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow rounded mt-12">
      <h1 className="text-xl font-bold text-gray-900 mb-4">
        Register for {event.title}
      </h1>
      <p className="text-sm text-gray-600 mb-6">{event.description}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded"
          required
        />
        <input
          type="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded"
          required
        />
        <input
          type="tel"
          placeholder="Phone Number (optional)"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded"
        />
        {error && (
          <div className="text-red-600 flex items-center text-sm">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
          </div>
        )}
        <Button type="submit" className="w-full">Submit Registration</Button>
      </form>
    </div>
  );
};

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function Home() {
  const searchParams = useSearchParams();
  
  const customerName = searchParams.get('customer_name') || '';
  const invoiceNo = searchParams.get('invoice_no') || '';
  const csName = searchParams.get('cs_name') || '';
  const referralCode = searchParams.get('referral_code') || '';

  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState('pending');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!invoiceNo) {
      setStatus('invalid');
      setMessage('Link tidak valid. Invoice number wajib ada.');
      setLoading(false);
      return;
    }
    setLoading(false);
  }, [invoiceNo]);

  const handleContinue = async () => {
    setChecking(true);
    
    try {
      const response = await fetch('https://krearteproject.app.n8n.cloud/webhook/tally-survey-respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: {
            invoice_no: invoiceNo
          }
        }),
      });

      const result = await response.json();

      if (result.status === 'completed') {
        setStatus('completed');
        setMessage(result.message || 'Anda sudah mengisi survey ini. Terima kasih!');
      } else if (result.status === 'pending') {
        window.location.href = 'https://tally.so/r/Xx060P';
      } else if (result.status === 'invalid') {
        setStatus('invalid');
        setMessage(result.message || 'Data tidak ditemukan.');
      } else {
        setStatus('error');
        setMessage(result.message || 'Terjadi kesalahan. Silakan coba lagi.');
      }
    } catch (err) {
      console.error('Survey check error:', err);
      setStatus('error');
      setMessage('Gagal terhubung ke server. Cek koneksi internet Anda.');
    } finally {
      setChecking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">!</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Link Tidak Valid</h1>
          <p className="text-gray-600 text-sm">{message}</p>
        </div>
      </div>
    );
  }

  if (status === 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-green-600 text-2xl">✓</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Survey Sudah Diisi</h1>
          <p className="text-gray-600 text-sm">{message}</p>
          <p className="text-xs text-gray-400 mt-4">Invoice: {invoiceNo}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl mx-auto flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">K</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Krearte</h1>
          <p className="text-sm text-gray-600 mt-1">Customer Survey Form</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-500 mb-3 font-medium">Konfirmasi Data</p>
          
          <div className="space-y-3 text-sm">
            {customerName && (
              <div className="flex justify-between">
                <span className="text-gray-600">Nama Customer</span>
                <span className="font-medium text-gray-900">{customerName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Invoice No</span>
              <span className="font-mono font-medium text-gray-900">{invoiceNo}</span>
            </div>
            {csName && (
              <div className="flex justify-between">
                <span className="text-gray-600">CS Name</span>
                <span className="font-medium text-gray-900">{csName}</span>
              </div>
            )}
            {referralCode && (
              <div className="flex justify-between">
                <span className="text-gray-600">Referral Code</span>
                <span className="font-mono bg-purple-100 px-2 py-1 rounded text-purple-700 text-xs">{referralCode}</span>
              </div>
            )}
          </div>
        </div>

        {status === 'error' && message && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
            <p className="text-xs text-red-800">{message}</p>
          </div>
        )}

        <button
          onClick={handleContinue}
          disabled={checking}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {checking ? 'Memeriksa...' : '✓ Saya Sudah Siap Isi Survey'}
        </button>

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2024 Krearte. All rights reserved.
        </p>
      </div>
    </div>
  );
}
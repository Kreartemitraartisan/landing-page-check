// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function Home() {
  const searchParams = useSearchParams();
  
  const customerName = searchParams.get('customer_name') || '';
  const invoiceNo = searchParams.get('invoice_no') || '';
  const csName = searchParams.get('cs_name') || '';
  const referralCode = searchParams.get('referral_code') || '';

  const [status, setStatus] = useState<'checking' | 'completed' | 'invalid' | 'error'>('checking');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Validasi params wajib
    if (!invoiceNo) {
      setStatus('invalid');
      setMessage('Link tidak valid. Invoice number wajib ada.');
      return;
    }

    // Auto-check ke webhook n8n
    const checkSurvey = async () => {
      try {
        const response = await fetch('https://kreartenew.app.n8n.cloud/webhook/tally-survey-respond', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: { invoice_no: invoiceNo }
          }),
        });

        const result = await response.json();

        if (result.status === 'completed') {
          setStatus('completed');
          setMessage(result.message || 'Anda sudah mengisi survey ini. Terima kasih!');
        } else if (result.status === 'pending') {
          // Auto redirect ke Tally
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
      }
    };

    checkSurvey();
  }, [invoiceNo]);

  // Completed state
  if (status === 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-teal-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border-t-4 border-[rgb(0,102,125)]">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-[rgb(0,102,125)] text-2xl">✓</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Survey Sudah Diisi</h1>
          <p className="text-gray-600 text-sm mb-4">{message}</p>
          <div className="bg-gray-50 rounded-lg p-3 text-left text-sm">
            <p className="text-gray-600">Invoice: <span className="font-mono font-medium">{invoiceNo}</span></p>
            {customerName && <p className="text-gray-600">Customer: <span className="font-medium">{customerName}</span></p>}
          </div>
        </div>
      </div>
    );
  }

  // Invalid state
  if (status === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-teal-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border-t-4 border-red-500">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">!</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Link Tidak Valid</h1>
          <p className="text-gray-600 text-sm mb-2">{message}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-teal-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border-t-4 border-orange-500">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-orange-600 text-2xl">!</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Terjadi Kesalahan</h1>
          <p className="text-gray-600 text-sm mb-4">{message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-[rgb(0,102,125)] text-white rounded-lg hover:opacity-90 transition text-sm font-medium"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // Checking state (fallback jika loading.tsx tidak muncul)
  return (
    <div className="min-h-screen flex items-center justify-center bg-teal-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[rgb(0,102,125)] border-t-transparent mx-auto mb-4"></div>
        <p className="text-[rgb(0,102,125)] font-medium">Memeriksa status survey...</p>
      </div>
    </div>
  );
}
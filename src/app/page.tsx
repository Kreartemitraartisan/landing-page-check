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
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Validasi params wajib
    if (!invoiceNo) {
      setStatus('invalid');
      setMessage('Link tidak valid. Invoice number wajib ada.');
      setLoading(false);
      return;
    }

    // Auto-checking ke webhook n8n
    const checkSurvey = async () => {
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
          // Auto redirect ke Tally
          setStatus('redirecting');
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
        setLoading(false);
      }
    };

    checkSurvey();
  }, [invoiceNo]);

  // Loading / Checking state
  if (loading || status === 'checking' || status === 'redirecting') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-teal-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-teal-700 font-medium">
            {status === 'redirecting' ? 'Mengalihkan ke form...' : 'Memeriksa status survey...'}
          </p>
        </div>
      </div>
    );
  }

  // Invalid link
  if (status === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-teal-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border-t-4 border-red-500">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">!</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Link Tidak Valid</h1>
          <p className="text-gray-600 text-sm mb-2">{message}</p>
          <p className="text-xs text-gray-400">Hubungi CS Krearte jika masalah berlanjut.</p>
        </div>
      </div>
    );
  }

  // Already completed
  if (status === 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-teal-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border-t-4 border-teal-600">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-teal-600 text-2xl">✓</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Survey Sudah Diisi</h1>
          <p className="text-gray-600 text-sm mb-4">{message}</p>
          <div className="bg-gray-50 rounded-lg p-3 text-left text-sm">
            <p className="text-gray-600">Invoice: <span className="font-mono font-medium">{invoiceNo}</span></p>
            {customerName && <p className="text-gray-600">Customer: <span className="font-medium">{customerName}</span></p>}
          </div>
          <p className="text-xs text-teal-600 mt-4 font-medium">Terima kasih sudah berpartisipasi!</p>
        </div>
      </div>
    );
  }

  // Error state
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
          className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-sm font-medium"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
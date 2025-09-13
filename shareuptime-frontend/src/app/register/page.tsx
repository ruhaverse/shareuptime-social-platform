'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { authService } from '@/lib/auth';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.register({
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      
      if (response.success) {
        router.push('/login?message=Kayıt başarılı. Giriş yapabilirsiniz.');
      } else {
        setError(response.message || 'Kayıt başarısız');
      }
    } catch (error) {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Kayıt Ol
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ShareUpTime'a katılın
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Ad Soyad"
              name="fullName"
              type="text"
              required
              value={formData.firstName + ' ' + formData.lastName}
              onChange={(e) => {
                const names = e.target.value.split(' ');
                setFormData({ 
                  ...formData, 
                  firstName: names[0] || '', 
                  lastName: names.slice(1).join(' ') || '' 
                });
              }}
              placeholder="Ad ve soyadınızı girin"
            />
            
            <Input
              label="Kullanıcı Adı"
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Kullanıcı adınızı girin"
            />
            
            <Input
              label="Email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email adresinizi girin"
            />
            
            <Input
              label="Şifre"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Şifrenizi girin"
            />
            
            <Input
              label="Şifre Tekrar"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Şifrenizi tekrar girin"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <Button
              type="submit"
              className="w-full"
              loading={loading}
              disabled={!formData.firstName || !formData.lastName || !formData.username || !formData.email || !formData.password || !formData.confirmPassword}
            >
              {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Zaten hesabınız var mı?{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Giriş yapın
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

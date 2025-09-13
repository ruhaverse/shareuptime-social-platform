import Link from 'next/link';
import { ShareupButton } from '@/components/ui/ShareupButton';
import { shareupColors } from '@/styles/shareup-colors';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#9039CC] to-[#160390A1]">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center">
          {/* Logo */}
          <div className={`
            w-32 h-32 mx-auto mb-8 
            bg-white rounded-full 
            flex items-center justify-center
            shadow-2xl
          `}>
            <span className={`text-5xl font-bold text-[${shareupColors.iondigoDye}]`}>
              SU
            </span>
          </div>

          <h1 className="text-6xl font-bold text-white mb-6">
            ShareUpTime
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Sosyal medyanın geleceği burada! Modern mikroservis mimarisi ile 
            gerçek zamanlı bağlantılar kurun, paylaşın ve toplulukla etkileşime geçin.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/login">
              <button className="min-w-[200px] bg-white text-[#044566] hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors">
                Giriş Yap
              </button>
            </Link>
            <Link href="/register">
              <button className="min-w-[200px] bg-white/20 text-white border-2 border-white hover:bg-white/30 px-8 py-3 rounded-lg font-semibold transition-colors">
                Hesap Oluştur
              </button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="text-white text-4xl mb-6 text-center">🚀</div>
            <h3 className="text-2xl font-semibold text-white mb-4 text-center">
              Mikroservis Mimarisi
            </h3>
            <p className="text-white/80 text-center leading-relaxed">
              Kimlik doğrulama, kullanıcı yönetimi, gönderiler, sosyal etkileşimler 
              ve gerçek zamanlı mesajlaşma ile ölçeklenebilir mikroservisler.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="text-white text-4xl mb-6 text-center">⚡</div>
            <h3 className="text-2xl font-semibold text-white mb-4 text-center">
              Gerçek Zamanlı Özellikler
            </h3>
            <p className="text-white/80 text-center leading-relaxed">
              Socket.io ve olay odaklı mimari ile anlık mesajlaşma, 
              canlı bildirimler ve gerçek zamanlı güncellemeler.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="text-white text-4xl mb-6 text-center">🔒</div>
            <h3 className="text-2xl font-semibold text-white mb-4 text-center">
              Güvenli & Ölçeklenebilir
            </h3>
            <p className="text-white/80 text-center leading-relaxed">
              JWT kimlik doğrulama, hız sınırlama ve Docker ile 
              yatay ölçeklenebilir kurumsal düzeyde güvenlik.
            </p>
          </div>
        </div>

        {/* Platform Features */}
        <div className="mt-20 bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-10 border border-white/20">
          <h2 className="text-4xl font-bold text-white mb-10 text-center">
            Platform Özellikleri
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">👤</div>
              <h4 className="font-semibold text-white text-lg mb-2">Kullanıcı Profilleri</h4>
              <p className="text-white/70">Kapsamlı profil yönetimi</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📝</div>
              <h4 className="font-semibold text-white text-lg mb-2">Gönderiler & Medya</h4>
              <p className="text-white/70">Hashtag ile içerik paylaşımı</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">❤️</div>
              <h4 className="font-semibold text-white text-lg mb-2">Sosyal Etkileşimler</h4>
              <p className="text-white/70">Beğeni, yorum ve paylaşım</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <h4 className="font-semibold text-white text-lg mb-2">Gerçek Zamanlı Chat</h4>
              <p className="text-white/70">Anlık mesajlaşma sistemi</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <h3 className="text-3xl font-bold text-white mb-6">
            Sosyal Medyanın Geleceğine Katılın
          </h3>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            ShareUpTime ile modern sosyal medya deneyimini yaşayın. 
            Hemen ücretsiz hesabınızı oluşturun!
          </p>
          <Link href="/register">
            <button className="bg-white text-[#044566] hover:bg-gray-100 min-w-[250px] px-8 py-3 rounded-lg font-semibold transition-colors">
              Hemen Başla
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}

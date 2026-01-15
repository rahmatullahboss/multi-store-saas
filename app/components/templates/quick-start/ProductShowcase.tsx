import { useState } from 'react';
import { Star, CheckCircle } from 'lucide-react';
import type { SectionProps } from '../_core/types';
import { OptimizedImage } from '~/components/OptimizedImage';

export function ProductShowcase({ product, theme, config }: SectionProps) {
  // Use product images if available, otherwise placeholders
  const images = product.images && product.images.length > 0 
    ? product.images 
    : [product.imageUrl || "https://via.placeholder.com/600x600"];

  const [activeImage, setActiveImage] = useState(images[0]);

  return (
    <section className="py-20 bg-gradient-to-br from-[#1D3557] to-[#0D1B2A] text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">
            আমাদের <span className="text-[#E63946]">প্রোডাক্ট</span>
          </h2>
          <p className="text-white/70">বিস্তারিত দেখুন এবং সিদ্ধান্ত নিন</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Gallery */}
          <div>
            <div className="rounded-3xl overflow-hidden shadow-2xl mb-5 aspect-square bg-white/5">
               <OptimizedImage 
                  src={activeImage} 
                  alt={product.title} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
            </div>
            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      activeImage === img ? 'border-[#E63946] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <OptimizedImage src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{product.title}</h2>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="flex text-[#FFD700]">
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <Star key={i} size={20} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <span className="text-white/80 text-sm">৪.৮ (২৫০+ রিভিউ)</span>
            </div>

            <p className="text-white/80 text-lg leading-relaxed mb-8">
               {product.description || "এই প্রোডাক্টটি বিশেষভাবে বাংলাদেশের গ্রাহকদের জন্য ডিজাইন করা হয়েছে। উচ্চমানের ম্যাটেরিয়াল ব্যবহার করে তৈরি যা দীর্ঘদিন টেকসই। প্রতিদিনের ব্যবহারে আপনার জীবনকে আরো সহজ ও আনন্দময় করে তুলবে।"}
            </p>

            <ul className="space-y-4 mb-8">
              {((config as any).showcaseData?.features?.length ? (config as any).showcaseData.features : config.features?.length ? config.features : [
                { title: "প্রিমিয়াম কোয়ালিটি ম্যাটেরিয়াল" },
                { title: "দীর্ঘ স্থায়িত্ব ও টেকসই ডিজাইন" },
                { title: "ব্যবহার করা সহজ" },
                { title: "১ বছরের ওয়ারেন্টি" },
                { title: "ফ্রি গাইডলাইন ভিডিও" }
              ]).map((feature: any, i: number) => (
                <li key={i} className="flex items-center gap-3 text-lg">
                  <CheckCircle className="text-[#2A9D8F]" size={22} />
                  <span>{feature.title || feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

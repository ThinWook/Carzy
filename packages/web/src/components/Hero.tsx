import Image from 'next/image';

const Hero = () => {
  return (
    <div className="hero">
      <div className="flex-1 pt-36 padding-x">
        <h1 className="hero__title">
          Tìm kiếm, mua bán xe cũ chỉ với vài thao tác đơn giản!
        </h1>

        <p className="hero__subtitle">
          Kết nối người mua và người bán nhanh chóng, an toàn với đa dạng lựa chọn phù hợp mọi nhu cầu.
        </p>
      </div>
      <div className="hero__image-container">
        <div className="hero__image">
          <Image
            src="/hero.png"
            alt="hero"
            fill
            className="object-contain object-center"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
            priority
            quality={100}
          />
        </div>

        <div className="hero__image-overlay" />
      </div>
    </div>
  );
};

export default Hero; 
# راهنمای استقرار و نگهداری Persian LLM SaaS

## پیش‌نیازها

### سیستم عامل
- Ubuntu 20.04+ یا macOS 10.15+
- Windows 10+ (با WSL2)

### نرم‌افزارهای مورد نیاز
- Node.js 18.0+
- npm/yarn/pnpm
- Git

### سرویس‌های خارجی
- حساب Supabase (برای احراز هویت و پایگاه داده)
- کلید OpenAI API (اختیاری)
- کلید Hugging Face API (اختیاری)

## نصب محلی

### 1. کلون کردن پروژه
```bash
git clone <repository-url>
cd v0-persian-llm-saa-s-main
```

### 2. نصب وابستگی‌ها
```bash
# با pnpm (توصیه شده)
pnpm install

# یا با npm
npm install

# یا با yarn
yarn install
```

### 3. تنظیم متغیرهای محیطی
فایل `.env.local` را ایجاد کنید:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. اجرای پروژه
```bash
# حالت توسعه
pnpm dev

# یا
npm run dev
```

پروژه در آدرس `http://localhost:3000` در دسترس خواهد بود.

## استقرار Production

### گزینه 1: Vercel (توصیه شده)

#### مراحل:
1. حساب Vercel ایجاد کنید
2. پروژه را به GitHub push کنید
3. در Vercel، پروژه را import کنید
4. متغیرهای محیطی را تنظیم کنید
5. Deploy کنید

#### تنظیمات Vercel:
```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "installCommand": "pnpm install"
}
```

### گزینه 2: Netlify

#### مراحل:
1. حساب Netlify ایجاد کنید
2. پروژه را connect کنید
3. Build settings:
   - Build command: `pnpm build && pnpm export`
   - Publish directory: `out`

### گزینه 3: Docker

#### Dockerfile:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### اجرا:
```bash
docker build -t persian-llm-saas .
docker run -p 3000:3000 persian-llm-saas
```

### گزینه 4: سرور مجازی (VPS)

#### نصب Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### نصب PM2:
```bash
npm install -g pm2
```

#### استقرار:
```bash
# کلون پروژه
git clone <repository-url>
cd v0-persian-llm-saa-s-main

# نصب وابستگی‌ها
npm install

# ساخت پروژه
npm run build

# اجرا با PM2
pm2 start npm --name "persian-llm-saas" -- start
pm2 save
pm2 startup
```

## تنظیمات Supabase

### 1. ایجاد پروژه جدید
- به dashboard.supabase.com بروید
- پروژه جدید ایجاد کنید
- URL و anon key را کپی کنید

### 2. تنظیم احراز هویت
```sql
-- فعال‌سازی احراز هویت با ایمیل
-- در Supabase Dashboard > Authentication > Settings
```

### 3. تنظیم RLS (Row Level Security)
```sql
-- مثال برای جدول profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
```

## مانیتورینگ و نگهداری

### 1. لاگ‌ها
```bash
# مشاهده لاگ‌های PM2
pm2 logs persian-llm-saas

# مشاهده لاگ‌های سیستم
tail -f /var/log/nginx/access.log
```

### 2. بک‌آپ
```bash
# بک‌آپ پایگاه داده Supabase
# از dashboard Supabase استفاده کنید

# بک‌آپ فایل‌های پروژه
tar -czf backup-$(date +%Y%m%d).tar.gz /path/to/project
```

### 3. بروزرسانی
```bash
# دریافت آخرین تغییرات
git pull origin main

# نصب وابستگی‌های جدید
npm install

# ساخت مجدد
npm run build

# راه‌اندازی مجدد
pm2 restart persian-llm-saas
```

### 4. مانیتورینگ عملکرد
```bash
# نصب htop برای مانیتورینگ سیستم
sudo apt install htop

# مشاهده وضعیت PM2
pm2 status
pm2 monit
```

## امنیت

### 1. HTTPS
```nginx
# تنظیم Nginx برای HTTPS
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 2. فایروال
```bash
# تنظیم UFW
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
```

### 3. محدودیت نرخ درخواست
```javascript
// در next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-RateLimit-Limit',
            value: '100'
          }
        ]
      }
    ]
  }
}
```

## بهینه‌سازی عملکرد

### 1. کش کردن
```javascript
// تنظیم cache headers
export async function GET() {
  return new Response(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  })
}
```

### 2. CDN
- استفاده از Cloudflare یا AWS CloudFront
- کش کردن فایل‌های استاتیک
- فشرده‌سازی gzip

### 3. بهینه‌سازی تصاویر
```javascript
// در next.config.js
module.exports = {
  images: {
    domains: ['example.com'],
    formats: ['image/webp', 'image/avif']
  }
}
```

## عیب‌یابی

### مشکلات رایج:

#### 1. خطای Build
```bash
# پاک کردن cache
rm -rf .next
npm run build
```

#### 2. مشکل اتصال به Supabase
- بررسی URL و کلیدها
- چک کردن تنظیمات CORS
- بررسی وضعیت سرویس Supabase

#### 3. عملکرد کند
- بررسی لاگ‌ها
- مانیتورینگ منابع سیستم
- بهینه‌سازی کوئری‌های پایگاه داده

#### 4. خطاهای JavaScript
```bash
# فعال‌سازی source maps
NEXT_PUBLIC_DEBUG=true npm run dev
```

## پشتیبانی و به‌روزرسانی

### چرخه انتشار:
- **Major releases**: هر 6 ماه
- **Minor releases**: هر ماه
- **Patch releases**: هر هفته (در صورت نیاز)

### مسیرهای پشتیبانی:
- GitHub Issues برای گزارش باگ
- Discussions برای سوالات
- Email پشتیبانی برای مسائل حساس

### مستندات:
- [API Documentation](./API_DOCS.md)
- [Component Library](./COMPONENTS.md)
- [Contributing Guide](./CONTRIBUTING.md)

---

**نسخه**: 2.0.0  
**آخرین بروزرسانی**: 1403/04/25  
**سطح پشتیبانی**: Production Ready


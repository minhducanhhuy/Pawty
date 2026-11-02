const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const envProdPath = path.resolve(__dirname, '../.env.production');
if (!fs.existsSync(envProdPath)) {
  console.error('[Lỗi] Không tìm thấy file .env.production!');
  process.exit(1);
}

const envContent = fs.readFileSync(envProdPath, 'utf8');
const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
if (!match || !match[1] || match[1].includes('[YOUR_PROJECT_REF]') || match[1].includes('[YOUR_PASSWORD]')) {
  console.error('[Lỗi] DATABASE_URL trong .env.production chưa được điền đúng.');
  process.exit(1);
}

const rawDbUrl = match[1].trim();

// For Prisma db push / DDL schema creation, Session pooler (port 5432) is required because Transaction pooler (6543) blocks advisory locks.
let pushDbUrl = rawDbUrl;
if (pushDbUrl.includes(':6543')) {
  pushDbUrl = pushDbUrl.replace(':6543', ':5432').replace('?pgbouncer=true', '').replace('&pgbouncer=true', '');
}

console.log('>>> [1/2] Đang đẩy Schema lên Supabase (prisma db push)...');
try {
  execSync('npx prisma db push --schema=server/prisma/schema.prisma --accept-data-loss --skip-generate', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: pushDbUrl },
  });
  console.log('>>> [1/2] Đẩy Schema lên Supabase thành công!');
} catch (err) {
  console.error('[Lỗi] Quá trình prisma db push thất bại:', err.message);
  process.exit(1);
}

console.log('\n>>> [2/2] Đang nạp dữ liệu mẫu lên Supabase (seed-db)...');
try {
  execSync('node server/dist/server/src/data/seed-db.js', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: rawDbUrl },
  });
  console.log('\n=============================================================');
  console.log('🎉 THÀNH CÔNG RỰC RỠ! Supabase Database đã khởi tạo & nạp dữ liệu mẫu 100%!');
  console.log('=============================================================');
} catch (err) {
  console.error('[Lỗi] Quá trình seed dữ liệu thất bại:', err.message);
  process.exit(1);
}

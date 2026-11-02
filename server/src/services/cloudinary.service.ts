import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export class CloudinaryService {
  private isConfigured = false;
  private uploadsDir: string;

  constructor() {
    this.uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }

    this.initCloudinary();
  }

  private initCloudinary() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const cloudinaryUrl = process.env.CLOUDINARY_URL;

    if (cloudinaryUrl && !cloudinaryUrl.includes('your_api_key')) {
      cloudinary.config({ secure: true });
      this.isConfigured = true;
      console.log('[Cloudinary] Đã khởi tạo cấu hình Cloudinary từ CLOUDINARY_URL.');
    } else if (
      cloudName &&
      apiKey &&
      apiSecret &&
      cloudName !== 'your_cloud_name' &&
      apiKey !== 'your_api_key'
    ) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });
      this.isConfigured = true;
      console.log(`[Cloudinary] Đã khởi tạo cấu hình Cloudinary cho Cloud: ${cloudName}`);
    } else {
      this.isConfigured = false;
      console.log(
        '[Cloudinary] Chưa phát hiện cấu hình Cloudinary hợp lệ trong .env (CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET). Hệ thống sẽ tự động dùng local static storage làm fallback.'
      );
    }
  }

  /**
   * Kiểm tra chuỗi có phải là Data URL base64 hoặc chuỗi base64 không
   */
  public isBase64Image(str: string): boolean {
    if (!str || typeof str !== 'string') return false;
    const trimmed = str.trim();
    if (trimmed.startsWith('data:image/')) return true;
    if (trimmed.length > 500 && !trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return true;
    }
    return false;
  }

  /**
   * Upload một ảnh (Data URL / Base64 / File buffer) lên Cloudinary
   * Nếu đã là HTTP/HTTPS URL thì trả về nguyên bản.
   * Nếu Cloudinary chưa cấu hình hoặc lỗi, lưu ảnh vào public/uploads và trả về link static URL.
   */
  public async uploadImage(
    imageData: string,
    folder = 'pawty/media',
    host = 'localhost:3000'
  ): Promise<string> {
    if (!imageData || typeof imageData !== 'string') {
      return '';
    }

    const trimmed = imageData.trim();

    // Nếu đã là link HTTP/HTTPS chuẩn (Unsplash, Cloudinary cũ, v.v.), không cần upload lại
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }

    // Nếu là base64 hoặc data URI:
    if (this.isConfigured) {
      try {
        const result: UploadApiResponse = await cloudinary.uploader.upload(trimmed, {
          folder,
          resource_type: 'image',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        });
        if (result && result.secure_url) {
          console.log(`[Cloudinary] Upload thành công: ${result.secure_url}`);
          return result.secure_url;
        }
      } catch (err: any) {
        console.error('[Cloudinary] Lỗi upload lên Cloudinary:', err?.message || err);
        console.log('[Cloudinary] Chuyển hướng lưu vào Local Static Storage làm dự phòng...');
      }
    }

    // Fallback: Lưu vào thư mục static uploads của server
    try {
      const extMatch = trimmed.match(/^data:image\/([a-zA-Z0-9]+);base64,/);
      const ext = extMatch && extMatch[1] ? extMatch[1] : 'jpg';
      const cleanBase64 = trimmed.replace(/^data:image\/[a-zA-Z0-9]+;base64,/, '');
      const buffer = Buffer.from(cleanBase64, 'base64');
      const filename = `media_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
      const filePath = path.join(this.uploadsDir, filename);

      fs.writeFileSync(filePath, buffer);
      const fallbackUrl = `http://${host}/uploads/${filename}`;
      console.log(`[Media Storage] Đã lưu file tĩnh fallback: ${fallbackUrl}`);
      return fallbackUrl;
    } catch (fallbackErr: any) {
      console.error('[Media Storage] Lỗi lưu fallback local image:', fallbackErr?.message || fallbackErr);
      return trimmed;
    }
  }

  /**
   * Upload danh sách nhiều ảnh cùng lúc
   */
  public async uploadMultipleImages(
    images: string[],
    folder = 'pawty/media',
    host = 'localhost:3000'
  ): Promise<string[]> {
    if (!Array.isArray(images) || images.length === 0) return [];
    const results = await Promise.all(
      images.map((img) => this.uploadImage(img, folder, host))
    );
    return results.filter((url) => Boolean(url));
  }
}

export const cloudinaryService = new CloudinaryService();


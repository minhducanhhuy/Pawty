import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';
import type { PetVisualSignature, Species } from '@pawty/types';

export class GeminiVisionService {
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    // Auto-load from .env or server/.env if process.env is empty
    if (!this.apiKey) {
      try {
        const candidatePaths = [
          path.resolve(process.cwd(), '.env'),
          path.resolve(process.cwd(), 'server/.env'),
          path.resolve(__dirname, '../../../../../.env'),
          path.resolve(__dirname, '../../../../.env'),
          path.resolve(__dirname, '../../../.env'),
          path.resolve(__dirname, '../../.env'),
        ];
        for (const envPath of candidatePaths) {
          if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            for (const line of envContent.split('\n')) {
              const trimmed = line.trim();
              if (trimmed.startsWith('GEMINI_API_KEY=')) {
                this.apiKey = trimmed.split('=')[1].trim();
              }
              if (trimmed.startsWith('GEMINI_MODEL=')) {
                this.model = trimmed.split('=')[1].trim();
              }
            }
            if (this.apiKey) break;
          }
        }
      } catch {
        // Ignore fallback error
      }
    }
  }

  /**
   * Tải ảnh từ URL từ xa hoặc trích xuất Base64 Data URL
   */
  private async fetchImageAsBase64(imageUrl: string): Promise<{ base64: string; mimeType: string }> {
    if (imageUrl.startsWith('data:')) {
      const match = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        return {
          mimeType: match[1],
          base64: match[2],
        };
      }
    }

    return new Promise((resolve, reject) => {
      const client = imageUrl.startsWith('https:') ? https : http;
      client
        .get(imageUrl, (res) => {
          if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
            return reject(new Error(`Failed to fetch image: HTTP ${res.statusCode}`));
          }
          const chunks: Buffer[] = [];
          res.on('data', (chunk) => chunks.push(chunk));
          res.on('end', () => {
            const buffer = Buffer.concat(chunks);
            const contentType = res.headers['content-type'] || 'image/jpeg';
            resolve({
              base64: buffer.toString('base64'),
              mimeType: contentType.split(';')[0],
            });
          });
        })
        .on('error', reject);
    });
  }

  /**
   * Phân tích ảnh thú cưng bằng mô hình Google Gemini Vision đa phương thức
   */
  public async analyzePetImage(
    imageUrl: string,
    postText: string = ''
  ): Promise<PetVisualSignature | null> {
    if (!this.apiKey) {
      console.warn('[GeminiVisionService] Không tìm thấy GEMINI_API_KEY, chuyển sang chế độ phân tích văn bản.');
      return null;
    }

    try {
      const { base64, mimeType } = await this.fetchImageAsBase64(imageUrl);

      const prompt = `Bạn là trợ lý AI nhận diện thú cưng chuyên dụng của hệ thống Pawty Super App.
Nhiệm vụ: Phân tích bức ảnh được cung cấp (kết hợp với bài đăng: "${postText}") để trích xuất chính xác đặc trưng thú cưng phục vụ thuật toán đối soát tìm Boss thất lạc.
BẮT BUỘC chỉ trả về 1 đối tượng JSON duy nhất (không bọc markdown, không thêm text giải thích) theo cấu trúc:
{
  "species": "dog" hoặc "cat",
  "breed": "tên giống thú cưng bằng tiếng Việt hoặc tên quốc tế quen thuộc (ví dụ: Poodle, Corgi, Golden Retriever, Mèo Anh lông ngắn, Mèo mướp, Husky...)",
  "primaryColor": "màu lông chủ đạo (ví dụ: Nâu đỏ, Vàng, Trắng, Đen, Xám, Vện đốm...)",
  "hasCollar": true hoặc false,
  "collarColor": "màu vòng cổ nếu có (ví dụ: Xanh mint, Đỏ, Vàng, Đen) hoặc null",
  "distinctiveFeatures": ["mảng ngực trắng", "tai cụp", "tai dựng", "đuôi ngắn", "có chuông cổ"...]
}`;

      const payload = JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType,
                  data: base64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

      const responseText = await new Promise<string>((resolve, reject) => {
        const req = https.request(
          url,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(payload),
            },
            timeout: 15000,
          },
          (res) => {
            let body = '';
            res.on('data', (chunk) => (body += chunk));
            res.on('end', () => {
              if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                resolve(body);
              } else {
                reject(new Error(`Gemini API error (HTTP ${res.statusCode}): ${body}`));
              }
            });
          }
        );

        req.on('error', reject);
        req.on('timeout', () => {
          req.destroy();
          reject(new Error('Gemini API timeout (15s)'));
        });
        req.write(payload);
        req.end();
      });

      const parsed = JSON.parse(responseText);
      const rawJson = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawJson) return null;

      const aiData = JSON.parse(rawJson);
      const rawSpecies = String(aiData.species || 'dog').toLowerCase();
      const species: Species = rawSpecies.includes('cat') || rawSpecies.includes('mèo') ? 'cat' : 'dog';

      return {
        species,
        breed: String(aiData.breed || 'Chưa rõ giống'),
        primaryColor: String(aiData.primaryColor || 'Nâu'),
        hasCollar: Boolean(aiData.hasCollar),
        collarColor: aiData.collarColor ? String(aiData.collarColor) : undefined,
        distinctiveFeatures: Array.isArray(aiData.distinctiveFeatures)
          ? aiData.distinctiveFeatures.map(String)
          : [],
      };
    } catch (err: any) {
      console.warn('[GeminiVisionService] Lỗi khi gọi Gemini Vision API:', err.message);
      return null;
    }
  }
  /**
   * Tạo mô tả nhận dạng thú cưng tự động và chi tiết từ ảnh tải lên
   * giúp chủ nuôi không phải tự tay gõ mô tả khi đăng tin SOS khẩn cấp.
   */
  public async generateSosPetDescription(
    imageUrl: string
  ): Promise<{
    species: 'Chó' | 'Mèo';
    breed: string;
    primaryColor: string;
    description: string;
    distinctiveFeatures: string[];
    hasCollar: boolean;
    collarColor?: string;
  } | null> {
    if (!this.apiKey) {
      console.warn('[GeminiVisionService] Không tìm thấy GEMINI_API_KEY.');
      return null;
    }

    try {
      const { base64, mimeType } = await this.fetchImageAsBase64(imageUrl);

      const prompt = `Bạn là Trợ lý AI nhận dạng thú cưng của Pawty Super App.
Nhiệm vụ: Người dùng đang cần đăng tin tìm thú cưng thất lạc. Hãy nhìn kỹ bức ảnh này và tự động viết một đoạn mô tả nhận diện cực kỳ chi tiết, súc tích, dễ nhận biết nhất bằng tiếng Việt (giúp người đi đường dễ dàng nhận ra bé).
BẮT BUỘC trả về ĐÚNG 1 JSON hợp lệ (không markdown, không thêm text ngoài):
{
  "species": "Chó" hoặc "Mèo",
  "breed": "Tên giống cụ thể (ví dụ: Poodle Toy, Golden Retriever, Corgi Pembroke, Mèo Anh lông ngắn...)",
  "primaryColor": "Màu lông chủ đạo (ví dụ: Nâu đỏ, Vàng kem, Trắng tuyết, Mướp vện...)",
  "hasCollar": true hoặc false,
  "collarColor": "Màu vòng cổ nếu có (ví dụ: Xanh mint, Đỏ, Đen) hoặc null",
  "distinctiveFeatures": ["tai cụp dài", "vệt lông trắng ở ngực", "mắt to đen", "có chuông vàng"...],
  "description": "Đoạn văn hoàn chỉnh 2-3 câu mô tả đầy đủ: giống loài, màu sắc, dáng lông, phụ kiện đeo cổ (nếu có), các điểm nổi bật nhất để người khác nhìn thấy là nhận ra ngay."
}`;

      const payload = JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType,
                  data: base64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
      const responseText = await new Promise<string>((resolve, reject) => {
        const req = https.request(
          url,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(payload),
            },
            timeout: 15000,
          },
          (res) => {
            let body = '';
            res.on('data', (chunk) => (body += chunk));
            res.on('end', () => {
              if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                resolve(body);
              } else {
                reject(new Error(`Gemini API error (HTTP ${res.statusCode}): ${body}`));
              }
            });
          }
        );
        req.on('error', reject);
        req.on('timeout', () => {
          req.destroy();
          reject(new Error('Gemini API timeout'));
        });
        req.write(payload);
        req.end();
      });

      const parsed = JSON.parse(responseText);
      const rawJson = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawJson) return null;
      const aiData = JSON.parse(rawJson);

      const rawSpecies = String(aiData.species || 'Chó').toLowerCase();
      const species: 'Chó' | 'Mèo' = rawSpecies.includes('mèo') || rawSpecies.includes('cat') ? 'Mèo' : 'Chó';

      return {
        species,
        breed: String(aiData.breed || 'Chưa rõ giống'),
        primaryColor: String(aiData.primaryColor || 'Nâu'),
        hasCollar: Boolean(aiData.hasCollar),
        collarColor: aiData.collarColor ? String(aiData.collarColor) : undefined,
        distinctiveFeatures: Array.isArray(aiData.distinctiveFeatures) ? aiData.distinctiveFeatures.map(String) : [],
        description: String(aiData.description || 'Bé cún/mèo thân thiện cần tìm chủ.'),
      };
    } catch (err: any) {
      console.warn('[GeminiVisionService] Lỗi khi tạo mô tả SOS:', err.message);
      return null;
    }
  }
}

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

/**
 * GeminiVisionService — Chỉ phục vụ DUY NHẤT tính năng đọc bức ảnh thú cưng
 * do chủ nuôi tải lên trong biểu mẫu SOS để tự động tạo câu mô tả đặc điểm nhận dạng.
 */
export class GeminiVisionService {
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    if (!this.apiKey || this.apiKey === 'your_gemini_api_key_here') {
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
                const candidateKey = trimmed.split('=')[1]?.trim() || '';
                if (candidateKey && candidateKey !== 'your_gemini_api_key_here') {
                  this.apiKey = candidateKey;
                }
              }
              if (trimmed.startsWith('GEMINI_MODEL=')) {
                this.model = trimmed.split('=')[1]?.trim() || this.model;
              }
            }
            if (this.apiKey && this.apiKey !== 'your_gemini_api_key_here') break;
          }
        }
      } catch {
        // Ignore env read fallback error
      }
    }
  }

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
            return reject(new Error(`Không thể tải ảnh từ URL: HTTP ${res.statusCode}`));
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
   * Đọc ảnh thú cưng do chủ gửi vào và tạo mô tả nhận dạng chi tiết bằng tiếng Việt.
   */
  public async generateSosPetDescription(
    imageUrl?: string,
    imageBase64?: string,
    inputMimeType: string = 'image/jpeg'
  ): Promise<{
    species: 'Chó' | 'Mèo';
    breed: string;
    primaryColor: string;
    description: string;
    distinctiveFeatures: string[];
    hasCollar: boolean;
    collarColor?: string;
  } | null> {
    if (!this.apiKey || this.apiKey === 'your_gemini_api_key_here') {
      throw new Error(
        'Chưa cấu hình GEMINI_API_KEY hợp lệ trong file .env. Vui lòng cập nhật khóa Gemini API để AI đọc ảnh tạo mô tả!'
      );
    }

    let base64 = imageBase64;
    let mimeType = inputMimeType;

    if (!base64 && imageUrl) {
      const fetched = await this.fetchImageAsBase64(imageUrl);
      base64 = fetched.base64;
      mimeType = fetched.mimeType;
    }

    if (!base64) {
      return null;
    }

    // Nếu chuỗi base64 có tiền tố data:image/...;base64, thì tách phần nội dung gốc
    if (base64.startsWith('data:')) {
      const match = base64.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        base64 = match[2];
      }
    }

    const prompt = `Bạn là trợ lý hỗ trợ viết mô tả tìm thú cưng thất lạc của ứng dụng Pawty.
Nhiệm vụ: Hãy nhìn bức ảnh thú cưng do chủ nuôi cung cấp và viết một đoạn mô tả ngoại hình chi tiết, rõ ràng, súc tích bằng tiếng Việt để người xung quanh nhìn thấy là nhận ra ngay.
BẮT BUỘC trả về ĐÚNG 1 đối tượng JSON hợp lệ (không bọc markdown):
{
  "species": "Chó" hoặc "Mèo",
  "breed": "Tên giống cụ thể (VD: Golden Retriever, Corgi, Poodle, Mèo Anh lông ngắn...)",
  "primaryColor": "Màu lông chủ đạo",
  "hasCollar": true hoặc false,
  "collarColor": "Màu vòng cổ nếu có hoặc null",
  "distinctiveFeatures": ["đặc điểm 1", "đặc điểm 2"],
  "description": "Đoạn mô tả hoàn chỉnh 2-3 câu về giống loài, màu lông, vóc dáng, vòng cổ/phụ kiện và điểm nhận dạng nổi bật nhất từ bức ảnh."
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
          timeout: 20000,
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
        reject(new Error('Quá thời gian chờ phản hồi từ Gemini API'));
      });
      req.write(payload);
      req.end();
    });

    const parsed = JSON.parse(responseText);
    const rawJson = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawJson) return null;
    const aiData = JSON.parse(rawJson);

    const rawSpecies = String(aiData.species || 'Chó').toLowerCase();
    const species: 'Chó' | 'Mèo' =
      rawSpecies.includes('mèo') || rawSpecies.includes('cat') ? 'Mèo' : 'Chó';

    return {
      species,
      breed: String(aiData.breed || 'Chưa rõ giống'),
      primaryColor: String(aiData.primaryColor || 'Nâu vàng'),
      hasCollar: Boolean(aiData.hasCollar),
      collarColor: aiData.collarColor ? String(aiData.collarColor) : undefined,
      distinctiveFeatures: Array.isArray(aiData.distinctiveFeatures)
        ? aiData.distinctiveFeatures.map(String)
        : [],
      description: String(aiData.description || ''),
    };
  }
}

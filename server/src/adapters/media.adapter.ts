import { HttpStatus, Injectable } from '@nestjs/common';
import { DomainException } from '../common/errors';

export type MediaUploadKind = 'pet' | 'moment' | 'vaccine';

export interface UploadSignatureResult {
  uploadUrl: string;
  method: 'PUT' | 'POST';
  fields: Record<string, string>;
  publicUrl: string;
}

export interface MediaProvider {
  getUploadSignature(kind: MediaUploadKind): UploadSignatureResult;
}

const SANDBOX_SAMPLE_IMAGES: Record<MediaUploadKind, string> = {
  pet: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
  moment: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80',
  vaccine: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
};

export class SandboxMediaProvider implements MediaProvider {
  getUploadSignature(kind: MediaUploadKind): UploadSignatureResult {
    const id = `${kind}_${Date.now()}`;
    return {
      uploadUrl: `https://sandbox-cdn.pawty.app/upload/${id}`,
      method: 'PUT',
      fields: {
        kind,
        mode: 'sandbox',
        acceptDirectDataUrl: 'true',
      },
      publicUrl: SANDBOX_SAMPLE_IMAGES[kind] || SANDBOX_SAMPLE_IMAGES.pet,
    };
  }
}

export class CloudinaryMediaProvider implements MediaProvider {
  getUploadSignature(_kind: MediaUploadKind): UploadSignatureResult {
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      throw new DomainException(
        'NOT_CONFIGURED',
        'Cloudinary Media CDN chưa được cấu hình khoá thật (CLOUDINARY_CLOUD_NAME).',
        HttpStatus.NOT_IMPLEMENTED,
      );
    }
    throw new DomainException(
      'NOT_CONFIGURED',
      'Cloudinary Media CDN chưa được cấu hình.',
      HttpStatus.NOT_IMPLEMENTED,
    );
  }
}

@Injectable()
export class MediaAdapterService implements MediaProvider {
  private readonly sandbox = new SandboxMediaProvider();
  private readonly cloudinary = new CloudinaryMediaProvider();

  private getProvider(): MediaProvider {
    const mode = (process.env.MEDIA_PROVIDER || 'sandbox').toLowerCase();
    return mode === 'cloudinary' ? this.cloudinary : this.sandbox;
  }

  getUploadSignature(kind: MediaUploadKind): UploadSignatureResult {
    return this.getProvider().getUploadSignature(kind);
  }
}

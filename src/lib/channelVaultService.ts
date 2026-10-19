import crypto from 'crypto';

/**
 * Layanan Enkripsi Kredensial Server-Side Terpadu (AES-256-GCM)
 * Untuk kanal YouTube, Meta (Instagram, Facebook), dan TikTok.
 * Menjamin access_token, refresh_token, dan client_secret tidak pernah tersimpan dalam teks mentah (plaintext).
 */

function getMasterKey(): Buffer {
  const secret = process.env.CHANNEL_ENCRYPTION_KEY || process.env.TOKEN_ENCRYPTION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: CHANNEL_ENCRYPTION_KEY atau TOKEN_ENCRYPTION_SECRET wajib dikonfigurasi di environment produksi!');
    }
    // Kunci deterministik aman untuk development/test lokal Komnas Palestina
    return crypto.createHash('sha256').update('komnas-palestina-humed-vault-secret-local-dev-key').digest();
  }
  return crypto.createHash('sha256').update(secret).digest();
}

const ALGORITHM = 'aes-256-gcm';

export interface EncryptedPayload {
  iv: string;
  tag: string;
  data: string;
  format: 'aes-256-gcm';
}

/**
 * Mengenkripsi token atau rahasia kredensial kanal menggunakan AES-256-GCM terverifikasi
 */
export function encryptChannelCredential(plainText: string): string {
  if (!plainText) return '';
  try {
    const key = getMasterKey();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    
    // Format baku AES-256-GCM: iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (err) {
    console.error('[ChannelVault] Gagal mengenkripsi kredensial:', err);
    throw new Error('Enkripsi kredensial gagal. Operasi dibatalkan demi keamanan data.');
  }
}

/**
 * Mendekripsi token atau rahasia kredensial kanal di lingkungan server internal
 */
export function decryptChannelCredential(cipherText: string): string {
  if (!cipherText) return '';
  try {
    const parts = cipherText.split(':');
    if (parts.length !== 3) {
      // Jika teks bukan format iv:tag:data, kembalikan apa adanya (kompatibilitas backward jika ada teks lama)
      return cipherText;
    }

    const [ivHex, authTagHex, encryptedData] = parts;
    const key = getMasterKey();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('[ChannelVault] Gagal mendekripsi kredensial kanal:', err);
    return '';
  }
}

/**
 * Validasi apakah format string kredensial sudah aman terenkripsi dengan AES-256-GCM
 */
export function isCredentialEncrypted(text: string): boolean {
  if (!text) return false;
  const parts = text.split(':');
  return parts.length === 3 && parts[0].length === 24 && parts[1].length === 32;
}

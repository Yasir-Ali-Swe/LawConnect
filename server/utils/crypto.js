import crypto from "crypto";
import { JWT_SECRET } from "../config/env.js";

// Derive a 32-byte key from process.env.DECISION_ENCRYPTION_KEY or a fallback
const getEncryptionKey = () => {
    const secret = process.env.DECISION_ENCRYPTION_KEY || JWT_SECRET || "fallback_secret_key_for_lawconnect_12345";
    // Ensure key is exactly 32 bytes (256 bits)
    return crypto.createHash("sha256").update(secret).digest();
};

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;

export const encrypt = (text) => {
    if (!text) return text;
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    // Prepend IV to the encrypted text separated by colon
    return iv.toString("hex") + ":" + encrypted;
};

export const decrypt = (encryptedText) => {
    if (!encryptedText) return encryptedText;
    const parts = encryptedText.split(":");
    if (parts.length !== 2) {
        throw new Error("Invalid encrypted format");
    }
    const iv = Buffer.from(parts[0], "hex");
    const encrypted = Buffer.from(parts[1], "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
};

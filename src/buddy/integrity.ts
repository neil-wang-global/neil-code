import { createHmac, randomBytes } from 'crypto'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { getClaudeConfigHomeDir } from '../utils/envUtils.js'
import { writeFileSyncAndFlush_DEPRECATED } from '../utils/file.js'

function getSecretPath(): string {
  return join(getClaudeConfigHomeDir(), '.buddy.sig')
}

function getOrCreateSecret(): Buffer {
  const path = getSecretPath()
  if (existsSync(path)) {
    try {
      const hex = readFileSync(path, 'utf-8').trim()
      if (hex.length === 64) return Buffer.from(hex, 'hex')
    } catch {
      // corrupt — regenerate
    }
  }
  const secret = randomBytes(32)
  writeFileSyncAndFlush_DEPRECATED(path, secret.toString('hex'))
  return secret
}

/**
 * Compute HMAC-SHA256 of the given JSON string.
 */
export function computeHmac(json: string): string {
  const secret = getOrCreateSecret()
  return createHmac('sha256', secret).update(json).digest('hex')
}

/**
 * Verify that the stored HMAC matches the given JSON string.
 */
export function verifyHmac(json: string, expectedHmac: string): boolean {
  const actual = computeHmac(json)
  // Constant-time comparison to avoid timing attacks (overkill but good habit)
  if (actual.length !== expectedHmac.length) return false
  let mismatch = 0
  for (let i = 0; i < actual.length; i++) {
    mismatch |= actual.charCodeAt(i) ^ expectedHmac.charCodeAt(i)
  }
  return mismatch === 0
}

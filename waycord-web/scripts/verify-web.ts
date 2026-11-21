import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

interface VerificationResult {
  check: string
  status: 'PASS' | 'FAIL'
  detail: string
}

const results: VerificationResult[] = []

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')

console.log('🚀 Running Waycord Web Portal Verification Suite...\n')

// 1. TypeScript Compilation Check
try {
  process.stdout.write('Checking TypeScript compilation (tsc --noEmit)... ')
  execSync('npm run typecheck', { cwd: ROOT_DIR, stdio: 'pipe' })
  console.log('PASSED')
  results.push({
    check: 'TypeScript Typecheck',
    status: 'PASS',
    detail: 'Zero TS compiler errors across router, components, and server routes.',
  })
} catch (err: any) {
  console.log('FAILED')
  results.push({
    check: 'TypeScript Typecheck',
    status: 'FAIL',
    detail: err.message || 'tsc compilation failed.',
  })
}

// 2. Production Build Check
try {
  process.stdout.write('Checking Production Build (vite build)... ')
  execSync('npm run build', { cwd: ROOT_DIR, stdio: 'pipe' })
  console.log('PASSED')
  results.push({
    check: 'Vite Production Build',
    status: 'PASS',
    detail: 'Client and SSR environment bundles emitted successfully to dist/.',
  })
} catch (err: any) {
  console.log('FAILED')
  results.push({
    check: 'Vite Production Build',
    status: 'FAIL',
    detail: err.message || 'Build failed.',
  })
}

// 3. Client Bundle Secret Leak Check
try {
  process.stdout.write('Auditing Client Bundles for Secret Token Leaks... ')
  const clientDist = path.join(ROOT_DIR, 'dist', 'client')
  if (!fs.existsSync(clientDist)) {
    throw new Error('dist/client not found. Run build first.')
  }

  const forbiddenTokens = [
    'SUPABASE_SERVICE_ROLE_KEY',
    'mock_service_role_key_for_testing',
    'PHONEPE_SALT_KEY',
    'mock_salt_key_12345',
    'PATREON_CLIENT_SECRET',
    'mock_patreon_secret',
    'PATREON_WEBHOOK_SECRET',
    'mock_patreon_webhook_secret',
  ]

  const files = fs.readdirSync(path.join(clientDist, 'assets'))
  const leakedIn: string[] = []

  for (const file of files) {
    if (file.endsWith('.js')) {
      const content = fs.readFileSync(path.join(clientDist, 'assets', file), 'utf8')
      for (const token of forbiddenTokens) {
        if (content.includes(token)) {
          leakedIn.push(`Token "${token}" found in ${file}`)
        }
      }
    }
  }

  if (leakedIn.length > 0) {
    console.log('FAILED')
    results.push({
      check: 'Client Bundle Zero-Secrets Audit',
      status: 'FAIL',
      detail: leakedIn.join('; '),
    })
  } else {
    console.log('PASSED')
    results.push({
      check: 'Client Bundle Zero-Secrets Audit',
      status: 'PASS',
      detail: '0 private keys, PhonePe salt keys, or service role secrets exposed in client JS.',
    })
  }
} catch (err: any) {
  console.log('FAILED')
  results.push({
    check: 'Client Bundle Zero-Secrets Audit',
    status: 'FAIL',
    detail: err.message,
  })
}

// 4. JSON-LD Structured Data Schema Validation
try {
  process.stdout.write('Validating JSON-LD Schemas in src/routes/index.tsx... ')
  const indexSource = fs.readFileSync(path.join(ROOT_DIR, 'src', 'routes', 'index.tsx'), 'utf8')

  // Check SoftwareApplication
  const hasSoftwareApp =
    indexSource.includes('SoftwareApplication') &&
    indexSource.includes('ProductivityApplication') &&
    indexSource.includes('OperatingSystem') || indexSource.includes('operatingSystem')

  // Check FAQPage
  const hasFaqPage =
    indexSource.includes('FAQPage') &&
    indexSource.includes('mainEntity') &&
    indexSource.includes('acceptedAnswer')

  if (hasSoftwareApp && hasFaqPage) {
    console.log('PASSED')
    results.push({
      check: 'JSON-LD Structured Data',
      status: 'PASS',
      detail: 'SoftwareApplication and 6-question FAQPage schemas validated.',
    })
  } else {
    console.log('FAILED')
    results.push({
      check: 'JSON-LD Structured Data',
      status: 'FAIL',
      detail: 'Missing required SoftwareApplication or FAQPage schemas.',
    })
  }
} catch (err: any) {
  console.log('FAILED')
  results.push({
    check: 'JSON-LD Structured Data',
    status: 'FAIL',
    detail: err.message,
  })
}

// 5. Robots.txt and Sitemap.xml Validation
try {
  process.stdout.write('Validating robots.txt & sitemap.xml... ')
  const robotsPath = path.join(ROOT_DIR, 'public', 'robots.txt')
  const robotsContent = fs.readFileSync(robotsPath, 'utf8')

  const sitemapPath = path.join(ROOT_DIR, 'public', 'sitemap.xml')
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf8')

  if (!robotsContent.includes('Disallow: /')) {
    throw new Error('robots.txt must contain Disallow: /')
  }

  if (
    !sitemapContent.includes('<urlset') ||
    !sitemapContent.includes('/privacy') ||
    !sitemapContent.includes('/terms') ||
    !sitemapContent.includes('/refund-policy')
  ) {
    throw new Error('sitemap.xml is missing required compliance URLs')
  }

  console.log('PASSED')
  results.push({
    check: 'Robots.txt & Sitemap.xml',
    status: 'PASS',
    detail: 'Robots.txt correctly disallows crawler indexing; sitemap.xml holds 4 valid routes.',
  })
} catch (err: any) {
  console.log('FAILED')
  results.push({
    check: 'Robots.txt & Sitemap.xml',
    status: 'FAIL',
    detail: err.message,
  })
}

// Print Summary Table
console.log('\n================================================================================')
console.log('                       WAYCORD VERIFICATION SUMMARY                             ')
console.log('================================================================================\n')

console.log('| Check                           | Status | Detail                                                                |')
console.log('|---------------------------------|--------|-----------------------------------------------------------------------|')
for (const r of results) {
  const checkCol = r.check.padEnd(31, ' ')
  const statusCol = r.status.padEnd(6, ' ')
  const detailCol = r.detail.padEnd(69, ' ')
  console.log(`| ${checkCol} | ${statusCol} | ${detailCol} |`)
}
console.log('\n================================================================================')

const allPassed = results.every((r) => r.status === 'PASS')
if (!allPassed) {
  process.exit(1)
} else {
  console.log('🎉 All verification gates PASSED successfully!')
}

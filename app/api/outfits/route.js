import { NextResponse } from 'next/server';
import { readdir } from 'node:fs/promises';
import path from 'node:path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function titleFromFileName(fileName) {
  return fileName
    .replace(/\.glb$/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export async function GET() {
  const outfitsDir = path.join(process.cwd(), 'public', 'outfits');

  try {
    const entries = await readdir(outfitsDir, { withFileTypes: true });

    const outfits = entries
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.glb'))
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
      .map((fileName) => ({
        name: titleFromFileName(fileName),
        file: `/outfits/${encodeURIComponent(fileName)}`,
        fileName
      }));

    return NextResponse.json({ outfits });
  } catch (error) {
    return NextResponse.json({
      outfits: [],
      message: 'No public/outfits folder was found yet.'
    });
  }
}

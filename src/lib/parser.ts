// ============================================================
// CineFlow — Script Parser / Shot Breakdown Scraper
// ============================================================
// Walks TipTap JSON document tree to extract scene headings
// and entity mentions, then produces BreakdownRow[] for the
// Shot Breakdown table.
// ============================================================

import { JSONContent } from '@tiptap/react';
import { BreakdownRow, MentionData, ScriptLine } from '@/lib/types';

const SCENE_HEADING_REGEX = /^(INT\.|EXT\.|INT\/EXT\.)\s+(.+?)(?:\s*[-–—]\s*(DAY|NIGHT|DAWN|DUSK))?$/i;


/**
 * Recursively walk a TipTap JSON doc and extract all text + mention nodes
 * in document order.
 */
function walkDoc(node: JSONContent): Array<{ type: 'text'; text: string } | { type: 'mention'; data: MentionData }> {
  const results: Array<{ type: 'text'; text: string } | { type: 'mention'; data: MentionData }> = [];

  if (node.type === 'text' && node.text) {
    results.push({ type: 'text', text: node.text });
  }

  const MENTION_TYPES = ['mention', 'characterMention', 'propMention', 'locationMention'];
  if (MENTION_TYPES.includes(node.type || '') && node.attrs) {
    results.push({
      type: 'mention',
      data: {
        type: node.attrs.entityType || 'character',
        name: node.attrs.label || node.attrs.id || '',
        id: node.attrs.id || '',
        trigger: node.attrs.label && node.attrs.label.startsWith('#') ? '#' : (node.attrs.label && node.attrs.label.startsWith('$') ? '$' : '@'),
      },
    });
  }

  if (node.content) {
    for (const child of node.content) {
      results.push(...walkDoc(child));
    }
  }

  return results;
}

/**
 * Parse full lines of text from a TipTap doc.
 * Returns an array of "lines" where each line contains its text + mentions.
 */
function extractLines(doc: JSONContent): Array<{
  fullText: string;
  plainText: string; // Text WITHOUT mentions for regex matching
  mentions: MentionData[];
}> {
  const lines: Array<{ fullText: string; plainText: string; mentions: MentionData[] }> = [];

  if (!doc.content) return lines;

  for (const block of doc.content) {
    const items = walkDoc(block);
    let fullText = '';
    let plainText = '';
    const mentions: MentionData[] = [];

    for (const item of items) {
      if (item.type === 'text') {
        fullText += item.text;
        plainText += item.text;
      } else {
        fullText += `${item.data.name}`;
        // Do NOT add to plainText so regex doesn't see mentions
        mentions.push(item.data);
      }
    }

    lines.push({ fullText: fullText.trim(), plainText: plainText.trim(), mentions });
  }

  return lines;
}

/**
 * Parse script document and return breakdown rows.
 */
export function parseScriptToBreakdown(doc: JSONContent | undefined): BreakdownRow[] {
  if (!doc) return [];

  const lines = extractLines(doc);
  const rows: BreakdownRow[] = [];
  let currentRow: BreakdownRow | null = null;
  let sceneCounter = 0;

  for (const line of lines) {
    const match = line.plainText.match(SCENE_HEADING_REGEX);

    if (match) {
      // Save previous scene if exists
      if (currentRow) {
        rows.push(currentRow);
      }

      sceneCounter++;
      const settingRaw = match[1].replace('.', '').toUpperCase();
      const locationName = match[2].trim();
      const timeOfDay = (match[3] || 'DAY').toUpperCase();

      const currentLine: ScriptLine = { text: line.fullText, mentions: line.mentions };
      currentRow = {
        sceneNumber: sceneCounter,
        heading: line.fullText,
        location: locationName,
        setting: settingRaw,
        timeOfDay,
        characters: [],
        props: [],
        lines: [currentLine],
      };
      
      // IMPORTANT: Also collect mentions from this SAME line
      for (const mention of line.mentions) {
        if (mention.type === 'character' && !currentRow.characters.some(m => m.id === mention.id)) {
          currentRow.characters.push(mention);
        }
        if (mention.type === 'prop' && !currentRow.props.some(m => m.id === mention.id)) {
          currentRow.props.push(mention);
        }
      }
    } else if (currentRow) {
      // Collect lines into current scene 
      currentRow.lines.push({ text: line.fullText, mentions: line.mentions });

      // Collect mentions into current scene
      for (const mention of line.mentions) {
        if (mention.type === 'character' && !currentRow.characters.some(m => m.id === mention.id)) {
          currentRow.characters.push(mention);
        }
        if (mention.type === 'prop' && !currentRow.props.some(m => m.id === mention.id)) {
          currentRow.props.push(mention);
        }
      }
    }
  }

  // Push last scene
  if (currentRow) {
    rows.push(currentRow);
  }

  return rows;
}
